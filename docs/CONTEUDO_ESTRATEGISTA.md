# 📝 Página de Conteúdo para Marketing Strategists

## 📋 Visão Geral

Página exclusiva para **marketing strategists** que estão relacionados a um business específico.

**URL:** `/conteudo-estrategista`

---

## 🔒 Controle de Acesso

### **Requisitos para Acesso:**

1. ✅ **User role:** `marketing_strategist`
2. ✅ **Creator ID:** Strategist deve ter `creator_id` (strategist é um creator)
3. ✅ **Business relacionado:** Deve existir um business com:
   - `strategist_id` = `user.creator_id`
   - `has_strategist` = `true`

### **Fluxo de Verificação:**

```typescript
// 1. Verificar se é marketing strategist
const isStrategist = user.role === 'marketing_strategist' || 
  (user.roles && user.roles.includes('marketing_strategist'));

// 2. Verificar se tem creator_id
if (!user.creator_id) {
  // Acesso negado
}

// 3. Buscar business relacionado
const { data: business } = await supabase
  .from('businesses')
  .select('id, name, has_strategist')
  .eq('strategist_id', user.creator_id)
  .eq('has_strategist', true)
  .maybeSingle();

// 4. Se não encontrar business, acesso negado
if (!business) {
  // Acesso negado
}
```

---

## 🗄️ Estrutura do Banco de Dados

### **Tabela `creators`:**
```sql
CREATE TABLE creators (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  is_strategist BOOLEAN DEFAULT false,
  strategist_specialties TEXT[],
  strategist_experience_years INTEGER,
  platform_email VARCHAR(255),
  platform_roles platform_user_role[],
  -- ... outros campos
);
```

### **Tabela `businesses`:**
```sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  has_strategist BOOLEAN DEFAULT false,
  strategist_id UUID REFERENCES creators(id),
  strategist_notes TEXT,
  -- ... outros campos
);
```

### **Tabela `platform_users`:**
```sql
CREATE TABLE platform_users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE,
  role platform_user_role,
  roles platform_user_role[],
  creator_id UUID REFERENCES creators(id),
  business_id UUID REFERENCES businesses(id),
  -- ... outros campos
);
```

---

## 📊 Exemplo de Dados

### **Creator que é Strategist:**
```json
{
  "id": "548f643b-0e0d-4a34-8582-d682c0000000",
  "name": "PIETRA MANTOVANI",
  "is_strategist": true,
  "strategist_specialties": ["Instagram", "TikTok"],
  "strategist_experience_years": 3,
  "platform_email": "pietramantovani98@gmail.com",
  "platform_roles": ["creator", "marketing_strategist"]
}
```

### **Business com Strategist:**
```json
{
  "id": "abc123...",
  "name": "Boussolé",
  "has_strategist": true,
  "strategist_id": "548f643b-0e0d-4a34-8582-d682c0000000",
  "strategist_notes": "Pietra é responsável pela estratégia de conteúdo"
}
```

### **Platform User (Strategist):**
```json
{
  "id": "xyz789...",
  "email": "pietramantovani98@gmail.com",
  "role": "marketing_strategist",
  "roles": ["creator", "marketing_strategist"],
  "creator_id": "548f643b-0e0d-4a34-8582-d682c0000000",
  "business_id": null
}
```

---

## 🚫 Páginas Bloqueadas

Marketing strategists **NÃO** têm acesso a:

- ❌ `/campaigns` → Redirecionado para `/conteudo-estrategista`
- ❌ `/reports` → Redirecionado para `/conteudo-estrategista`
- ❌ `/dashboard` → Apenas admin/manager/business_owner

---

## ✅ Páginas Permitidas

Marketing strategists **TÊM** acesso a:

- ✅ `/conteudo-estrategista` → Página exclusiva de conteúdo

---

## 🎯 Navegação

### **Menu Lateral (Sidebar):**

**Para `marketing_strategist`:**
```
📝 Conteúdo (/conteudo-estrategista)
```

**Para `creator`:**
```
📋 Campanhas (/campanhas-criador)
```

