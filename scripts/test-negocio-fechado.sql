-- Script para testar a nova etapa "Negócio Fechado"
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar se a nova etapa foi adicionada ao enum
SELECT 
  enumlabel as stage_name,
  enumsortorder as sort_order
FROM pg_enum 
WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'business_stage')
ORDER BY enumsortorder;

-- 2. Verificar negócios existentes por etapa
SELECT 
  business_stage,
  COUNT(*) as total_negocios,
  SUM(estimated_value) as valor_total
FROM businesses 
WHERE organization_id = '00000000-0000-0000-0000-000000000001'
  AND is_active = true
GROUP BY business_stage
ORDER BY business_stage;

-- 3. Verificar se há negócios que podem ser movidos para "Negócio Fechado"
SELECT
  id,
  name,
  business_stage,
  estimated_value,
  priority
FROM businesses
WHERE organization_id = '00000000-0000-0000-0000-000000000001'
  AND is_active = true
  AND business_stage IN ('Follow up', 'Reunião realizada')
ORDER BY updated_at DESC
LIMIT 5;
