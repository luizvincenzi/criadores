-- ========================================
-- SCRIPT SIMPLIFICADO PARA SUPABASE
-- ========================================
-- Execute ESTE script quando receber erro de constraint
-- Limpa dados antigos e reinsere tudo de uma vez

-- PASSO 1: Remover dados antigos do Boussolé
DELETE FROM strategic_map_sections
WHERE strategic_map_id IN (
  SELECT id FROM strategic_maps
  WHERE business_id = (
    SELECT id FROM businesses
    WHERE LOWER(name) LIKE '%bouss%'
    LIMIT 1
  )
);

DELETE FROM strategic_maps
WHERE business_id = (
  SELECT id FROM businesses
  WHERE LOWER(name) LIKE '%bouss%'
  LIMIT 1
);

-- PASSO 2: Remover a constraint problemática
ALTER TABLE strategic_map_sections
DROP CONSTRAINT IF EXISTS strategic_map_sections_section_type_check;

-- PASSO 3: Inserir mapa estratégico
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
  '2025-Q4',
  2025,
  4,
  'completed',
  100,
  '{"business_info": {"category": "Restaurante Rooftop", "city": "Londrina", "state": "PR"}}'::jsonb,
  (SELECT id FROM users WHERE LOWER(email) = 'financeiro.brooftop@gmail.com' LIMIT 1)
FROM businesses b
WHERE LOWER(b.name) LIKE '%bouss%'
LIMIT 1;

-- PASSO 4: Inserir as 8 seções
INSERT INTO strategic_map_sections (strategic_map_id, section_type, section_order, content, ai_generated_content, is_ai_generated)
SELECT
  sm.id,
  'metrics_overview'::text,
  1,
  '{"instagram": {"followers": 8750, "growth_rate": 4.8}, "facebook": {"followers": 6200, "growth_rate": 3.1}, "tiktok": {"followers": 2100, "growth_rate": 6.2}, "google_reviews": {"rating": 4.3, "total": 423}, "main_opportunity": "Vista panorâmica", "competitive_advantage": "Único rooftop em Londrina"}'::jsonb,
  '{"analysis": "Presença digital sólida", "recommendations": ["Capitalizar visual", "Conteúdo backstage", "Parcerias com influenciadores"]}'::jsonb,
  true
FROM strategic_maps sm
WHERE sm.business_id = (SELECT id FROM businesses WHERE LOWER(name) LIKE '%bouss%' LIMIT 1)
LIMIT 1

UNION ALL

SELECT
  sm.id,
  'market_analysis'::text,
  2,
  '{"market_size": "R$ 850 milhões anuais", "growth_rate": "6.2% ao ano", "competition_level": "Média-Alta", "main_trends": ["Experiência rooftop", "Conteúdo instagramável"], "target_segments": ["Jovens 25-40", "Profissionais", "Turistas"], "market_share": "3.8%"}'::jsonb,
  '{"analysis": "Crescimento moderado", "opportunities": ["Eventos corporativos", "Parcerias com hotéis"], "threats": ["Concorrência local", "Sazonalidade climática"]}'::jsonb,
  true
FROM strategic_maps sm
WHERE sm.business_id = (SELECT id FROM businesses WHERE LOWER(name) LIKE '%bouss%' LIMIT 1)
LIMIT 1

UNION ALL

SELECT
  sm.id,
  'business_diagnosis'::text,
  3,
  '{"current_situation": "Rooftop estabelecido com faturamento estável", "strengths": ["Vista panorâmica", "Ambiente instagramável", "Localização central"], "weaknesses": ["Dependência climática", "Custos manutenção", "Sazonalidade"], "performance_indicators": {"ocupacao_media": 68, "ticket_medio": 85, "margem_lucro": 22, "nps": 78}}'::jsonb,
  '{"diagnosis": "Conceito diferenciado com boa performance", "critical_success_factors": ["Otimização sazonal", "Marketing visual"]}'::jsonb,
  true
FROM strategic_maps sm
WHERE sm.business_id = (SELECT id FROM businesses WHERE LOWER(name) LIKE '%bouss%' LIMIT 1)
LIMIT 1

UNION ALL

SELECT
  sm.id,
  'swot'::text,
  4,
  '{"strengths": ["Vista única", "Ambiente moderno", "Localização central", "Equipe especializada", "Conceito diferenciado"], "weaknesses": ["Dependência climática", "Custos elevados", "Concorrência intensa", "Sazonalidade"], "opportunities": ["Eventos corporativos", "Parcerias com hotéis", "Shows musicais", "Delivery premium"], "threats": ["Mudanças climáticas", "Novos rooftops", "Aumento custos", "Regulamentações"]}'::jsonb,
  '{"analysis": "Equilíbrio entre forças e fraquezas", "strategic_focus": "Capitalizar oportunidades mitiga ameaças"}'::jsonb,
  true
FROM strategic_maps sm
WHERE sm.business_id = (SELECT id FROM businesses WHERE LOWER(name) LIKE '%bouss%' LIMIT 1)
LIMIT 1

UNION ALL

