# 🎯 Instruções Finais - Sistema de Múltiplos Roles

## ✅ O que foi feito

1. ✅ Credenciais adicionadas ao sistema de login
2. ✅ Script de criação de usuários preparado
3. ✅ Migration SQL criada para suporte a múltiplos roles
4. ✅ Documentação completa criada

---

## 🚀 Próximos Passos (EXECUTAR MANUALMENTE)

### Passo 1: Adicionar coluna `roles` no Supabase

Acesse o **Supabase SQL Editor** e execute:

```sql
-- 1. Adicionar coluna roles (array de roles)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS roles user_role[] DEFAULT ARRAY['user']::user_role[];

-- 2. Migrar dados existentes
UPDATE users 
SET roles = ARRAY[role]::user_role[] 
WHERE roles IS NULL OR roles = '{}';

-- 3. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_users_roles ON users USING GIN(roles);

-- 4. Verificar se funcionou
SELECT id, email, role, roles FROM users LIMIT 5;
```

---

### Passo 2: Criar/Atualizar Usuários

Execute o script:

```bash
cd /Users/luizvincenzi/Documents/Criadores/criadores
npx tsx scripts/create-creator-users.ts
```

Ou execute manualmente no Supabase SQL Editor:

```sql
-- 1. Buscar ID do criador Pietra Mantovani
SELECT id FROM creators WHERE slug = 'pietra-mantovani';
-- Copie o ID retornado

-- 2. Atualizar usuário Pietra Mantovani
UPDATE users
SET 
  role = 'creator',
  roles = ARRAY['creator', 'marketing_strategist']::user_role[],
  creator_id = '975c1933-cfa0-4b3a-9660-f14259ec4b26', -- ID do criador
  permissions = '{
    "campaigns": {"read": true, "write": false, "delete": false},
    "conteudo": {"read": true, "write": true, "delete": true},
    "reports": {"read": true, "write": false, "delete": false},
    "tasks": {"read": true, "write": true, "delete": false}
  }'::jsonb,
  is_active = true,
  updated_at = NOW()
WHERE email = 'pietramantovani98@gmail.com';

-- 3. Buscar IDs de businesses para Marilia gerenciar
SELECT id FROM businesses WHERE organization_id = '00000000-0000-0000-0000-000000000001' LIMIT 5;
-- Copie os IDs retornados

-- 4. Criar/Atualizar usuário Marilia
INSERT INTO users (
  organization_id,
  email,
  full_name,
  role,
  roles,
  managed_businesses,
  permissions,
  is_active,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'marilia12cavalheiro@gmail.com',
  'Marilia',
  'marketing_strategist',
  ARRAY['marketing_strategist', 'creator']::user_role[],
  ARRAY[]::uuid[], -- Adicione IDs de businesses aqui
  '{
    "campaigns": {"read": true, "write": true, "delete": false},
    "conteudo": {"read": true, "write": true, "delete": false},
    "briefings": {"read": true, "write": true, "delete": false},
    "reports": {"read": true, "write": false, "delete": false},
    "tasks": {"read": true, "write": true, "delete": false}
  }'::jsonb,
  true,
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  role = EXCLUDED.role,
  roles = EXCLUDED.roles,
  managed_businesses = EXCLUDED.managed_businesses,
  permissions = EXCLUDED.permissions,
  is_active = EXCLUDED.is_active,
  updated_at = NOW();

-- 5. Verificar se os usuários foram criados
SELECT 
  id,
  email,
  full_name,
  role,
  roles,
  creator_id,
  managed_businesses,
  is_active
FROM users
WHERE email IN ('pietramantovani98@gmail.com', 'marilia12cavalheiro@gmail.com');
```

---

### Passo 3: Testar Login

1. Acesse: `http://localhost:3000/login`
2. Teste com Pietra:
   - Email: `pietramantovani98@gmail.com`
   - Senha: `2#Todoscria`
3. Teste com Marilia:
   - Email: `marilia12cavalheiro@gmail.com`
   - Senha: `2#Todoscria`

---

## 📊 Resumo dos Usuários

### Pietra Mantovani
- **Email:** pietramantovani98@gmail.com
- **Senha:** 2#Todoscria
- **Role Primário:** creator
- **Roles:** creator + marketing_strategist
- **Dashboard:** /dashboard/criador
- **Permissões:**
  - ✅ Ver campanhas atribuídas
  - ✅ Criar/editar conteúdo
  - ✅ Planejar calendário
  - ✅ Ver relatórios

### Marilia
- **Email:** marilia12cavalheiro@gmail.com
- **Senha:** 2#Todoscria
- **Role Primário:** marketing_strategist
- **Roles:** marketing_strategist + creator
- **Dashboard:** /dashboard/criador
- **Permissões:**
  - ✅ Ver/criar campanhas
  - ✅ Criar/editar conteúdo
  - ✅ Planejar calendário
  - ✅ Criar briefings
  - ✅ Ver relatórios

---

## 🔍 Verificações

### Verificar se coluna `roles` existe:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'roles';
```

### Verificar usuários com múltiplos roles:
```sql
SELECT 
  email,
  role,
  roles,
  array_length(roles, 1) as role_count
FROM users
WHERE array_length(roles, 1) > 1;
```

### Verificar criador de Pietra:
```sql
SELECT 
  c.id,
  c.name,
  c.slug,
  c.status,
  u.email,
  u.roles
FROM creators c
LEFT JOIN users u ON u.creator_id = c.id
WHERE c.slug = 'pietra-mantovani';
```

---

## 📝 Arquivos Criados

1. `/docs/SISTEMA_MULTIPLOS_ROLES.md` - Documentação do sistema
2. `/docs/ANALISE_IMPLEMENTACAO_ACESSOS.md` - Análise inicial
3. `/supabase/migrations/028_add_multiple_roles_support.sql` - Migration SQL
4. `/scripts/create-creator-users.ts` - Script de criação de usuários
5. `/scripts/add-roles-column.ts` - Script para adicionar coluna roles
6. `/app/api/supabase/auth/login/route.ts` - Credenciais adicionadas

---

## ⚠️ Importante

- A coluna `role` (singular) continua existindo para compatibilidade
- A coluna `roles` (plural) é um array que permite múltiplos roles
- O sistema de autenticação já está preparado para aceitar os novos usuários
- As páginas `/dashboard/criador` já existem e funcionam para ambos os roles

---

## 🎯 Próxima Fase

Após executar os passos acima:

1. Testar login com ambos os usuários
2. Verificar acesso às páginas
3. Validar permissões
4. Atualizar lógica de autenticação para usar `roles` (array) em vez de `role` (singular)

