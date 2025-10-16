-- ========================================
-- TEMPLATE: Script para popular Mapa Estratégico de QUALQUER empresa
-- ========================================
--
-- INSTRUÇÕES:
-- 1. Copie este arquivo
-- 2. Substitua os valores entre [COLCHETES] pelos dados reais da empresa
-- 3. Execute no Supabase SQL Editor
--
-- VARIÁVEIS A SUBSTITUIR:
-- [EMPRESA_NOME]: Nome da empresa (ex: "Boussolé", "Restaurante XYZ")
-- [EMPRESA_EMAIL]: Email do usuário responsável
-- [TRIMESTRE]: Formato "YYYY-QN" (ex: "2025-Q4")
-- [ANO]: Ano (ex: 2025)
-- [NUMERO_TRIMESTRE]: 1, 2, 3 ou 4
--
-- DICAS:
-- - Mude os dados JSON para refletir a realidade da empresa
-- - Mantenha a estrutura igual
-- - Use dados reais ou realistas
-- ========================================

-- 1. Inserir mapa estratégico principal
INSERT INTO strategic_maps (
  organization_id,
  business_id,
  quarter,
  year,
  quarter_number,
  status,
  generation_progress,
  input_data,
  created_by
)
SELECT
  b.organization_id,
  b.id,
  '[TRIMESTRE]',
  [ANO],
  [NUMERO_TRIMESTRE],
  'completed',
  100,
  '{
    "business_info": {
      "category": "[CATEGORIA_EMPRESA]",
      "target_audience": "[PUBLICO_ALVO]",
      "city": "[CIDADE]",
      "state": "[ESTADO]",
      "main_competitors": ["[COMPETIDOR_1]", "[COMPETIDOR_2]"]
    },
    "social_media": {
      "instagram": {
        "url": "[URL_INSTAGRAM]",
        "followers": [FOLLOWERS_INSTA],
        "engagement_rate": [ENGAGEMENT_INSTA],
        "verified": false
      },
      "facebook": {
        "url": "[URL_FACEBOOK]",
        "followers": [FOLLOWERS_FB],
        "engagement_rate": [ENGAGEMENT_FB]
      },
      "tiktok": {
        "url": "[URL_TIKTOK]",
        "followers": [FOLLOWERS_TIKTOK],
        "engagement_rate": [ENGAGEMENT_TIKTOK]
      }
    }
  }'::jsonb,
  (SELECT id FROM users WHERE email = '[EMPRESA_EMAIL]' LIMIT 1)
FROM businesses b
WHERE b.name ILIKE '%[EMPRESA_NOME]%'
  AND NOT EXISTS (
    SELECT 1 FROM strategic_maps
    WHERE business_id = b.id AND quarter = '[TRIMESTRE]' AND year = [ANO]
  )
LIMIT 1;

-- 2. Obter ID do mapa criado
WITH map_id AS (
  SELECT id FROM strategic_maps
  WHERE business_id = (SELECT id FROM businesses WHERE name ILIKE '%[EMPRESA_NOME]%' LIMIT 1)
  AND quarter = '[TRIMESTRE]'
  AND year = [ANO]
  LIMIT 1
)

-- 3. Inserir todas as 8 seções
INSERT INTO strategic_map_sections (strategic_map_id, section_type, section_order, content, ai_generated_content, is_ai_generated)

-- Seção 1: Visão Geral das Métricas
SELECT
  (SELECT id FROM map_id),
  'metrics_overview'::section_type,
  1,
  '{
    "instagram": {"followers": [FOLLOWERS_INSTA], "growth_rate": [ENGAGEMENT_INSTA]},
    "facebook": {"followers": [FOLLOWERS_FB], "growth_rate": [ENGAGEMENT_FB]},
    "tiktok": {"followers": [FOLLOWERS_TIKTOK], "growth_rate": [ENGAGEMENT_TIKTOK]},
    "google_reviews": {"rating": [RATING_GOOGLE], "total": [TOTAL_REVIEWS]},
    "main_opportunity": "[OPORTUNIDADE_PRINCIPAL]",
    "competitive_advantage": "[VANTAGEM_COMPETITIVA]"
  }'::jsonb,
  '{
    "analysis": "[ANALISE_METRICAS]",
    "recommendations": ["[RECOMENDACAO_1]", "[RECOMENDACAO_2]", "[RECOMENDACAO_3]"]
  }'::jsonb,
  true

