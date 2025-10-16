-- ========================================
-- Script para limpar e repovoar o Mapa Estratégico
-- Executa se houve erro na primeira tentativa
-- ========================================

-- 1. Remover dados antigos do Boussolé se existirem
DELETE FROM strategic_map_sections
WHERE strategic_map_id IN (
  SELECT id FROM strategic_maps
  WHERE business_id = (SELECT id FROM businesses WHERE name ILIKE '%boussolé%' LIMIT 1)
);

DELETE FROM strategic_maps
WHERE business_id = (SELECT id FROM businesses WHERE name ILIKE '%boussolé%' LIMIT 1);

-- 2. Agora executar o script de população do zero
-- (Copie e cole o conteúdo de populate-boussole-strategic-map.sql aqui)

-- Inserir dados na tabela strategic_maps
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
  '{
    "business_info": {
      "category": "Alimentação - Restaurante Rooftop",
      "target_audience": "Jovens adultos 25-40 anos, famílias, profissionais liberais",
      "city": "Londrina",
      "state": "PR",
      "main_competitors": ["Outro Rooftop", "Restaurante Italiano", "Bar Contemporâneo"]
    },
    "social_media": {
      "instagram": {"url": "https://instagram.com/boussole.rooftop", "followers": 8750, "engagement_rate": 4.8, "verified": false},
      "facebook": {"url": "https://facebook.com/boussole.rooftop", "followers": 6200, "engagement_rate": 3.1},
      "tiktok": {"url": "https://tiktok.com/@boussole.rooftop", "followers": 2100, "engagement_rate": 6.2}
    },
    "reviews": {
      "google": {"url": "https://www.google.com/search?q=boussole+rooftop&lrd=0x94eb434d3c216fa1:0x8daadcf649279e18", "rating": 4.3, "total_reviews": 423},
      "tripadvisor": {"url": "", "rating": 0, "total_reviews": 0}
    },
    "website": {"url": "https://boussole.com.br", "bounce_rate": 38.5, "monthly_visits": 8900},
    "additional_info": {
      "main_challenges": ["Concorrência local intensa", "Sazonalidade climática", "Custos com manutenção rooftop"],
      "strengths": ["Vista panorâmica única", "Ambiente instagramável", "Cardápio contemporâneo", "Localização central"],
      "opportunities": ["Eventos corporativos", "Parcerias com hotéis", "Delivery de drinks", "Shows e apresentações"]
    }
  }'::jsonb,
  (SELECT id FROM users WHERE email = 'financeiro.brooftop@gmail.com' LIMIT 1)
FROM businesses b
WHERE b.name ILIKE '%boussolé%'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Obter o ID do mapa que foi criado
WITH map_id AS (
  SELECT id FROM strategic_maps
  WHERE business_id = (SELECT id FROM businesses WHERE name ILIKE '%boussolé%' LIMIT 1)
  LIMIT 1
)

-- Inserir todas as 8 seções em uma única operação
INSERT INTO strategic_map_sections (strategic_map_id, section_type, section_order, content, ai_generated_content, is_ai_generated)
SELECT
  (SELECT id FROM map_id),
  'metrics_overview'::section_type,
  1,
  '{"instagram": {"followers": 8750, "growth_rate": 4.8}, "facebook": {"followers": 6200, "growth_rate": 3.1}, "tiktok": {"followers": 2100, "growth_rate": 6.2}, "google_reviews": {"rating": 4.3, "total": 423}, "main_opportunity": "Vista panorâmica única e ambiente instagramável geram alto engajamento orgânico", "competitive_advantage": "Único rooftop gastronômico de Londrina com vista completa da cidade"}'::jsonb,
  '{"analysis": "A Boussolé apresenta presença digital sólida para um restaurante de Londrina, com destaque para o alto engajamento no Instagram e TikTok, típico de estabelecimentos com apelo visual.", "recommendations": ["Capitalizar o apelo visual do rooftop", "Criar conteúdo de bastidores", "Parcerias com influenciadores locais", "Campanhas sazonais focadas na vista"]}'::jsonb,
  true
