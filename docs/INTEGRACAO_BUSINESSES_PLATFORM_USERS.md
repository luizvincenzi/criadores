# 🏢 Integração: Businesses ↔ Platform_Users

## 📊 Situação Atual

### Estrutura da Tabela `businesses`:

```sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY,
  organization_id UUID,
  name VARCHAR(255),
  slug VARCHAR(255),
  
  contact_info JSONB DEFAULT '{
    "primary_contact": "",    -- Nome do proprietário
    "whatsapp": "",
    "instagram": "",
    "email": "",              -- Email do proprietário
    "phone": "",
    "website": ""
  }',
  
  address JSONB,
  contract_info JSONB,
  status business_status,
  responsible_user_id UUID,  -- Funcionário responsável (CRM)
  ...
)
```

### Campos Importantes:
- **`contact_info->>'primary_contact'`**: Nome do proprietário/responsável
- **`contact_info->>'email'`**: Email do proprietário
- **`contact_info->>'whatsapp'`**: WhatsApp do proprietário
- **`responsible_user_id`**: Funcionário do CRM responsável pela conta

---

## 🎯 Desafio: Business Owner vs Business

### Diferença Importante:

1. **Business (Empresa)**: 
   - Entidade jurídica (ex: "Auto Posto Bela Suíça", "Govinda Restaurante")
   - Pode ter múltiplos proprietários/gestores
   - Pode ter múltiplos usuários com acesso

2. **Business Owner (Proprietário)**:
   - Pessoa física que gerencia a empresa
   - Pode gerenciar múltiplas empresas
   - Precisa de login individual

### Cenários Possíveis:

#### Cenário 1: Um proprietário, uma empresa
```
João Silva (business_owner)
  └─ Govinda Restaurante
```

#### Cenário 2: Um proprietário, múltiplas empresas
```
Maria Santos (business_owner)
  ├─ Auto Posto Bela Suíça
  ├─ Porks Londrina
  └─ Cartagena Bar
```

#### Cenário 3: Múltiplos proprietários, uma empresa
```
Boussolé Rooftop
  ├─ Pedro Costa (sócio 1)
  └─ Ana Lima (sócia 2)
```

---

## 🎯 Solução Recomendada: OPÇÃO 1 (Adaptada)

### Conceito:
Adicionar campos de controle de acesso na tabela `businesses` + permitir múltiplos usuários por empresa.

### Estrutura:

```sql
-- 1. Adicionar campos à tabela businesses
ALTER TABLE businesses 
  ADD COLUMN platform_access_status VARCHAR(50) DEFAULT 'pending',
  ADD COLUMN platform_access_granted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN platform_access_granted_by UUID REFERENCES users(id),
  ADD COLUMN platform_owner_name VARCHAR(255),
  ADD COLUMN platform_owner_email VARCHAR(255),
  ADD COLUMN platform_owner_whatsapp VARCHAR(50);

-- 2. Índices
CREATE INDEX idx_businesses_platform_access ON businesses(platform_access_status);
CREATE INDEX idx_businesses_platform_owner_email ON businesses(platform_owner_email);
```

### Relacionamento:

```
businesses (1) ←→ (N) platform_users
   │                      │
   │                      ├─ business_id (FK)
   │                      └─ role = 'business_owner'
   │
   └─ Pode ter múltiplos business_owners
```

---

## 📋 Implementação Completa

### 1. Migration SQL

