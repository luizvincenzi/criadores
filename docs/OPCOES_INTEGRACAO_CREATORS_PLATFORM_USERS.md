# 🎯 Integração: Creators ↔ Platform_Users

## 📊 Situação Atual

### Problema Identificado:
- **Tabela `creators`**: Cadastro de criadores no CRM (criadores.digital)
- **Tabela `platform_users`**: Acesso à plataforma (criadores.app)
- **Mesma pessoa, duas tabelas**: Pietra e Marilia existem em ambas

### Exemplos:
1. **Pietra Mantovani**
   - CRM: Cadastrada na tabela `creators` (com Instagram, WhatsApp, etc)
   - Plataforma: Precisa acessar criadores.app com `pietramantovani98@gmail.com`

2. **Marilia Marques**
   - CRM: Cadastrada como "Marilia Marques" (@mariliacavalheiro1)
   - Plataforma: Precisa acessar criadores.app com `marilia12cavalheiro@gmail.com`

### Requisitos:
1. ✅ Conectar `creators` ↔ `platform_users` (mesmo UUID)
2. ✅ Controlar acesso do CRM (liberar/negar acesso)
3. ✅ Quando liberar no CRM → criar acesso automático na plataforma
4. ✅ Quando negar no CRM → desativar acesso na plataforma

---

## 🎯 3 Opções de Implementação

---

## 📌 OPÇÃO 1: Campo de Controle na Tabela `creators` (RECOMENDADA ⭐)

### Conceito:
Adicionar campos de controle de acesso diretamente na tabela `creators`. O `platform_users.creator_id` aponta para `creators.id` (mesmo UUID).

### Estrutura:

```sql
-- Adicionar à tabela creators
ALTER TABLE creators ADD COLUMN platform_access_status VARCHAR(50) DEFAULT 'pending';
ALTER TABLE creators ADD COLUMN platform_access_granted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE creators ADD COLUMN platform_access_granted_by UUID REFERENCES users(id);
ALTER TABLE creators ADD COLUMN platform_email VARCHAR(255);
ALTER TABLE creators ADD COLUMN platform_password_hash TEXT;

-- Valores possíveis para platform_access_status:
-- 'pending'   = Aguardando liberação
-- 'granted'   = Acesso liberado
-- 'denied'    = Acesso negado
-- 'suspended' = Acesso suspenso temporariamente
-- 'revoked'   = Acesso revogado
```

### Fluxo:

```
CRM (criadores.digital)
│
├─ Funcionário clica "Liberar Acesso" no criador
│  └─ UPDATE creators SET platform_access_status = 'granted'
│
├─ Trigger automático detecta mudança
│  └─ Se 'granted': Cria/ativa em platform_users
│  └─ Se 'denied/revoked': Desativa em platform_users
│
└─ Creator pode fazer login em criadores.app
```

### Implementação:

```sql
-- 1. Migration para adicionar campos
ALTER TABLE creators 
  ADD COLUMN platform_access_status VARCHAR(50) DEFAULT 'pending',
  ADD COLUMN platform_access_granted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN platform_access_granted_by UUID REFERENCES users(id),
  ADD COLUMN platform_email VARCHAR(255),
  ADD COLUMN platform_password_hash TEXT,
  ADD COLUMN platform_roles platform_user_role[] DEFAULT ARRAY['creator']::platform_user_role[];

-- 2. Criar índice
CREATE INDEX idx_creators_platform_access ON creators(platform_access_status);
CREATE INDEX idx_creators_platform_email ON creators(platform_email);

-- 3. Trigger para sincronizar com platform_users
CREATE OR REPLACE FUNCTION sync_creator_to_platform_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Se acesso foi liberado
  IF NEW.platform_access_status = 'granted' AND OLD.platform_access_status != 'granted' THEN
    -- Criar ou ativar em platform_users
    INSERT INTO platform_users (
      id, -- MESMO UUID do creator
      organization_id,
      email,
      full_name,
      role,
      roles,
      creator_id,
      is_active,
      platform
    ) VALUES (
      NEW.id, -- ← IMPORTANTE: Mesmo UUID!
      NEW.organization_id,
      NEW.platform_email,
      NEW.name,
      'creator',
      NEW.platform_roles,
      NEW.id,
      true,
      'client'
    )
    ON CONFLICT (id) DO UPDATE SET
      is_active = true,
      email = NEW.platform_email,
      roles = NEW.platform_roles,
      updated_at = NOW();
  END IF;
  
  -- Se acesso foi negado/revogado
  IF NEW.platform_access_status IN ('denied', 'revoked', 'suspended') THEN
    UPDATE platform_users 
    SET is_active = false, updated_at = NOW()
    WHERE creator_id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_creator_platform_access
  AFTER UPDATE OF platform_access_status ON creators
  FOR EACH ROW
  EXECUTE FUNCTION sync_creator_to_platform_user();
```

