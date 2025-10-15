# 🚀 EXECUTAR AGORA - Guia Rápido

## ⚠️ IMPORTANTE: Erros Corrigidos

Os erros que você viu foram:
1. ✅ **Trigger duplicado** - CORRIGIDO (agora usa DROP IF EXISTS)
2. ✅ **Query múltipla** - CORRIGIDO (removido do bloco DO)

---

## 📋 Passo a Passo

### **PASSO 1: Abra o Supabase SQL Editor**

```
https://supabase.com/dashboard/project/[seu-projeto]/sql
```

---

### **PASSO 2: Execute a Migration Corrigida**

Copie **TODO** o conteúdo de:
```
supabase/migrations/030_add_platform_access_control_FIXED.sql
```

Cole no SQL Editor e clique em **"Run"**

---

### **PASSO 3: Verifique o Resultado**

Você deve ver:
```
✅ Migration 030 executada com sucesso!
✅ Triggers criados e funções auxiliares disponíveis!
✅ RLS será configurado separadamente para evitar conflitos
```

---

### **PASSO 4: Verificar Estrutura**

Execute para confirmar que os campos foram adicionados:

```sql
-- Ver campos em creators
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'creators' 
AND column_name LIKE 'platform%'
ORDER BY column_name;

-- Ver campos em businesses
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND column_name LIKE 'platform%'
ORDER BY column_name;
```

**Resultado esperado:**
```
platform_access_granted_at
platform_access_granted_by
platform_access_status
platform_email (creators)
platform_password_hash (creators)
platform_roles (creators)
platform_owner_name (businesses)
platform_owner_email (businesses)
platform_owner_whatsapp (businesses)
platform_additional_users (businesses)
```

---

### **PASSO 5: Conectar Pietra Mantovani**

#### 5.1. Buscar ID da Pietra:

```sql
SELECT id, name, slug, contact_info->>'email' as email
FROM creators 
WHERE name ILIKE '%pietra%' OR slug ILIKE '%pietra%'
LIMIT 5;
```

**Copie o UUID retornado!**

#### 5.2. Liberar acesso:

```sql
-- SUBSTITUA [UUID_DA_PIETRA] pelo UUID real que você copiou
SELECT grant_creator_platform_access(
  '[UUID_DA_PIETRA]'::uuid,
  'pietramantovani98@gmail.com',
  ARRAY['creator', 'marketing_strategist']::platform_user_role[],
  '00000000-0000-0000-0000-000000000001'::uuid
);
```

**Resultado esperado:**
```
grant_creator_platform_access
-----------------------------
t (true)
```

#### 5.3. Verificar sincronização:

```sql
-- Ver em creators
SELECT 
  name,
  platform_access_status,
  platform_email,
  platform_roles
FROM creators 
WHERE platform_email = 'pietramantovani98@gmail.com';

-- Ver em platform_users
SELECT 
  email,
  full_name,
  roles,
  creator_id,
  is_active
FROM platform_users 
WHERE email = 'pietramantovani98@gmail.com';
```

**Resultado esperado:**
```
creators:
- platform_access_status: granted
- platform_email: pietramantovani98@gmail.com
- platform_roles: {creator,marketing_strategist}

platform_users:
- email: pietramantovani98@gmail.com
- roles: {creator,marketing_strategist}
- is_active: true
- creator_id: [mesmo UUID do creator]
```

---

### **PASSO 6: Conectar Marilia Marques**

#### 6.1. Buscar ID da Marilia:

```sql
SELECT id, name, slug, contact_info->>'email' as email
FROM creators 
WHERE name ILIKE '%marilia%' OR slug ILIKE '%marilia%'
LIMIT 5;
```

**Copie o UUID retornado!**

#### 6.2. Liberar acesso:

```sql
-- SUBSTITUA [UUID_DA_MARILIA] pelo UUID real
SELECT grant_creator_platform_access(
  '[UUID_DA_MARILIA]'::uuid,
  'marilia12cavalheiro@gmail.com',
  ARRAY['marketing_strategist', 'creator']::platform_user_role[],
  '00000000-0000-0000-0000-000000000001'::uuid
);
```

#### 6.3. Verificar:

```sql
SELECT 
  email,
  full_name,
  roles,
  creator_id,
  is_active
FROM platform_users 
WHERE email = 'marilia12cavalheiro@gmail.com';
```