UNION ALL
SELECT
  (SELECT id FROM map_id),
  'market_analysis'::section_type,
  2,
  '{"market_size": "R$ 850 milhões anuais no mercado de alimentação de Londrina", "growth_rate": "6.2% ao ano", "competition_level": "Média-Alta", "main_trends": ["Experiência rooftop", "Conteúdo instagramável", "Delivery local", "Eventos corporativos"], "target_segments": ["Jovens adultos 25-40", "Turistas", "Profissionais liberais", "Eventos corporativos"], "market_share": "3.8%"}'::jsonb,
  '{"analysis": "O mercado de Londrina apresenta crescimento moderado, com destaque para o segmento de experiências diferenciadas como rooftops. A Boussolé está bem posicionada como única opção rooftop da cidade.", "opportunities": ["Eventos corporativos no rooftop", "Parcerias com hotéis", "Shows e apresentações", "Delivery de drinks premium"], "threats": ["Concorrência de bares tradicionais", "Sazonalidade climática", "Custos elevados de manutenção"]}'::jsonb,
  true
UNION ALL
SELECT
  (SELECT id FROM map_id),
  'business_diagnosis'::section_type,
  3,
  '{"current_situation": "Rooftop gastronômico estabelecido em Londrina com conceito único, faturamento estável mas com desafios de sazonalidade climática", "strengths": ["Vista panorâmica única", "Ambiente instagramável", "Localização central", "Equipe especializada"], "weaknesses": ["Dependência climática", "Custos manutenção rooftop", "Concorrência local", "Sazonalidade baixa temporada"], "performance_indicators": {"ocupacao_media": 68, "ticket_medio": 85, "margem_lucro": 22, "nps": 78}}'::jsonb,
  '{"diagnosis": "A Boussolé apresenta um conceito diferenciado com boa performance financeira, mas enfrenta desafios específicos de operação em rooftop.", "critical_success_factors": ["Otimização sazonal", "Manutenção preventiva", "Marketing visual", "Gestão de custos fixos"], "action_priority": "Curto prazo - mitigar riscos climáticos e otimizar operação"}'::jsonb,
  true
UNION ALL
SELECT
  (SELECT id FROM map_id),
  'swot'::section_type,
  4,
  '{"strengths": ["Vista panorâmica única em Londrina", "Ambiente instagramável e moderno", "Localização central e acessível", "Equipe especializada em rooftop", "Conceito diferenciado na cidade"], "weaknesses": ["Dependência de condições climáticas", "Custos elevados de manutenção", "Concorrência local intensa", "Sazonalidade baixa temporada"], "opportunities": ["Eventos corporativos e sociais", "Parcerias com hotéis locais", "Shows e apresentações musicais", "Delivery de drinks premium"], "threats": ["Mudanças climáticas extremas", "Concorrência de novos rooftops", "Aumento custos manutenção", "Regulamentações municipais"]}'::jsonb,
  '{"analysis": "A análise SWOT revela um equilíbrio entre forças e fraquezas, com oportunidades interessantes no horizonte.", "strategic_focus": "Aproveitar pontos fortes para capitalizar oportunidades, enquanto mitiga ameaças através de eficiência operacional."}'::jsonb,
  true
UNION ALL
SELECT
  (SELECT id FROM map_id),
  'product_analysis'::section_type,
  5,
  '{"product_lines": [{"name": "Drinks Premium", "description": "Carta de drinks autorais e coquetéis rooftop", "price_range": "R$ 18-35", "popularity": 92, "margin": 65}, {"name": "Menu Contemporâneo", "description": "Pratos da gastronomia contemporânea com vista", "price_range": "R$ 45-75", "popularity": 78, "margin": 42}, {"name": "Petiscos & Porções", "description": "Opções para happy hour e grupos", "price_range": "R$ 25-55", "popularity": 85, "margin": 55}], "best_sellers": ["Negroni rooftop", "Ceviche contemporâneo", "Porção de fritas trufadas"], "seasonal_menu": true, "customer_feedback": "Clientes destacam a vista e experiência única"}'::jsonb,
  '{"analysis": "O cardápio da Boussolé é bem estruturado, com boa diversificação e foco na qualidade. O menu executivo representa a maior fonte de receita.", "recommendations": ["Manter foco no menu executivo", "Desenvolver linha de produtos para delivery", "Criar combos promocionais"]}'::jsonb,
  true
