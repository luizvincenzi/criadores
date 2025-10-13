-- ============================================================================
-- SEED: TEMPLATES INICIAIS
-- ============================================================================

-- Template 1: Combo Completo (Érico Rocha + Ladeira + Jeff Walker)
INSERT INTO lp_templates (id, name, slug, methodology, description, structure, is_active) VALUES (
  '10000000-0000-0000-0000-000000000001',
  'Template Combo Completo',
  'combo-completo',
  'erico-rocha-completo',
  'Template completo seguindo Érico Rocha (funil completo), Ladeira (copy persuasivo) e Jeff Walker (PLF adaptado). Ideal para vender múltiplos produtos com oferta de combo.',
  '{
    "sections": [
      {
        "id": "hero",
        "name": "Hero",
        "component": "HeroSection",
        "methodology_notes": {
          "erico_rocha": "Isca - Promessa clara + Prova social com números",
          "ladeira": "Headline magnética + Subheadline com ''como'' + CTA claro",
          "jeff_walker": "Oportunidade - O QUE você vai conseguir"
        }
      },
      {
        "id": "problema",
        "name": "Problema",
        "component": "ProblemaSection",
        "methodology_notes": {
          "erico_rocha": "Dor + Agitação - Identificar e amplificar a dor",
          "ladeira": "Identificação emocional com o problema",
          "jeff_walker": "Contexto - Por que o problema existe"
        }
      },
      {
        "id": "dados-mercado",
        "name": "Dados do Mercado",
        "component": "DadosMercadoSection",
        "methodology_notes": {
          "erico_rocha": "Prova social com números do mercado",
          "ladeira": "Credibilidade com dados reais e fontes",
          "jeff_walker": "Oportunidade - Tamanho do mercado"
        }
      },
      {
        "id": "solucao-1",
        "name": "Solução #1",
        "component": "SolucaoSection",
        "methodology_notes": {
          "erico_rocha": "Solução - Apresentar produto individual primeiro",
          "ladeira": "Bullets de benefícios tangíveis",
          "jeff_walker": "Transformação - COMO funciona"
        }
      },
      {
        "id": "solucao-2",
        "name": "Solução #2",
        "component": "SolucaoSection",
        "methodology_notes": {
          "erico_rocha": "Solução - Segundo produto individual",
          "ladeira": "Bullets de benefícios tangíveis",
          "jeff_walker": "Transformação - COMO funciona"
        }
      },
      {
        "id": "solucao-3",
        "name": "Solução #3",
        "component": "SolucaoSection",
        "methodology_notes": {
          "erico_rocha": "Solução - Terceiro produto individual",
          "ladeira": "Bullets de benefícios tangíveis",
          "jeff_walker": "Transformação - COMO funciona"
        }
      },
      {
        "id": "combo",
        "name": "Oferta Combo",
        "component": "ComboSection",
        "methodology_notes": {
          "erico_rocha": "Oferta irresistível - Combo com desconto + Bônus exclusivos",
          "ladeira": "Comparação de valor - Mostrar economia",
          "jeff_walker": "Posse - POR QUE AGORA (escassez + urgência)"
        }
      },
      {
        "id": "processo",
        "name": "Como Funciona",
        "component": "ProcessoSection",
        "methodology_notes": {
          "erico_rocha": "Reduzir fricção - Mostrar que é fácil começar",
          "ladeira": "Passo a passo claro",
          "jeff_walker": "Transformação - Jornada do cliente"
        }
      },
      {
        "id": "depoimentos",
        "name": "Depoimentos",
        "component": "DepoimentosSection",
        "methodology_notes": {
          "erico_rocha": "Prova - Cases reais de transformação",
          "ladeira": "Prova social com nome + foto + resultado específico",
          "jeff_walker": "Prova de conceito - Outros conseguiram"
        }
      },
      {
        "id": "urgencia",
        "name": "Urgência",
        "component": "UrgenciaSection",
        "methodology_notes": {
          "erico_rocha": "Escassez real - Vagas limitadas",
          "ladeira": "Urgência sem fake - Razão real para agir agora",
          "jeff_walker": "Post-Launch - Fechamento com escassez"
        }
      },
      {
        "id": "faq",
        "name": "FAQ",
        "component": "FAQSection",
        "methodology_notes": {
          "erico_rocha": "Reduzir objeções",
          "ladeira": "Antecipar e responder objeções comuns",
          "jeff_walker": "Reduzir fricção para a compra"
        }
      },
      {
        "id": "cta-final",
        "name": "CTA Final",
        "component": "CTAFinalSection",
        "methodology_notes": {
          "erico_rocha": "Última chance - Reforçar urgência",
          "ladeira": "CTA claro e específico",
          "jeff_walker": "Última chamada para ação"
        }
      }
    ],
    "methodology_summary": {
      "erico_rocha": "Funil completo: Isca (Hero) → Problema (Dor + Agitação) → Solução (Produtos individuais) → Oferta (Combo irresistível) → Urgência (Escassez) → FAQ (Objeções) → CTA Final",
      "ladeira": "Copy persuasivo em cada seção: Headline magnética + Bullets poderosos + Prova social (nome + foto + resultado) + Urgência real + CTA claro",
      "jeff_walker": "PLF adaptado para evergreen: Oportunidade (O QUE) → Transformação (COMO) → Posse (POR QUE AGORA)"
    }
  }'::jsonb,
  true
);