SELECT
  sm.id,
  'product_analysis'::text,
  5,
  '{"product_lines": [{"name": "Drinks Premium", "description": "Drinks autorais", "price_range": "R$ 18-35", "popularity": 92, "margin": 65}, {"name": "Menu Contemporâneo", "description": "Gastronomia contemporânea", "price_range": "R$ 45-75", "popularity": 78, "margin": 42}, {"name": "Petiscos & Porções", "description": "Opções happy hour", "price_range": "R$ 25-55", "popularity": 85, "margin": 55}], "best_sellers": ["Negroni rooftop", "Ceviche contemporâneo", "Fritas trufadas"], "seasonal_menu": true, "customer_feedback": "Vista e experiência única"}'::jsonb,
  '{"analysis": "Cardápio bem estruturado", "recommendations": ["Manter foco no menu", "Desenvolver delivery", "Combos promocionais"]}'::jsonb,
  true
FROM strategic_maps sm
WHERE sm.business_id = (SELECT id FROM businesses WHERE LOWER(name) LIKE '%bouss%' LIMIT 1)
LIMIT 1

UNION ALL

SELECT
  sm.id,
  'icp_personas'::text,
  6,
  '{"primary_persona": {"name": "Mariana Silva", "age": "28-38", "occupation": "Profissional liberal", "income": "R$ 8.000-15.000", "behaviors": ["Experiências instagramáveis", "Janta 2-3x/semana", "Valoriza vista"], "pain_points": ["Busca lugares únicos", "Quer destacar redes sociais"], "preferred_channels": ["Instagram", "TikTok", "Indicação amigos"]}, "secondary_persona": {"name": "Roberto Santos", "age": "35-50", "occupation": "Empresário local", "income": "R$ 12.000-25.000", "behaviors": ["Reuniões negócios", "Eventos corporativos", "Busca networking"], "pain_points": ["Ambientes diferenciados", "Busca exclusividade"], "preferred_channels": ["LinkedIn", "Google Reviews", "Indicação profissional"]}}'::jsonb,
  '{"analysis": "Profissionais classe média-alta", "segmentation_strategy": "Corporativo almoço, premium jantar"}'::jsonb,
  true
FROM strategic_maps sm
WHERE sm.business_id = (SELECT id FROM businesses WHERE LOWER(name) LIKE '%bouss%' LIMIT 1)
LIMIT 1

UNION ALL

SELECT
  sm.id,
  'kpi_table'::text,
  7,
  '{"kpis": [{"name": "Ocupação Média", "current": 68, "target": 75, "unit": "%", "trend": "up", "frequency": "monthly"}, {"name": "Ticket Médio", "current": 85, "target": 92, "unit": "R$", "trend": "up", "frequency": "monthly"}, {"name": "Margem de Lucro", "current": 22, "target": 25, "unit": "%", "trend": "stable", "frequency": "quarterly"}, {"name": "NPS", "current": 78, "target": 82, "unit": "pontos", "trend": "up", "frequency": "quarterly"}], "monitoring_frequency": "Semanal ocupação, mensal demais", "responsible_team": "Gerente Operações"}'::jsonb,
  '{"analysis": "Negócio saudável com crescimento", "action_plan": ["Revisar fornecedores", "Controlar desperdício", "Otimizar equipe"]}'::jsonb,
  true
FROM strategic_maps sm
WHERE sm.business_id = (SELECT id FROM businesses WHERE LOWER(name) LIKE '%bouss%' LIMIT 1)
LIMIT 1

UNION ALL

SELECT
  sm.id,
  'objectives'::text,
  8,
  '{"quarterly_objectives": [{"objective": "Aumentar ocupação para 75%", "key_results": ["Sistema reservas online", "Campanhas sazonais", "Programa fidelidade"], "timeline": "Q4 2025", "responsible": "Gerente Marketing", "budget": "R$ 12.000"}, {"objective": "Elevar margem para 25%", "key_results": ["Otimizar custos", "Reduzir desperdício", "Aumentar ticket"], "timeline": "Q4 2025", "responsible": "Gerente Operações", "budget": "R$ 18.000"}, {"objective": "Melhorar NPS para 82", "key_results": ["Treinamento equipe", "Feedback digital", "Melhorias reviews"], "timeline": "Q4 2025", "responsible": "Gerente Geral", "budget": "R$ 6.000"}], "long_term_vision": "Ser rooftop referência em Londrina", "success_metrics": ["Crescimento 30% faturamento", "Margem 28%", "NPS 85+"]}'::jsonb,
  '{"analysis": "Objetivos alinhados com SWOT", "implementation_plan": "Executar em fases com maior impacto"}'::jsonb,
  true
FROM strategic_maps sm
WHERE sm.business_id = (SELECT id FROM businesses WHERE LOWER(name) LIKE '%bouss%' LIMIT 1)
LIMIT 1;

-- PASSO 5: Verificar resultado
SELECT 'Inserção concluída!' as resultado;
SELECT
  COUNT(*) as total_sections,
  COUNT(DISTINCT section_type) as tipos_diferentes
FROM strategic_map_sections
WHERE strategic_map_id IN (
  SELECT id FROM strategic_maps
  WHERE business_id = (SELECT id FROM businesses WHERE LOWER(name) LIKE '%bouss%' LIMIT 1)
);
