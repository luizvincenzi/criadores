-- ========================================
-- OPÇÃO 2: DASHBOARD HÍBRIDO COM SEÇÕES DEDICADAS
-- ========================================
-- Mantém snapshots separados dos dados de IA, permitindo comparação

-- 1. CRIAR VIEW PARA DADOS DE IA FORMATADOS
CREATE OR REPLACE VIEW ai_insights_dashboard AS
SELECT 
  ai.entity_id as business_id,
  b.name as business_name,
  ai.ai_response::jsonb as ai_data,
  ai.processed_data::jsonb as processed_data,
  ai.created_at as analysis_date,
  ai.confidence_score,
  ai.status,
  
  -- Extrair channel performance
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', channel->>'name',
        'score', (channel->>'score')::integer,
        'color', channel->>'color',
        'reasoning', channel->>'reasoning'
      )
    )
    FROM jsonb_array_elements(ai.ai_response::jsonb->'channelPerformance') AS channel
  ) as channel_performance,
  
  -- Extrair segmentação de audiência
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'name', segment->>'name',
        'percentage', (segment->>'percentage')::integer,
        'description', segment->>'description'
      )
    )
    FROM jsonb_array_elements(ai.ai_response::jsonb->'audienceSegmentation') AS segment
  ) as audience_segmentation,
  
  -- Extrair recomendações prioritárias
  (
    SELECT jsonb_agg(action)
    FROM (
      SELECT action
      FROM jsonb_array_elements(ai.ai_response::jsonb->'actionPlan'->'internal') AS action
      WHERE action->>'priority' = 'high'
      UNION ALL
      SELECT action
      FROM jsonb_array_elements(ai.ai_response::jsonb->'actionPlan'->'influencers') AS action
      WHERE action->>'priority' = 'high'
    ) priority_actions
  ) as priority_recommendations,
  
  -- Análise de negócio
  ai.ai_response::jsonb->'businessAnalysis' as business_analysis,
  ai.ai_response::jsonb->'marketAnalysis' as market_analysis,
  ai.ai_response::jsonb->'actionPlan' as action_plans

FROM ai_analysis ai
JOIN businesses b ON ai.entity_id = b.id
WHERE ai.entity_type = 'business'
  AND ai.analysis_type = 'advanced_insights'
  AND ai.status = 'completed'
  AND b.organization_id = '00000000-0000-0000-0000-000000000001';

-- 2. FUNÇÃO PARA COMPARAR DADOS DE IA COM SNAPSHOTS
CREATE OR REPLACE FUNCTION compare_ai_with_snapshots(p_business_id UUID)
RETURNS TABLE(
  metric_name TEXT,
  ai_value TEXT,
  snapshot_value TEXT,
  correlation_status TEXT,
  recommendation TEXT
) AS $$
DECLARE
  ai_record RECORD;
  snapshot_record RECORD;
BEGIN
  -- Buscar dados de IA
  SELECT * INTO ai_record
  FROM ai_insights_dashboard
  WHERE business_id = p_business_id
  ORDER BY analysis_date DESC
  LIMIT 1;
  
  -- Buscar snapshot mais recente
  SELECT * INTO snapshot_record
  FROM business_quarterly_snapshots
  WHERE business_id = p_business_id
  ORDER BY year DESC, quarter_number DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 
      'Erro'::TEXT,
      'N/A'::TEXT,
      'N/A'::TEXT,
      'error'::TEXT,
      'Nenhum snapshot encontrado'::TEXT;
    RETURN;
  END IF;
  
  -- Comparar Instagram
  RETURN QUERY SELECT
    'Instagram Performance'::TEXT,
    COALESCE(
      (ai_record.channel_performance->0->>'score')::TEXT || ' (IA Score)',
      'N/A'
    ),
    COALESCE(
      (snapshot_record.digital_presence->>'instagram')::TEXT || ' (Seguidores)',
      '0'
    ),
    CASE 
      WHEN (ai_record.channel_performance->0->>'score')::integer > 80 
           AND (snapshot_record.digital_presence->>'instagram')::integer > 5000 THEN 'aligned'
      WHEN (ai_record.channel_performance->0->>'score')::integer > 80 
           AND (snapshot_record.digital_presence->>'instagram')::integer < 1000 THEN 'potential'
      ELSE 'misaligned'
    END,
    CASE 
      WHEN (ai_record.channel_performance->0->>'score')::integer > 80 THEN 
        'IA indica alto potencial no Instagram. Considere investir mais nesta plataforma.'
      ELSE 
        'IA sugere melhorias no Instagram. Revise estratégia de conteúdo.'
    END;
    
  -- Comparar Ocupação vs Strengths
  RETURN QUERY SELECT
    'Ocupação vs Forças do Negócio'::TEXT,
    COALESCE(
      array_length(
        ARRAY(SELECT jsonb_array_elements_text(ai_record.business_analysis->'strengths')), 
        1
      )::TEXT || ' forças identificadas',
      '0'
    ),
    COALESCE(
      (snapshot_record.kpis->>'ocupacao')::TEXT || '% ocupação',
      '0%'
    ),
    CASE 
      WHEN array_length(
        ARRAY(SELECT jsonb_array_elements_text(ai_record.business_analysis->'strengths')), 
        1
      ) > 2 AND (snapshot_record.kpis->>'ocupacao')::integer > 70 THEN 'aligned'
      WHEN array_length(
        ARRAY(SELECT jsonb_array_elements_text(ai_record.business_analysis->'strengths')), 
        1
      ) > 2 AND (snapshot_record.kpis->>'ocupacao')::integer < 50 THEN 'potential'
      ELSE 'review_needed'
    END,
    CASE 
      WHEN array_length(
        ARRAY(SELECT jsonb_array_elements_text(ai_record.business_analysis->'strengths')), 
        1
      ) > 2 THEN 
        'IA identifica múltiplas forças. Potencial para aumentar ocupação.'
      ELSE 
        'IA sugere fortalecer posicionamento antes de focar em ocupação.'
    END;
    
  -- Comparar Audiência vs 4 Ps
  RETURN QUERY SELECT
    'Audiência vs Estratégia de Preço'::TEXT,
    COALESCE(
      (ai_record.audience_segmentation->0->>'name')::TEXT,
      'N/A'
    ),
    COALESCE(
      snapshot_record.four_ps_status->>'preco',
      'gray'
    ),
    CASE 
      WHEN ai_record.audience_segmentation->0->>'name' LIKE '%renda média-alta%' 
           AND snapshot_record.four_ps_status->>'preco' = 'green' THEN 'aligned'
      WHEN ai_record.audience_segmentation->0->>'name' LIKE '%renda média-alta%' 
           AND snapshot_record.four_ps_status->>'preco' != 'green' THEN 'opportunity'
      ELSE 'review_needed'
    END,
    CASE 
      WHEN ai_record.audience_segmentation->0->>'name' LIKE '%renda média-alta%' THEN 
        'IA identifica audiência premium. Considere estratégia de preço premium.'
      ELSE 
        'IA sugere audiência diversificada. Revise estratégia de precionamento.'
    END;
    