### Vantagens:
- ✅ **Fonte única de verdade**: `creators` controla tudo
- ✅ **Sincronização automática**: Trigger cuida da sincronia
- ✅ **Mesmo UUID**: `creators.id` = `platform_users.id`
- ✅ **Controle centralizado**: Tudo gerenciado do CRM
- ✅ **Auditoria**: Sabe quem liberou e quando
- ✅ **Simples**: Fácil de entender e manter

### Desvantagens:
- ⚠️ Adiciona campos à tabela `creators`
- ⚠️ Trigger pode falhar (precisa tratamento de erro)

---

## 📌 OPÇÃO 2: Tabela de Relacionamento Intermediária

### Conceito:
Criar uma tabela `creator_platform_access` que faz a ponte entre `creators` e `platform_users`.

### Estrutura:

```sql
CREATE TABLE creator_platform_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  platform_user_id UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  
  -- Controle de Acesso
  access_status VARCHAR(50) DEFAULT 'pending',
  access_granted_at TIMESTAMP WITH TIME ZONE,
  access_granted_by UUID REFERENCES users(id),
  access_revoked_at TIMESTAMP WITH TIME ZONE,
  access_revoked_by UUID REFERENCES users(id),
  access_revoked_reason TEXT,
  
  -- Configurações
  platform_email VARCHAR(255) NOT NULL,
  platform_roles platform_user_role[] DEFAULT ARRAY['creator']::platform_user_role[],
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(creator_id)
);
```

### Fluxo:

```
creators ←→ creator_platform_access ←→ platform_users
   │              │                          │
   │              ├─ access_status          │
   │              ├─ platform_email         │
   │              └─ platform_roles         │
   │                                         │
   └─────────────────────────────────────────┘
```

### Vantagens:
- ✅ **Separação de responsabilidades**: Cada tabela tem seu propósito
- ✅ **Histórico completo**: Pode guardar todas as mudanças
- ✅ **Flexível**: Fácil adicionar novos campos de controle
- ✅ **Não modifica `creators`**: Mantém tabela original intacta

### Desvantagens:
- ⚠️ **Mais complexo**: 3 tabelas em vez de 2
- ⚠️ **Mais JOINs**: Queries mais pesadas
- ⚠️ **UUIDs diferentes**: `creators.id` ≠ `platform_users.id`

---

## 📌 OPÇÃO 3: ENUM de Status + Coluna Simples em `creators`

### Conceito:
Abordagem minimalista: apenas um campo `platform_access` na tabela `creators`.

### Estrutura:

```sql
-- 1. Criar ENUM
CREATE TYPE platform_access_type AS ENUM (
  'none',      -- Sem acesso
  'pending',   -- Aguardando aprovação
  'active',    -- Acesso ativo
  'suspended', -- Suspenso
  'revoked'    -- Revogado
);

-- 2. Adicionar à tabela creators
ALTER TABLE creators 
  ADD COLUMN platform_access platform_access_type DEFAULT 'none',
  ADD COLUMN platform_user_id UUID REFERENCES platform_users(id);

-- 3. Índice
CREATE INDEX idx_creators_platform_access ON creators(platform_access);
```

### Fluxo:

```
CRM: Liberar acesso
  ↓
UPDATE creators SET platform_access = 'active'
  ↓
Aplicação cria platform_user
  ↓
UPDATE creators SET platform_user_id = [novo_id]
```

### Vantagens:
- ✅ **Muito simples**: Apenas 2 campos
- ✅ **Rápido**: Menos processamento
- ✅ **Fácil consultar**: `WHERE platform_access = 'active'`

