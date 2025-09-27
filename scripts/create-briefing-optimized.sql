-- ========================================
-- SISTEMA DE BRIEFING MENSAL OTIMIZADO
-- ========================================
-- Versão que aproveita tabelas existentes para minimizar duplicação

-- ANÁLISE DAS TABELAS EXISTENTES:
-- ✅ businesses: Já tem business_id, name, contact_info, address
-- ✅ business_notes: Já existe para notas/comentários
-- ✅ business_tasks: Já existe para tarefas relacionadas
-- ✅ campaigns: Já tem campanhas por business_id e month
-- ✅ jornada_tasks: Já tem sistema de tarefas por jornada

-- ESTRATÉGIA OTIMIZADA:
-- 1. Usar business_notes com note_type='briefing' para armazenar briefings
-- 2. Usar business_tasks para tarefas do briefing
-- 3. Criar apenas 1 tabela nova para checklist de performance
-- 4. Usar JSONB na tabela business_notes para dados estruturados

-- 1. CRIAR TABELA DE CHECKLIST DE PERFORMANCE (ÚNICA NOVA TABELA)
CREATE TABLE IF NOT EXISTS briefing_performance_checklist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- IDENTIFICAÇÃO DO BRIEFING
  reference_month VARCHAR(20) NOT NULL, -- Ex: Outubro/2025
  meeting_date DATE NOT NULL,
  
  -- CHECKLIST ESTRUTURADO
  checklist_items JSONB NOT NULL DEFAULT '{
    "feedback_collected": {"checked": false, "evidence": ""},
    "strategy_understood": {"checked": false, "evidence": ""},
    "campaigns_defined": {"checked": false, "evidence": ""},
    "creator_profile_aligned": {"checked": false, "evidence": ""},
    "content_guidelines_discussed": {"checked": false, "evidence": ""},
    "deadlines_established": {"checked": false, "evidence": ""},
    "metrics_identified": {"checked": false, "evidence": ""},
    "next_steps_defined": {"checked": false, "evidence": ""}
  }'::jsonb,
  
  -- SCORE CALCULADO AUTOMATICAMENTE
  performance_score INTEGER DEFAULT 0, -- 0-100
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- CONSTRAINT PARA EVITAR DUPLICATAS
  UNIQUE(business_id, reference_month)
);

-- 2. FUNÇÃO PARA CALCULAR SCORE AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION calculate_briefing_score(checklist_data JSONB)
RETURNS INTEGER AS $$
DECLARE
  total_items INTEGER := 0;
  completed_items INTEGER := 0;
  item_key TEXT;
  item_value JSONB;
BEGIN
  -- Contar itens do checklist
  FOR item_key, item_value IN SELECT * FROM jsonb_each(checklist_data)
  LOOP
    total_items := total_items + 1;
    IF (item_value->>'checked')::boolean = true THEN
      completed_items := completed_items + 1;
    END IF;
  END LOOP;
  
  -- Calcular porcentagem
  IF total_items = 0 THEN
    RETURN 0;
  END IF;
  
  RETURN ROUND((completed_items::DECIMAL / total_items::DECIMAL) * 100);
END;
$$ LANGUAGE plpgsql;

-- 3. TRIGGER PARA ATUALIZAR SCORE AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION update_briefing_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.performance_score := calculate_briefing_score(NEW.checklist_items);
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_briefing_score
  BEFORE INSERT OR UPDATE ON briefing_performance_checklist
  FOR EACH ROW
  EXECUTE FUNCTION update_briefing_score();

-- 4. INSERIR DADOS DE EXEMPLO (JOHN BEER & PORK)
INSERT INTO briefing_performance_checklist (
  business_id,
  organization_id,
  reference_month,
  meeting_date,
  checklist_items
) VALUES (
  '55310ebd-0e0d-492e-8c34-cd4740000000', -- Boussolé business_id
  '00000000-0000-0000-0000-000000000001', -- Default org
  'Outubro/2025',
  '2025-09-26',
  '{
    "feedback_collected": {
      "checked": true, 
      "evidence": "Diogo detalhou a percepção sobre a energia morna de alguns vídeos do John e elogiou o padrão das entregas do Bra."
    },
    "strategy_understood": {
      "checked": true, 
      "evidence": "Foi definida a estratégia de focar em dias específicos (quarta/quinta) e nos eventos (Oktoberfest/Halloween) para concentrar o impacto."
    },
    "campaigns_defined": {
      "checked": true, 
      "evidence": "As 4 campanhas de Outubro foram claramente estabelecidas: 2 para eventos e 2 para fortalecer dias da semana."
    },
    "creator_profile_aligned": {
      "checked": true, 
      "evidence": "Para o Bra, foi solicitado inverter a proporção para mais criadores de lifestyle. Para o John, foi discutida a possibilidade de recontratar perfis de sucesso."
    },
    "content_guidelines_discussed": {
      "checked": true, 
      "evidence": "O feedback sobre capas, cenários e a pegada dos vídeos serviu como base para os Dos & Donts, que serão formalizados no briefing."
    },
    "deadlines_established": {
      "checked": true, 
      "evidence": "Prazos definidos: vídeo do Oktoberfest até 06/10 e Halloween até 27/10. Para o Bra, foi definida uma postagem por semana, às sextas."
    },
    "metrics_identified": {
      "checked": true, 
      "evidence": "Diogo solicitou expressamente os insights de audiência (público, faixa etária) dos posts feitos no perfil dos criadores."
    },
    "next_steps_defined": {
      "checked": true, 
      "evidence": "Ao final, foram definidos os próximos passos: cliente envia briefing detalhado e a equipe interna apresenta os perfis e coleta os dados de audiência."
    }
  }'::jsonb
) ON CONFLICT (business_id, reference_month) DO NOTHING;

