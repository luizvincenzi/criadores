-- Script para verificar o status da empresa Boussolé
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar dados completos da empresa Boussolé
SELECT 
  id,
  organization_id,
  name,
  slug,
  status,
  is_active,
  business_stage,
  created_at,
  updated_at
FROM businesses 
WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000';

-- 2. Verificar se a empresa está na organização correta
SELECT 
  'Organização correta' as check_item,
  CASE 
    WHEN organization_id = '00000000-0000-0000-0000-000000000001' 
    THEN '✅ SIM' 
    ELSE '❌ NÃO' 
  END as status
FROM businesses 
WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000'

UNION ALL

SELECT 
  'Empresa ativa' as check_item,
  CASE 
    WHEN is_active = true 
    THEN '✅ SIM' 
    ELSE '❌ NÃO' 
  END as status
FROM businesses 
WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000';

-- 3. Se a empresa não estiver ativa, ativar
UPDATE businesses 
SET 
  is_active = true,
  updated_at = NOW()
WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000'
  AND is_active = false;

-- 4. Verificar novamente após possível atualização
SELECT 
  id,
  name,
  organization_id,
  is_active,
  status,
  'Empresa pronta para uso' as resultado
FROM businesses 
WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000'
  AND organization_id = '00000000-0000-0000-0000-000000000001'
  AND is_active = true;

-- 5. Verificar campanhas da empresa
SELECT 
  COUNT(*) as total_campanhas,
  'Campanhas vinculadas à empresa' as info
FROM campaigns 
WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000'
  AND organization_id = '00000000-0000-0000-0000-000000000001';

-- 6. Verificar usuário business_owner
SELECT 
  u.email,
  u.full_name,
  u.role,
  u.business_id,
  u.is_active,
  'Usuário business_owner configurado' as info
FROM users u
WHERE u.email = 'financeiro.brooftop@gmail.com'
  AND u.role = 'business_owner'
  AND u.business_id = '55310ebd-0e0d-492e-8c34-cd4740000000'
  AND u.is_active = true;
