-- Script para verificar duplicatas na tabela businesses
-- Execute este script no SQL Editor do Supabase Dashboard

-- 1. Verificar se há duplicatas do Boussolé
SELECT 
  id,
  organization_id,
  name,
  slug,
  is_active,
  created_at,
  'Registros do Boussolé' as tipo
FROM businesses 
WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000'
ORDER BY created_at;

-- 2. Verificar se há empresas com nomes similares
SELECT 
  id,
  organization_id,
  name,
  slug,
  is_active,
  created_at,
  'Nomes similares ao Boussolé' as tipo
FROM businesses 
WHERE name ILIKE '%boussolé%' 
   OR name ILIKE '%boussole%'
ORDER BY name, created_at;

-- 3. Verificar duplicatas por ID em geral
SELECT 
  id,
  COUNT(*) as total_registros,
  'Duplicatas por ID' as tipo
FROM businesses 
GROUP BY id 
HAVING COUNT(*) > 1
ORDER BY total_registros DESC;

-- 4. Verificar duplicatas por nome
SELECT 
  name,
  COUNT(*) as total_registros,
  'Duplicatas por nome' as tipo
FROM businesses 
GROUP BY name 
HAVING COUNT(*) > 1
ORDER BY total_registros DESC;

-- 5. Verificar estrutura da tabela businesses
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'businesses' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Verificar constraints e índices
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'businesses'::regclass;

-- 7. Verificar se há problema com UUID
SELECT 
  id,
  name,
  organization_id,
  is_active,
  CASE 
    WHEN id::text = '55310ebd-0e0d-492e-8c34-cd4740000000' THEN '✅ UUID correto'
    ELSE '❌ UUID diferente'
  END as uuid_check
FROM businesses 
WHERE name ILIKE '%boussolé%' 
   OR name ILIKE '%boussole%'
   OR id = '55310ebd-0e0d-492e-8c34-cd4740000000';

-- 8. Teste da query exata que está falhando
SELECT 
  id, 
  name, 
  is_active,
  'Query da API' as fonte
FROM businesses 
WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000'
  AND organization_id = '00000000-0000-0000-0000-000000000001';

-- 9. Verificar se há problema com organization_id
SELECT 
  organization_id,
  COUNT(*) as total_businesses,
  'Businesses por organização' as info
FROM businesses 
GROUP BY organization_id
ORDER BY total_businesses DESC;

-- 10. Limpar possíveis duplicatas (CUIDADO - só execute se necessário)
-- DESCOMENTE APENAS SE HOUVER DUPLICATAS CONFIRMADAS
/*
-- Manter apenas o registro mais recente em caso de duplicatas
DELETE FROM businesses 
WHERE id IN (
  SELECT id 
  FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY id ORDER BY created_at DESC) as rn
    FROM businesses
  ) t 
  WHERE rn > 1
);
*/