### Desvantagens:
- ⚠️ **Sem auditoria**: Não sabe quem liberou/quando
- ⚠️ **Sem histórico**: Perde informações de mudanças
- ⚠️ **Menos controle**: Funcionalidades limitadas

---

## 📊 Comparação das Opções

| Aspecto | Opção 1 (Campos) | Opção 2 (Tabela) | Opção 3 (ENUM) |
|---------|------------------|------------------|----------------|
| **Complexidade** | Média | Alta | Baixa |
| **Manutenção** | Fácil | Média | Muito Fácil |
| **Performance** | Boa | Média | Excelente |
| **Auditoria** | Completa | Completa | Nenhuma |
| **Histórico** | Parcial | Completo | Nenhum |
| **Flexibilidade** | Boa | Excelente | Limitada |
| **Sincronização** | Automática (trigger) | Manual/API | Manual/API |
| **Mesmo UUID** | ✅ Sim | ❌ Não | ❌ Não |

---

## 🎯 Recomendação Final

### ⭐ **OPÇÃO 1: Campo de Controle na Tabela `creators`**

**Por quê?**

1. ✅ **Mesmo UUID**: `creators.id` = `platform_users.id` = Relacionamento perfeito
2. ✅ **Sincronização automática**: Trigger cuida de tudo
3. ✅ **Auditoria**: Sabe quem liberou e quando
4. ✅ **Controle centralizado**: Tudo no CRM
5. ✅ **Simples de usar**: Funcionário só clica "Liberar Acesso"
6. ✅ **Escalável**: Funciona para milhares de criadores

**Fluxo Completo:**

```
1. CRM (criadores.digital)
   └─ Funcionário acessa perfil do criador
   └─ Clica "Liberar Acesso à Plataforma"
   └─ Preenche email: pietramantovani98@gmail.com
   └─ Seleciona roles: [creator, marketing_strategist]
   └─ Clica "Confirmar"

2. Backend
   └─ UPDATE creators SET 
       platform_access_status = 'granted',
       platform_email = 'pietramantovani98@gmail.com',
       platform_roles = ['creator', 'marketing_strategist'],
       platform_access_granted_by = [id_do_funcionario],
       platform_access_granted_at = NOW()

3. Trigger Automático
   └─ Detecta mudança em platform_access_status
   └─ Cria/atualiza em platform_users com MESMO UUID
   └─ Envia email de boas-vindas para o criador

4. Criador
   └─ Recebe email com link de ativação
   └─ Define senha
   └─ Faz login em criadores.app
```

---

## 📝 Próximos Passos

Se você escolher a **Opção 1** (recomendada):

1. ✅ Executar migration para adicionar campos em `creators`
2. ✅ Criar trigger de sincronização
3. ✅ Atualizar CRM para ter botão "Liberar Acesso"
4. ✅ Criar API para gerenciar acesso
5. ✅ Conectar Pietra e Marilia manualmente
6. ✅ Testar fluxo completo

---

## 🔍 Consultas Úteis

```sql
-- Ver criadores com acesso liberado
SELECT 
  c.name,
  c.platform_access_status,
  c.platform_email,
  c.platform_roles,
  pu.email as platform_user_email,
  pu.is_active
FROM creators c
LEFT JOIN platform_users pu ON c.id = pu.creator_id
WHERE c.platform_access_status = 'granted';

-- Ver criadores aguardando liberação
SELECT name, contact_info->>'email', platform_access_status
FROM creators
WHERE platform_access_status = 'pending';

-- Liberar acesso manualmente
UPDATE creators 
SET 
  platform_access_status = 'granted',
  platform_email = 'pietramantovani98@gmail.com',
  platform_roles = ARRAY['creator', 'marketing_strategist']::platform_user_role[],
  platform_access_granted_at = NOW()
WHERE slug = 'pietra-mantovani';
```

---

## 🎉 Conclusão

A **Opção 1** oferece o melhor equilíbrio entre:
- Simplicidade de uso
- Controle centralizado
- Sincronização automática
- Auditoria completa
- Performance

**Tempo de implementação:** 2-3 horas