UNION ALL

-- Seção 2: Análise de Mercado
SELECT
  (SELECT id FROM map_id),
  'market_analysis'::section_type,
  2,
  '{
    "market_size": "[TAMANHO_MERCADO]",
    "growth_rate": "[CRESCIMENTO_MERCADO]",
    "competition_level": "[NIVEL_COMPETICAO]",
    "main_trends": ["[TENDENCIA_1]", "[TENDENCIA_2]"],
    "target_segments": ["[SEGMENTO_1]", "[SEGMENTO_2]"],
    "market_share": "[MARKET_SHARE]"
  }'::jsonb,
  '{
    "analysis": "[ANALISE_MERCADO]",
    "opportunities": ["[OPO_MERCADO_1]", "[OPO_MERCADO_2]"],
    "threats": ["[AMEACA_MERCADO_1]", "[AMEACA_MERCADO_2]"]
  }'::jsonb,
  true

UNION ALL

-- Seção 3: Diagnóstico do Negócio
SELECT
  (SELECT id FROM map_id),
  'business_diagnosis'::section_type,
  3,
  '{
    "current_situation": "[SITUACAO_ATUAL]",
    "strengths": ["[FORCA_1]", "[FORCA_2]"],
    "weaknesses": ["[FRAQUEZA_1]", "[FRAQUEZA_2]"],
    "performance_indicators": {
      "ocupacao_media": [OCUPACAO],
      "ticket_medio": [TICKET],
      "margem_lucro": [MARGEM],
      "nps": [NPS]
    }
  }'::jsonb,
  '{
    "diagnosis": "[DIAGNOSTICO]",
    "critical_success_factors": ["[FATOR_SUCESSO_1]", "[FATOR_SUCESSO_2]"],
    "action_priority": "[PRIORIDADE_ACAO]"
  }'::jsonb,
  true

UNION ALL

-- Seção 4: Análise SWOT
SELECT
  (SELECT id FROM map_id),
  'swot'::section_type,
  4,
  '{
    "strengths": ["[SWOT_S_1]", "[SWOT_S_2]", "[SWOT_S_3]"],
    "weaknesses": ["[SWOT_W_1]", "[SWOT_W_2]"],
    "opportunities": ["[SWOT_O_1]", "[SWOT_O_2]"],
    "threats": ["[SWOT_T_1]", "[SWOT_T_2]"]
  }'::jsonb,
  '{
    "analysis": "[ANALISE_SWOT]",
    "strategic_focus": "[FOCO_ESTRATEGICO]"
  }'::jsonb,
  true

UNION ALL

-- Seção 5: Análise de Produto
SELECT
  (SELECT id FROM map_id),
  'product_analysis'::section_type,
  5,
  '{
    "product_lines": [
      {"name": "[PRODUTO_1]", "description": "[DESC_PROD_1]", "price_range": "[PRECO_1]", "popularity": [POP_1], "margin": [MAR_1]},
      {"name": "[PRODUTO_2]", "description": "[DESC_PROD_2]", "price_range": "[PRECO_2]", "popularity": [POP_2], "margin": [MAR_2]},
      {"name": "[PRODUTO_3]", "description": "[DESC_PROD_3]", "price_range": "[PRECO_3]", "popularity": [POP_3], "margin": [MAR_3]}
    ],
    "best_sellers": ["[BEST_SELLER_1]", "[BEST_SELLER_2]"],
    "seasonal_menu": [true/false],
    "customer_feedback": "[FEEDBACK_CLIENTE]"
  }'::jsonb,
  '{
    "analysis": "[ANALISE_PRODUTO]",
    "recommendations": ["[REC_PROD_1]", "[REC_PROD_2]"]
  }'::jsonb,
  true

UNION ALL