UNION ALL
SELECT
  (SELECT id FROM map_id),
  'icp_personas'::section_type,
  6,
  '{"primary_persona": {"name": "Mariana Silva", "age": "28-38", "occupation": "Profissional liberal (advogada, médica, designer)", "income": "R$ 8.000-15.000", "behaviors": ["Busca experiências instagramáveis", "Janta fora 2-3x/semana", "Valoriza vista e ambiente", "Compartilha momentos especiais"], "pain_points": ["Dificuldade em conseguir reserva", "Busca lugares únicos", "Quer destacar nas redes sociais"], "preferred_channels": ["Instagram", "TikTok", "Indicação de amigos"]}, "secondary_persona": {"name": "Roberto Santos", "age": "35-50", "occupation": "Empresário local", "income": "R$ 12.000-25.000", "behaviors": ["Reuniões de negócios no rooftop", "Eventos corporativos", "Busca networking", "Valoriza privacidade"], "pain_points": ["Falta opções para eventos", "Precisa de ambientes diferenciados", "Busca exclusividade"], "preferred_channels": ["LinkedIn", "Google Reviews", "Indicação profissional"]}}'::jsonb,
  '{"analysis": "Os clientes ideais da Boussolé são profissionais de classe média-alta que buscam experiências gastronômicas de qualidade.", "segmentation_strategy": "Focar em público corporativo para almoço e público premium para jantar, com comunicação direcionada para cada segmento."}'::jsonb,
  true
UNION ALL
SELECT
  (SELECT id FROM map_id),
  'kpi_table'::section_type,
  7,
  '{"kpis": [{"name": "Ocupação Média", "current": 68, "target": 75, "unit": "%", "trend": "up", "frequency": "monthly"}, {"name": "Ticket Médio", "current": 85, "target": 92, "unit": "R$", "trend": "up", "frequency": "monthly"}, {"name": "Margem de Lucro", "current": 22, "target": 25, "unit": "%", "trend": "stable", "frequency": "quarterly"}, {"name": "NPS", "current": 78, "target": 82, "unit": "pontos", "trend": "up", "frequency": "quarterly"}], "monitoring_frequency": "Semanal para ocupação, mensal para demais KPIs", "responsible_team": "Gerente de Operações"}'::jsonb,
  '{"analysis": "Os KPIs mostram um negócio saudável com tendência de crescimento. O foco deve estar na melhoria da margem através de otimização de custos.", "action_plan": ["Revisar fornecedores mensalmente", "Implementar controle de desperdício", "Otimizar equipe por turno"]}'::jsonb,
  true
UNION ALL
SELECT
  (SELECT id FROM map_id),
  'objectives'::section_type,
  8,
  '{"quarterly_objectives": [{"objective": "Aumentar ocupação média para 75%", "key_results": ["Sistema de reservas online", "Campanhas sazonais", "Programa de fidelidade"], "timeline": "Q4 2025", "responsible": "Gerente de Marketing", "budget": "R$ 12.000"}, {"objective": "Elevar margem de lucro para 25%", "key_results": ["Otimizar custos drinks", "Reduzir desperdício", "Aumentar ticket médio"], "timeline": "Q4 2025", "responsible": "Gerente de Operações", "budget": "R$ 18.000"}, {"objective": "Melhorar NPS para 82 pontos", "key_results": ["Treinamento equipe", "Sistema feedback digital", "Melhorias baseadas em reviews"], "timeline": "Q4 2025", "responsible": "Gerente Geral", "budget": "R$ 6.000"}], "long_term_vision": "Ser o rooftop referência em Londrina, expandindo para eventos corporativos e se tornando ponto turístico gastronômico", "success_metrics": ["Crescimento de 30% em faturamento", "Margem de 28%", "NPS acima de 85"]}'::jsonb,
  '{"analysis": "Os objetivos estão alinhados com a análise SWOT e o diagnóstico do negócio, focando nas oportunidades identificadas.", "implementation_plan": "Executar em fases, começando pelas ações de maior impacto e menor investimento, com acompanhamento semanal."}'::jsonb,
  true
ON CONFLICT DO NOTHING;

-- Verificar se tudo foi inserido corretamente
SELECT 'Dados inseridos com sucesso!' as status;
SELECT COUNT(*) as total_sections FROM strategic_map_sections
WHERE strategic_map_id IN (
  SELECT id FROM strategic_maps
  WHERE business_id = (SELECT id FROM businesses WHERE name ILIKE '%boussolé%' LIMIT 1)
);
