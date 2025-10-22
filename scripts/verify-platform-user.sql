-- Script para verificar se platform_user foi criado corretamente
-- Execute no Supabase SQL Editor

-- 1. Verificar se Julia Franco existe em creators
SELECT 
  'CREATOR' as tabela,
  id,
  name,
  platform_email,
  platform_access_status,
  platform_roles
FROM creators 
WHERE platform_email = 'juliacarolinasan83@gmail.com';

-- 2. Verificar se existe em platform_users
SELECT 
  'PLATFORM_USER' as tabela,
  id,
  email,
  full_name,
  role,
  roles,
  creator_id,
  is_active
FROM platform_users 
WHERE email = 'juliacarolinasan83@gmail.com';

-- 3. Verificar se IDs coincidem
SELECT 
  c.id as creator_id,
  c.name as creator_name,
  c.platform_email,
  pu.id as platform_user_id,
  pu.email as platform_user_email,
  CASE 
    WHEN c.id = pu.id THEN '✅ IDs COINCIDEM'
    ELSE '❌ IDs DIFERENTES'
  END as id_match,
  CASE 
    WHEN pu.id IS NULL THEN '❌ PLATFORM_USER NÃO EXISTE'
    WHEN pu.is_active THEN '✅ ATIVO'
    ELSE '⚠️ INATIVO'
  END as status
FROM creators c
LEFT JOIN platform_users pu ON c.id = pu.id
WHERE c.platform_email = 'juliacarolinasan83@gmail.com';