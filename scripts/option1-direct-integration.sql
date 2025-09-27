-- ========================================
-- OPÇÃO 1: INTEGRAÇÃO DIRETA COM ENRIQUECIMENTO AUTOMÁTICO
-- ========================================
-- Integra dados de AI com snapshots trimestrais automaticamente

-- 1. FUNÇÃO PARA ENRIQUECER SNAPSHOT COM DADOS DE IA
CREATE OR REPLACE FUNCTION enrich_snapshot_with_ai_data(
  p_business_id UUID,
  p_quarter VARCHAR(10)
) RETURNS VOID AS $$
DECLARE
  ai_data RECORD;
  channel_scores JSONB;
  audience_data JSONB;
  action_plans JSONB;
  market_insights JSONB;
BEGIN
  -- Buscar dados mais recentes de IA para a empresa
  SELECT 
    ai_response::jsonb as ai_response,
    processed_data::jsonb as processed_data,
    created_at
  INTO ai_data
  FROM ai_analysis 
  WHERE entity_id = p_business_id 
    AND entity_type = 'business'
    AND analysis_type = 'advanced_insights'
    AND status = 'completed'
  ORDER BY created_at DESC 
  LIMIT 1;
  
  IF NOT FOUND THEN
    RAISE NOTICE 'Nenhum dado de IA encontrado para business_id: %', p_business_id;
    RETURN;
  END IF;
  
  -- Extrair channel performance para presença digital
  SELECT jsonb_object_agg(
    CASE 
      WHEN channel->>'name' = 'Instagram' THEN 'instagram'
      WHEN channel->>'name' = 'TikTok' THEN 'tiktok'
      WHEN channel->>'name' = 'WhatsApp' THEN 'whatsapp'
      WHEN channel->>'name' = 'Google Ads' THEN 'google'
      ELSE LOWER(channel->>'name')
    END,
    (channel->>'score')::integer
  ) INTO channel_scores
  FROM jsonb_array_elements(ai_data.ai_response->'channelPerformance') AS channel;
  
  -- Extrair segmentação de audiência
  SELECT jsonb_agg(
    jsonb_build_object(
      'segment', segment->>'name',
      'percentage', (segment->>'percentage')::integer,
      'description', segment->>'description'
    )
  ) INTO audience_data
  FROM jsonb_array_elements(ai_data.ai_response->'audienceSegmentation') AS segment;
  
  -- Extrair planos de ação
  SELECT jsonb_build_object(
    'genZ', ai_data.ai_response->'actionPlan'->'genZ',
    'internal', ai_data.ai_response->'actionPlan'->'internal',
    'influencers', ai_data.ai_response->'actionPlan'->'influencers'
  ) INTO action_plans;
  
  -- Extrair insights de mercado
  SELECT jsonb_build_object(
    'trends', ai_data.ai_response->'marketAnalysis'->'trends',
    'competitors', ai_data.ai_response->'marketAnalysis'->'competitors',
    'opportunities', ai_data.ai_response->'marketAnalysis'->'opportunities',
    'seasonality', ai_data.ai_response->'marketAnalysis'->'seasonality'
  ) INTO market_insights;
  
  -- Atualizar snapshot com dados enriquecidos
  UPDATE business_quarterly_snapshots 
  SET 
    -- Presença digital baseada em channel performance
    digital_presence = jsonb_build_object(
      'instagram', COALESCE((channel_scores->>'instagram')::integer * 100, 0),
      'tiktok', COALESCE((channel_scores->>'tiktok')::integer * 10, 0),
      'facebook', COALESCE((channel_scores->>'facebook')::integer * 50, 0),
      'google', jsonb_build_object(
        'rating', COALESCE((channel_scores->>'google')::numeric / 20, 4.0),
        'reviews', COALESCE((channel_scores->>'google')::integer * 2, 50)
      ),
      'tripadvisor', jsonb_build_object(
        'rating', 4.2,
        'rank', GREATEST(1, 20 - COALESCE((channel_scores->>'instagram')::integer / 10, 0))
      )
    ),
    
    -- KPIs baseados em channel performance e insights
    kpis = jsonb_build_object(
      'ocupacao', LEAST(100, COALESCE((channel_scores->>'instagram')::integer, 50)),
      'ticket', LEAST(150, 50 + COALESCE((channel_scores->>'google')::integer, 0)),
      'margemPorcoes', LEAST(80, 40 + COALESCE((channel_scores->>'whatsapp')::integer / 2, 20)),
      'nps', LEAST(100, COALESCE((channel_scores->>'instagram')::integer, 60)),
      'ruido', GREATEST(0, 5 - COALESCE((channel_scores->>'instagram')::integer / 20, 2))
    ),
    
    -- 4 Ps baseados em análise de negócio
    four_ps_status = jsonb_build_object(
      'produto', CASE 
        WHEN ai_data.ai_response->'businessAnalysis'->>'mainOpportunity' LIKE '%nicho%' THEN 'yellow'
        WHEN array_length(ai_data.ai_response->'businessAnalysis'->'strengths', 1) > 2 THEN 'green'
        ELSE 'red'
      END,
      'preco', CASE 
        WHEN ai_data.ai_response->'audienceSegmentation'->0->>'name' LIKE '%renda média-alta%' THEN 'green'
        WHEN ai_data.ai_response->'audienceSegmentation'->0->>'name' LIKE '%renda média%' THEN 'yellow'
        ELSE 'red'
      END,
      'praca', CASE 
        WHEN ai_data.ai_response->'businessAnalysis'->>'description' LIKE '%Londrina%' THEN 'green'
        ELSE 'yellow'
      END,
      'promocao', CASE 
        WHEN (channel_scores->>'instagram')::integer > 80 THEN 'green'
        WHEN (channel_scores->>'instagram')::integer > 60 THEN 'yellow'
        ELSE 'red'
      END
    ),
    
    -- Executive summary baseado em análise de IA
    executive_summary = jsonb_build_object(
      'green', ai_data.ai_response->'businessAnalysis'->'strengths',
      'yellow', ARRAY[ai_data.ai_response->'businessAnalysis'->>'mainOpportunity'],
      'red', ai_data.ai_response->'businessAnalysis'->'weaknesses'
    ),
    
    -- Dados de IA enriquecidos
    ai_insights = jsonb_build_object(
      'channelPerformance', ai_data.ai_response->'channelPerformance',
      'audienceSegmentation', audience_data,
      'actionPlans', action_plans,
      'marketInsights', market_insights,
      'businessAnalysis', ai_data.ai_response->'businessAnalysis',
      'lastAnalysis', ai_data.created_at
    ),
    
    ai_confidence = 95,
    ai_last_analysis = ai_data.created_at,
    ai_recommendations = ARRAY(
      SELECT jsonb_array_elements_text(
        ai_data.ai_response->'actionPlan'->'internal'->0->'metrics'
      )
    ),
    
    competitive_analysis = market_insights,
    market_opportunities = ARRAY(
      SELECT jsonb_array_elements_text(
        ai_data.ai_response->'marketAnalysis'->'opportunities'
      )
    ),
    
    updated_at = NOW(),
    notes = 'Enriquecido automaticamente com dados de IA em ' || NOW()::text
    
  WHERE business_id = p_business_id 
    AND quarter = p_quarter;
    
  RAISE NOTICE 'Snapshot % enriquecido com dados de IA para business %', p_quarter, p_business_id;
