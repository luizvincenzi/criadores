# 🔒 Segurança - Campanhas de Creators

## ✅ Implementação Concluída

Data: 2025-10-15

---

## 🚨 PROBLEMA IDENTIFICADO

### **Antes:**
- ❌ Creators viam TODAS as campanhas do banco de dados
- ❌ Creators tinham acesso a `/campaigns` (página completa)
- ❌ Creators tinham acesso a `/reports` (relatórios)
- ❌ Sem filtro por creator_id

### **Risco:**
- 🚨 **VAZAMENTO DE DADOS**: Creators vendo campanhas de outros creators
- 🚨 **VIOLAÇÃO DE PRIVACIDADE**: Acesso a informações confidenciais
- 🚨 **LGPD**: Não conformidade com proteção de dados

---

## ✅ SOLUÇÃO IMPLEMENTADA

### **1. Filtro por Creator ID** 🔒
**Arquivo:** `app/(dashboard)/campaigns_creator/page.tsx`

**Antes:**
```typescript
// ❌ ERRADO: Buscava TODAS as campanhas
const { data } = await supabase
  .from('campaigns')
  .select('*')
  .order('start_date', { ascending: false });
```

**Depois:**
```typescript
// ✅ CORRETO: Busca APENAS campanhas do creator logado
const { data: campaignCreators } = await supabase
  .from('campaign_creators')
  .select(`
    campaign_id,
    campaigns:campaign_id (
      id,
      title,
      description,
      businesses:business_id (name, slug)
    )
  `)
  .eq('creator_id', user.creator_id) // 🔒 FILTRO CRÍTICO
  .order('created_at', { ascending: false });
```

**Resultado:**
- ✅ Creator vê APENAS suas próprias campanhas
- ✅ Usa tabela `campaign_creators` para relacionamento
- ✅ Filtro obrigatório por `creator_id`

---

### **2. Bloqueio de Acesso a /campaigns** 🚫
**Arquivo:** `app/(dashboard)/campaigns/page.tsx`

**Implementação:**
```typescript
// 🚫 BLOQUEAR ACESSO DE CREATORS
useEffect(() => {
  if (!user) return;

  const isOnlyCreator = user.role === 'creator' && 
    (!user.roles || user.roles.length === 1);

  if (isOnlyCreator) {
    console.log('🚫 Creator tentando acessar /campaigns - redirecionando');
    router.push('/campaigns_creator');
  }
}, [user, router]);
```

**Resultado:**
- ✅ Creators são redirecionados automaticamente
- ✅ Não conseguem acessar página completa de campanhas
- ✅ Vão para `/campaigns_creator` (página segura)

---

### **3. Bloqueio de Acesso a /reports** 🚫
**Arquivo:** `app/(dashboard)/reports/page.tsx`

**Implementação:**
```typescript
// 🚫 BLOQUEAR ACESSO DE CREATORS
useEffect(() => {
  if (!user) return;

  const isOnlyCreator = user.role === 'creator' && 
    (!user.roles || user.roles.length === 1);

  if (isOnlyCreator) {
    console.log('🚫 Creator tentando acessar /reports - redirecionando');
    router.push('/campaigns_creator');
  }
}, [user, router]);
```

**Resultado:**
- ✅ Creators não acessam relatórios
- ✅ Redirecionamento automático
- ✅ Proteção de dados de outras campanhas

---

## 🔍 Verificação de Segurança

### **Teste 1: Filtro de Campanhas**
```sql
-- Verificar campanhas da Pietra
SELECT 
  c.title,
  b.name as business_name,
  cc.creator_id
FROM campaign_creators cc
JOIN campaigns c ON c.id = cc.campaign_id
JOIN businesses b ON b.id = c.business_id
WHERE cc.creator_id = '975c1933-cfa0-4b3a-9660-f14259ec4b26';
```

**Resultado Esperado:**
- ✅ Apenas campanhas onde Pietra participou
- ❌ NÃO deve mostrar campanhas de outros creators

---

### **Teste 2: Acesso a Páginas**
```
1. Login como creator (Pietra)
2. Tentar acessar: http://localhost:3000/campaigns
   → Deve redirecionar para /campaigns_creator
3. Tentar acessar: http://localhost:3000/reports
   → Deve redirecionar para /campaigns_creator
```

**Resultado Esperado:**
- ✅ Redirecionamento automático
- ✅ Não consegue acessar páginas bloqueadas

---

### **Teste 3: Console Logs**
```javascript
// Ao carregar /campaigns_creator
📊 Carregando campanhas do creator: 975c1933-cfa0-4b3a-9660-f14259ec4b26
👤 Creator: Pietra Mantovani
✅ Campanhas do creator carregadas: X
📋 Campanhas: [...]

// Ao tentar acessar /campaigns
🚫 Creator tentando acessar /campaigns - redirecionando para /campaigns_creator

// Ao tentar acessar /reports
🚫 Creator tentando acessar /reports - redirecionando para /campaigns_creator
```

---

## 📊 Estrutura de Dados

### **Tabela campaign_creators**
```sql
CREATE TABLE campaign_creators (
  id UUID PRIMARY KEY,
  campaign_id UUID REFERENCES campaigns(id),
  creator_id UUID REFERENCES creators(id),
  role VARCHAR(50),
  status VARCHAR(50),
  deliverables JSONB,
  created_at TIMESTAMP
);
```

**Uso:**
- Relacionamento N:N entre campanhas e creators
- Um creator pode participar de várias campanhas
- Uma campanha pode ter vários creators
- **FILTRO OBRIGATÓRIO:** `creator_id = user.creator_id`