```sql
-- =====================================================
-- ADICIONAR CONTROLE DE ACESSO À TABELA BUSINESSES
-- =====================================================

-- 1. Adicionar campos de controle
ALTER TABLE businesses 
  ADD COLUMN IF NOT EXISTS platform_access_status VARCHAR(50) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS platform_access_granted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS platform_access_granted_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS platform_owner_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS platform_owner_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS platform_owner_whatsapp VARCHAR(50),
  ADD COLUMN IF NOT EXISTS platform_additional_users JSONB DEFAULT '[]'::jsonb;

-- 2. Criar índices
CREATE INDEX IF NOT EXISTS idx_businesses_platform_access 
  ON businesses(platform_access_status);
  
CREATE INDEX IF NOT EXISTS idx_businesses_platform_owner_email 
  ON businesses(platform_owner_email);

-- 3. Comentários
COMMENT ON COLUMN businesses.platform_access_status IS 
  'Status de acesso à plataforma: pending, granted, denied, suspended, revoked';
  
COMMENT ON COLUMN businesses.platform_owner_name IS 
  'Nome do proprietário principal que terá acesso à plataforma';
  
COMMENT ON COLUMN businesses.platform_owner_email IS 
  'Email do proprietário para login na plataforma';
  
COMMENT ON COLUMN businesses.platform_additional_users IS 
  'Array de usuários adicionais: [{"name": "...", "email": "...", "role": "business_owner"}]';

-- 4. Trigger para sincronizar com platform_users
CREATE OR REPLACE FUNCTION sync_business_to_platform_user()
RETURNS TRIGGER AS $$
DECLARE
  additional_user JSONB;
BEGIN
  -- Se acesso foi liberado
  IF NEW.platform_access_status = 'granted' AND 
     (OLD.platform_access_status IS NULL OR OLD.platform_access_status != 'granted') THEN
    
    -- Criar/ativar proprietário principal
    IF NEW.platform_owner_email IS NOT NULL THEN
      INSERT INTO platform_users (
        organization_id,
        email,
        full_name,
        role,
        roles,
        business_id,
        is_active,
        platform
      ) VALUES (
        NEW.organization_id,
        NEW.platform_owner_email,
        NEW.platform_owner_name,
        'business_owner',
        ARRAY['business_owner']::platform_user_role[],
        NEW.id,
        true,
        'client'
      )
      ON CONFLICT (email) DO UPDATE SET
        is_active = true,
        business_id = NEW.id,
        updated_at = NOW();
    END IF;
    
    -- Criar usuários adicionais
    IF NEW.platform_additional_users IS NOT NULL THEN
      FOR additional_user IN SELECT * FROM jsonb_array_elements(NEW.platform_additional_users)
      LOOP
        INSERT INTO platform_users (
          organization_id,
          email,
          full_name,
          role,
          roles,
          business_id,
          is_active,
          platform
        ) VALUES (
          NEW.organization_id,
          additional_user->>'email',
          additional_user->>'name',
          'business_owner',
          ARRAY['business_owner']::platform_user_role[],
          NEW.id,
          true,
          'client'
        )
        ON CONFLICT (email) DO UPDATE SET
          is_active = true,
          business_id = NEW.id,
          updated_at = NOW();
      END LOOP;
    END IF;
  END IF;
  
  -- Se acesso foi negado/revogado
  IF NEW.platform_access_status IN ('denied', 'revoked', 'suspended') THEN
    UPDATE platform_users 
    SET is_active = false, updated_at = NOW()
    WHERE business_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_business_platform_access
  AFTER UPDATE OF platform_access_status ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION sync_business_to_platform_user();
```

---

## 🔄 Fluxos de Trabalho

### Fluxo 1: Liberar Acesso (Um Proprietário)

```
CRM (criadores.digital)
  ↓
Funcionário acessa perfil do "Govinda Restaurante"
  ↓
Clica "Liberar Acesso à Plataforma"
  ↓
Preenche:
  - Nome: João Silva
  - Email: joao@govinda.com.br
  - WhatsApp: (43) 99999-9999
  ↓
Clica "Confirmar"
  ↓
UPDATE businesses SET 
  platform_access_status = 'granted',
  platform_owner_name = 'João Silva',
  platform_owner_email = 'joao@govinda.com.br',
  platform_owner_whatsapp = '(43) 99999-9999'
  ↓
Trigger cria em platform_users:
  - email: joao@govinda.com.br
  - role: business_owner
  - business_id: [id do Govinda]
  ↓
João recebe email de boas-vindas
```

### Fluxo 2: Liberar Acesso (Múltiplos Proprietários)

