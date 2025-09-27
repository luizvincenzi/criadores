-- ========================================
-- SISTEMA DE BRIEFING MENSAL
-- ========================================
-- Implementação completa do sistema de briefings mensais

-- 1. CRIAR TABELA PRINCIPAL DE BRIEFINGS MENSAIS
CREATE TABLE IF NOT EXISTS monthly_briefings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- IDENTIFICAÇÃO DO BRIEFING
  ref_code VARCHAR(50) UNIQUE NOT NULL, -- Ex: BRF-202510-002
  reference_month VARCHAR(20) NOT NULL, -- Ex: Outubro/2025
  meeting_date DATE NOT NULL,
  
  -- PARTICIPANTES
  participants JSONB NOT NULL DEFAULT '{
    "criadores": [],
    "client": []
  }'::jsonb,
  
  -- RESUMO EXECUTIVO
  executive_summary JSONB NOT NULL DEFAULT '{
    "month_campaigns": [],
    "next_step": "",
    "identified_needs": [],
    "previous_month_feedback": ""
  }'::jsonb,
  
  -- INFORMAÇÕES DO PRODUTO (4 Ps)
  product_info JSONB NOT NULL DEFAULT '{
    "description": "",
    "price": "",
    "place": "",
    "promotion": "",
    "ideal_audience": "",
    "main_pain_point": "",
    "benefits": [],
    "common_objections": "",
    "urgency": ""
  }'::jsonb,
  
  -- CONTEXTO DA CAMPANHA
  campaign_context JSONB NOT NULL DEFAULT '{
    "objective": "",
    "strategy": "",
    "pillars": ""
  }'::jsonb,
  
  -- DO\'S & DON\'TS
  dos_and_donts JSONB NOT NULL DEFAULT '{
    "dos": [],
    "donts": []
  }'::jsonb,
  
  -- DICAS DE CONVERSÃO
  conversion_tips TEXT[] DEFAULT '{}',
  
  -- PLANO DE AÇÃO
  action_plan JSONB NOT NULL DEFAULT '{
    "internal": [],
    "client": []
  }'::jsonb,
  
  -- PERFORMANCE DA CALL
  call_performance JSONB NOT NULL DEFAULT '{
    "checklist": [],
    "score_percentage": 0,
    "total_items": 0,
    "completed_items": 0
  }'::jsonb,
  
  -- STATUS E METADADOS
  status VARCHAR(50) DEFAULT 'draft', -- draft, completed, approved, archived
  created_by UUID REFERENCES users(id),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  
  -- TIMESTAMPS
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CRIAR TABELA DE CAMPANHAS RELACIONADAS AO BRIEFING
CREATE TABLE IF NOT EXISTS briefing_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  briefing_id UUID NOT NULL REFERENCES monthly_briefings(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES campaigns(id) ON DELETE SET NULL,
  
  -- INFORMAÇÕES DA CAMPANHA NO BRIEFING
  campaign_name VARCHAR(255) NOT NULL,
  campaign_type VARCHAR(100), -- Ex: "Evento: Oktoberfest", "Dia da semana: Quarta-feira"
  priority INTEGER DEFAULT 1, -- 1 = alta, 2 = média, 3 = baixa
  delivery_deadline DATE,
  
  -- STATUS ESPECÍFICO NO BRIEFING
  briefing_status VARCHAR(50) DEFAULT 'planned', -- planned, in_progress, delivered, approved
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR TABELA DE TAREFAS DO BRIEFING
CREATE TABLE IF NOT EXISTS briefing_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  briefing_id UUID NOT NULL REFERENCES monthly_briefings(id) ON DELETE CASCADE,
  
  -- INFORMAÇÕES DA TAREFA
  task_description TEXT NOT NULL,
  task_type VARCHAR(50) NOT NULL, -- 'internal' ou 'client'
  status VARCHAR(20) DEFAULT 'todo', -- todo, doing, done
  priority INTEGER DEFAULT 2, -- 1 = alta, 2 = média, 3 = baixa
  
  -- RESPONSABILIDADE
  assigned_to VARCHAR(100), -- Nome da pessoa/equipe responsável
  assigned_user_id UUID REFERENCES users(id),
  
  -- PRAZOS
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- METADADOS
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CRIAR TABELA DE CHECKLIST DE PERFORMANCE
CREATE TABLE IF NOT EXISTS briefing_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  briefing_id UUID NOT NULL REFERENCES monthly_briefings(id) ON DELETE CASCADE,
  
  -- ITEM DO CHECKLIST
  item_description TEXT NOT NULL,
  is_checked BOOLEAN DEFAULT false,
  evidence TEXT, -- Evidência de que o item foi cumprido
  
  -- ORDEM E CATEGORIA
  item_order INTEGER DEFAULT 1,
  category VARCHAR(100), -- Ex: "feedback", "strategy", "planning"
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_monthly_briefings_business_month ON monthly_briefings(business_id, reference_month);
CREATE INDEX IF NOT EXISTS idx_monthly_briefings_meeting_date ON monthly_briefings(meeting_date);
CREATE INDEX IF NOT EXISTS idx_monthly_briefings_status ON monthly_briefings(status);
CREATE INDEX IF NOT EXISTS idx_briefing_campaigns_briefing_id ON briefing_campaigns(briefing_id);
CREATE INDEX IF NOT EXISTS idx_briefing_tasks_briefing_id ON briefing_tasks(briefing_id);
CREATE INDEX IF NOT EXISTS idx_briefing_tasks_status ON briefing_tasks(status);
CREATE INDEX IF NOT EXISTS idx_briefing_checklist_briefing_id ON briefing_checklist_items(briefing_id);

-- 6. CRIAR TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
CREATE OR REPLACE FUNCTION update_briefing_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_briefing_updated_at
  BEFORE UPDATE ON monthly_briefings
  FOR EACH ROW
  EXECUTE FUNCTION update_briefing_updated_at();

CREATE TRIGGER trigger_update_briefing_tasks_updated_at
  BEFORE UPDATE ON briefing_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_briefing_updated_at();

-- 7. FUNÇÃO PARA CALCULAR SCORE DE PERFORMANCE
CREATE OR REPLACE FUNCTION calculate_briefing_performance_score(p_briefing_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_items INTEGER;
  completed_items INTEGER;
  score_percentage INTEGER;
BEGIN
  -- Contar itens totais e completos
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE is_checked = true)
  INTO total_items, completed_items
  FROM briefing_checklist_items
  WHERE briefing_id = p_briefing_id;
  
  -- Calcular percentual
  IF total_items > 0 THEN
    score_percentage := ROUND((completed_items::DECIMAL / total_items::DECIMAL) * 100);
  ELSE
    score_percentage := 0;
  END IF;
  
  -- Atualizar na tabela principal
  UPDATE monthly_briefings 
  SET call_performance = jsonb_set(
    jsonb_set(
      jsonb_set(
        call_performance,
        '{score_percentage}',
        to_jsonb(score_percentage)
      ),
      '{total_items}',
      to_jsonb(total_items)
    ),
    '{completed_items}',
    to_jsonb(completed_items)
  )
  WHERE id = p_briefing_id;
  
  RETURN score_percentage;
END;
$$ LANGUAGE plpgsql;

-- 8. TRIGGER PARA ATUALIZAR SCORE AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION trigger_update_briefing_score()
RETURNS TRIGGER AS $$
BEGIN
  PERFORM calculate_briefing_performance_score(
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.briefing_id
      ELSE NEW.briefing_id
    END
  );
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_briefing_checklist_score_update
  AFTER INSERT OR UPDATE OR DELETE ON briefing_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_briefing_score();

-- 9. FUNÇÃO PARA GERAR REF_CODE AUTOMÁTICO
CREATE OR REPLACE FUNCTION generate_briefing_ref_code(p_business_id UUID, p_meeting_date DATE)
RETURNS VARCHAR(50) AS $$
DECLARE
  year_month VARCHAR(6);
  sequence_num INTEGER;
  ref_code VARCHAR(50);
BEGIN
  -- Formato: YYYYMM
  year_month := TO_CHAR(p_meeting_date, 'YYYYMM');
  
  -- Buscar próximo número sequencial para o mês
  SELECT COALESCE(MAX(
    CAST(
      SUBSTRING(ref_code FROM 'BRF-' || year_month || '-(\d+)') AS INTEGER
    )
  ), 0) + 1
  INTO sequence_num
  FROM monthly_briefings
  WHERE business_id = p_business_id
    AND ref_code LIKE 'BRF-' || year_month || '-%';
  
  -- Gerar código final
  ref_code := 'BRF-' || year_month || '-' || LPAD(sequence_num::TEXT, 3, '0');
  
  RETURN ref_code;
END;
$$ LANGUAGE plpgsql;

-- 10. TRIGGER PARA GERAR REF_CODE AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION trigger_generate_briefing_ref_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ref_code IS NULL OR NEW.ref_code = '' THEN
    NEW.ref_code := generate_briefing_ref_code(NEW.business_id, NEW.meeting_date);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_briefing_ref_code_generation
  BEFORE INSERT ON monthly_briefings
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_briefing_ref_code();

-- 11. POLÍTICAS RLS (ROW LEVEL SECURITY)
ALTER TABLE monthly_briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefing_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefing_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefing_checklist_items ENABLE ROW LEVEL SECURITY;

-- Política para monthly_briefings
CREATE POLICY "Users can access briefings from their organization" ON monthly_briefings
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- Política para briefing_campaigns
CREATE POLICY "Users can access briefing campaigns from their organization" ON briefing_campaigns
  FOR ALL USING (
    briefing_id IN (
      SELECT id FROM monthly_briefings 
      WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Política para briefing_tasks
CREATE POLICY "Users can access briefing tasks from their organization" ON briefing_tasks
  FOR ALL USING (
    briefing_id IN (
      SELECT id FROM monthly_briefings 
      WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- Política para briefing_checklist_items
CREATE POLICY "Users can access briefing checklist from their organization" ON briefing_checklist_items
  FOR ALL USING (
    briefing_id IN (
      SELECT id FROM monthly_briefings 
      WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

-- 12. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON TABLE monthly_briefings IS 'Armazena os briefings mensais realizados com as empresas';
COMMENT ON TABLE briefing_campaigns IS 'Campanhas específicas discutidas em cada briefing';
COMMENT ON TABLE briefing_tasks IS 'Tarefas e ações definidas durante o briefing';
COMMENT ON TABLE briefing_checklist_items IS 'Itens do checklist de performance da reunião de briefing';

COMMENT ON COLUMN monthly_briefings.ref_code IS 'Código de referência único do briefing (ex: BRF-202510-002)';
COMMENT ON COLUMN monthly_briefings.call_performance IS 'Dados de performance da call incluindo score calculado automaticamente';
COMMENT ON COLUMN briefing_tasks.task_type IS 'Tipo da tarefa: internal (crIAdores) ou client (cliente)';
COMMENT ON COLUMN briefing_checklist_items.evidence IS 'Evidência ou justificativa de que o item foi cumprido durante a reunião';
