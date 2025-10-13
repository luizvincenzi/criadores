-- ============================================================================
-- SEED: LANDING PAGES INICIAIS (6 LPs existentes)
-- ============================================================================
-- LPs:
-- 1. /empresas (Combo)
-- 2. /empresas/mentoria
-- 3. /empresas/social-media
-- 4. /empresas/criadores
-- 5. /empresas/social-media-medicos
-- 6. /empresas/social-media-advogados
-- ============================================================================

-- ============================================================================
-- LP 1: /empresas (Combo Completo)
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
  '20000000-0000-0000-0000-000000000001',
  'empresas',
  'LP Principal - Combo Empresas',
  'combo',
  '10000000-0000-0000-0000-000000000001', -- Template Combo Completo
  '{
    "hero": {
      "title": "Transforme Sua Empresa Numa Referência Regional",
      "subtitle": "Escolha a solução ideal para seu negócio crescer no digital: Mentoria Estratégica, Social Media Profissional ou Criadores Locais. Ou tenha tudo isso trabalhando junto.",
      "cta_text": "Falar Com Especialista Agora",
      "cta_url": "/chatcriadores-empresas",
      "urgency_badge": "Últimas 3 vagas de 2025",
      "social_proof": {
        "empresas": 40,
        "locais": 20,
        "conteudos": 1000
      },
      "trust_badges": [
        "Sem taxa de adesão",
        "Sem fidelidade",
        "Resultados mensuráveis"
      ]
    },
    "problema": {
      "title": "Por Que a crIAdores Nasceu?",
      "subtitle": "A crIAdores nasceu para resolver um desafio que toda empresa local enfrenta: como crescer no digital sem gastar fortunas e sem virar refém de agências.",
      "problems": [
        {
          "icon": "📱",
          "title": "Publicações Improvisadas",
          "description": "Você posta quando dá tempo, sem planejamento, sem consistência, sem resultado."
        },
        {
          "icon": "🎯",
          "title": "Parcerias Que Não Geram Vendas",
          "description": "Você já tentou parcerias com criadores, mas eles só geraram curtidas, não clientes."
        },
        {
          "icon": "💼",
          "title": "Falta de Consistência no Marketing",
          "description": "Você sabe que precisa de marketing, mas não tem tempo nem equipe para fazer direito."
        }
      ]
    },
    "dados_mercado": {
      "title": "O Mercado de Criadores Está Explodindo",
      "stats": [
        {
          "number": "R$ 21 bi",
          "label": "Mercado de criadores no Brasil em 2024",
          "source": "Fonte: Influencer Marketing Hub"
        },
        {
          "number": "78%",
          "label": "Das empresas vão investir mais em criadores em 2025",
          "source": "Fonte: HubSpot"
        },
        {
          "number": "3x",
          "label": "Mais conversão que tráfego pago tradicional",
          "source": "Fonte: Nielsen"
        }
      ]
    },
    "solucoes": [
      {
        "order": 1,
        "product_id": "48835b46-53e6-4062-b763-841ced3bc0d9",
        "title": "De Empresário Sobrecarregado a Estrategista do Próprio Negócio",
        "description": "Imagine acordar sabendo EXATAMENTE o que fazer no marketing da sua empresa. Sem depender de agência. Sem gastar fortunas. Apenas você, com clareza total sobre cada passo.",
        "benefits": [
          "Encontros semanais ao vivo com Gabriel D''Ávila",
          "+35 mentorias gravadas (acesso vitalício)",
          "Aplicação prática: você implementa enquanto aprende",
          "Comunidade exclusiva de empresários"
        ],
        "urgency": "Últimas 8 vagas para garantir qualidade no atendimento",
        "cta_text": "Falar Com Especialista",
        "cta_url": "/chatcriadores-mentoria"
      },
      {
        "order": 2,
        "product_id": "e4601bac-eb02-4116-a6ad-6a79a85f628b",
        "title": "Presença Digital Profissional Sem Contratar Uma Equipe Inteira",
        "description": "Para ter presença digital profissional, você precisaria contratar: Social Media profissional, Designer gráfico e Estrategista de marketing. Com a crIAdores você tem tudo isso em um único serviço.",
        "benefits": [
          "Estrategista dedicado ao seu negócio",
          "Conteúdo constante e planejado",
          "Reuniões semanais de alinhamento",
          "Relatórios mensais de performance"
        ],
        "urgency": "Vagas limitadas para garantir qualidade",
        "cta_text": "Falar Com Especialista",
        "cta_url": "/chatcriadores-social-media"
      },
      {
        "order": 3,
        "product_id": "f7c78360-990e-4482-b73d-b748696ce450",
        "title": "O Segredo dos Negócios Locais Que Estão Lotando",
        "description": "Tráfego pago traz cliques. Criadores locais trazem clientes. A diferença está na autenticidade: pessoas reais da sua cidade recomendando seu negócio para seguidores que confiam nelas.",
        "benefits": [
          "Criadores locais selecionados para seu nicho",
          "Campanhas mensais planejadas",
          "Gestão completa das parcerias",
          "Relatórios de performance"
        ],
        "urgency": "Vagas limitadas por região",
        "cta_text": "Falar Com Especialista",
        "cta_url": "/chatcriadores-criadores"
      }
    ],
    "combo": {
      "title": "Mas E Se Você Pudesse Ter TUDO Isso?",
      "description": "Imagine ter mentoria estratégica + social media profissional + criadores locais trabalhando juntos para o seu negócio. Tudo integrado. Tudo alinhado. Tudo focado no seu crescimento.",
      "price_monthly": 4600,
      "price_semestral": 3600,
      "discount_amount": 1000,
      "discount_percentage": 22,
      "urgency": "Apenas 3 vagas disponíveis para o combo completo em dezembro",
      "exclusive_benefits": [
        "Estratégia 100% integrada entre todas as frentes",
        "Reunião semanal unificada (economize tempo)",
        "Relatório consolidado mensal",
        "Prioridade no suporte"
      ],
      "bonus": [
        "Bônus 1: Acesso vitalício à comunidade de empresários",
        "Bônus 2: 10 templates de conteúdo prontos",
        "Bônus 3: Checklist de lançamento de campanha"
      ],
      "guarantee": "30 dias de garantia incondicional. Se não gostar, devolvemos 100% do investimento."
    },
    "processo": {
      "title": "Como Funciona?",
      "steps": [
        {
          "number": 1,
          "title": "Diagnóstico Gratuito",
          "description": "Conversamos sobre seu negócio, objetivos e desafios atuais"
        },
        {
          "number": 2,
          "title": "Plano Personalizado",
          "description": "Criamos uma estratégia sob medida para sua empresa"
        },
        {
          "number": 3,
          "title": "Implementação",
          "description": "Colocamos tudo em prática com acompanhamento semanal"
        },
        {
          "number": 4,
          "title": "Resultados",
          "description": "Você vê seu negócio crescer com métricas claras"
        }
      ]
    },
    "depoimentos": [
      {
        "name": "João Silva",
        "company": "Brah! Poke",
        "role": "Fundador",
        "photo": "/assets/depoimentos/joao.jpg",
        "text": "Antes da crIAdores, eu postava quando dava tempo e não via resultado. Hoje tenho estratégia clara e os clientes chegam todo dia.",
        "result": "De 80 para 160 clientes/mês em 3 meses"
      },
      {
        "name": "Maria Santos",
        "company": "Clínica Estética Bella",
        "role": "Proprietária",
        "photo": "/assets/depoimentos/maria.jpg",
        "text": "A mentoria me deu clareza total. Agora sei exatamente o que fazer no marketing e não dependo mais de agência.",
        "result": "Economia de R$ 8.000/mês em agência"
      }
    ],
    "urgencia": {
      "title": "Últimas Vagas de 2025",
      "message": "Estamos fechando as últimas 3 vagas para garantir qualidade no atendimento. Depois disso, só em 2026.",
      "countdown": {
        "enabled": false
      },
      "scarcity_type": "vagas"
    },
    "faq": [
      {
        "question": "Como funciona a garantia?",
        "answer": "Você tem 30 dias para testar sem compromisso. Se não gostar, devolvemos 100% do investimento, sem perguntas."
      },
      {
        "question": "Preciso ter conhecimento de marketing?",
        "answer": "Não! A mentoria é feita para empresários que querem aprender do zero. Começamos do básico e vamos evoluindo juntos."
      },
      {
        "question": "Quanto tempo leva para ver resultados?",
        "answer": "Nossos clientes começam a ver os primeiros resultados em 30-60 dias. Mas o crescimento é progressivo e sustentável."
      },
      {
        "question": "Posso cancelar quando quiser?",
        "answer": "Sim! Não temos fidelidade. Você pode cancelar quando quiser, sem multa."
      }
    ],
    "cta_final": {
      "title": "Pronto Para Transformar Sua Empresa?",
      "subtitle": "Fale com um especialista agora e descubra qual solução é ideal para você",
      "cta_text": "Falar Com Especialista Agora",
      "cta_url": "/chatcriadores-empresas"
    },
    "theme": {
      "primary_color": "#0b3553",
      "secondary_color": "#137333",
      "font_family": "Onest",
      "border_radius": "12px"
    }
  }'::jsonb,
  '{
    "chatbot_url": "/chatcriadores-empresas",
    "conversion_goal": "chatbot_click",
    "analytics": {
      "ga4_id": "G-XXXXXXXXXX",
      "meta_pixel_id": "",
      "hotjar_id": ""
    },
    "features": {
      "show_urgency": true,
      "show_countdown": false,
      "enable_ab_test": false
    }
  }'::jsonb,
  '{
    "title": "Transforme Sua Empresa Numa Referência Regional | crIAdores",
    "description": "Mentoria Estratégica + Social Media Profissional + Criadores Locais. Escolha a solução ideal para seu negócio crescer no digital.",
    "keywords": ["marketing digital", "empresas locais", "criadores de conteúdo", "mentoria empresarial", "social media"],
    "og_image": "/assets/og-empresas.jpg",
    "og_type": "website",
    "canonical": "https://criadores.app/empresas",
    "robots": "index, follow"
  }'::jsonb,
  'active',
  true,
  NOW()
);

-- Relacionar produtos com a LP
INSERT INTO lp_products (lp_id, product_id, order_index) VALUES
  ('20000000-0000-0000-0000-000000000001', '48835b46-53e6-4062-b763-841ced3bc0d9', 1), -- Mentoria
  ('20000000-0000-0000-0000-000000000001', 'e4601bac-eb02-4116-a6ad-6a79a85f628b', 2), -- Estrategista
  ('20000000-0000-0000-0000-000000000001', 'f7c78360-990e-4482-b73d-b748696ce450', 3); -- Marketing Influência

-- ============================================================================
-- FIM DO SEED - LP 1
-- ============================================================================
-- Nota: As outras 5 LPs serão criadas em arquivos separados para não exceder 300 linhas
-- Ver: 003_lp_mentoria.sql, 004_lp_social_media.sql, etc
-- ============================================================================

