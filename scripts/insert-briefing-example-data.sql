-- ========================================
-- INSERIR DADOS DE EXEMPLO DO BRIEFING MENSAL
-- ========================================
-- Baseado no briefing HTML do John Beer & Pork

-- 1. INSERIR BRIEFING PRINCIPAL
INSERT INTO monthly_briefings (
  business_id,
  organization_id,
  ref_code,
  reference_month,
  meeting_date,
  participants,
  executive_summary,
  product_info,
  campaign_context,
  dos_and_donts,
  conversion_tips,
  action_plan,
  call_performance,
  status,
  created_by
) VALUES (
  '55310ebd-0e0d-492e-8c34-cd4740000000', -- Boussolé business_id
  '00000000-0000-0000-0000-000000000001', -- Default org
  'BRF-202510-002',
  'Outubro/2025',
  '2025-09-26',
  
  -- Participantes
  '{
    "criadores": ["Luiz Vincenzi", "Rafa (criadores ops)", "Gabriel"],
    "client": ["Diogo Torresan (John Beer & Pork)"]
  }'::jsonb,
  
  -- Resumo Executivo
  '{
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
    "previous_month_feedback": "No geral positivo. Para o \"John\", alguns vídeos tiveram uma energia \"morna\", e as capas dos reels podem ser mais bem pensadas para valorizar o feed. Para o \"Bra (Pokk)\", as entregas foram boas, com destaque para o vídeo da Pietra."
  }'::jsonb,
  
  -- Informações do Produto
  '{
    "description": "Bar em Londrina com foco em cervejas artesanais, porções e ambiente descontraído para entretenimento e happy hour.",
    "price": "Variado (chopp, drinks, porções)",
    "place": "Loja física em Londrina, PR.",
    "promotion": "Open Chopp às quartas, Ladies Night às quintas.",
    "ideal_audience": "Jovens e adultos (25-45 anos) em Londrina, interessados em happy hour, música, eventos e cerveja artesanal.",
    "main_pain_point": "Busca por um lugar com ambiente legal, bons produtos e entretenimento para ir com amigos durante da semana e fins de semana.",
    "benefits": [
      "Eventos temáticos e dias com promoções fixas.",
      "Ambiente ideal para socialização e diversão.",
      "Cardápio variado de comidas e bebidas."
    ],
    "common_objections": "\"O bar é muito cheio.\" Resposta: \"Temos dias mais tranquilos como a quarta-feira, ideal para quem busca uma experiência com mais calma.\"",
    "urgency": "Eventos únicos como Oktoberfest e Halloween acontecem apenas uma vez ao ano, com atrações especiais."
  }'::jsonb,
  
  -- Contexto da Campanha
  '{
    "objective": "Aumentar o fluxo de clientes e o reconhecimento da marca ao concentrar esforços de divulgação em eventos e dias da semana específicos, gerando picos de movimento e fortalecendo a percepção do John como um destino de entretenimento.",
    "strategy": "Adotar uma abordagem de \"pulso\", focando a verba e a comunicação em campanhas de curta duração e alto impacto, em vez de uma divulgação genérica. A ideia é criar um senso de urgência e oportunidade para cada pilar de conteúdo.",
    "pillars": "A comunicação será dividida em 4 pilares: 2 eventos principais (Oktoberfest e Halloween) para atrair grande público e 2 campanhas de sustentação (Quarta do Open Chopp e Quinta Ladies Night) para garantir o fluxo contínuo durante a semana."
  }'::jsonb,
  
  -- Do's & Don'ts
  '{
    "dos": [
      "Gravar vídeos com energia alta, transmitindo alegria e diversão.",
      "Criar capas de Reels atrativas, que valorizem o feed e mostrem o ambiente.",
      "Explorar cenários que mostrem a identidade visual e a atmosfera do bar.",
      "Para o \"Bra\", usar roupas que combinem com a identidade da marca (ex: verde)."
    ],
    "donts": [
      "Produzir conteúdo com \"pegada morna\" ou baixa energia.",
      "Usar capas de vídeo genéricas ou que não contextualizem o local.",
      "Gravar em cenários que não valorizam o espaço (ex: fundo com TV).",
      "Focar excessivamente no criador sem mostrar a experiência do ambiente."
    ]
  }'::jsonb,
  
  -- Dicas de Conversão
  ARRAY[
    'Promover os eventos (Oktoberfest, Halloween) com contagem regressiva nos Stories.',
    'Criar enquetes interativas sobre as atrações dos eventos para gerar engajamento.',
    'Incentivar o compartilhamento de conteúdo gerado pelo usuário (UGC) durante os eventos.',
    'Utilizar os vídeos para campanhas de remarketing focadas no público local.'
  ],
  
  -- Plano de Ação (será inserido separadamente nas tabelas específicas)
  '{
    "internal": [],
    "client": []
  }'::jsonb,
  
  -- Performance da Call (será calculado automaticamente)
  '{
    "score_percentage": 0,
    "total_items": 0,
    "completed_items": 0
  }'::jsonb,
  
  'completed',
  NULL -- created_by será NULL por enquanto
) ON CONFLICT (ref_code) DO NOTHING;

