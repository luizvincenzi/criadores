-- Script para atualizar usuário Boussolé diretamente no Supabase
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar usuário atual
SELECT 
  id,
  email,
  full_name,
  role,
  business_id,
  permissions,
  is_active
FROM users 
WHERE email = 'financeiro.brooftop@gmail.com';

-- 2. Verificar empresa Boussolé
SELECT 
  id,
  name,
  status,
  estimated_value,
  is_active
FROM businesses 
WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000';

-- 3. Adicionar novos roles ao enum (se não existirem)
DO $$
BEGIN
    -- Adicionar business_owner se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'business_owner' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'business_owner';
        RAISE NOTICE 'Role business_owner adicionado';
    ELSE
        RAISE NOTICE 'Role business_owner já existe';
    END IF;
    
    -- Adicionar creator se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'creator' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'creator';
        RAISE NOTICE 'Role creator adicionado';
    ELSE
        RAISE NOTICE 'Role creator já existe';
    END IF;
    
    -- Adicionar marketing_strategist se não existir
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'marketing_strategist' AND enumtypid = 'user_role'::regtype) THEN
        ALTER TYPE user_role ADD VALUE 'marketing_strategist';
        RAISE NOTICE 'Role marketing_strategist adicionado';
    ELSE
        RAISE NOTICE 'Role marketing_strategist já existe';
    END IF;
END $$;

-- 4. Adicionar coluna business_id se não existir
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id);

-- 5. Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_users_business_id ON users(business_id) WHERE business_id IS NOT NULL;

-- 6. Atualizar usuário Boussolé para business_owner
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
  updated_at = NOW()
WHERE email = 'financeiro.brooftop@gmail.com';

-- 7. Verificar atualização
SELECT 
  id,
  email,
  full_name,
  role,
  business_id,
  permissions->>'scope' as permission_scope,
  is_active,
  updated_at
FROM users 
WHERE email = 'financeiro.brooftop@gmail.com';

-- 8. Verificar campanhas do Boussolé
SELECT 
  c.id,
  c.title,
  c.description,
  c.month,
  c.status,
  c.budget,
  c.business_id,
  b.name as business_name,
  c.created_at
FROM campaigns c
LEFT JOIN businesses b ON c.business_id = b.id
WHERE c.business_id = '55310ebd-0e0d-492e-8c34-cd4740000000'
  AND c.organization_id = '00000000-0000-0000-0000-000000000001'
ORDER BY c.created_at DESC;

-- 9. Verificar se há campanhas sem business_id que deveriam ser do Boussolé
SELECT 
  c.id,
  c.title,
  c.month,
  c.status,
  c.business_id,
  c.created_at
FROM campaigns c
WHERE c.business_id IS NULL
  AND c.organization_id = '00000000-0000-0000-0000-000000000001'
  AND (
    c.title ILIKE '%boussolé%' OR 
    c.title ILIKE '%boussole%' OR
    c.description ILIKE '%boussolé%' OR
    c.description ILIKE '%boussole%'
  )
ORDER BY c.created_at DESC;

-- 10. Atualizar campanhas que deveriam ser do Boussolé (se necessário)
-- DESCOMENTE APENAS SE HOUVER CAMPANHAS SEM BUSINESS_ID QUE SÃO DO BOUSSOLÉ
/*
UPDATE campaigns 
SET 
  business_id = '55310ebd-0e0d-492e-8c34-cd4740000000',
  updated_at = NOW()
WHERE business_id IS NULL
  AND organization_id = '00000000-0000-0000-0000-000000000001'
  AND (
    title ILIKE '%boussolé%' OR 
    title ILIKE '%boussole%' OR
    description ILIKE '%boussolé%' OR
    description ILIKE '%boussole%'
  );
*/

-- 11. Verificar roles disponíveis
SELECT unnest(enum_range(NULL::user_role)) as available_roles;

-- 12. Estatísticas finais
SELECT 
  'Usuário Boussolé' as item,
  CASE 
    WHEN role = 'business_owner' AND business_id = '55310ebd-0e0d-492e-8c34-cd4740000000' 
    THEN '✅ Configurado corretamente'
    ELSE '❌ Precisa de ajuste'
  END as status
FROM users 
WHERE email = 'financeiro.brooftop@gmail.com'

UNION ALL

SELECT 
  'Campanhas do Boussolé' as item,
  CASE 
    WHEN COUNT(*) > 0 
    THEN CONCAT('✅ ', COUNT(*), ' campanhas encontradas')
    ELSE '⚠️ Nenhuma campanha encontrada'
  END as status
FROM campaigns 
WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000'
  AND organization_id = '00000000-0000-0000-0000-000000000001';

-- 13. Comando para testar login (informativo)
SELECT 
  '🔐 TESTE DE LOGIN' as info,
  'Email: financeiro.brooftop@gmail.com' as email,
  'Senha: 1#Boussolecria' as senha,
  'Role: business_owner' as role,
  'Business ID: 55310ebd-0e0d-492e-8c34-cd4740000000' as business_id;
