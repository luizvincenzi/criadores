-- Script para verificar valores válidos do enum campaign_status
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar valores válidos do enum campaign_status
SELECT 
  unnest(enum_range(NULL::campaign_status)) AS valid_status
ORDER BY valid_status;

-- 2. Verificar campanhas existentes e seus status
SELECT 
  status,
  COUNT(*) as count
FROM campaigns 
GROUP BY status
ORDER BY status;

-- 3. Verificar se há algum valor NULL ou inválido
SELECT 
  id,
  title,
  status,
  business_id,
  month
FROM campaigns 
WHERE status IS NULL 
   OR status::text NOT IN (
     SELECT unnest(enum_range(NULL::campaign_status))::text
   )
LIMIT 10;

-- 4. Debug: Mostrar algumas campanhas para verificar
SELECT 
  c.id,
  c.title,
  c.status,
  c.month,
  b.name as business_name
FROM campaigns c
JOIN businesses b ON c.business_id = b.id
ORDER BY c.updated_at DESC
LIMIT 5;