-- 2. OBTER O ID DO BRIEFING CRIADO
DO $$
DECLARE
  briefing_id UUID;
BEGIN
  -- Buscar o ID do briefing
  SELECT id INTO briefing_id 
  FROM monthly_briefings 
  WHERE ref_code = 'BRF-202510-002';
  
  IF briefing_id IS NOT NULL THEN
    
    -- 3. INSERIR CAMPANHAS RELACIONADAS
    INSERT INTO briefing_campaigns (briefing_id, campaign_name, campaign_type, priority, delivery_deadline, briefing_status) VALUES
    (briefing_id, 'Oktoberfest', 'Evento: Oktoberfest (início do mês)', 1, '2025-10-06', 'planned'),
    (briefing_id, 'Halloween', 'Evento: Halloween (fim do mês)', 1, '2025-10-27', 'planned'),
    (briefing_id, 'Open Chopp', 'Dia da semana: Quarta-feira (Open Chopp)', 2, NULL, 'planned'),
    (briefing_id, 'Ladies Night', 'Dia da semana: Quinta-feira (Ladies Night)', 2, NULL, 'planned');
    
    -- 4. INSERIR TAREFAS INTERNAS
    INSERT INTO briefing_tasks (briefing_id, task_description, task_type, status, priority, assigned_to, due_date) VALUES
    (briefing_id, 'Apresentar perfis de influenciadores para as 4 campanhas', 'internal', 'todo', 1, 'Equipe crIAdores', '2025-10-01'),
    (briefing_id, 'Coletar e enviar dados de audiência dos perfis', 'internal', 'todo', 1, 'Rafa (criadores ops)', '2025-10-01'),
    (briefing_id, 'Briefing dos criadores com foco em energia, capas e cenários', 'internal', 'todo', 1, 'Gabriel', '2025-10-02'),
    (briefing_id, 'Garantir entrega do vídeo do Oktoberfest até 06/10', 'internal', 'todo', 1, 'Luiz Vincenzi', '2025-10-06'),
    (briefing_id, 'Garantir entrega do vídeo do Halloween até 27/10', 'internal', 'todo', 2, 'Luiz Vincenzi', '2025-10-27');
    
    -- 5. INSERIR TAREFAS DO CLIENTE
    INSERT INTO briefing_tasks (briefing_id, task_description, task_type, status, priority, assigned_to, due_date) VALUES
    (briefing_id, 'Enviar briefing detalhado das campanhas de Outubro', 'client', 'doing', 1, 'Diogo Torresan', '2025-09-30'),
    (briefing_id, 'Avaliar e aprovar os perfis de influenciadores', 'client', 'todo', 1, 'Diogo Torresan', '2025-10-02'),
    (briefing_id, 'Sugerir possível recontratação de criadores anteriores', 'client', 'todo', 2, 'Diogo Torresan', '2025-10-01');
    
    -- 6. INSERIR CHECKLIST DE PERFORMANCE
    INSERT INTO briefing_checklist_items (briefing_id, item_description, is_checked, evidence, item_order, category) VALUES
    (briefing_id, 'Coletou feedback do mês anterior?', true, 'Diogo detalhou a percepção sobre a "energia morna" de alguns vídeos do John e elogiou o padrão das entregas do Bra.', 1, 'feedback'),
    (briefing_id, 'Entendeu a estratégia para o próximo mês?', true, 'Foi definida a estratégia de focar em dias específicos (quarta/quinta) e nos eventos (Oktoberfest/Halloween) para concentrar o impacto.', 2, 'strategy'),
    (briefing_id, 'Definiu as campanhas/temas a serem trabalhados?', true, 'As 4 campanhas de Outubro foram claramente estabelecidas: 2 para eventos e 2 para fortalecer dias da semana.', 3, 'planning'),
    (briefing_id, 'Alinhou o perfil de criador desejado?', true, 'Para o Bra, foi solicitado inverter a proporção para mais criadores de lifestyle. Para o John, foi discutida a possibilidade de recontratar perfis de sucesso.', 4, 'planning'),
    (briefing_id, 'Discutiu Do''s & Don''ts para o conteúdo?', true, 'O feedback sobre capas, cenários e a "pegada" dos vídeos serviu como base para os Do''s & Don''ts, que serão formalizados no briefing.', 5, 'content'),
    (briefing_id, 'Estabeleceu prazos de entrega e postagem?', true, 'Prazos definidos: vídeo do Oktoberfest até 06/10 e Halloween até 27/10. Para o Bra, foi definida uma postagem por semana, às sextas.', 6, 'planning'),
    (briefing_id, 'Identificou a necessidade de métricas?', true, 'Diogo solicitou expressamente os insights de audiência (público, faixa etária) dos posts feitos no perfil dos criadores.', 7, 'metrics'),
    (briefing_id, 'Definiu claramente os próximos passos?', true, 'Ao final, foram definidos os próximos passos: cliente envia briefing detalhado e a equipe interna apresenta os perfis e coleta os dados de audiência.', 8, 'planning');
    
    RAISE NOTICE 'Briefing de exemplo inserido com sucesso! ID: %', briefing_id;
    
  ELSE
    RAISE NOTICE 'Erro: Briefing não foi criado corretamente.';
  END IF;
