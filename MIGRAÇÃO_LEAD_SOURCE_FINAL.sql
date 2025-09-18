-- 🚀 MIGRAÇÃO FINAL PARA LEAD_SOURCE
-- Execute linha por linha no Supabase Dashboard

-- PASSO 1: Remover constraint que limita valores
ALTER TABLE businesses DROP CONSTRAINT IF EXISTS businesses_lead_source_check;

-- PASSO 2: Alterar coluna para VARCHAR
ALTER TABLE businesses ALTER COLUMN lead_source TYPE VARCHAR(50);

-- PASSO 3: Verificar se funcionou
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'businesses' 
AND column_name = 'lead_source';

-- ✅ PRONTO! Agora a API pode usar qualquer valor para lead_source
