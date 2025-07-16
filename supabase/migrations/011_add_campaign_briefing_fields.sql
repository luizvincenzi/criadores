-- Adicionar campos específicos de briefing para campanhas
-- Estes campos são necessários para o formulário completo de criação de campanhas

-- Adicionar campo campaign_date para timestamp específico da campanha
ALTER TABLE campaigns
ADD COLUMN IF NOT EXISTS campaign_date TIMESTAMP WITH TIME ZONE;

-- Adicionar comentário explicativo para campaign_date
COMMENT ON COLUMN campaigns.campaign_date IS 'Data específica da campanha para filtros precisos por mês/ano';

-- Criar índice para consultas eficientes por data
CREATE INDEX IF NOT EXISTS idx_campaigns_campaign_date ON campaigns(campaign_date);

-- Atualizar campanhas existentes com data baseada no campo month
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

-- Adicionar campo briefing_details como JSONB para armazenar informações detalhadas do briefing
ALTER TABLE campaigns 
ADD COLUMN briefing_details JSONB DEFAULT '{
  "formato": "",
  "perfil_criador": "",
  "objetivo_detalhado": "",
  "comunicacao_secundaria": "",
  "datas_gravacao": {
    "data_inicio": null,
    "data_fim": null,
    "horarios_preferenciais": [],
    "observacoes": ""
  },
  "roteiro_video": {
    "o_que_falar": "",
    "historia": "",
    "promocao_cta": "",
    "tom_comunicacao": "",
    "pontos_obrigatorios": []
  },
  "requisitos_tecnicos": {
    "duracao_video": "",
    "qualidade": "",
    "formato_entrega": "",
    "hashtags_obrigatorias": []
  }
}'::jsonb;

-- Adicionar comentário explicativo
COMMENT ON COLUMN campaigns.briefing_details IS 'Detalhes específicos do briefing da campanha incluindo formato, perfil do criador, roteiro, datas de gravação e requisitos técnicos';

-- Criar índice para consultas eficientes no campo JSONB
CREATE INDEX idx_campaigns_briefing_details_gin ON campaigns USING gin(briefing_details);

-- Atualizar campanhas existentes com estrutura padrão (se houver)
UPDATE campaigns 
SET briefing_details = '{
  "formato": "",
  "perfil_criador": "",
  "objetivo_detalhado": "",
  "comunicacao_secundaria": "",
  "datas_gravacao": {
    "data_inicio": null,
    "data_fim": null,
    "horarios_preferenciais": [],
    "observacoes": ""
  },
  "roteiro_video": {
    "o_que_falar": "",
    "historia": "",
    "promocao_cta": "",
    "tom_comunicacao": "",
    "pontos_obrigatorios": []
  },
  "requisitos_tecnicos": {
    "duracao_video": "",
    "qualidade": "",
    "formato_entrega": "",
    "hashtags_obrigatorias": []
  }
}'::jsonb
WHERE briefing_details IS NULL;

-- Verificar se a migração foi aplicada corretamente
SELECT 
  'campaigns' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN briefing_details IS NOT NULL THEN 1 END) as com_briefing_details
FROM campaigns;
