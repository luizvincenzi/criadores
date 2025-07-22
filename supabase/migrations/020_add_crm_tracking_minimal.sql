-- Migration: Adicionar tracking CRM usando estrutura existente
-- Data: 2025-01-22
-- Descrição: Adiciona tracking de tempo e atividades usando tabela businesses existente

-- 1. Adicionar campos de tracking na tabela businesses existente
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS current_stage_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS expected_close_date DATE,
ADD COLUMN IF NOT EXISTS actual_close_date DATE,
ADD COLUMN IF NOT EXISTS is_won BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_lost BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS lost_reason TEXT;

-- 2. Criar tabela de atividades/histórico para businesses
CREATE TABLE IF NOT EXISTS business_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id), -- Vendedor que fez a atividade
  
  -- Tipo de atividade
  activity_type VARCHAR(50) NOT NULL, -- 'stage_change', 'note', 'call', 'email', 'meeting', 'task', 'created'
  
  -- Conteúdo da atividade
  title VARCHAR(255) NOT NULL,
  description TEXT,
  
  -- Para mudanças de etapa
  old_stage business_stage,
  new_stage business_stage,
  
  -- Para tracking de tempo
  time_in_previous_stage INTERVAL, -- Tempo que ficou na etapa anterior
  
  -- Para mudanças de prioridade
  old_priority business_priority,
  new_priority business_priority,
  
  -- Para mudanças de valor
  old_value DECIMAL(12,2),
  new_value DECIMAL(12,2),
  
  -- Metadados extras
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Criar tabela de comentários/notas para businesses
CREATE TABLE IF NOT EXISTS business_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  
  -- Conteúdo da nota
  content TEXT NOT NULL,
  note_type VARCHAR(50) DEFAULT 'general', -- 'general', 'internal', 'client_facing', 'stage_change'
  
  -- Anexos (opcional)
  attachments JSONB DEFAULT '[]',
  
  -- Relacionado a uma atividade específica
  activity_id UUID REFERENCES business_activities(id),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar tabela de tarefas relacionadas aos businesses
CREATE TABLE IF NOT EXISTS business_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  assigned_to_user_id UUID NOT NULL REFERENCES users(id),
  created_by_user_id UUID NOT NULL REFERENCES users(id),
  
  -- Informações da tarefa
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type VARCHAR(50) DEFAULT 'general', -- 'call', 'email', 'meeting', 'follow_up', 'proposal', 'contract'
  
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
CREATE INDEX idx_business_activities_business_id ON business_activities(business_id);
CREATE INDEX idx_business_activities_user_id ON business_activities(user_id);
CREATE INDEX idx_business_activities_type ON business_activities(activity_type);
CREATE INDEX idx_business_activities_created_at ON business_activities(created_at DESC);

CREATE INDEX idx_business_notes_business_id ON business_notes(business_id);
CREATE INDEX idx_business_notes_user_id ON business_notes(user_id);
CREATE INDEX idx_business_notes_created_at ON business_notes(created_at DESC);

CREATE INDEX idx_business_tasks_business_id ON business_tasks(business_id);
CREATE INDEX idx_business_tasks_assigned_to ON business_tasks(assigned_to_user_id);
CREATE INDEX idx_business_tasks_status ON business_tasks(status);
CREATE INDEX idx_business_tasks_due_date ON business_tasks(due_date) WHERE status != 'completed';

-- 6. Atualizar campos existentes com valores padrão
UPDATE businesses 
SET current_stage_since = COALESCE(current_stage_since, created_at)
WHERE current_stage_since IS NULL;

-- 7. Criar trigger para tracking de mudança de etapa
CREATE OR REPLACE FUNCTION track_business_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a etapa mudou
  IF OLD.business_stage IS DISTINCT FROM NEW.business_stage THEN
    DECLARE
      time_in_stage INTERVAL := NOW() - OLD.current_stage_since;
      activity_user_id UUID := COALESCE(NEW.owner_user_id, OLD.owner_user_id);
    BEGIN
      -- Inserir atividade de mudança de etapa
      INSERT INTO business_activities (
        business_id,
        user_id,
        activity_type,
        title,
        description,
        old_stage,
        new_stage,
        time_in_previous_stage
      ) VALUES (
        NEW.id,
        activity_user_id,
        'stage_change',
        'Etapa alterada de "' || OLD.business_stage || '" para "' || NEW.business_stage || '"',
        'Tempo na etapa anterior: ' || COALESCE(time_in_stage::text, '0'),
        OLD.business_stage,
        NEW.business_stage,
        time_in_stage
      );
      
      -- Atualizar timestamp da etapa atual
      NEW.current_stage_since = NOW();
    END;
  END IF;
  
  -- Se a prioridade mudou
  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    INSERT INTO business_activities (
      business_id,
      user_id,
      activity_type,
      title,
      description,
      old_priority,
      new_priority
    ) VALUES (
      NEW.id,
      COALESCE(NEW.owner_user_id, OLD.owner_user_id),
      'priority_change',
      'Prioridade alterada de "' || OLD.priority || '" para "' || NEW.priority || '"',
      'Mudança de prioridade do negócio',
      OLD.priority,
      NEW.priority
    );
  END IF;
  
  -- Se o valor mudou
  IF OLD.estimated_value IS DISTINCT FROM NEW.estimated_value THEN
    INSERT INTO business_activities (
      business_id,
      user_id,
      activity_type,
      title,
      description,
      old_value,
      new_value
    ) VALUES (
      NEW.id,
      COALESCE(NEW.owner_user_id, OLD.owner_user_id),
      'value_change',
      'Valor alterado de R$ ' || COALESCE(OLD.estimated_value::text, '0') || ' para R$ ' || COALESCE(NEW.estimated_value::text, '0'),
      'Mudança no valor estimado do negócio',
      OLD.estimated_value,
      NEW.estimated_value
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_business_changes
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION track_business_stage_change();

-- 8. Criar trigger para registrar criação de business
CREATE OR REPLACE FUNCTION track_business_creation()
RETURNS TRIGGER AS $$
BEGIN
  -- Registrar criação do business
  INSERT INTO business_activities (
    business_id,
    user_id,
    activity_type,
    title,
    description
  ) VALUES (
    NEW.id,
    COALESCE(NEW.owner_user_id, NEW.created_by_user_id),
    'created',
    'Empresa criada',
    'Nova empresa "' || NEW.name || '" foi adicionada ao sistema'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_track_business_creation
  AFTER INSERT ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION track_business_creation();

-- 9. Criar triggers para updated_at
CREATE TRIGGER trigger_business_notes_updated_at
  BEFORE UPDATE ON business_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_business_tasks_updated_at
  BEFORE UPDATE ON business_tasks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 10. Comentários nas tabelas
COMMENT ON COLUMN businesses.current_stage_since IS 'Timestamp de quando entrou na etapa atual';
COMMENT ON COLUMN businesses.expected_close_date IS 'Data prevista para fechamento do negócio';
COMMENT ON COLUMN businesses.actual_close_date IS 'Data real de fechamento do negócio';
COMMENT ON COLUMN businesses.is_won IS 'Negócio foi ganho/fechado com sucesso';
COMMENT ON COLUMN businesses.is_lost IS 'Negócio foi perdido';
COMMENT ON COLUMN businesses.lost_reason IS 'Motivo da perda do negócio';

COMMENT ON TABLE business_activities IS 'Histórico de atividades e mudanças nas empresas/negócios';
COMMENT ON TABLE business_notes IS 'Comentários e notas das empresas/negócios';
COMMENT ON TABLE business_tasks IS 'Tarefas relacionadas às empresas/negócios';
