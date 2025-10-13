-- ============================================================================
-- SEED: LP /empresas/social-media-advogados
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
  '20000000-0000-0000-0000-000000000006',
  'empresas/social-media-advogados',
  'LP Social Media para Advogados',
  'segmento-especifico',
  '10000000-0000-0000-0000-000000000003', -- Template Segmento Específico
  '{
    "hero": {
      "title": "Construa Autoridade e Atraia Clientes Qualificados Para Seu Escritório",
      "subtitle": "Social media especializada para advogados e escritórios de advocacia. Conteúdo jurídico, compliance total e captação de clientes.",
      "cta_text": "Falar Com Especialista Agora",
      "cta_url": "/chatcriadores-advogados",
      "urgency_badge": "100% Compliance OAB • Marketing Ético • Captação de Clientes",
      "social_proof": {
        "advogados_atendidos": 12,
        "compliance": 100
      },
      "trust_badges": [
        "Compliance OAB",
        "Conteúdo Jurídico",
        "Captação de Clientes"
      ]
    },
    "problema": {
      "title": "Por Que Advogados Precisam de Marketing Digital?",
      "subtitle": "O cliente moderno pesquisa online antes de contratar um advogado",
      "problems": [
        {
          "icon": "🔍",
          "title": "82% Pesquisam Online",
          "description": "Antes de escolher um advogado ou escritório"
        },
        {
          "icon": "⚖️",
          "title": "Autoridade Digital",
          "description": "Conteúdo jurídico gera confiança e credibilidade"
        },
        {
          "icon": "💼",
          "title": "Captação Qualificada",
          "description": "Clientes chegam mais informados e prontos para contratar"
        }
      ],
      "agitation": "Mas você não tem tempo para criar conteúdo. Por isso criamos uma solução completa de marketing jurídico — ético, profissional e que gera clientes qualificados."
    },
    "solucoes": [
      {
        "order": 1,
        "product_id": "e4601bac-eb02-4116-a6ad-6a79a85f628b",
        "title": "Marketing Jurídico Completo",
        "description": "Tudo que você precisa para atrair clientes de forma ética",
        "benefits": [
          "Conteúdo jurídico 100% compliance OAB",
          "2 Reels por semana sobre sua área de atuação",
          "Stories diários com dicas jurídicas",
          "Planejamento mensal de campanhas",
          "Formulário de captação integrado",
          "Resposta a comentários e DMs",
          "Relatório mensal de leads",
          "Consultoria de compliance OAB"
        ],
        "price_monthly": 2500,
        "price_semestral": 1500,
        "urgency": "Apenas 2 vagas para advogados este mês",
        "cta_text": "Falar Com Especialista Agora",
        "cta_url": "/chatcriadores-advogados",
        "compliance_note": "Todo conteúdo é revisado por especialista em marketing jurídico e segue 100% as normas da OAB"
      }
    ],
    "compliance": {
      "title": "100% Compliance OAB",
      "description": "Seguimos rigorosamente todas as normas da Ordem dos Advogados do Brasil",
      "rules": [
        {
          "icon": "✅",
          "title": "Sem Captação Indevida",
          "description": "Conteúdo educativo, nunca sensacionalista"
        },
        {
          "icon": "✅",
          "title": "Sem Promessas de Resultado",
          "description": "Informação técnica e responsável"
        },
        {
          "icon": "✅",
          "title": "Sem Mercantilização",
          "description": "Foco em educar e construir autoridade"
        },
        {
          "icon": "✅",
          "title": "Linguagem Adequada",
          "description": "Técnica mas acessível ao público leigo"
        }
      ]
    },
    "processo": {
      "title": "Como Funciona?",
      "steps": [
        {
          "number": 1,
          "title": "Diagnóstico",
          "description": "Entendemos sua área de atuação e público-alvo"
        },
        {
          "number": 2,
          "title": "Planejamento",
          "description": "Criamos calendário editorial com temas jurídicos relevantes"
        },
        {
          "number": 3,
          "title": "Produção",
          "description": "Criamos conteúdo educativo e profissional"
        },
        {
          "number": 4,
          "title": "Aprovação",
          "description": "Você revisa e aprova antes de publicar"
        },
        {
          "number": 5,
          "title": "Publicação",
          "description": "Publicamos e gerenciamos sua presença digital"
        }
      ]
    },
    "depoimentos": [
      {
        "name": "Dra. Ana Paula Silva",
        "company": "Silva & Associados",
        "role": "Advogada Trabalhista",
        "text": "O conteúdo é impecável e totalmente dentro das normas da OAB. Estou recebendo consultas de clientes muito mais qualificados.",
        "result": "+25 consultas/mês"
      }
    ],
    "urgencia": {
      "title": "Vagas Limitadas Para Advogados",
      "message": "Atendemos apenas 2 advogados novos por mês para garantir qualidade",
      "scarcity_type": "vagas"
    },
    "faq": [
      {
        "question": "O conteúdo segue as normas da OAB?",
        "answer": "Sim! 100%. Todo conteúdo é revisado por especialista em marketing jurídico e segue rigorosamente as normas da OAB."
      },
      {
        "question": "Preciso aparecer nos vídeos?",
        "answer": "Não necessariamente. Podemos criar conteúdo educativo sem sua aparição, mas recomendamos que apareça para criar conexão e autoridade."
      },
      {
        "question": "Como funciona a captação de clientes?",
        "answer": "Integramos um formulário de contato no seu Instagram. Clientes interessados preenchem e você recebe os dados."
      },
      {
        "question": "Quanto tempo leva para ver resultados?",
        "answer": "Advogados começam a receber consultas em 30-45 dias. O crescimento é progressivo e sustentável."
      },
      {
        "question": "Posso escolher os temas do conteúdo?",
        "answer": "Sim! Você participa do planejamento mensal e pode sugerir temas relevantes para sua área de atuação."
      }
    ],
    "cta_final": {
      "title": "Comece a Atrair Clientes Qualificados Hoje",
      "subtitle": "Apenas 2 vagas disponíveis este mês. Garanta a sua agora.",
      "cta_text": "Falar Com Especialista Agora",
      "cta_url": "/chatcriadores-advogados"
    },
    "theme": {
      "primary_color": "#0b3553",
      "secondary_color": "#137333",
      "font_family": "Onest",
      "border_radius": "12px"
    }
  }'::jsonb,
  '{
    "chatbot_url": "/chatcriadores-advogados",
    "conversion_goal": "chatbot_click",
    "analytics": {
      "ga4_id": "G-XXXXXXXXXX"
    },
    "features": {
      "show_urgency": true,
      "show_countdown": false,
      "show_compliance": true
    },
    "segment": "advogados"
  }'::jsonb,
  '{
    "title": "Social Media para Advogados | Marketing Jurídico Ético | crIAdores",
    "description": "Social media especializada para advogados e escritórios. 100% compliance OAB, conteúdo jurídico e captação de clientes.",
    "keywords": ["marketing jurídico", "social media para advogados", "marketing para advogados", "compliance OAB"],
    "og_image": "/assets/og-advogados.jpg",
    "og_type": "website",
    "canonical": "https://criadores.app/empresas/social-media-advogados",
    "robots": "index, follow"
  }'::jsonb,
  'active',
  true,
  NOW()
);

-- Relacionar produto
INSERT INTO lp_products (lp_id, product_id, order_index) VALUES
  ('20000000-0000-0000-0000-000000000006', 'e4601bac-eb02-4116-a6ad-6a79a85f628b', 1); -- Estrategista de Marketing

