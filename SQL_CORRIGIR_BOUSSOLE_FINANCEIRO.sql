-- =====================================================
-- 🔧 CORREÇÃO: Usuário financeiro.brooftop@gmail.com
-- =====================================================
-- PROBLEMA IDENTIFICADO:
-- 1. O business Boussolé Rooftop EXISTE (ID: 55310ebd-0e0d-492e-8c34-cd4740000000)
-- 2. O usuário NÃO EXISTE em platform_users
-- 3. O platform_access_status está como 'pending'
-- =====================================================

-- ============================================
-- 🔴 EXECUTE ESTE BLOCO PARA CRIAR O USUÁRIO
-- ============================================

-- PASSO 1: Criar o usuário em platform_users
INSERT INTO platform_users (
  id,
  organization_id,
  email,
  full_name,
  role,
  roles,
  business_id,
  managed_businesses,
  is_active,
  platform,
  created_at,
  updated_at
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000001',
  'financeiro.brooftop@gmail.com',
  'Cris - Boussolé Rooftop',
  'business_owner',
  ARRAY['business_owner']::platform_user_role[],
  '55310ebd-0e0d-492e-8c34-cd4740000000',
  ARRAY['55310ebd-0e0d-492e-8c34-cd4740000000']::uuid[],
  true,
  'client',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  role = 'business_owner',
  roles = ARRAY['business_owner']::platform_user_role[],
  business_id = '55310ebd-0e0d-492e-8c34-cd4740000000',
  managed_businesses = ARRAY['55310ebd-0e0d-492e-8c34-cd4740000000']::uuid[],
  is_active = true,
  updated_at = NOW();

-- PASSO 2: Atualizar o business para platform_access_status = 'granted'
UPDATE businesses
SET
  platform_access_status = 'granted',
  platform_access_granted_at = NOW(),
  updated_at = NOW()
WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000';

-- PASSO 3: Verificar resultado em platform_users
SELECT
  id,
  email,
  full_name,
  role,
  roles,
  business_id,
  managed_businesses,
  is_active
FROM platform_users
WHERE email = 'financeiro.brooftop@gmail.com';

-- PASSO 4: Verificar resultado em businesses
SELECT
  id,
  name,
  platform_access_status,
  platform_access_granted_at,
  platform_owner_email
FROM businesses
WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000';

-- ============================================
-- ✅ APÓS EXECUTAR, O USUÁRIO DEVE:
-- 1. Existir em platform_users com role = 'business_owner'
-- 2. Ter business_id = '55310ebd-0e0d-492e-8c34-cd4740000000'
-- 3. Poder acessar /conteudo-empresa normalmente
-- ============================================