END;
$$ LANGUAGE plpgsql;

-- 3. FUNÇÃO PARA GERAR RELATÓRIO DE INTEGRAÇÃO
CREATE OR REPLACE FUNCTION generate_integration_report(p_business_id UUID)
RETURNS TABLE(
  section_name TEXT,
  ai_insights JSONB,
  snapshot_data JSONB,
  integration_score INTEGER,
  recommendations TEXT[]
) AS $$
DECLARE
  ai_data RECORD;
  snapshot_data RECORD;
BEGIN
  -- Buscar dados
  SELECT * INTO ai_data FROM ai_insights_dashboard WHERE business_id = p_business_id LIMIT 1;
  SELECT * INTO snapshot_data FROM business_quarterly_snapshots WHERE business_id = p_business_id ORDER BY created_at DESC LIMIT 1;
  
  -- Seção: Performance Digital
  RETURN QUERY SELECT
    'Performance Digital'::TEXT,
    jsonb_build_object(
      'channelPerformance', ai_data.channel_performance,
      'topChannel', (
        SELECT channel->>'name'
        FROM jsonb_array_elements(ai_data.channel_performance) AS channel
        ORDER BY (channel->>'score')::integer DESC
        LIMIT 1
      )
    ),
    jsonb_build_object(
      'digitalPresence', snapshot_data.digital_presence,
      'totalFollowers', (
        COALESCE((snapshot_data.digital_presence->>'instagram')::integer, 0) +
        COALESCE((snapshot_data.digital_presence->>'tiktok')::integer, 0) +
        COALESCE((snapshot_data.digital_presence->>'facebook')::integer, 0)
      )
    ),
    CASE 
      WHEN (
        SELECT MAX((channel->>'score')::integer)
        FROM jsonb_array_elements(ai_data.channel_performance) AS channel
      ) > 80 THEN 85
      ELSE 60
    END,
    ARRAY[
      'Sincronizar dados de IA com presença digital',
      'Focar no canal com maior score de IA',
      'Alinhar estratégia de conteúdo com insights de audiência'
    ];
    
  -- Seção: Estratégia de Negócio
  RETURN QUERY SELECT
    'Estratégia de Negócio'::TEXT,
    jsonb_build_object(
      'businessAnalysis', ai_data.business_analysis,
      'priorityActions', ai_data.priority_recommendations
    ),
    jsonb_build_object(
      'fourPs', snapshot_data.four_ps_status,
      'executiveSummary', snapshot_data.executive_summary
    ),
    CASE 
      WHEN array_length(
        ARRAY(SELECT jsonb_array_elements_text(ai_data.business_analysis->'strengths')), 
        1
      ) > 2 THEN 75
      ELSE 50
    END,
    ARRAY[
      'Implementar ações prioritárias identificadas pela IA',
      'Alinhar 4 Ps com análise de mercado da IA',
      'Atualizar executive summary com insights de IA'
    ];
    
END;
$$ LANGUAGE plpgsql;

-- 4. APLICAR PARA BOUSSOLÉ
SELECT * FROM compare_ai_with_snapshots('55310ebd-0e0d-492e-8c34-cd4740000000'::uuid);

-- 5. GERAR RELATÓRIO COMPLETO
SELECT * FROM generate_integration_report('55310ebd-0e0d-492e-8c34-cd4740000000'::uuid);

-- 6. VERIFICAR DADOS DISPONÍVEIS
SELECT 
  'AI Data Available' as data_type,
  business_name,
  analysis_date,
  jsonb_array_length(channel_performance) as channels_analyzed,
  jsonb_array_length(audience_segmentation) as audience_segments,
  jsonb_array_length(priority_recommendations) as priority_actions
FROM ai_insights_dashboard 
WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000'

UNION ALL

SELECT 
  'Snapshot Data Available' as data_type,
  'Boussolé' as business_name,
  created_at as analysis_date,
  CASE WHEN kpis->>'ocupacao' != '0' THEN 1 ELSE 0 END as channels_analyzed,
  CASE WHEN digital_presence->>'instagram' != '0' THEN 1 ELSE 0 END as audience_segments,
  array_length(ai_recommendations, 1) as priority_actions
FROM business_quarterly_snapshots 
WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000';
