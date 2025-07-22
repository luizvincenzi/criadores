-- Migration: Criar estrutura CRM completa estilo HubSpot
-- Data: 2025-01-22
-- Descrição: Cria tabelas para negócios, atividades e tracking de tempo

-- 1. Criar tabela de negócios (deals/opportunities)
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  business_id UUID NOT NULL REFERENCES businesses(id), -- Empresa relacionada
  name VARCHAR(255) NOT NULL, -- Nome do negócio
  description TEXT,
  
  -- Informações do negócio
  stage business_stage DEFAULT 'Leads próprios frios',
  priority business_priority DEFAULT 'Média',
  estimated_value DECIMAL(12,2) DEFAULT 0.00,
  contract_creators_count INTEGER DEFAULT 0,
  
  -- Responsáveis
  owner_user_id UUID REFERENCES users(id), -- Vendedor responsável
  created_by_user_id UUID REFERENCES users(id), -- Quem criou
  
  -- Datas importantes
  expected_close_date DATE,
  actual_close_date DATE,
  
  -- Tracking de tempo na etapa atual
  current_stage_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_won BOOLEAN DEFAULT false,
  is_lost BOOLEAN DEFAULT false,
  lost_reason TEXT,
  
  -- Metadados
  custom_fields JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar tabela de atividades/histórico
CREATE TABLE IF NOT EXISTS deal_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id), -- Quem fez a atividade
  
  -- Tipo de atividade
  activity_type VARCHAR(50) NOT NULL, -- 'stage_change', 'note', 'call', 'email', 'meeting', 'task'
  
  -- Conteúdo da atividade
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Para mudanças de etapa
  old_stage business_stage,
  new_stage business_stage,
  
  -- Para tracking de tempo
  time_in_previous_stage INTERVAL, -- Tempo que ficou na etapa anterior
  
  -- Metadados
  metadata JSONB DEFAULT '{}', -- Dados extras específicos do tipo de atividade
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de comentários/notas
CREATE TABLE IF NOT EXISTS deal_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Conteúdo da nota
  content TEXT NOT NULL,
  note_type VARCHAR(50) DEFAULT 'general', -- 'general', 'internal', 'client_facing'
  
  -- Anexos (opcional)
  attachments JSONB DEFAULT '[]',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de tarefas relacionadas aos negócios
CREATE TABLE IF NOT EXISTS deal_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES deals(id) ON DELETE CASCADE,
  assigned_to_user_id UUID NOT NULL REFERENCES users(id),
  created_by_user_id UUID NOT NULL REFERENCES users(id),
  
  -- Informações da tarefa
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type VARCHAR(50) DEFAULT 'general', -- 'call', 'email', 'meeting', 'follow_up', 'general'
  
  -- Status e prioridade
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'cancelled'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  
  -- Datas
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Criar índices para performance
CREATE INDEX idx_deals_business_id ON deals(business_id);
CREATE INDEX idx_deals_owner_user_id ON deals(owner_user_id);
CREATE INDEX idx_deals_stage ON deals(stage) WHERE is_active = true;
CREATE INDEX idx_deals_organization_stage ON deals(organization_id, stage) WHERE is_active = true;
CREATE INDEX idx_deals_expected_close ON deals(expected_close_date) WHERE is_active = true;

CREATE INDEX idx_deal_activities_deal_id ON deal_activities(deal_id);
CREATE INDEX idx_deal_activities_user_id ON deal_activities(user_id);
CREATE INDEX idx_deal_activities_type ON deal_activities(activity_type);
CREATE INDEX idx_deal_activities_created_at ON deal_activities(created_at DESC);

CREATE INDEX idx_deal_notes_deal_id ON deal_notes(deal_id);
CREATE INDEX idx_deal_notes_user_id ON deal_notes(user_id);
CREATE INDEX idx_deal_notes_created_at ON deal_notes(created_at DESC);

CREATE INDEX idx_deal_tasks_deal_id ON deal_tasks(deal_id);
CREATE INDEX idx_deal_tasks_assigned_to ON deal_tasks(assigned_to_user_id);
CREATE INDEX idx_deal_tasks_status ON deal_tasks(status);
CREATE INDEX idx_deal_tasks_due_date ON deal_tasks(due_date) WHERE status != 'completed';

-- 6. Criar triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_deal_notes_updated_at
  BEFORE UPDATE ON deal_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_deal_tasks_updated_at
  BEFORE UPDATE ON deal_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. Criar trigger para tracking de mudança de etapa
CREATE OR REPLACE FUNCTION track_deal_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a etapa mudou
  IF OLD.stage IS DISTINCT FROM NEW.stage THEN
    -- Calcular tempo na etapa anterior
    DECLARE
      time_in_stage INTERVAL := NOW() - OLD.current_stage_since;
    BEGIN
      -- Inserir atividade de mudança de etapa
      INSERT INTO deal_activities (
        deal_id,
        user_id,
        activity_type,
        title,
        description,
        old_stage,
        new_stage,
        time_in_previous_stage
      ) VALUES (
        NEW.id,
        COALESCE(NEW.owner_user_id, OLD.owner_user_id),
        'stage_change',
        'Etapa alterada de "' || OLD.stage || '" para "' || NEW.stage || '"',
        'Tempo na etapa anterior: ' || time_in_stage,
        OLD.stage,
        NEW.stage,
        time_in_stage
      );
      
      -- Atualizar timestamp da etapa atual
      NEW.current_stage_since = NOW();
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_deal_stage_change
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION track_deal_stage_change();

-- 8. Comentários nas tabelas
COMMENT ON TABLE deals IS 'Negócios/oportunidades de venda vinculados às empresas';
COMMENT ON TABLE deal_activities IS 'Histórico de atividades e mudanças nos negócios';
COMMENT ON TABLE deal_notes IS 'Comentários e notas dos negócios';
COMMENT ON TABLE deal_tasks IS 'Tarefas relacionadas aos negócios';

-- 9. Inserir dados de exemplo (opcional)
-- INSERT INTO deals (organization_id, business_id, name, stage, estimated_value, owner_user_id)
-- SELECT 
--   '00000000-0000-0000-0000-000000000001',
--   id,
--   'Negócio com ' || name,
--   business_stage,
--   estimated_value,
--   owner_user_id
-- FROM businesses 
-- WHERE is_active = true
-- LIMIT 5;