-- Template 2: Produto Único (Foco em 1 solução)
INSERT INTO lp_templates (id, name, slug, methodology, description, structure, is_active) VALUES (
  '10000000-0000-0000-0000-000000000002',
  'Template Produto Único',
  'produto-unico',
  'ladeira-direto',
  'Template focado em vender 1 produto específico. Copy direto e persuasivo seguindo Ladeira.',
  '{
    "sections": [
      {
        "id": "hero",
        "name": "Hero",
        "component": "HeroSection"
      },
      {
        "id": "problema",
        "name": "Problema",
        "component": "ProblemaSection"
      },
      {
        "id": "solucao-1",
        "name": "Solução",
        "component": "SolucaoSection"
      },
      {
        "id": "processo",
        "name": "Como Funciona",
        "component": "ProcessoSection"
      },
      {
        "id": "depoimentos",
        "name": "Depoimentos",
        "component": "DepoimentosSection"
      },
      {
        "id": "urgencia",
        "name": "Urgência",
        "component": "UrgenciaSection"
      },
      {
        "id": "faq",
        "name": "FAQ",
        "component": "FAQSection"
      },
      {
        "id": "cta-final",
        "name": "CTA Final",
        "component": "CTAFinalSection"
      }
    ]
  }'::jsonb,
  true
);

-- Template 3: Segmento Específico (Médicos, Advogados, etc)
INSERT INTO lp_templates (id, name, slug, methodology, description, structure, is_active) VALUES (
  '10000000-0000-0000-0000-000000000003',
  'Template Segmento Específico',
  'segmento-especifico',
  'ladeira-direto',
  'Template para segmentos específicos (médicos, advogados, etc) com compliance e linguagem adaptada.',
  '{
    "sections": [
      {
        "id": "hero",
        "name": "Hero",
        "component": "HeroSection"
      },
      {
        "id": "problema",
        "name": "Problema",
        "component": "ProblemaSection"
      },
      {
        "id": "compliance",
        "name": "Compliance",
        "component": "ComplianceSection",
        "methodology_notes": {
          "ladeira": "Reduzir objeção de compliance (CFM, OAB, etc)"
        }
      },
      {
        "id": "solucao-1",
        "name": "Solução",
        "component": "SolucaoSection"
      },
      {
        "id": "depoimentos",
        "name": "Depoimentos",
        "component": "DepoimentosSection"
      },
      {
        "id": "faq",
        "name": "FAQ",
        "component": "FAQSection"
      },
      {
        "id": "cta-final",
        "name": "CTA Final",
        "component": "CTAFinalSection"
      }
    ]
  }'::jsonb,
  true
);

-- ============================================================================
-- FIM DO SEED DE TEMPLATES
-- ============================================================================

