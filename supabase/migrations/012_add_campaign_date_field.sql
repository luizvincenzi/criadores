-- Adicionar campo campaign_date para timestamp específico da campanha
-- Este campo permitirá filtros mais precisos por data

-- Adicionar campo campaign_date como TIMESTAMP WITH TIME ZONE
ALTER TABLE campaigns 
ADD COLUMN campaign_date TIMESTAMP WITH TIME ZONE;

-- Adicionar comentário explicativo
COMMENT ON COLUMN campaigns.campaign_date IS 'Data específica da campanha para filtros precisos por mês/ano';

-- Criar índice para consultas eficientes por data
CREATE INDEX idx_campaigns_campaign_date ON campaigns(campaign_date);

-- Atualizar campanhas existentes com data baseada no campo month
-- Converter formato "2025-07" para timestamp do primeiro dia do mês
UPDATE campaigns 
SET campaign_date = CASE 
  WHEN month ~ '^\d{4}-\d{2}$' THEN 
    (month || '-01')::date::timestamp with time zone
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