END $$;

-- 7. VERIFICAR DADOS INSERIDOS
SELECT 
  'Briefing criado' as status,
  ref_code,
  reference_month,
  meeting_date,
  status,
  (call_performance->>'score_percentage')::integer as performance_score
FROM monthly_briefings 
WHERE ref_code = 'BRF-202510-002';

-- 8. VERIFICAR CAMPANHAS
SELECT 
  'Campanhas' as tipo,
  campaign_name,
  campaign_type,
  priority,
  briefing_status
FROM briefing_campaigns bc
JOIN monthly_briefings mb ON bc.briefing_id = mb.id
WHERE mb.ref_code = 'BRF-202510-002';

-- 9. VERIFICAR TAREFAS
SELECT 
  'Tarefas' as tipo,
  task_type,
  task_description,
  status,
  assigned_to
FROM briefing_tasks bt
JOIN monthly_briefings mb ON bt.briefing_id = mb.id
WHERE mb.ref_code = 'BRF-202510-002'
ORDER BY task_type, priority;

-- 10. VERIFICAR CHECKLIST E CALCULAR SCORE
SELECT 
  'Checklist' as tipo,
  COUNT(*) as total_items,
  COUNT(*) FILTER (WHERE is_checked = true) as completed_items,
  ROUND((COUNT(*) FILTER (WHERE is_checked = true)::DECIMAL / COUNT(*)::DECIMAL) * 100) as score_percentage
FROM briefing_checklist_items bci
JOIN monthly_briefings mb ON bci.briefing_id = mb.id
WHERE mb.ref_code = 'BRF-202510-002';

-- 11. ATUALIZAR SCORE AUTOMATICAMENTE (trigger deve fazer isso)
SELECT calculate_briefing_performance_score(id) as calculated_score
FROM monthly_briefings 
WHERE ref_code = 'BRF-202510-002';
