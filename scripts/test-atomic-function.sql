-- Script para testar se a função add_creator_atomic foi aplicada corretamente
-- Execute este script no Supabase SQL Editor para verificar

-- 1. Verificar se a função existe
SELECT 
  proname as function_name,
  prosrc as function_body
FROM pg_proc 
WHERE proname = 'add_creator_atomic';

-- 2. Verificar se há criadores placeholder
SELECT 
  id,
  name,
  status,
  created_at
FROM creators 
WHERE name = '[SLOT VAZIO]';

-- 3. Verificar campanhas com problemas de constraint
SELECT 
  c.id as campaign_id,
  c.title,
  c.quantidade_criadores,
  COUNT(cc.id) as slots_count,
  ARRAY_AGG(cr.name) as creators
FROM campaigns c
LEFT JOIN campaign_creators cc ON c.id = cc.campaign_id AND cc.status != 'Removido'
LEFT JOIN creators cr ON cc.creator_id = cr.id
WHERE c.organization_id = '00000000-0000-0000-0000-000000000001'
GROUP BY c.id, c.title, c.quantidade_criadores
HAVING COUNT(cc.id) != c.quantidade_criadores
ORDER BY c.created_at DESC;

-- 4. Verificar duplicatas na tabela campaign_creators
SELECT 
  campaign_id,
  creator_id,
  COUNT(*) as count
FROM campaign_creators 
WHERE status != 'Removido'
GROUP BY campaign_id, creator_id
HAVING COUNT(*) > 1;