-- 5. INSERIR BRIEFING COMO NOTA ESTRUTURADA
INSERT INTO business_notes (
  business_id,
  user_id,
  content,
  note_type,
  attachments
) VALUES (
  '55310ebd-0e0d-492e-8c34-cd4740000000', -- Boussolé business_id
  NULL, -- Sistema
  'Briefing Mensal - Outubro/2025',
  'briefing',
  '{
    "briefing_data": {
      "ref_code": "BRF-202510-002",
      "reference_month": "Outubro/2025",
      "meeting_date": "2025-09-26",
      "participants": {
        "criadores": ["Luiz Vincenzi", "Rafa (criadores ops)", "Gabriel"],
        "client": ["Diogo Torresan (John Beer & Pork)"]
      },
      "executive_summary": {
        "month_campaigns": [
          "Evento: Oktoberfest (início do mês)",
          "Evento: Halloween (fim do mês)",
          "Dia da semana: Quarta-feira (Open Chopp)",
          "Dia da semana: Quinta-feira (Ladies Night)"
        ],
        "next_step": "Aguardando briefing detalhado do cliente (foco em Oktoberfest).",
        "identified_needs": [
          "Melhorar energia/pegada dos vídeos",
          "Criar capas de Reels mais atrativas",
          "Explorar cenários que reflitam o bar",
          "Obter insights de audiência dos posts"
        ],
        "previous_month_feedback": "No geral positivo. Para o John, alguns vídeos tiveram uma energia morna, e as capas dos reels podem ser mais bem pensadas para valorizar o feed. Para o Bra (Pokk), as entregas foram boas, com destaque para o vídeo da Pietra."
      },
      "product_info": {
        "description": "Bar em Londrina com foco em cervejas artesanais, porções e ambiente descontraído para entretenimento e happy hour.",
        "price": "Variado (chopp, drinks, porções)",
        "place": "Loja física em Londrina, PR.",
        "promotion": "Open Chopp às quartas, Ladies Night às quintas.",
        "ideal_audience": "Jovens e adultos (25-45 anos) em Londrina, interessados em happy hour, música, eventos e cerveja artesanal.",
        "benefits": [
          "Eventos temáticos e dias com promoções fixas.",
          "Ambiente ideal para socialização e diversão.",
          "Cardápio variado de comidas e bebidas."
        ],
        "urgency": "Eventos únicos como Oktoberfest e Halloween acontecem apenas uma vez ao ano, com atrações especiais."
      },
      "campaign_context": {
        "objective": "Aumentar o fluxo de clientes e o reconhecimento da marca ao concentrar esforços de divulgação em eventos e dias da semana específicos, gerando picos de movimento e fortalecendo a percepção do John como um destino de entretenimento.",
        "strategy": "Adotar uma abordagem de pulso, focando a verba e a comunicação em campanhas de curta duração e alto impacto, em vez de uma divulgação genérica. A ideia é criar um senso de urgência e oportunidade para cada pilar de conteúdo.",
        "pillars": "A comunicação será dividida em 4 pilares: 2 eventos principais (Oktoberfest e Halloween) para atrair grande público e 2 campanhas de sustentação (Quarta do Open Chopp e Quinta Ladies Night) para garantir o fluxo contínuo durante a semana."
      },
      "dos_and_donts": {
        "dos": [
          "Gravar vídeos com energia alta, transmitindo alegria e diversão.",
          "Criar capas de Reels atrativas, que valorizem o feed e mostrem o ambiente.",
          "Explorar cenários que mostrem a identidade visual e a atmosfera do bar.",
          "Para o Bra, usar roupas que combinem com a identidade da marca (ex: verde)."
        ],
        "donts": [
          "Produzir conteúdo com pegada morna ou baixa energia.",
          "Usar capas de vídeo genéricas ou que não contextualizem o local.",
          "Gravar em cenários que não valorizam o espaço (ex: fundo com TV).",
          "Focar excessivamente no criador sem mostrar a experiência do ambiente."
        ]
      },
      "conversion_tips": [
        "Promover os eventos (Oktoberfest, Halloween) com contagem regressiva nos Stories.",
        "Criar enquetes interativas sobre as atrações dos eventos para gerar engajamento.",
        "Incentivar o compartilhamento de conteúdo gerado pelo usuário (UGC) durante os eventos.",
        "Utilizar os vídeos para campanhas de remarketing focadas no público local."
      ]
    }
  }'::jsonb
) ON CONFLICT DO NOTHING;

