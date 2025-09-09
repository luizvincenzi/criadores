-- Script para verificar e corrigir o usuário Boussolé
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se o usuário existe
SELECT 
  id,
  email,
  full_name,
  role,
  business_id,
  is_active,
  created_at,
  'Usuário atual' as status
FROM users 
WHERE email = 'financeiro.brooftop@gmail.com';

-- 2. Verificar se há problema com case sensitivity
SELECT 
  id,
  email,
  full_name,
  role,
  business_id,
  is_active,
  'Busca case insensitive' as status
FROM users 
WHERE LOWER(email) = LOWER('financeiro.brooftop@gmail.com');

-- 3. Verificar todos os usuários com email similar
SELECT 
  id,
  email,
  full_name,
  role,
  business_id,
  is_active,
  'Emails similares' as status
FROM users 
WHERE email ILIKE '%financeiro%' 
   OR email ILIKE '%brooftop%'
   OR email ILIKE '%boussole%';

-- 4. Se o usuário não existir, criar
INSERT INTO users (
  organization_id,
  email,
  full_name,
  role,
  business_id,
  permissions,
  is_active,
  created_at,
  updated_at
) 
SELECT 
  '00000000-0000-0000-0000-000000000001',
  'financeiro.brooftop@gmail.com',
  'Financeiro Boussolé',
  'business_owner',
  '55310ebd-0e0d-492e-8c34-cd4740000000',
  '{
    "businesses": {"read": true, "write": true, "delete": false},
    "campaigns": {"read": true, "write": true, "delete": false},
    "creators": {"read": true, "write": false, "delete": false},
    "leads": {"read": true, "write": true, "delete": false},
    "tasks": {"read": true, "write": true, "delete": false},
    "analytics": {"read": true, "write": false, "delete": false},
    "users": {"read": false, "write": false, "delete": false},
    "scope": "business",
    "business_id": "55310ebd-0e0d-492e-8c34-cd4740000000"
  }'::jsonb,
  true,
  NOW(),
  NOW()
WHERE NOT EXISTS (
  SELECT 1 FROM users 
  WHERE LOWER(email) = LOWER('financeiro.brooftop@gmail.com')
);

-- 5. Atualizar usuário existente se necessário
UPDATE users 
SET 
  role = 'business_owner',
  business_id = '55310ebd-0e0d-492e-8c34-cd4740000000',
  permissions = '{
    "businesses": {"read": true, "write": true, "delete": false},
    "campaigns": {"read": true, "write": true, "delete": false},
    "creators": {"read": true, "write": false, "delete": false},
    "leads": {"read": true, "write": true, "delete": false},
    "tasks": {"read": true, "write": true, "delete": false},
    "analytics": {"read": true, "write": false, "delete": false},
    "users": {"read": false, "write": false, "delete": false},
    "scope": "business",
    "business_id": "55310ebd-0e0d-492e-8c34-cd4740000000"
  }'::jsonb,
  is_active = true,
  updated_at = NOW()
WHERE LOWER(email) = LOWER('financeiro.brooftop@gmail.com');

-- 6. Verificar resultado final
SELECT 
  id,
  email,
  full_name,
  role,
  business_id,
  permissions->>'scope' as permission_scope,
  is_active,
  updated_at,
  'Usuário final' as status
FROM users 
WHERE LOWER(email) = LOWER('financeiro.brooftop@gmail.com');

-- 7. Verificar se a empresa Boussolé existe e está ativa
SELECT 
  id,
  name,
  organization_id,
  is_active,
  status,
  'Empresa Boussolé' as info
FROM businesses 
WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000';

-- 8. Ativar empresa se necessário
UPDATE businesses 
SET 
  is_active = true,
  updated_at = NOW()
WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000'
  AND is_active = false;

-- 9. Verificar campanhas da empresa
SELECT 
  COUNT(*) as total_campanhas,
  'Campanhas do Boussolé' as info
FROM campaigns 
WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000'
  AND organization_id = '00000000-0000-0000-0000-000000000001';

-- 10. Teste de autenticação (informativo)
SELECT 
  '🔐 DADOS PARA TESTE' as info,
  'Email: financeiro.brooftop@gmail.com' as email,
  'Senha: 1#Boussolecria' as senha,
  'API: /api/supabase/auth/login' as endpoint,
  'Método: POST' as metodo;