```
CRM (criadores.digital)
  ↓
Funcionário acessa "Boussolé Rooftop"
  ↓
Clica "Liberar Acesso à Plataforma"
  ↓
Preenche proprietário principal:
  - Nome: Pedro Costa
  - Email: pedro@boussole.com.br
  ↓
Adiciona usuário adicional:
  - Nome: Ana Lima
  - Email: ana@boussole.com.br
  ↓
Clica "Confirmar"
  ↓
UPDATE businesses SET 
  platform_access_status = 'granted',
  platform_owner_name = 'Pedro Costa',
  platform_owner_email = 'pedro@boussole.com.br',
  platform_additional_users = '[
    {"name": "Ana Lima", "email": "ana@boussole.com.br"}
  ]'
  ↓
Trigger cria 2 registros em platform_users:
  1. Pedro Costa (business_owner)
  2. Ana Lima (business_owner)
  ↓
Ambos recebem email de boas-vindas
```

### Fluxo 3: Proprietário com Múltiplas Empresas

```
Maria Santos já tem acesso ao "Auto Posto Bela Suíça"
  ↓
Funcionário libera acesso ao "Porks Londrina"
  ↓
Usa o MESMO email: maria@santos.com.br
  ↓
Trigger detecta email existente
  ↓
Atualiza platform_users:
  - managed_businesses = [id_auto_posto, id_porks]
  ↓
Maria agora vê 2 empresas no dashboard
```

---

## 📊 Estrutura Final

### Tabela `businesses`:
```sql
businesses
├─ id
├─ name
├─ contact_info (JSONB original)
├─ platform_access_status ← NOVO
├─ platform_access_granted_at ← NOVO
├─ platform_access_granted_by ← NOVO
├─ platform_owner_name ← NOVO
├─ platform_owner_email ← NOVO
├─ platform_owner_whatsapp ← NOVO
└─ platform_additional_users ← NOVO (JSONB array)
```

### Tabela `platform_users`:
```sql
platform_users
├─ id
├─ email
├─ full_name
├─ role = 'business_owner'
├─ business_id ← FK para businesses
├─ managed_businesses ← Array de IDs (se gerencia múltiplas)
└─ is_active
```

---

## 🔍 Queries Úteis

### Ver empresas com acesso liberado:
```sql
SELECT 
  b.name as empresa,
  b.platform_owner_name as proprietario,
  b.platform_owner_email as email,
  b.platform_access_status as status,
  COUNT(pu.id) as total_usuarios
FROM businesses b
LEFT JOIN platform_users pu ON b.id = pu.business_id
WHERE b.platform_access_status = 'granted'
GROUP BY b.id, b.name, b.platform_owner_name, b.platform_owner_email, b.platform_access_status;
```

### Ver proprietários com múltiplas empresas:
```sql
SELECT 
  pu.email,
  pu.full_name,
  array_agg(b.name) as empresas
FROM platform_users pu
JOIN businesses b ON b.id = ANY(pu.managed_businesses) OR b.id = pu.business_id
WHERE pu.role = 'business_owner'
GROUP BY pu.id, pu.email, pu.full_name
HAVING COUNT(b.id) > 1;
```

### Liberar acesso manualmente:
```sql
-- Exemplo: Govinda Restaurante
UPDATE businesses 
SET 
  platform_access_status = 'granted',
  platform_owner_name = 'João Silva',
  platform_owner_email = 'joao@govinda.com.br',
  platform_owner_whatsapp = '(43) 99999-9999',
  platform_access_granted_at = NOW(),
  platform_access_granted_by = '00000000-0000-0000-0000-000000000001'
WHERE slug = 'govinda';
```

---

## ✅ Vantagens da Solução

1. ✅ **Múltiplos proprietários**: Uma empresa pode ter vários usuários
2. ✅ **Múltiplas empresas**: Um proprietário pode gerenciar várias empresas
3. ✅ **Sincronização automática**: Trigger cuida de tudo
4. ✅ **Controle centralizado**: Tudo gerenciado do CRM
5. ✅ **Auditoria**: Sabe quem liberou e quando
6. ✅ **Flexível**: Fácil adicionar/remover usuários

---

## 🎯 Próximos Passos

1. ✅ Executar migration para adicionar campos em `businesses`
2. ✅ Criar trigger de sincronização
3. ✅ Atualizar CRM para ter botão "Liberar Acesso"
4. ✅ Criar interface para adicionar múltiplos usuários
5. ✅ Testar fluxo completo

---

**Tempo estimado:** 2-3 horas