-- 6. INSERIR TAREFAS DO BRIEFING
INSERT INTO business_tasks (
  business_id,
  assigned_to_user_id,
  created_by_user_id,
  title,
  description,
  task_type,
  status,
  priority,
  due_date
) VALUES 
-- Tarefas Internas
('55310ebd-0e0d-492e-8c34-cd4740000000', NULL, NULL, 'Apresentar perfis de influenciadores para as 4 campanhas', 'Selecionar e apresentar perfis adequados para Oktoberfest, Halloween, Open Chopp e Ladies Night', 'briefing', 'pending', 'high', '2025-10-01'),
('55310ebd-0e0d-492e-8c34-cd4740000000', NULL, NULL, 'Coletar e enviar dados de audiência dos perfis', 'Compilar insights de audiência (público, faixa etária) dos posts dos criadores', 'briefing', 'pending', 'high', '2025-10-01'),
('55310ebd-0e0d-492e-8c34-cd4740000000', NULL, NULL, 'Briefing dos criadores com foco em energia, capas e cenários', 'Orientar criadores sobre energia alta, capas atrativas e cenários que valorizem o bar', 'briefing', 'pending', 'high', '2025-10-02'),
('55310ebd-0e0d-492e-8c34-cd4740000000', NULL, NULL, 'Garantir entrega do vídeo do Oktoberfest até 06/10', 'Coordenar produção e entrega do conteúdo para o evento Oktoberfest', 'briefing', 'pending', 'high', '2025-10-06'),
('55310ebd-0e0d-492e-8c34-cd4740000000', NULL, NULL, 'Garantir entrega do vídeo do Halloween até 27/10', 'Coordenar produção e entrega do conteúdo para o evento Halloween', 'briefing', 'pending', 'medium', '2025-10-27'),

-- Tarefas do Cliente
('55310ebd-0e0d-492e-8c34-cd4740000000', NULL, NULL, 'Enviar briefing detalhado das campanhas de Outubro', 'Cliente deve enviar briefing completo com detalhes das 4 campanhas', 'briefing', 'in_progress', 'high', '2025-09-30'),
('55310ebd-0e0d-492e-8c34-cd4740000000', NULL, NULL, 'Avaliar e aprovar os perfis de influenciadores', 'Analisar perfis apresentados e aprovar os selecionados', 'briefing', 'pending', 'high', '2025-10-02'),
('55310ebd-0e0d-492e-8c34-cd4740000000', NULL, NULL, 'Sugerir possível recontratação de criadores anteriores', 'Indicar criadores que tiveram bom desempenho para recontratação', 'briefing', 'pending', 'medium', '2025-10-01')
ON CONFLICT DO NOTHING;

-- 7. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_briefing_performance_business_month 
ON briefing_performance_checklist(business_id, reference_month);

CREATE INDEX IF NOT EXISTS idx_business_notes_briefing 
ON business_notes(business_id, note_type) WHERE note_type = 'briefing';

CREATE INDEX IF NOT EXISTS idx_business_tasks_briefing 
ON business_tasks(business_id, task_type) WHERE task_type = 'briefing';

-- 8. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE briefing_performance_checklist IS 'Checklist de performance para briefings mensais';
COMMENT ON COLUMN briefing_performance_checklist.checklist_items IS 'Itens do checklist com evidências em formato JSONB';
COMMENT ON COLUMN briefing_performance_checklist.performance_score IS 'Score calculado automaticamente (0-100) baseado no checklist';

-- 9. VERIFICAR DADOS INSERIDOS
SELECT 
  'Briefing Performance' as tipo,
  reference_month,
  performance_score,
  (SELECT COUNT(*) FROM jsonb_object_keys(checklist_items)) as total_items,
  (SELECT COUNT(*) FROM jsonb_each(checklist_items) WHERE (value->>'checked')::boolean = true) as completed_items
FROM briefing_performance_checklist 
WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000';

SELECT 
  'Briefing Notes' as tipo,
  note_type,
  LEFT(content, 50) as preview,
  created_at
FROM business_notes 
WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000' 
AND note_type = 'briefing';

SELECT 
  'Briefing Tasks' as tipo,
  task_type,
  title,
  status,
  priority
FROM business_tasks 
WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000' 
AND task_type = 'briefing'
ORDER BY priority DESC, due_date ASC;
