-- Script para corrigir o usuário criadores.ops@gmail.com
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar usuários criadores.ops existentes
SELECT 
  id,
  email,
  full_name,
  role,
  is_active
FROM users 
WHERE email = 'criadores.ops@gmail.com';

-- 2. Remover usuário criado incorretamente (sem full_name)
DELETE FROM users 
WHERE email = 'criadores.ops@gmail.com' 
  AND full_name IS NULL;

-- 3. Criar o usuário corretamente
INSERT INTO users (email, full_name, role, organization_id, is_active)
VALUES (
  'criadores.ops@gmail.com',
  'Operações Criadores',
  'user',
  '00000000-0000-0000-0000-000000000001',
  true
)
ON CONFLICT (email) DO NOTHING;

-- 4. Verificar se foi criado corretamente
SELECT 
  id,
  email,
  full_name,
  role,
  is_active
FROM users 
WHERE email = 'criadores.ops@gmail.com';
