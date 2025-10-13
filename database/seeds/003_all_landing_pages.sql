-- ============================================================================
-- SEED: TODAS AS 6 LANDING PAGES
-- ============================================================================
-- Este arquivo contém todas as 6 LPs existentes migradas para o banco
-- ============================================================================

-- ============================================================================
-- LP 2: /empresas/mentoria
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
  '20000000-0000-0000-0000-000000000002',
  'empresas/mentoria',
  'LP Mentoria - Gabriel D''Ávila',
  'produto-unico',
  '10000000-0000-0000-0000-000000000002', -- Template Produto Único
  '{
    "hero": {
      "title": "Domine o Marketing e Transforme Seu Negócio",
      "subtitle": "Mentoria estratégica com Gabriel D''Ávila para empresários que querem aprender e aplicar marketing de verdade no seu negócio.",
      "cta_text": "Agendar Diagnóstico Gratuito",
      "cta_url": "/chatcriadores-mentoria",
      "urgency_badge": "+40 empresários mentorados • +35 mentorias gravadas",
      "social_proof": {
        "empresas": 40,
        "mentorias": 35
      },
      "trust_badges": [
        "Encontros semanais",
        "Aplicação prática",
        "Comunidade exclusiva"
      ]
    },
    "problema": {
      "title": "Por Que Você Precisa de Mentoria?",
      "subtitle": "Você sabe que precisa de marketing, mas não sabe por onde começar",
      "problems": [
        {
          "icon": "📚",
          "title": "Sobrecarga de Informação",
          "description": "Você consome muito conteúdo mas não sabe o que aplicar no seu negócio"
        },
        {
          "icon": "💸",
          "title": "Dinheiro Desperdiçado",
          "description": "Já tentou várias coisas que não deram resultado e perdeu dinheiro"
        },
        {
          "icon": "⏰",
          "title": "Falta de Tempo",
          "description": "Você está sempre ocupado mas não vê o negócio crescer"
        }
      ]
    },
    "solucoes": [
      {
        "order": 1,
        "product_id": "48835b46-53e6-4062-b763-841ced3bc0d9",
        "title": "Tudo Que Você Precisa Para Dominar o Marketing",
        "description": "Uma mentoria completa, prática e focada em resultados reais",
        "benefits": [
          "Encontros semanais ao vivo (1h30 por semana)",
          "Canal com +35 mentorias gravadas (acesso vitalício)",
          "Aplicação prática no seu negócio",
          "Suporte direto via WhatsApp",
          "Networking com outros empresários",
          "Tarefas semanais práticas",
          "Feedback personalizado",
          "Materiais de apoio e templates"
        ],
        "price_monthly": 2500,
        "price_semestral": 1500,
        "urgency": "Últimas 8 vagas para a turma de dezembro",
        "cta_text": "Agendar Diagnóstico Gratuito",
        "cta_url": "/chatcriadores-mentoria"
      }
    ],
    "processo": {
      "title": "Como Funciona?",
      "steps": [
        {
          "number": 1,
          "title": "Diagnóstico Gratuito",
          "description": "Conversamos sobre seu negócio e objetivos"
        },
        {
          "number": 2,
          "title": "Plano Personalizado",
          "description": "Criamos uma estratégia sob medida para você"
        },
        {
          "number": 3,
          "title": "Implementação",
          "description": "Você aplica com acompanhamento semanal"
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
        "text": "A mentoria me deu clareza total. Agora sei exatamente o que fazer no marketing.",
        "result": "De 80 para 160 clientes/mês"
      }
    ],
    "urgencia": {
      "title": "Últimas Vagas de 2025",
      "message": "Estamos fechando as últimas 8 vagas para garantir qualidade no atendimento",
      "countdown": {
        "enabled": false
      },
      "scarcity_type": "vagas"
    },
    "faq": [
      {
        "question": "Preciso ter conhecimento de marketing?",
        "answer": "Não! A mentoria é feita para empresários que querem aprender do zero. Começamos do básico e vamos evoluindo juntos."
      },
      {
        "question": "Quanto tempo leva para ver resultados?",
        "answer": "Nossos mentorados começam a ver os primeiros resultados em 30-60 dias. Mas o crescimento é progressivo e sustentável."
      },
      {
        "question": "Como funciona a garantia?",
        "answer": "Você tem 30 dias para testar sem compromisso. Se não gostar, devolvemos 100% do investimento."
      },
      {
        "question": "Posso cancelar quando quiser?",
        "answer": "Sim! Não temos fidelidade. Você pode cancelar quando quiser, sem multa."
      }
    ],
    "cta_final": {
      "title": "Comece 2026 Dominando o Marketing",
      "subtitle": "Últimas 8 vagas para a turma de dezembro. Garanta sua vaga agora.",
      "cta_text": "Agendar Diagnóstico Gratuito",
      "cta_url": "/chatcriadores-mentoria"
    },
    "theme": {
      "primary_color": "#0b3553",
      "secondary_color": "#137333",
      "font_family": "Onest",
      "border_radius": "12px"
    },
    "mentor": {
      "show": true,
      "name": "Gabriel D''Ávila",
      "title": "Fundador da crIAdores",
      "bio": "Especialista em marketing para negócios locais com mais de 40 empresários mentorados",
      "photo": "/assets/gabriel.jpg"
    }
  }'::jsonb,
  '{
    "chatbot_url": "/chatcriadores-mentoria",
    "conversion_goal": "chatbot_click",
    "analytics": {
      "ga4_id": "G-XXXXXXXXXX"
    },
    "features": {
      "show_urgency": true,
      "show_countdown": false,
      "show_mentor": true
    }
  }'::jsonb,
  '{
    "title": "Mentoria de Marketing com Gabriel D''Ávila | crIAdores",
    "description": "Domine o marketing e transforme seu negócio. Mentoria estratégica com encontros semanais, +35 mentorias gravadas e aplicação prática.",
    "keywords": ["mentoria marketing", "gabriel d''ávila", "marketing para empresas", "estratégia de marketing"],
    "og_image": "/assets/og-mentoria.jpg",
    "og_type": "website",
    "canonical": "https://criadores.app/empresas/mentoria",
    "robots": "index, follow"
  }'::jsonb,
  'active',
  true,
  NOW()
);

