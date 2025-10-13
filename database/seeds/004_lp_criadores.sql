-- ============================================================================
-- SEED: LP /empresas/criadores
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
  '20000000-0000-0000-0000-000000000004',
  'empresas/criadores',
  'LP Criadores - Marketing de Influência Local',
  'produto-unico',
  '10000000-0000-0000-0000-000000000002', -- Template Produto Único
  '{
    "hero": {
      "title": "Criadores Locais Que Vendem de Verdade",
      "subtitle": "Conecte sua empresa a 4 microinfluenciadores locais por mês. Curadoria completa, aprovação de conteúdo e resultados mensuráveis.",
      "cta_text": "Falar Com Especialista Agora",
      "cta_url": "/chatcriadores-criadores",
      "urgency_badge": "Criadores locais • Autenticidade • Resultados reais",
      "social_proof": {
        "criadores_mes": 4,
        "locais": 100
      },
      "trust_badges": [
        "4 criadores/mês",
        "Curadoria completa",
        "Você aprova tudo"
      ]
    },
    "problema": {
      "title": "Por Que Marketing de Influência Local?",
      "subtitle": "Pessoas confiam em pessoas, não em marcas",
      "problems": [
        {
          "icon": "📱",
          "title": "Alcance Limitado",
          "description": "Seu perfil não alcança pessoas novas da sua região"
        },
        {
          "icon": "🤝",
          "title": "Falta de Confiança",
          "description": "Clientes em potencial não conhecem sua empresa"
        },
        {
          "icon": "💰",
          "title": "Anúncios Caros",
          "description": "Tráfego pago está cada vez mais caro e menos efetivo"
        }
      ]
    },
    "solucoes": [
      {
        "order": 1,
        "product_id": "f7c78360-990e-4482-b73d-b748696ce450",
        "title": "Visibilidade Local Com Autenticidade",
        "description": "Criadores da sua região promovendo seu negócio de forma genuína",
        "benefits": [
          "4 microinfluenciadores locais por mês",
          "Curadoria completa (nós selecionamos)",
          "Briefing e alinhamento com criadores",
          "Você aprova todo conteúdo antes de publicar",
          "Acompanhamento de resultados",
          "Relatório mensal de alcance",
          "Reuso de conteúdo nas suas redes",
          "Networking com criadores locais"
        ],
        "price_monthly": 2500,
        "price_semestral": 1500,
        "urgency": "Vagas limitadas por região",
        "cta_text": "Falar Com Especialista Agora",
        "cta_url": "/chatcriadores-criadores"
      }
    ],
    "processo": {
      "title": "Como Funciona?",
      "steps": [
        {
          "number": 1,
          "title": "Curadoria",
          "description": "Selecionamos 4 criadores locais alinhados com sua marca"
        },
        {
          "number": 2,
          "title": "Briefing",
          "description": "Alinhamos expectativas e criamos o roteiro"
        },
        {
          "number": 3,
          "title": "Aprovação",
          "description": "Você aprova o conteúdo antes de publicar"
        },
        {
          "number": 4,
          "title": "Publicação",
          "description": "Criadores publicam e você acompanha os resultados"
        }
      ]
    },
    "depoimentos": [
      {
        "name": "Maria Santos",
        "company": "Salão Beleza Pura",
        "role": "Proprietária",
        "text": "Os criadores locais trouxeram muitas clientes novas. Pessoas que nunca tinham ouvido falar do salão!",
        "result": "+45 clientes novos em 2 meses"
      }
    ],
    "urgencia": {
      "title": "Vagas Limitadas Por Região",
      "message": "Trabalhamos com exclusividade territorial para garantir resultados",
      "scarcity_type": "vagas"
    },
    "faq": [
      {
        "question": "Como vocês selecionam os criadores?",
        "answer": "Analisamos engajamento real, público-alvo, localização e alinhamento com sua marca. Só trabalhamos com criadores autênticos."
      },
      {
        "question": "E se eu não gostar do conteúdo?",
        "answer": "Você aprova TUDO antes de publicar. Se não gostar, pedimos ajustes ou trocamos o criador."
      },
      {
        "question": "Quanto alcance vou ter?",
        "answer": "Depende dos criadores, mas em média cada um tem 5-15 mil seguidores locais. São 4 criadores/mês."
      },
      {
        "question": "Posso reusar o conteúdo?",
        "answer": "Sim! Todo conteúdo aprovado pode ser repostado nas suas redes sociais."
      }
    ],
    "cta_final": {
      "title": "Comece a Ser Visto na Sua Região",
      "subtitle": "Vagas limitadas por território. Garanta sua exclusividade agora.",
      "cta_text": "Falar Com Especialista Agora",
      "cta_url": "/chatcriadores-criadores"
    },
    "theme": {
      "primary_color": "#0b3553",
      "secondary_color": "#137333",
      "font_family": "Onest",
      "border_radius": "12px"
    }
  }'::jsonb,
  '{
    "chatbot_url": "/chatcriadores-criadores",
    "conversion_goal": "chatbot_click",
    "analytics": {
      "ga4_id": "G-XXXXXXXXXX"
    },
    "features": {
      "show_urgency": true,
      "show_countdown": false,
      "show_mentor": false
    }
  }'::jsonb,
  '{
    "title": "Marketing de Influência Local | crIAdores",
    "description": "Conecte sua empresa a 4 microinfluenciadores locais por mês. Curadoria completa, aprovação de conteúdo e resultados mensuráveis.",
    "keywords": ["marketing de influência", "microinfluenciadores", "criadores locais", "marketing local"],
    "og_image": "/assets/og-criadores.jpg",
    "og_type": "website",
    "canonical": "https://criadores.app/empresas/criadores",
    "robots": "index, follow"
  }'::jsonb,
  'active',
  true,
  NOW()
);

-- Relacionar produto
INSERT INTO lp_products (lp_id, product_id, order_index) VALUES
  ('20000000-0000-0000-0000-000000000004', 'f7c78360-990e-4482-b73d-b748696ce450', 1); -- Marketing de Influência

