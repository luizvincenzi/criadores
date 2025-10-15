# 🔄 Migração - Pietra Duplicada

## 📋 Problema Identificado

**Data:** 2025-10-15

### **Situação:**
- ✅ 2 entradas de "Pietra Mantovani" na tabela `creators`
- ❌ Duplicação causando problemas de autenticação e campanhas

### **Pietra Original (MANTER):**
```
ID: 548f643b-0e0d-4a34-8582-d682c0000000
Nome: PIETRA MANTOVANI
Criado em: 2025-07-15
Campanhas: 8
Instagram: @pietramantovani
Followers: 21,534
Email: N/A (antes da migração)
Status: pending (antes da migração)
```

### **Pietra Duplicada (DELETAR):**
```
ID: 975c1933-cfa0-4b3a-9660-f14259ec4b26
Nome: Pietra Mantovani
Criado em: 2025-10-15
Campanhas: 0
Email: pietramantovani98@gmail.com
Status: granted
```

---

## ✅ Solução Implementada

### **1. Atualização de platform_users**
```sql
UPDATE platform_users 
SET 
  creator_id = '548f643b-0e0d-4a34-8582-d682c0000000',
  full_name = 'PIETRA MANTOVANI',
  updated_at = NOW()
WHERE email = 'pietramantovani98@gmail.com';
```

**Resultado:**
- ✅ `platform_users` agora aponta para Pietra original
- ✅ Login funcionará com Pietra que tem campanhas

---

### **2. Deleção da Pietra Duplicada**
```sql
DELETE FROM creators 
WHERE id = '975c1933-cfa0-4b3a-9660-f14259ec4b26';
```

**Resultado:**
- ✅ Pietra duplicada removida
- ✅ Apenas 1 Pietra no banco de dados

---

### **3. Atualização da Pietra Original (PENDENTE)**

**⚠️ EXECUTAR NO SUPABASE SQL EDITOR:**

```sql
-- Desabilitar trigger temporariamente
ALTER TABLE creators DISABLE TRIGGER sync_creator_to_platform_users_trigger;

-- Atualizar Pietra original
UPDATE creators 
SET 
  platform_email = 'pietramantovani98@gmail.com',
  platform_access_status = 'granted',
  platform_access_granted_at = NOW(),
  platform_access_granted_by = '00000000-0000-0000-0000-000000000001',
  platform_roles = ARRAY['creator', 'marketing_strategist']::platform_user_role[],
  contact_info = jsonb_build_object(
    'email', 'pietramantovani98@gmail.com',
    'whatsapp', '43 98807-2689',
    'phone', '',
    'preferred_contact', 'email'
  ),
  updated_at = NOW()
WHERE id = '548f643b-0e0d-4a34-8582-d682c0000000';

-- Reabilitar trigger
ALTER TABLE creators ENABLE TRIGGER sync_creator_to_platform_users_trigger;
```

**Por que desabilitar o trigger?**
- O trigger `sync_creator_to_platform_users_trigger` tenta criar/atualizar `platform_users`
- Como já existe um registro com o email, dá erro de constraint
- Desabilitando temporariamente, podemos atualizar sem conflitos

---

## 🔍 Verificação

### **Após executar o SQL acima, verificar:**

```sql
-- 1. Verificar Pietra em creators
SELECT 
  id,
  name,
  platform_email,
  platform_access_status,
  platform_roles,
  social_media->>'instagram' as instagram
FROM creators 
WHERE id = '548f643b-0e0d-4a34-8582-d682c0000000';
```

**Resultado esperado:**
```
id: 548f643b-0e0d-4a34-8582-d682c0000000
name: PIETRA MANTOVANI
platform_email: pietramantovani98@gmail.com
platform_access_status: granted
platform_roles: {creator, marketing_strategist}
instagram: {"username": "@pietramantovani", "followers": 21534}
```

---

```sql
-- 2. Verificar platform_users
SELECT 
  id,
  email,
  full_name,
  creator_id,
  roles,
  is_active
FROM platform_users 
WHERE email = 'pietramantovani98@gmail.com';
```

**Resultado esperado:**
```
email: pietramantovani98@gmail.com
creator_id: 548f643b-0e0d-4a34-8582-d682c0000000
roles: {creator, marketing_strategist}
is_active: true
```

