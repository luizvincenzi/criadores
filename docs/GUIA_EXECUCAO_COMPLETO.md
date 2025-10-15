# 🚀 Guia de Execução Completo - Sistema de Acesso à Plataforma

## 📋 Pré-requisitos

- [x] Supabase configurado
- [x] Migration 029 executada (platform_users)
- [x] Acesso ao SQL Editor do Supabase
- [x] Creators e Businesses cadastrados no banco

---

## 🎯 Passo a Passo

### **PASSO 1: Executar Migration 030**

#### 1.1. Abra o Supabase SQL Editor

```
https://supabase.com/dashboard/project/[seu-projeto]/sql
```

#### 1.2. Copie TODO o conteúdo do arquivo:

```
supabase/migrations/030_add_platform_access_control.sql
```

#### 1.3. Execute no SQL Editor

Clique em **"Run"** ou pressione `Ctrl+Enter`

#### 1.4. Verifique o resultado:

Você deve ver:
```
✅ Migration 030 executada com sucesso!
✅ RLS habilitado e políticas de segurança criadas!
✅ LGPD Compliance: Isolamento total por business garantido!
```

---

### **PASSO 2: Testar Segurança e Isolamento**

#### 2.1. Execute o script de teste:

```
scripts/test-security-isolation.sql
```

#### 2.2. Verifique os resultados:

Todos os testes devem mostrar **✅ PASSOU**

#### 2.3. Remova os dados de teste:

```sql
DELETE FROM platform_users WHERE email LIKE '%.teste@%';
DELETE FROM businesses WHERE slug LIKE '%-teste';
```

---

### **PASSO 3: Conectar Pietra Mantovani**

#### 3.1. Buscar ID da Pietra:

```sql
SELECT id, name, slug, contact_info->>'email' as email
FROM creators 
WHERE name ILIKE '%pietra%' OR slug ILIKE '%pietra%';
```

**Anote o UUID retornado!**

#### 3.2. Liberar acesso:

```sql
-- Substitua [UUID_DA_PIETRA] pelo UUID real
SELECT grant_creator_platform_access(
  '[UUID_DA_PIETRA]'::uuid,
  'pietramantovani98@gmail.com',
  ARRAY['creator', 'marketing_strategist']::platform_user_role[],
  '00000000-0000-0000-0000-000000000001'::uuid
);
```

#### 3.3. Verificar sincronização:

```sql
-- Ver dados em creators
SELECT 
  name,
  platform_access_status,
  platform_email,
  platform_roles
FROM creators 
WHERE platform_email = 'pietramantovani98@gmail.com';

-- Ver dados em platform_users
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
- ✅ `platform_access_status = 'granted'`
- ✅ Registro criado em `platform_users`
- ✅ `creator_id` aponta para o mesmo UUID

---

### **PASSO 4: Conectar Marilia Marques**

#### 4.1. Buscar ID da Marilia:

```sql
SELECT id, name, slug, contact_info->>'email' as email
FROM creators 
WHERE name ILIKE '%marilia%' OR slug ILIKE '%marilia%';
```

**Anote o UUID retornado!**

#### 4.2. Liberar acesso:

```sql
-- Substitua [UUID_DA_MARILIA] pelo UUID real
SELECT grant_creator_platform_access(
  '[UUID_DA_MARILIA]'::uuid,
  'marilia12cavalheiro@gmail.com',
  ARRAY['marketing_strategist', 'creator']::platform_user_role[],
  '00000000-0000-0000-0000-000000000001'::uuid
);
```

#### 4.3. Verificar sincronização:

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

### **PASSO 5: (Opcional) Conectar Business**

#### 5.1. Buscar ID do Govinda:

```sql
SELECT id, name, slug, contact_info->>'email' as email
FROM businesses 
WHERE name ILIKE '%govinda%';
```

#### 5.2. Liberar acesso:

```sql
-- Substitua [UUID_DO_GOVINDA] pelo UUID real
SELECT grant_business_platform_access(
  '[UUID_DO_GOVINDA]'::uuid,
  'João Silva',
  'joao@govinda.com.br',
  '(43) 99999-9999',
  '[]'::jsonb, -- Sem usuários adicionais
  '00000000-0000-0000-0000-000000000001'::uuid
);
```

#### 5.3. Verificar sincronização:

```sql
-- Ver dados em businesses
SELECT 
  name,
  platform_access_status,
  platform_owner_name,
  platform_owner_email
FROM businesses 
WHERE platform_owner_email = 'joao@govinda.com.br';

-- Ver dados em platform_users
SELECT 
  email,
  full_name,
  role,
  business_id,
  managed_businesses,
  is_active
FROM platform_users 
WHERE email = 'joao@govinda.com.br';
```

---

### **PASSO 6: Verificar Views**

#### 6.1. Ver creators com acesso:

```sql
SELECT * FROM v_creators_platform_access;
```

#### 6.2. Ver businesses com acesso:

```sql
SELECT * FROM v_businesses_platform_access;
```

#### 6.3. Ver todos os platform_users:

```sql
SELECT 
  email,
  full_name,
  roles,
  creator_id,
  business_id,
  managed_businesses,
  is_active,
  last_login