END;
$$ LANGUAGE plpgsql;

-- 2. APLICAR ENRIQUECIMENTO PARA BOUSSOLÉ
SELECT enrich_snapshot_with_ai_data(
  '55310ebd-0e0d-492e-8c34-cd4740000000'::uuid,
  '2025-Q3'
);

-- 3. VERIFICAR RESULTADO
SELECT 
  quarter,
  kpis->>'ocupacao' as ocupacao,
  kpis->>'nps' as nps,
  digital_presence->>'instagram' as instagram,
  four_ps_status->>'produto' as produto_status,
  ai_confidence,
  array_length(ai_recommendations, 1) as total_recomendacoes,
  array_length(market_opportunities, 1) as total_oportunidades,
  LENGTH(ai_insights::text) as tamanho_ai_insights
FROM business_quarterly_snapshots 
WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000';

-- 4. FUNÇÃO PARA SINCRONIZAÇÃO AUTOMÁTICA
CREATE OR REPLACE FUNCTION sync_all_snapshots_with_ai()
RETURNS TABLE(business_name TEXT, snapshots_updated INTEGER) AS $$
DECLARE
  business_record RECORD;
  snapshot_record RECORD;
  updated_count INTEGER := 0;
BEGIN
  FOR business_record IN 
    SELECT DISTINCT b.id, b.name 
    FROM businesses b
    JOIN ai_analysis ai ON ai.entity_id = b.id
    WHERE b.is_active = true
  LOOP
    FOR snapshot_record IN
      SELECT quarter 
      FROM business_quarterly_snapshots 
      WHERE business_id = business_record.id
    LOOP
      PERFORM enrich_snapshot_with_ai_data(business_record.id, snapshot_record.quarter);
      updated_count := updated_count + 1;
    END LOOP;
    
    RETURN QUERY SELECT business_record.name, updated_count;
    updated_count := 0;
  END LOOP;
END;
$$ LANGUAGE plpgsql;