---

```sql
-- 3. Verificar campanhas
SELECT COUNT(*) as total_campanhas
FROM campaign_creators 
WHERE creator_id = '548f643b-0e0d-4a34-8582-d682c0000000';
```

**Resultado esperado:**
```
total_campanhas: 8
```

---

## 🧪 Teste de Login

### **Credenciais:**
```
Email: pietramantovani98@gmail.com
Senha: 2#Todoscria
```

### **Fluxo esperado:**
1. ✅ Login bem-sucedido
2. ✅ Redirecionamento para `/campanhas-criador`
3. ✅ Exibição de 8 campanhas
4. ✅ Menu mostra apenas "Campanhas"
5. ✅ Não consegue acessar `/campaigns` ou `/reports`

---

## 📊 Mudanças de URL

### **Antes:**
```
/campaigns_creator
```

### **Depois:**
```
/campanhas-criador
```

**Motivo:** Padronização de URLs em português

---

## 🔒 Segurança

### **Filtro de Campanhas:**
```typescript
// Busca APENAS campanhas do creator logado
const { data } = await supabase
  .from('campaign_creators')
  .select(`
    campaigns:campaign_id (
      id,
      title,
      businesses:business_id (name)
    )
  `)
  .eq('creator_id', user.creator_id); // 🔒 FILTRO CRÍTICO
```

### **Bloqueio de Páginas:**
```typescript
// Redireciona creators que tentam acessar /campaigns ou /reports
if (isOnlyCreator) {
  router.push('/campanhas-criador');
}
```

---

## 📝 Scripts Criados

### **1. check-pietra-campaigns.ts**
- Verifica campanhas da Pietra
- Identifica duplicações
- Mostra estatísticas

### **2. merge-duplicate-pietra.ts**
- Mescla Pietras duplicadas
- Migra dados de acesso
- Deleta duplicada

### **3. merge-duplicate-pietra-v2.ts**
- Versão melhorada
- Usa service role key
- Trata erros de trigger

### **4. EXECUTE_NO_SUPABASE.sql**
- SQL para executar manualmente
- Desabilita/reabilita trigger
- Atualiza Pietra original

---

## ⚠️ Próximos Passos

### **1. EXECUTAR SQL NO SUPABASE** (URGENTE)
```bash
# Abrir Supabase SQL Editor
# Copiar conteúdo de scripts/EXECUTE_NO_SUPABASE.sql
# Executar
```

### **2. Testar Login**
```bash
# Login com pietramantovani98@gmail.com
# Verificar se campanhas aparecem
# Verificar se redirecionamento funciona
```

### **3. Prevenir Duplicações Futuras**
```sql
-- Adicionar constraint de email único em creators
ALTER TABLE creators 
ADD CONSTRAINT creators_platform_email_unique 
UNIQUE (platform_email);
```

### **4. Implementar RLS**
```sql
-- Política para campaign_creators
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

---

## 🎯 Checklist Final

- [x] Identificar Pietras duplicadas
- [x] Atualizar platform_users para Pietra original
- [x] Deletar Pietra duplicada
- [ ] **EXECUTAR SQL para atualizar Pietra original** ⚠️
- [ ] Testar login
- [ ] Verificar campanhas
- [ ] Adicionar constraint de email único
- [ ] Implementar RLS

---

## 📞 Suporte

Se houver problemas:

1. **Verificar logs do console:**
```javascript
// Ao fazer login
📊 Carregando campanhas do creator: 548f643b-0e0d-4a34-8582-d682c0000000
✅ Campanhas do creator carregadas: 8
```

2. **Verificar no banco:**
```sql
SELECT * FROM platform_users WHERE email = 'pietramantovani98@gmail.com';
SELECT * FROM creators WHERE id = '548f643b-0e0d-4a34-8582-d682c0000000';
```

3. **Executar script de verificação:**
```bash
npx tsx scripts/check-pietra-campaigns.ts
```

---

**Status:** ⚠️ Aguardando execução do SQL no Supabase  
**Última atualização:** 2025-10-15  
**Responsável:** Luiz Vincenzi

