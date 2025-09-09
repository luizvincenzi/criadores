-- Script para aplicar migration de user roles diretamente no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar roles existentes
SELECT unnest(enum_range(NULL::user_role)) as existing_roles;

-- 2. Adicionar novos valores ao ENUM (se não existirem)
DO $$
BEGIN
    -- Adicionar business_owner se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'business_owner' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'business_owner';
    END IF;
    
    -- Adicionar creator se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'creator' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'creator';
    END IF;
    
    -- Adicionar marketing_strategist se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'marketing_strategist' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'marketing_strategist';
    END IF;
END $$;

-- 3. Adicionar colunas à tabela users (se não existirem)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id),
ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES creators(id),
ADD COLUMN IF NOT EXISTS managed_businesses UUID[] DEFAULT '{}';

-- 4. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_business_id ON users(business_id) WHERE business_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_creator_id ON users(creator_id) WHERE creator_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_role_business ON users(role, business_id) WHERE business_id IS NOT NULL;

-- 5. Verificar estrutura final
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
  AND table_schema = 'public'
  AND column_name IN ('business_id', 'creator_id', 'managed_businesses')
ORDER BY column_name;

-- 6. Verificar roles disponíveis
SELECT unnest(enum_range(NULL::user_role)) as available_roles;

-- 7. Criar alguns usuários de exemplo manualmente
-- Business Owner
INSERT INTO users (
  organization_id,
  email,
  full_name,
  role,
  business_id,
  permissions,
  is_active
) 
SELECT 
  '00000000-0000-0000-0000-000000000001',
  'business.owner@exemplo.com',
  'Dono da Empresa Exemplo',
  'business_owner',
  b.id,
  '{
    "businesses": {"read": true, "write": true, "delete": false},
    "campaigns": {"read": true, "write": true, "delete": false},
    "creators": {"read": true, "write": false, "delete": false},
    "analytics": {"read": true, "write": false, "delete": false},
    "scope": "business"
  }'::jsonb,
  true
FROM businesses b 
WHERE b.name ILIKE '%brah%' OR b.name ILIKE '%poke%'
LIMIT 1
ON CONFLICT (email) DO NOTHING;

-- Marketing Strategist
INSERT INTO users (
  organization_id,
  email,
  full_name,
  role,
  managed_businesses,
  permissions,
  is_active
) 
SELECT 
  '00000000-0000-0000-0000-000000000001',
  'marketing.strategist@exemplo.com',
  'Estrategista Marketing Exemplo',
  'marketing_strategist',
  ARRAY[b.id],
  '{
    "businesses": {"read": true, "write": true, "delete": false},
    "campaigns": {"read": true, "write": true, "delete": false},
    "creators": {"read": true, "write": true, "delete": false},
    "analytics": {"read": true, "write": true, "delete": false},
    "scope": "managed_businesses"
  }'::jsonb,
  true
FROM businesses b 
WHERE b.name ILIKE '%brah%' OR b.name ILIKE '%poke%'
LIMIT 1
ON CONFLICT (email) DO NOTHING;

-- Creator
INSERT INTO users (
  organization_id,
  email,
  full_name,
  role,
  creator_id,
  permissions,
  is_active
) 
SELECT 
  '00000000-0000-0000-0000-000000000001',
  'creator@exemplo.com',
  'Criador Exemplo',
  'creator',
  c.id,
  '{
    "campaigns": {"read": true, "write": false, "delete": false},
    "creators": {"read": true, "write": true, "delete": false},
    "tasks": {"read": true, "write": true, "delete": false},
    "analytics": {"read": true, "write": false, "delete": false},
    "scope": "creator"
  }'::jsonb,
  true
FROM creators c 
WHERE c.name ILIKE '%alanna%'
LIMIT 1
ON CONFLICT (email) DO NOTHING;

-- 8. Verificar usuários criados
SELECT 
  id,
  email,
  full_name,
  role,
  business_id,
  creator_id,
  managed_businesses,
  is_active
FROM users 
WHERE email LIKE '%exemplo.com'
ORDER BY role;

-- 9. Mostrar estatísticas finais
SELECT 
  role,
  COUNT(*) as total_users
FROM users 
WHERE is_active = true
GROUP BY role
ORDER BY role;
