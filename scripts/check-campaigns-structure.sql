-- Script para verificar a estrutura da tabela campaigns
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar colunas da tabela campaigns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Verificar se já existe a coluna responsible_user_id
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
  AND column_name = 'responsible_user_id';

-- 3. Verificar usuários disponíveis para atribuição
SELECT 
  id,
  email,
  full_name,
  role,
  is_active
FROM users 
WHERE is_active = true
  AND organization_id = '00000000-0000-0000-0000-000000000001'
ORDER BY role, full_name;
