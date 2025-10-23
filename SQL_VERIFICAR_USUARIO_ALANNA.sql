-- 🔍 Verificar Usuário Alanna no Banco de Dados
-- Execute este script no Supabase SQL Editor

-- ============================================
-- 1. VERIFICAR SE USUÁRIO EXISTE
-- ============================================
SELECT 
  id,
  email,
  full_name,
  role,
  roles,
  is_active,
  password_hash,
  created_at,
  updated_at,
  last_login
FROM users
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
FROM users
WHERE email = 'alannaalicia17@gmail.com';

-- ============================================
-- 3. VERIFICAR PERMISSÕES
-- ============================================
SELECT 
  email,
  permissions,
  business_id,
  creator_id,
  managed_businesses
FROM users
WHERE email = 'alannaalicia17@gmail.com';

-- ============================================
-- 4. VERIFICAR ORGANIZAÇÃO
-- ============================================
SELECT 
  u.email,
  u.organization_id,
  o.name as organization_name,
  o.slug as organization_slug
FROM users u
LEFT JOIN organizations o ON u.organization_id = o.id
WHERE u.email = 'alannaalicia17@gmail.com';

-- ============================================
-- 5. COMPARAR COM OUTRO USUÁRIO (REFERÊNCIA)
-- ============================================
SELECT 
  email,
  full_name,
  role,
  is_active,
  password_hash,
  LENGTH(password_hash) as hash_length
FROM users
WHERE email IN ('alannaalicia17@gmail.com', 'pietramantovani98@gmail.com')
ORDER BY email;

-- ============================================
-- 6. ATUALIZAR PASSWORD_HASH (SE NECESSÁRIO)
-- ============================================
-- ⚠️ IMPORTANTE: Substitua o hash abaixo pelo hash correto
-- Gere o hash usando: npx tsx scripts/generate-password-hash.ts "SuaSenha123!"

-- UPDATE users 
-- SET password_hash = '$2a$12$SUBSTITUA_PELO_HASH_CORRETO_AQUI'
-- WHERE email = 'alannaalicia17@gmail.com';

-- ============================================
-- 7. VERIFICAR ÚLTIMO LOGIN
-- ============================================
SELECT 
  email,
  last_login,
  CASE 
    WHEN last_login IS NULL THEN '❌ Nunca fez login'
    ELSE '✅ Último login: ' || last_login
  END as login_status
FROM users
WHERE email = 'alannaalicia17@gmail.com';

-- ============================================
-- 8. LISTAR TODOS OS USUÁRIOS COM HASH
-- ============================================
SELECT 
  email,
  full_name,
  role,
  is_active,
  CASE 
    WHEN password_hash IS NULL THEN '❌ Sem hash'
    WHEN LENGTH(password_hash) = 60 THEN '✅ Com hash'
    ELSE '⚠️ Hash inválido'
  END as password_status
FROM users
ORDER BY email;

-- ============================================
-- 9. CONTAR USUÁRIOS COM E SEM HASH
-- ============================================
SELECT 
  CASE 
    WHEN password_hash IS NULL THEN 'Sem hash'
    WHEN LENGTH(password_hash) = 60 THEN 'Com hash válido'
    ELSE 'Hash inválido'
  END as status,
  COUNT(*) as quantidade
FROM users
GROUP BY status;

-- ============================================
-- 10. ATIVAR USUÁRIO (SE INATIVO)
-- ============================================
-- ⚠️ Descomente se o usuário estiver inativo
-- UPDATE users 
-- SET is_active = true
-- WHERE email = 'alannaalicia17@gmail.com';

-- ============================================
-- 11. RESETAR ÚLTIMO LOGIN
-- ============================================
-- ⚠️ Descomente para resetar o último login
-- UPDATE users 
-- SET last_login = NULL
-- WHERE email = 'alannaalicia17@gmail.com';

-- ============================================
-- 12. VERIFICAR ORGANIZAÇÃO PADRÃO
-- ============================================
SELECT 
  id,
  name,
  slug,
  created_at
FROM organizations
WHERE id = '00000000-0000-0000-0000-000000000001';

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- 1. O hash deve ter exatamente 60 caracteres
-- 2. O hash deve começar com $2a$ ou $2b$
-- 3. is_active deve ser true para fazer login
-- 4. organization_id deve ser válido
-- 5. Se não tem password_hash, o login usa lista hardcoded

