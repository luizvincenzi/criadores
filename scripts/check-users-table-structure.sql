-- Script para verificar a estrutura da tabela users
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar colunas da tabela users
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se existe algum usuário com email criadores.ops
SELECT 
  id,
  email,
  role,
  organization_id,
  is_active
FROM users 
WHERE email ILIKE '%criadores.ops%' 
   OR email ILIKE '%ops%';

-- 3. Verificar usuários admin existentes
SELECT 
  id,
  email,
  role,
  organization_id,
  is_active
FROM users 
WHERE role = 'admin' 
  AND organization_id = '00000000-0000-0000-0000-000000000001'
  AND is_active = true
LIMIT 5;
