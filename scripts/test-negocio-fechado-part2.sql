-- Script para testar criação e atualização com "Negócio Fechado"
-- Execute APÓS executar as migrations 024 e 025
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Testar criação de negócio com nova etapa
INSERT INTO businesses (
  organization_id,
  name,
  business_stage,
  estimated_value,
  priority,
  is_active,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Teste Negócio Fechado',
  'Negócio Fechado',
  50000.00,
  'Alta',
  true,
  NOW(),
  NOW()
) RETURNING id, name, business_stage, estimated_value;

-- 2. Verificar se o negócio foi criado corretamente
SELECT 
  id,
  name,
  business_stage,
  estimated_value,
  priority,
  created_at
FROM businesses 
WHERE name = 'Teste Negócio Fechado'
  AND organization_id = '00000000-0000-0000-0000-000000000001';

-- 3. Testar atualização de um negócio existente para "Negócio Fechado"
-- (Substitua o ID pelo ID de um negócio real)
-- UPDATE businesses 
-- SET 
--   business_stage = 'Negócio Fechado',
--   updated_at = NOW()
-- WHERE id = 'SEU_ID_AQUI'
--   AND organization_id = '00000000-0000-0000-0000-000000000001'
-- RETURNING id, name, business_stage;

-- 4. Verificar contagem por etapa após as mudanças
SELECT 
  business_stage,
  COUNT(*) as total_negocios,
  SUM(estimated_value) as valor_total
FROM businesses 
WHERE organization_id = '00000000-0000-0000-0000-000000000001'
  AND is_active = true
GROUP BY business_stage
ORDER BY 
  CASE business_stage
    WHEN 'Leads próprios frios' THEN 1
    WHEN 'Leads próprios quentes' THEN 2
    WHEN 'Leads indicados' THEN 3
    WHEN 'Enviando proposta' THEN 4
    WHEN 'Marcado reunião' THEN 5
    WHEN 'Reunião realizada' THEN 6
    WHEN 'Follow up' THEN 7
    WHEN 'Negócio Fechado' THEN 8
    WHEN 'Contrato assinado' THEN 9
    WHEN 'Declinado' THEN 10
    ELSE 11
  END;
