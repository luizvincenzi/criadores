-- 🚀 SOLUÇÃO SIMPLES PARA LEAD_SOURCE
-- Execute este SQL no Supabase Dashboard (uma linha por vez se necessário)

-- ========================================
-- PASSO 1: REMOVER CONSTRAINT ANTIGA
-- ========================================

-- Remover constraint que está limitando os valores
ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_lead_source_check;

-- ========================================
-- PASSO 2: ALTERAR COLUNA PARA VARCHAR
-- ========================================

-- Alterar coluna para VARCHAR para aceitar qualquer valor
ALTER TABLE businesses ALTER COLUMN lead_source TYPE VARCHAR(50);

-- ========================================
-- PASSO 3: TESTAR NOVOS VALORES
-- ========================================

-- Testar se agora aceita os novos valores
INSERT INTO businesses (
  organization_id,
  name,
  business_stage,
  status,
  is_active,
  lead_source
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Teste Lead Source',
  '01_PROSPECT',
  'Reunião de briefing',
  true,
  'chatcriadores-home'
);

-- Verificar se funcionou
SELECT id, name, lead_source FROM businesses WHERE name = 'Teste Lead Source';

-- Limpar teste
DELETE FROM businesses WHERE name = 'Teste Lead Source';

-- ========================================
-- VERIFICAÇÃO FINAL
-- ========================================

-- Verificar tipo da coluna
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND column_name = 'lead_source';

-- ✅ PRONTO!
-- Agora a API pode usar qualquer valor para lead_source