-- Relacionar produto
INSERT INTO lp_products (lp_id, product_id, order_index) VALUES
  ('20000000-0000-0000-0000-000000000002', '48835b46-53e6-4062-b763-841ced3bc0d9', 1); -- Mentoria

-- ============================================================================
-- LP 3: /empresas/social-media
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
  '20000000-0000-0000-0000-000000000003',
  'empresas/social-media',
  'LP Social Media - Estrategista Dedicado',
  'produto-unico',
  '10000000-0000-0000-0000-000000000002',
  '{
    "hero": {
      "title": "Seu Estrategista Dedicado de Marketing Digital",
      "subtitle": "Terceirize seu marketing com um profissional dedicado que cuida de tudo: estratégia, criação, publicação e análise de resultados.",
      "cta_text": "Falar Com Especialista Agora",
      "cta_url": "/chatcriadores-social-media",
      "urgency_badge": "Profissional dedicado • Constância garantida • Resultados mensuráveis",
      "social_proof": {
        "reels_semana": 2,
        "stories_semana": 7
      },
      "trust_badges": [
        "2 Reels por semana",
        "Stories diários",
        "Reuniões semanais"
      ]
    },
    "solucoes": [
      {
        "order": 1,
        "product_id": "e4601bac-eb02-4116-a6ad-6a79a85f628b",
        "title": "Tudo Que Sua Empresa Precisa Para Crescer no Digital",
        "description": "Um profissional dedicado cuidando de todo o seu marketing digital",
        "benefits": [
          "Planejamento mensal completo",
          "2 Reels por semana (8/mês)",
          "Stories diários (30/mês)",
          "Reuniões semanais de alinhamento",
          "Análise de métricas mensal",
          "Resposta a comentários e DMs",
          "Estratégia de crescimento",
          "Relatórios detalhados"
        ],
        "price_monthly": 2500,
        "price_semestral": 1500,
        "urgency": "Apenas 3 vagas disponíveis este mês",
        "cta_text": "Falar Com Especialista Agora",
        "cta_url": "/chatcriadores-social-media"
      }
    ],
    "theme": {
      "primary_color": "#0b3553",
      "secondary_color": "#137333",
      "font_family": "Onest"
    }
  }'::jsonb,
  '{
    "chatbot_url": "/chatcriadores-social-media",
    "conversion_goal": "chatbot_click"
  }'::jsonb,
  '{
    "title": "Estrategista de Social Media Dedicado | crIAdores",
    "description": "Terceirize seu marketing digital com profissional dedicado. 2 Reels/semana, stories diários e estratégia completa.",
    "keywords": ["social media", "marketing digital", "estrategista dedicado"],
    "canonical": "https://criadores.app/empresas/social-media"
  }'::jsonb,
  'active',
  true,
  NOW()
);

INSERT INTO lp_products (lp_id, product_id, order_index) VALUES
  ('20000000-0000-0000-0000-000000000003', 'e4601bac-eb02-4116-a6ad-6a79a85f628b', 1); -- Estrategista de Marketing