-- Seção 6: ICP & Personas
SELECT
  (SELECT id FROM map_id),
  'icp_personas'::section_type,
  6,
  '{
    "primary_persona": {
      "name": "[PERSONA_PRIMARIA_NOME]",
      "age": "[PERSONA_PRIMARIA_IDADE]",
      "occupation": "[PERSONA_PRIMARIA_PROFISSAO]",
      "income": "[PERSONA_PRIMARIA_RENDA]",
      "behaviors": ["[COMPORTAMENTO_1]", "[COMPORTAMENTO_2]"],
      "pain_points": ["[DIFICULDADE_1]", "[DIFICULDADE_2]"],
      "preferred_channels": ["[CANAL_1]", "[CANAL_2]"]
    },
    "secondary_persona": {
      "name": "[PERSONA_SECUNDARIA_NOME]",
      "age": "[PERSONA_SECUNDARIA_IDADE]",
      "occupation": "[PERSONA_SECUNDARIA_PROFISSAO]",
      "income": "[PERSONA_SECUNDARIA_RENDA]",
      "behaviors": ["[COMPORTAMENTO_3]", "[COMPORTAMENTO_4]"],
      "pain_points": ["[DIFICULDADE_3]", "[DIFICULDADE_4]"],
      "preferred_channels": ["[CANAL_3]", "[CANAL_4]"]
    }
  }'::jsonb,
  '{
    "analysis": "[ANALISE_ICP]",
    "segmentation_strategy": "[ESTRATEGIA_SEGMENTACAO]"
  }'::jsonb,
  true

UNION ALL

-- Seção 7: KPIs e Indicadores
SELECT
  (SELECT id FROM map_id),
  'kpi_table'::section_type,
  7,
  '{
    "kpis": [
      {"name": "[KPI_1_NOME]", "current": [KPI_1_ATUAL], "target": [KPI_1_META], "unit": "[KPI_1_UNIDADE]", "trend": "[KPI_1_TENDENCIA]", "frequency": "[KPI_1_FREQUENCIA]"},
      {"name": "[KPI_2_NOME]", "current": [KPI_2_ATUAL], "target": [KPI_2_META], "unit": "[KPI_2_UNIDADE]", "trend": "[KPI_2_TENDENCIA]", "frequency": "[KPI_2_FREQUENCIA]"},
      {"name": "[KPI_3_NOME]", "current": [KPI_3_ATUAL], "target": [KPI_3_META], "unit": "[KPI_3_UNIDADE]", "trend": "[KPI_3_TENDENCIA]", "frequency": "[KPI_3_FREQUENCIA]"},
      {"name": "[KPI_4_NOME]", "current": [KPI_4_ATUAL], "target": [KPI_4_META], "unit": "[KPI_4_UNIDADE]", "trend": "[KPI_4_TENDENCIA]", "frequency": "[KPI_4_FREQUENCIA]"}
    ],
    "monitoring_frequency": "[FREQUENCIA_MONITORAMENTO]",
    "responsible_team": "[EQUIPE_RESPONSAVEL]"
  }'::jsonb,
  '{
    "analysis": "[ANALISE_KPI]",
    "action_plan": ["[PLANO_ACAO_1]", "[PLANO_ACAO_2]"]
  }'::jsonb,
  true

UNION ALL

-- Seção 8: Objetivos e Plano de Ação
SELECT
  (SELECT id FROM map_id),
  'objectives'::section_type,
  8,
  '{
    "quarterly_objectives": [
      {"objective": "[OBJETIVO_1]", "key_results": ["[KR_1_1]", "[KR_1_2]"], "timeline": "[TIMELINE_1]", "responsible": "[RESP_1]", "budget": "[BUDGET_1]"},
      {"objective": "[OBJETIVO_2]", "key_results": ["[KR_2_1]", "[KR_2_2]"], "timeline": "[TIMELINE_2]", "responsible": "[RESP_2]", "budget": "[BUDGET_2]"},
      {"objective": "[OBJETIVO_3]", "key_results": ["[KR_3_1]", "[KR_3_2]"], "timeline": "[TIMELINE_3]", "responsible": "[RESP_3]", "budget": "[BUDGET_3]"}
    ],
    "long_term_vision": "[VISAO_LONGO_PRAZO]",
    "success_metrics": ["[METRICA_SUCESSO_1]", "[METRICA_SUCESSO_2]"]
  }'::jsonb,
  '{
    "analysis": "[ANALISE_OBJETIVOS]",
    "implementation_plan": "[PLANO_IMPLEMENTACAO]"
  }'::jsonb,
  true

ON CONFLICT DO NOTHING;

-- 4. Verificar se tudo foi inserido
SELECT 'Inserção concluída!' as status;
SELECT COUNT(*) as total_sections
FROM strategic_map_sections
WHERE strategic_map_id IN (
  SELECT id FROM strategic_maps
  WHERE business_id = (SELECT id FROM businesses WHERE name ILIKE '%[EMPRESA_NOME]%' LIMIT 1)
  AND quarter = '[TRIMESTRE]'
  AND year = [ANO]
);
