-- 🔧 CORRIGIR ROLE DA ALANNA
-- O role "strategist" é inválido, deve ser "marketing_strategist"

-- ============================================
-- 1. VERIFICAR ROLE ATUAL
-- ============================================
SELECT 
  email,
  role,
  roles,
  is_active,
  LENGTH(password_hash) as hash_length
FROM platform_users
WHERE email = 'alannaalicia17@gmail.com';

-- Resultado esperado:
-- role: strategist ← INVÁLIDO!
-- roles: ["marketing_strategist", "creator"] ← CORRETO

-- ============================================
-- 2. CORRIGIR ROLE PARA marketing_strategist
-- ============================================
UPDATE platform_users 
SET 
  role = 'marketing_strategist',
  updated_at = NOW()
WHERE email = 'alannaalicia17@gmail.com';

-- ============================================
-- 3. VERIFICAR SE FOI CORRIGIDO
-- ============================================
SELECT 
  email,
  role,
  roles,
  is_active,
  LENGTH(password_hash) as hash_length,
  SUBSTRING(password_hash, 1, 10) as hash_preview
FROM platform_users
WHERE email = 'alannaalicia17@gmail.com';

-- Resultado esperado:
-- role: marketing_strategist ← CORRETO!
-- roles: ["marketing_strategist", "creator"] ← CORRETO
-- is_active: true ← CORRETO
-- hash_length: 60 ← CORRETO

-- ============================================
-- 4. VERIFICAR TODOS OS ROLES INVÁLIDOS
-- ============================================
SELECT 
  email,
  role,
  roles,
  CASE 
    WHEN role NOT IN ('creator', 'marketing_strategist', 'business_owner') 
    THEN '❌ INVÁLIDO'
    ELSE '✅ VÁLIDO'
  END as status
FROM platform_users
ORDER BY email;

-- ============================================
-- 5. CORRIGIR TODOS OS ROLES INVÁLIDOS (SE HOUVER)
-- ============================================
-- Se houver outros usuários com role inválido, corrigir:

UPDATE platform_users 
SET 
  role = CASE 
    WHEN 'marketing_strategist' = ANY(roles) THEN 'marketing_strategist'::platform_user_role
    WHEN 'business_owner' = ANY(roles) THEN 'business_owner'::platform_user_role
    ELSE 'creator'::platform_user_role
  END,
  updated_at = NOW()
WHERE role NOT IN ('creator', 'marketing_strategist', 'business_owner');

-- ============================================
-- NOTAS
-- ============================================
-- O enum platform_user_role aceita apenas:
-- - 'creator'
-- - 'marketing_strategist'
-- - 'business_owner'
--
-- O valor 'strategist' NÃO é válido!

