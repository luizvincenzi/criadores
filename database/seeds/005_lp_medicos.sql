-- ============================================================================
-- SEED: LP /empresas/social-media-medicos
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
  '20000000-0000-0000-0000-000000000005',
  'empresas/social-media-medicos',
  'LP Social Media para Médicos',
  'segmento-especifico',
  '10000000-0000-0000-0000-000000000003', -- Template Segmento Específico
  '{
    "hero": {
      "title": "Atraia Mais Pacientes Com Marketing Digital Ético e Profissional",
      "subtitle": "Social media especializada para médicos, clínicas e consultórios. Conteúdo educativo, compliance total e agendamentos online.",
      "cta_text": "Falar Com Especialista Agora",
      "cta_url": "/chatcriadores-medicos",
      "urgency_badge": "100% Compliance CFM • Marketing Ético • Resultados Reais",
      "social_proof": {
        "medicos_atendidos": 15,
        "compliance": 100
      },
      "trust_badges": [
        "Compliance CFM",
        "Conteúdo Educativo",
        "Agendamentos Online"
      ]
    },
    "problema": {
      "title": "Por Que Médicos Precisam de Marketing Digital?",
      "subtitle": "O paciente moderno pesquisa online antes de agendar uma consulta",
      "problems": [
        {
          "icon": "🔍",
          "title": "77% Pesquisam Online",
          "description": "Antes de escolher um médico ou clínica"
        },
        {
          "icon": "📱",
          "title": "Instagram é o #1",
          "description": "Canal preferido para conhecer profissionais de saúde"
        },
        {
          "icon": "⭐",
          "title": "Conteúdo Educativo",
          "description": "Gera confiança e autoridade profissional"
        }
      ],
      "agitation": "Mas você não tem tempo para isso. Por isso criamos uma solução completa de social media médica — ética, profissional e que gera agendamentos."
    },
    "solucoes": [
      {
        "order": 1,
        "product_id": "e4601bac-eb02-4116-a6ad-6a79a85f628b",
        "title": "Social Media Médica Completa",
        "description": "Tudo que você precisa para atrair pacientes de forma ética",
        "benefits": [
          "Conteúdo educativo 100% compliance CFM",
          "2 Reels por semana sobre sua especialidade",
          "Stories diários com dicas de saúde",
          "Planejamento mensal de campanhas",
          "Agendamento online integrado",
          "Resposta a comentários e DMs",
          "Relatório mensal de agendamentos",
          "Consultoria de compliance"
        ],
        "price_monthly": 2500,
        "price_semestral": 1500,
        "urgency": "Apenas 2 vagas para médicos este mês",
        "cta_text": "Falar Com Especialista Agora",
        "cta_url": "/chatcriadores-medicos",
        "compliance_note": "Todo conteúdo é revisado por especialista em marketing médico e segue 100% as normas do CFM"
      }
    ],
    "compliance": {
      "title": "100% Compliance CFM",
      "description": "Seguimos rigorosamente todas as normas do Conselho Federal de Medicina",
      "rules": [
        {
          "icon": "✅",
          "title": "Sem Promessas de Resultado",
          "description": "Conteúdo educativo, nunca sensacionalista"
        },
        {
          "icon": "✅",
          "title": "Sem Autopromoção Excessiva",
          "description": "Foco em educar e informar o paciente"
        },
        {
          "icon": "✅",
          "title": "Sem Antes e Depois",
          "description": "Respeitamos a privacidade dos pacientes"
        },
        {
          "icon": "✅",
          "title": "Linguagem Técnica Adequada",
          "description": "Informação correta e acessível"
        }
      ]
    },
    "processo": {
      "title": "Como Funciona?",
      "steps": [
        {
          "number": 1,
          "title": "Diagnóstico",
          "description": "Entendemos sua especialidade e público-alvo"
        },
        {
          "number": 2,
          "title": "Planejamento",
          "description": "Criamos calendário editorial com temas relevantes"
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
        "name": "Dr. Carlos Mendes",
        "company": "Clínica Ortopédica",
        "role": "Ortopedista",
        "text": "Finalmente um serviço que entende as limitações do marketing médico. Conteúdo ético e que realmente traz pacientes.",
        "result": "+30 agendamentos/mês"
      }
    ],
    "urgencia": {
      "title": "Vagas Limitadas Para Médicos",
      "message": "Atendemos apenas 2 médicos novos por mês para garantir qualidade",
      "scarcity_type": "vagas"
    },
    "faq": [
      {
        "question": "O conteúdo segue as normas do CFM?",
        "answer": "Sim! 100%. Todo conteúdo é revisado por especialista em marketing médico e segue rigorosamente as normas do CFM."
      },
      {
        "question": "Preciso aparecer nos vídeos?",
        "answer": "Não necessariamente. Podemos criar conteúdo educativo sem sua aparição, mas recomendamos que apareça para criar conexão com pacientes."
      },
      {
        "question": "Como funciona o agendamento online?",
        "answer": "Integramos um sistema de agendamento no seu Instagram. O paciente agenda direto pelo perfil."
      },
      {
        "question": "Quanto tempo leva para ver resultados?",
        "answer": "Médicos começam a receber agendamentos em 30-45 dias. O crescimento é progressivo e sustentável."
      }
    ],
    "cta_final": {
      "title": "Comece a Atrair Mais Pacientes Hoje",
      "subtitle": "Apenas 2 vagas disponíveis este mês. Garanta a sua agora.",
      "cta_text": "Falar Com Especialista Agora",
      "cta_url": "/chatcriadores-medicos"
    },
    "theme": {
      "primary_color": "#0b3553",
      "secondary_color": "#137333",
      "font_family": "Onest",
      "border_radius": "12px"
    }
  }'::jsonb,
  '{
    "chatbot_url": "/chatcriadores-medicos",
    "conversion_goal": "chatbot_click",
    "analytics": {
      "ga4_id": "G-XXXXXXXXXX"
    },
    "features": {
      "show_urgency": true,
      "show_countdown": false,
      "show_compliance": true
    },
    "segment": "medicos"
  }'::jsonb,
  '{
    "title": "Social Media para Médicos | Marketing Médico Ético | crIAdores",
    "description": "Social media especializada para médicos e clínicas. 100% compliance CFM, conteúdo educativo e agendamentos online.",
    "keywords": ["marketing médico", "social media médica", "marketing para médicos", "compliance CFM"],
    "og_image": "/assets/og-medicos.jpg",
    "og_type": "website",
    "canonical": "https://criadores.app/empresas/social-media-medicos",
    "robots": "index, follow"
  }'::jsonb,
  'active',
  true,
  NOW()
);

-- Relacionar produto
INSERT INTO lp_products (lp_id, product_id, order_index) VALUES
  ('20000000-0000-0000-0000-000000000005', 'e4601bac-eb02-4116-a6ad-6a79a85f628b', 1); -- Estrategista de Marketing

