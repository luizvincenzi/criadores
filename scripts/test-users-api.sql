-- Script para testar se a API de usuários está funcionando
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar usuários na tabela
SELECT 
  id,
  email,
  full_name,
  role,
  is_active,
  organization_id
FROM users 
WHERE organization_id = '00000000-0000-0000-0000-000000000001'
  AND is_active = true
ORDER BY role, full_name;

-- 2. Contar usuários ativos
SELECT 
  COUNT(*) as total_usuarios_ativos
FROM users 
WHERE organization_id = '00000000-0000-0000-0000-000000000001'
  AND is_active = true;
