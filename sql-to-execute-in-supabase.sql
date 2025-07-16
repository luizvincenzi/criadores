-- EXECUTE ESTE SQL NO PAINEL DO SUPABASE
-- Vá em: Database > SQL Editor > New Query
-- Cole este código e clique em "Run"

-- 1. Adicionar campo campaign_date à tabela campaigns
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS campaign_date TIMESTAMP WITH TIME ZONE;

-- 2. Adicionar comentário explicativo
COMMENT ON COLUMN campaigns.campaign_date IS 'Data específica da campanha para filtros precisos por mês/ano';

-- 3. Criar índice para consultas eficientes por data
CREATE INDEX IF NOT EXISTS idx_campaigns_campaign_date ON campaigns(campaign_date);

-- 4. Atualizar campanhas existentes com data baseada no campo month
UPDATE campaigns 
SET campaign_date = CASE 
  -- Formato "2025-07" -> timestamp
  WHEN month ~ '^\d{4}-\d{2}$' THEN 
    (month || '-01')::date::timestamp with time zone
  -- Formato "julho de 2025" -> timestamp  
  WHEN month ~ '^\w+ de \d{4}$' THEN 
    CASE 
      WHEN month ILIKE 'janeiro%' THEN (SUBSTRING(month FROM '\d{4}') || '-01-01')::date::timestamp with time zone
      WHEN month ILIKE 'fevereiro%' THEN (SUBSTRING(month FROM '\d{4}') || '-02-01')::date::timestamp with time zone
      WHEN month ILIKE 'março%' THEN (SUBSTRING(month FROM '\d{4}') || '-03-01')::date::timestamp with time zone
      WHEN month ILIKE 'abril%' THEN (SUBSTRING(month FROM '\d{4}') || '-04-01')::date::timestamp with time zone
      WHEN month ILIKE 'maio%' THEN (SUBSTRING(month FROM '\d{4}') || '-05-01')::date::timestamp with time zone
      WHEN month ILIKE 'junho%' THEN (SUBSTRING(month FROM '\d{4}') || '-06-01')::date::timestamp with time zone
      WHEN month ILIKE 'julho%' THEN (SUBSTRING(month FROM '\d{4}') || '-07-01')::date::timestamp with time zone
      WHEN month ILIKE 'agosto%' THEN (SUBSTRING(month FROM '\d{4}') || '-08-01')::date::timestamp with time zone
      WHEN month ILIKE 'setembro%' THEN (SUBSTRING(month FROM '\d{4}') || '-09-01')::date::timestamp with time zone
      WHEN month ILIKE 'outubro%' THEN (SUBSTRING(month FROM '\d{4}') || '-10-01')::date::timestamp with time zone
      WHEN month ILIKE 'novembro%' THEN (SUBSTRING(month FROM '\d{4}') || '-11-01')::date::timestamp with time zone
      WHEN month ILIKE 'dezembro%' THEN (SUBSTRING(month FROM '\d{4}') || '-12-01')::date::timestamp with time zone
      ELSE NOW()
    END
  ELSE NOW()
END
WHERE campaign_date IS NULL;

-- 5. Verificar resultado
SELECT id, month, campaign_date 
FROM campaigns 
ORDER BY campaign_date DESC 
LIMIT 10;
