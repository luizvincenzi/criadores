-- Verificar usuário criado via onboarding
-- Execute no Supabase SQL Editor

-- 1. Verificar se usuário existe em platform_users
SELECT 
  id,
  email,
  full_name,
  role,
  roles,
  is_active,
  email_verified,
  business_id,
  LENGTH(password_hash) as hash_length,
  password_hash IS NOT NULL as has_password,
  created_at,
  updated_at,
  last_password_change
FROM platform_users
WHERE email IN ('connectcityops@gmail.com', 'alannaalicia17@gmail.com')
ORDER BY created_at DESC;

-- 2. Verificar detalhes completos
SELECT *
FROM platform_users
WHERE email = 'connectcityops@gmail.com';

-- 3. Testar se o hash está correto (se você souber a senha)
-- Nota: Isso só funciona se você tiver a extensão pgcrypto instalada
-- SELECT crypt('SUA_SENHA_AQUI', password_hash) = password_hash as senha_valida
-- FROM platform_users
-- WHERE email = 'connectcityops@gmail.com';