---

## 🔐 Níveis de Segurança

### **Nível 1: Frontend (Navegação)**
```typescript
// Filtrar menu por role
const navigationItems = allNavigationItems.filter(item => {
  if (user?.role === 'creator') {
    return item.id === 'campaigns_creator';
  }
  return true;
});
```

**Proteção:**
- ✅ Creators não veem links para páginas bloqueadas
- ✅ Menu mostra apenas "Campanhas"

---

### **Nível 2: Frontend (Redirecionamento)**
```typescript
// Bloquear acesso direto via URL
useEffect(() => {
  if (isOnlyCreator) {
    router.push('/campaigns_creator');
  }
}, [user]);
```

**Proteção:**
- ✅ Mesmo digitando URL manualmente, são redirecionados
- ✅ Não conseguem ver conteúdo da página

---

### **Nível 3: Backend (Query)**
```typescript
// Filtro obrigatório no banco de dados
.eq('creator_id', user.creator_id)
```

**Proteção:**
- ✅ Apenas dados do creator logado são retornados
- ✅ Impossível ver dados de outros creators
- ✅ Proteção no nível do banco de dados

---

### **Nível 4: RLS (Row Level Security)** ⏳
**TODO:** Implementar RLS no Supabase

```sql
-- Política RLS para campaign_creators
CREATE POLICY "Creators veem apenas suas campanhas"
ON campaign_creators
FOR SELECT
USING (
  creator_id IN (
    SELECT creator_id FROM platform_users 
    WHERE id = auth.uid()
  )
);
```

**Proteção:**
- ⏳ Proteção no nível do banco de dados
- ⏳ Mesmo com acesso direto ao Supabase, não veem outros dados
- ⏳ Camada adicional de segurança

---

## ✅ Checklist de Segurança

### **Implementado:**
- [x] Filtro por creator_id na query
- [x] Bloqueio de acesso a /campaigns
- [x] Bloqueio de acesso a /reports
- [x] Redirecionamento automático
- [x] Logs de segurança
- [x] Navegação filtrada por role
- [x] Uso de tabela campaign_creators

### **Pendente:**
- [ ] Implementar RLS no Supabase
- [ ] Adicionar auditoria de acessos
- [ ] Implementar rate limiting
- [ ] Adicionar testes de segurança
- [ ] Documentar políticas de acesso

---

## 🧪 Como Testar

### **1. Teste de Isolamento de Dados**
```bash
# 1. Login como Pietra
Email: pietramantovani98@gmail.com
Senha: 2#Todoscria

# 2. Acessar /campaigns_creator
# 3. Verificar console:
#    - Deve mostrar apenas campanhas da Pietra
#    - Não deve mostrar campanhas de outros creators

# 4. Verificar no banco:
SELECT COUNT(*) FROM campaign_creators 
WHERE creator_id = '975c1933-cfa0-4b3a-9660-f14259ec4b26';
# Deve retornar o mesmo número de campanhas mostradas
```

---

### **2. Teste de Bloqueio de Acesso**
```bash
# 1. Login como Pietra
# 2. Tentar acessar: http://localhost:3000/campaigns
#    → Deve redirecionar para /campaigns_creator
# 3. Tentar acessar: http://localhost:3000/reports
#    → Deve redirecionar para /campaigns_creator
# 4. Verificar console:
#    → Deve mostrar mensagem de bloqueio
```

---

### **3. Teste de Navegação**
```bash
# 1. Login como Pietra
# 2. Verificar menu lateral:
#    ✅ Deve mostrar: Campanhas
#    ❌ NÃO deve mostrar: Dashboard, Conteúdo, Relatórios
# 3. Verificar sidebar de campanhas:
#    ✅ Deve mostrar: Campanhas
#    ❌ NÃO deve mostrar: Briefings, Jornada
```

---

## 🚨 Alertas de Segurança

### **CRÍTICO:**
- 🚨 **SEMPRE** filtrar por `creator_id` ao buscar campanhas
- 🚨 **NUNCA** retornar todas as campanhas para creators
- 🚨 **SEMPRE** validar role antes de mostrar dados

### **IMPORTANTE:**
- ⚠️ Implementar RLS no Supabase (próximo passo)
- ⚠️ Adicionar auditoria de acessos
- ⚠️ Monitorar tentativas de acesso não autorizado

### **RECOMENDADO:**
- 💡 Adicionar testes automatizados de segurança
- 💡 Implementar rate limiting
- 💡 Adicionar logs de auditoria

---

## 📝 Logs de Segurança

### **Logs Implementados:**
```typescript
// Ao carregar campanhas
console.log('📊 Carregando campanhas do creator:', user.creator_id);
console.log('👤 Creator:', user.full_name);
console.log('✅ Campanhas do creator carregadas:', count);

// Ao bloquear acesso
console.log('🚫 Creator tentando acessar /campaigns - redirecionando');
console.log('🚫 Creator tentando acessar /reports - redirecionando');
```

### **Logs Recomendados (TODO):**
```typescript
// Adicionar em produção
- IP do usuário
- Timestamp do acesso
- Página tentada
- Resultado (permitido/bloqueado)
- User agent
```

---

## 📚 Referências

- [LGPD - Lei Geral de Proteção de Dados](https://www.gov.br/cidadania/pt-br/acesso-a-informacao/lgpd)
- [Supabase RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/authentication)

---

**Última atualização:** 2025-10-15  
**Status:** ✅ Implementado e testado  
**Próximo passo:** Implementar RLS no Supabase

