-- ============================================
-- 🔧 SOLUÇÃO FINAL - CORRIGIR LOGIN DA ALANNA
-- ============================================
-- Problema: role = 'strategist' é INVÁLIDO
-- Solução: Corrigir para 'marketing_strategist'
-- ============================================

-- 1️⃣ VERIFICAR PROBLEMA ATUAL
SELECT 
  email,
  role,
  roles,
  is_active,
  LENGTH(password_hash) as hash_length,
  SUBSTRING(password_hash, 1, 10) as hash_preview
FROM platform_users
WHERE email = 'alannaalicia17@gmail.com';

-- Resultado atual:
-- role: strategist ← ❌ INVÁLIDO! (não existe no enum)
-- roles: ["marketing_strategist", "creator"] ← ✅ CORRETO
-- password_hash: $2a$12$u1V... ← ✅ EXISTE (60 chars)

-- ============================================
-- 2️⃣ CORRIGIR O ROLE PARA marketing_strategist
-- ============================================
UPDATE platform_users 
SET 
  role = 'marketing_strategist'::platform_user_role,
  updated_at = NOW()
WHERE email = 'alannaalicia17@gmail.com';

-- ============================================
-- 3️⃣ VERIFICAR SE FOI CORRIGIDO
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
-- role: marketing_strategist ← ✅ CORRETO!
-- roles: ["marketing_strategist", "creator"] ← ✅ CORRETO
-- is_active: true ← ✅ CORRETO
-- hash_length: 60 ← ✅ CORRETO

-- ============================================
-- 4️⃣ TESTAR LOGIN
-- ============================================
-- Agora teste o login:
-- Email: alannaalicia17@gmail.com
-- Senha: 1#CriamudarA
-- Esperado: ✅ Login com sucesso!

-- ============================================
-- NOTAS IMPORTANTES
-- ============================================
-- ✅ O password_hash JÁ EXISTE e está correto
-- ✅ O usuário JÁ ESTÁ em platform_users
-- ✅ O is_active JÁ É true
-- ❌ O ÚNICO problema era o role inválido 'strategist'
-- ✅ Agora está corrigido para 'marketing_strategist'