**Para `business_owner`:**
```
📊 Dashboard (/dashboard)
📋 Campanhas (/campaigns)
📝 Conteúdo (/conteudo)
📈 Relatórios (/reports)
```

**Para `admin`/`manager`:**
```
📊 Dashboard (/dashboard)
📋 Campanhas (/campaigns)
📝 Conteúdo (/conteudo)
📈 Relatórios (/reports)
```

---

## 🧪 Teste

### **1. Criar Strategist:**

```sql
-- 1. Criar creator que é strategist
INSERT INTO creators (
  id,
  organization_id,
  name,
  is_strategist,
  strategist_specialties,
  strategist_experience_years,
  platform_email,
  platform_access_status,
  platform_roles
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'Ana Silva - Estrategista',
  true,
  ARRAY['Instagram', 'TikTok', 'YouTube'],
  5,
  'ana@example.com',
  'granted',
  ARRAY['creator', 'marketing_strategist']::platform_user_role[]
);

-- 2. Criar platform_user
INSERT INTO platform_users (
  organization_id,
  email,
  full_name,
  role,
  roles,
  creator_id,
  is_active
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'ana@example.com',
  'Ana Silva - Estrategista',
  'marketing_strategist',
  ARRAY['creator', 'marketing_strategist']::platform_user_role[],
  (SELECT id FROM creators WHERE platform_email = 'ana@example.com'),
  true
);
```

### **2. Relacionar Strategist a Business:**

```sql
UPDATE businesses 
SET 
  has_strategist = true,
  strategist_id = (SELECT id FROM creators WHERE platform_email = 'ana@example.com'),
  strategist_notes = 'Ana é responsável pela estratégia de conteúdo'
WHERE name = 'Boussolé';
```

### **3. Testar Login:**

```
Email: ana@example.com
Senha: (senha configurada)
```

**Resultado esperado:**
- ✅ Login bem-sucedido
- ✅ Redirecionamento para `/conteudo-estrategista`
- ✅ Menu mostra apenas "Conteúdo"
- ✅ Acesso concedido ao business "Boussolé"
- ❌ Não consegue acessar `/campaigns` ou `/reports`

---

## 🔍 Verificação de Strategists

### **Script de Verificação:**

```bash
npx tsx scripts/check-business-strategist.ts
```

**Saída esperada:**
```
✅ Strategists encontrados: 5

   - PIETRA MANTOVANI (548f643b...)
     Especialidades: 
     Experiência: 3 anos

   - Ana Silva - Estrategista (f8563122...)
     Especialidades: Instagram,TikTok,YouTube
     Experiência: 5 anos

📊 Businesses com strategist: 3

   - Boussolé
     Strategist: PIETRA MANTOVANI

   - Clinica Odontológica Natalia
     Strategist: Marilia Marques
```

---

## 📝 TODO

### **Próximas Implementações:**

1. **Filtrar conteúdo por business:**
   - Passar `businessId` para `ContentPlanningView`
   - Mostrar apenas conteúdo do business relacionado

2. **Adicionar métricas específicas:**
   - Performance de conteúdo
   - Engajamento
   - ROI

3. **Implementar RLS:**
   ```sql
   CREATE POLICY "Strategists veem apenas conteúdo do seu business"
   ON content
   FOR SELECT
   USING (
     business_id IN (
       SELECT id FROM businesses 
       WHERE strategist_id IN (
         SELECT creator_id FROM platform_users 
         WHERE id = auth.uid()
       )
     )
   );
   ```

4. **Adicionar dashboard de strategist:**
   - Visão geral do business
   - Métricas de conteúdo
   - Tarefas pendentes

---

## 🚀 Deployment

### **Checklist:**

- [x] Criar página `/conteudo-estrategista`
- [x] Adicionar verificação de acesso
- [x] Bloquear `/campaigns` e `/reports`
- [x] Atualizar navegação
- [x] Documentação completa
- [ ] Testar com usuário real
- [ ] Implementar filtro por business
- [ ] Adicionar RLS policies

---

**Status:** ✅ Implementado  
**Última atualização:** 2025-10-15  
**Responsável:** Luiz Vincenzi

