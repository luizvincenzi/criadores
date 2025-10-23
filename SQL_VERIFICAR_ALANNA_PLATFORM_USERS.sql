-- 🔍 VERIFICAR USUÁRIO ALANNA NA TABELA CORRETA (platform_users)
-- Execute este script no Supabase SQL Editor

-- ============================================
-- 1. VERIFICAR SE ALANNA EXISTE EM platform_users
-- ============================================
SELECT 
  id,
  email,
  full_name,
  role,
  roles,
  is_active,
  password_hash,
  creator_id,
  business_id,
  created_at,
  updated_at,
  last_login
FROM platform_users
WHERE email = 'alannaalicia17@gmail.com';

-- ============================================
-- 2. VERIFICAR DETALHES DO PASSWORD_HASH
-- ============================================
SELECT 
  email,
  password_hash,
  LENGTH(password_hash) as hash_length,
  SUBSTRING(password_hash, 1, 4) as hash_prefix,
  CASE 
    WHEN password_hash IS NULL THEN '❌ Sem hash'
    WHEN LENGTH(password_hash) = 60 THEN '✅ Hash válido'
    ELSE '⚠️ Hash inválido'
  END as status
FROM platform_users
WHERE email = 'alannaalicia17@gmail.com';

-- ============================================
-- 3. LISTAR TODOS OS USUÁRIOS EM platform_users
-- ============================================
SELECT 
  email,
  full_name,
  role,
  roles,
  is_active,
  CASE 
    WHEN password_hash IS NULL THEN '❌ Sem hash'
    WHEN LENGTH(password_hash) = 60 THEN '✅ Com hash'
    ELSE '⚠️ Hash inválido'
  END as password_status,
  created_at
FROM platform_users
ORDER BY created_at DESC;

-- ============================================
-- 4. VERIFICAR SE ALANNA ESTÁ EM creators
-- ============================================
SELECT 
  id,
  name,
  email,
  platform_email,
  platform_access_status,
  platform_password_hash,
  platform_roles,
  created_at
FROM creators
WHERE email = 'alannaalicia17@gmail.com' 
   OR platform_email = 'alannaalicia17@gmail.com';

-- ============================================
-- 5. CONTAR USUÁRIOS EM CADA TABELA
-- ============================================
SELECT 
  'platform_users' as tabela,
  COUNT(*) as total,
  COUNT(password_hash) as com_hash,
  COUNT(*) - COUNT(password_hash) as sem_hash
FROM platform_users

UNION ALL

SELECT 
  'creators (com platform_email)' as tabela,
  COUNT(*) as total,
  COUNT(platform_password_hash) as com_hash,
  COUNT(*) - COUNT(platform_password_hash) as sem_hash
FROM creators
WHERE platform_email IS NOT NULL;

-- ============================================
-- 6. SE ALANNA NÃO EXISTE, CRIAR EM platform_users
-- ============================================
-- ⚠️ IMPORTANTE: Descomente APENAS se Alanna não existir em platform_users

/*
INSERT INTO platform_users (
  id,
  organization_id,
  email,
  full_name,
  role,
  roles,
  is_active,
  platform,
  password_hash,
  permissions,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(), -- Gera novo UUID
  '00000000-0000-0000-0000-000000000001', -- Organization padrão
  'alannaalicia17@gmail.com',
  'Alanna Alícia',
  'marketing_strategist', -- Role principal
  ARRAY['marketing_strategist', 'creator']::platform_user_role[], -- Múltiplos roles
  true, -- is_active
  'client', -- platform
  '$2a$12$SUBSTITUA_PELO_HASH_DA_SENHA_1#CriamudarA', -- ⚠️ GERE O HASH CORRETO!
  '{
    "campaigns": {"read": true, "write": true, "delete": false},
    "conteudo": {"read": true, "write": true, "delete": false},
    "briefings": {"read": true, "write": true, "delete": false},
    "reports": {"read": true, "write": false, "delete": false},
    "tasks": {"read": true, "write": true, "delete": false}
  }'::jsonb,
  NOW(),
  NOW()
);
*/

-- ============================================
-- 7. GERAR HASH BCRYPT PARA A SENHA
-- ============================================
-- Use um dos métodos abaixo para gerar o hash:

-- OPÇÃO 1: Node.js (no terminal)
-- npx tsx -e "import bcrypt from 'bcryptjs'; console.log(await bcrypt.hash('1#CriamudarA', 12));"

-- OPÇÃO 2: Online (https://bcrypt-generator.com/)
-- Senha: 1#CriamudarA
-- Rounds: 12

-- OPÇÃO 3: Script TypeScript
-- Veja o arquivo: scripts/generate-password-hash.ts

-- ============================================
-- 8. ATUALIZAR PASSWORD_HASH (SE JÁ EXISTE)
-- ============================================
-- ⚠️ Descomente se Alanna já existe mas precisa atualizar o hash

/*
UPDATE platform_users 
SET 
  password_hash = '$2a$12$SUBSTITUA_PELO_HASH_CORRETO',
  updated_at = NOW()
WHERE email = 'alannaalicia17@gmail.com';
*/

-- ============================================
-- 9. VERIFICAR ORGANIZAÇÃO PADRÃO
-- ============================================
SELECT 
  id,
  name,
  slug,
  created_at
FROM organizations
WHERE id = '00000000-0000-0000-0000-000000000001';

-- ============================================
-- 10. ATIVAR USUÁRIO (SE INATIVO)
-- ============================================
-- ⚠️ Descomente se o usuário estiver inativo

/*
UPDATE platform_users 
SET 
  is_active = true,
  updated_at = NOW()
WHERE email = 'alannaalicia17@gmail.com';
*/

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. O hash bcrypt deve ter exatamente 60 caracteres
-- 2. O hash deve começar com $2a$ ou $2b$
-- 3. is_active deve ser true para fazer login
-- 4. organization_id deve ser '00000000-0000-0000-0000-000000000001'
-- 5. A senha é: 1#CriamudarA
-- 6. Use platform_users, NÃO users (users é para CRM)

