-- ============================================================================
-- SEED: LANDING PAGE "RELATÓRIO 360º DE MARKETING"
-- ============================================================================
-- LP: /relatorio360
-- Template: Produto Único (Template ID: 10000000-0000-0000-0000-000000000002)
-- Objetivo: Lead Magnet / Diagnóstico Gratuito de Marketing
-- ============================================================================

INSERT INTO landing_pages (
  id,
  slug,
  name,
  category,
  template_id,
  variables,
  config,
  seo,
  status,
  is_active,
  published_at
) VALUES (
  '20000000-0000-0000-0000-000000000007',
  'relatorio360',
  'Relatório 360º de Marketing',
  'marketing',
  '10000000-0000-0000-0000-000000000002',
  '{
    "hero": {
      "title": "🚀 Ganhe um Raio-X 360º de Marketing do seu negócio",
      "subtitle": "Descubra o que está travando seu crescimento e o que fazer pra vender mais. Receba um relatório completo com os principais pontos fortes e fracos do seu marketing + 1h de consultoria estratégica gratuita com um especialista da crIAdores.",
      "cta_text": "Solicitar meu Relatório 360º sem custo",
      "urgency_badge": "Relatório Gratuito",
      "trust_badges": [
        "100% Confidencial",
        "Entrega em 48h",
        "Sem compromisso"
      ]
    },
    "problema": {
      "title": "Por que esse diagnóstico é diferente?",
      "problems": [
        {
          "icon": "🔍",
          "title": "Análise Completa",
          "description": "Analisamos seu posicionamento, conteúdo, anúncios e presença local."
        },
        {
          "icon": "🤖",
          "title": "Inteligência Artificial",
          "description": "Usamos IA e benchmarks do seu setor para insights precisos."
        },
        {
          "icon": "📊",
          "title": "Relatório Detalhado",
          "description": "Você recebe um PDF com insights práticos e plano de ação imediato."
        },
        {
          "icon": "👥",
          "title": "Consultoria 1-a-1",
          "description": "Conversa com um estrategista da crIAdores — sem custo, sem compromisso."
        }
      ]
    },
    "solucoes": [
      {
        "order": 1,
        "product_id": null,
        "title": "Seu Relatório 360º inclui:",
        "description": "Um diagnóstico completo do seu marketing digital",
        "benefits": [
          "📈 Análise de Performance Digital — alcance, engajamento, seguidores e tendências",
          "🎯 Posicionamento de Marca — clareza da mensagem e diferenciais frente à concorrência",
          "💬 Comunicação e Conteúdo — avaliação do impacto e tom das suas postagens",
          "🧠 Recomendações Estratégicas — próximos passos práticos para aumentar resultados"
        ],
        "cta_text": "Solicitar meu Relatório 360º agora"
      }
    ],
    "cta_final": {
      "title": "💡 Pronto pra descobrir o que o seu marketing está deixando na mesa?",
      "subtitle": "Receba seu relatório personalizado em até 48 horas",
      "cta_text": "Solicitar meu Relatório 360º agora — 100% gratuito"
    }
  }'::jsonb,
  '{
    "chatbot_url": null,
    "conversion_goal": "lead_generation",
    "analytics": {
      "ga4_id": null,
      "meta_pixel_id": null
    },
    "features": {
      "show_urgency": false,
      "show_countdown": false,
      "show_mentor": false,
      "show_compliance": false
    },
    "segment": "marketing_diagnostic"
  }'::jsonb,
  '{
    "title": "Relatório 360º de Marketing Gratuito | crIAdores",
    "description": "Receba um diagnóstico completo do seu marketing digital. Descubra pontos fortes e fracos + 1h de consultoria gratuita. 100% confidencial.",
    "keywords": ["relatório marketing", "diagnóstico marketing", "marketing digital", "consultoria marketing", "análise marketing"],
    "og_image": "https://criadores.app/images/relatorio360-og.jpg",
    "og_type": "website",
    "canonical": "https://criadores.app/relatorio360",
    "robots": "index,follow"
  }'::jsonb,
  'active',
  true,
  NOW()
) ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- FIM DO SEED - RELATÓRIO 360º
-- ============================================================================