---

### **PASSO 7: Ver Todos os Usuários Criados**

```sql
SELECT 
  pu.email,
  pu.full_name,
  pu.roles,
  c.name as creator_name,
  pu.is_active,
  pu.created_at
FROM platform_users pu
LEFT JOIN creators c ON pu.creator_id = c.id
WHERE pu.is_active = true
ORDER BY pu.created_at DESC;
```

---

## ✅ Checklist de Validação

Execute cada query e marque:

- [ ] Migration 030 executada sem erros
- [ ] Campos `platform_*` existem em `creators`
- [ ] Campos `platform_*` existem em `businesses`
- [ ] Triggers criados (sem erro de duplicação)
- [ ] Funções auxiliares criadas
- [ ] Pietra conectada e sincronizada
- [ ] Marilia conectada e sincronizada
- [ ] Registros em `platform_users` criados
- [ ] `creator_id` correto para ambas
- [ ] Roles corretos para ambas

---

## 🔍 Queries de Diagnóstico

### Ver triggers criados:

```sql
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name
FROM pg_trigger 
WHERE tgname LIKE '%platform%'
ORDER BY tgname;
```

**Resultado esperado:**
```
trigger_sync_business_platform_access | businesses
trigger_sync_creator_platform_access  | creators
```

---

### Ver funções criadas:

```sql
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments
FROM pg_proc 
WHERE proname LIKE '%platform%'
ORDER BY proname;
```

**Resultado esperado:**
```
get_user_businesses
grant_business_platform_access
grant_creator_platform_access
log_platform_access
sync_business_to_platform_user
sync_creator_to_platform_user
user_has_access_to_business
```

---

### Ver constraints criadas:

```sql
SELECT 
  conname as constraint_name,
  conrelid::regclass as table_name
FROM pg_constraint 
WHERE conname LIKE '%platform%'
ORDER BY conname;
```

**Resultado esperado:**
```
check_business_owner_has_business | platform_users
check_creator_has_creator_id      | platform_users
```

---

## 🚨 Troubleshooting

### Se ainda der erro de trigger duplicado:

```sql
-- Remover triggers manualmente
DROP TRIGGER IF EXISTS trigger_sync_creator_platform_access ON creators;
DROP TRIGGER IF EXISTS trigger_sync_business_platform_access ON businesses;

-- Depois execute a migration novamente
```

---

### Se a função grant_creator_platform_access não existir:

```sql
-- Verificar se foi criada
SELECT proname FROM pg_proc WHERE proname = 'grant_creator_platform_access';

-- Se não existir, copie apenas a parte da função da migration e execute
```

---

### Se não encontrar Pietra ou Marilia:

```sql
-- Buscar todos os creators
SELECT id, name, slug FROM creators 
ORDER BY name 
LIMIT 20;

-- Buscar por parte do nome
SELECT id, name, slug FROM creators 
WHERE name ILIKE '%pietra%' OR name ILIKE '%mantovani%';
```

---

## 🎯 Resultado Final Esperado

Após executar tudo:

```sql
SELECT 
  'Pietra Mantovani' as usuario,
  COUNT(*) as total_registros,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ SUCESSO'
    ELSE '❌ VERIFICAR'
  END as status
FROM platform_users 
WHERE email = 'pietramantovani98@gmail.com'

UNION ALL

SELECT 
  'Marilia Marques' as usuario,
  COUNT(*) as total_registros,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ SUCESSO'
    ELSE '❌ VERIFICAR'
  END as status
FROM platform_users 
WHERE email = 'marilia12cavalheiro@gmail.com';
```

**Resultado esperado:**
```
usuario           | total_registros | status
------------------+-----------------+-----------
Pietra Mantovani  | 1               | ✅ SUCESSO
Marilia Marques   | 1               | ✅ SUCESSO
```

---

## 📚 Próximos Passos

Depois de validar tudo:

1. ✅ Ler `docs/SEGURANCA_E_LGPD.md` para entender o isolamento
2. ✅ Testar com `scripts/test-security-isolation.sql`
3. ✅ Implementar API de login
4. ✅ Criar interface no CRM para liberar acessos

---

**Tempo estimado:** 15-30 minutos  
**Dificuldade:** Fácil (apenas copiar e colar)