FROM platform_users
ORDER BY created_at DESC;
```

---

## 🔍 Queries Úteis

### Ver todos com acesso liberado:

```sql
SELECT 
  'creator' as tipo,
  c.name,
  c.platform_email,
  c.platform_access_status,
  c.platform_roles
FROM creators c
WHERE c.platform_access_status = 'granted'

UNION ALL

SELECT 
  'business' as tipo,
  b.name,
  b.platform_owner_email,
  b.platform_access_status,
  NULL as platform_roles
FROM businesses b
WHERE b.platform_access_status = 'granted';
```

### Ver usuários ativos na plataforma:

```sql
SELECT 
  pu.email,
  pu.full_name,
  pu.roles,
  c.name as creator_name,
  b.name as business_name,
  pu.is_active,
  pu.last_login
FROM platform_users pu
LEFT JOIN creators c ON pu.creator_id = c.id
LEFT JOIN businesses b ON pu.business_id = b.id
WHERE pu.is_active = true
ORDER BY pu.created_at DESC;
```

### Testar isolamento de business:

```sql
-- Verificar se João vê apenas Govinda
SELECT * FROM get_user_businesses(
  (SELECT id FROM platform_users WHERE email = 'joao@govinda.com.br')
);

-- Verificar se João tem acesso ao Govinda
SELECT user_has_access_to_business(
  (SELECT id FROM platform_users WHERE email = 'joao@govinda.com.br'),
  (SELECT id FROM businesses WHERE name ILIKE '%govinda%')
);

-- Verificar se João NÃO tem acesso ao Porks (deve retornar false)
SELECT user_has_access_to_business(
  (SELECT id FROM platform_users WHERE email = 'joao@govinda.com.br'),
  (SELECT id FROM businesses WHERE name ILIKE '%porks%')
);
```

---

## ✅ Checklist de Validação

### Migration:
- [ ] Migration 030 executada sem erros
- [ ] Campos adicionados em `creators`
- [ ] Campos adicionados em `businesses`
- [ ] Triggers criados
- [ ] Views criadas
- [ ] Funções criadas
- [ ] RLS habilitado

### Creators:
- [ ] Pietra conectada
- [ ] Marilia conectada
- [ ] Registros em `platform_users` criados
- [ ] `creator_id` correto
- [ ] Roles corretos

### Businesses (se testado):
- [ ] Business conectado
- [ ] Proprietário criado em `platform_users`
- [ ] `business_id` correto
- [ ] `managed_businesses` correto

### Segurança:
- [ ] RLS ativo em todas as tabelas
- [ ] Políticas de acesso funcionando
- [ ] Isolamento por UUID validado
- [ ] Constraints funcionando
- [ ] Auditoria ativa

---

## 🚨 Troubleshooting

### Erro: "column platform_access_status does not exist"

**Solução:** Execute a Migration 030 novamente

### Erro: "function grant_creator_platform_access does not exist"

**Solução:** Verifique se a Migration 030 foi executada completamente

### Trigger não está criando em platform_users

**Solução:** 
```sql
-- Verificar se trigger existe
SELECT * FROM pg_trigger WHERE tgname LIKE '%platform%';

-- Recriar trigger se necessário
-- (copie a parte do trigger da migration 030)
```

### Business owner vendo outros businesses

**Solução:**
```sql
-- Verificar RLS
SELECT tablename, rowsecurity FROM pg_tables 
WHERE tablename IN ('businesses', 'campaigns', 'platform_users');

-- Deve retornar rowsecurity = true para todas
```

---

## 📊 Resultado Esperado

Após executar todos os passos:

```
platform_users
├─ Pietra Mantovani
│  ├─ email: pietramantovani98@gmail.com
│  ├─ roles: [creator, marketing_strategist]
│  ├─ creator_id: [UUID da Pietra]
│  └─ is_active: true
│
├─ Marilia Marques
│  ├─ email: marilia12cavalheiro@gmail.com
│  ├─ roles: [marketing_strategist, creator]
│  ├─ creator_id: [UUID da Marilia]
│  └─ is_active: true
│
└─ João Silva (se testado)
   ├─ email: joao@govinda.com.br
   ├─ roles: [business_owner]
   ├─ business_id: [UUID do Govinda]
   └─ is_active: true
```

---

## 📚 Próximos Passos

Após validar tudo:

1. ✅ Implementar API de login para platform_users
2. ✅ Criar middleware de autenticação
3. ✅ Implementar dashboards por role
4. ✅ Criar interface no CRM para liberar acessos
5. ✅ Implementar envio de emails de boas-vindas

---

**Tempo estimado:** 1-2 horas  
**Dificuldade:** Média  
**Impacto:** Crítico

