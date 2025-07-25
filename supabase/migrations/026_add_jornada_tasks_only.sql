-- MIGRAÇÃO: Adicionar apenas tabela jornada_tasks (sem conflitos)
-- Data: 2025-01-24
-- Descrição: Adiciona tabela de tarefas da jornada sem conflitar com schema existente

-- 1. Criar ENUM para tipos de tarefas da jornada (apenas se não existir)
DO $$ BEGIN
    CREATE TYPE jornada_task_type AS ENUM (
      'briefing_preparation',     -- Preparação do briefing
      'briefing_meeting',         -- Reunião de briefing
      'creator_selection',        -- Seleção de criadores
      'creator_contact',          -- Contato com criadores
      'scheduling_coordination',  -- Coordenação de agendamentos
      'content_approval',         -- Aprovação de conteúdo
      'delivery_review',          -- Revisão de entregas
      'final_approval',           -- Aprovação final
      'campaign_closure',         -- Fechamento da campanha
      'follow_up',               -- Follow-up pós-campanha
      'custom'                   -- Tarefa personalizada
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Criar ENUM para estágios da jornada (apenas se não existir)
DO $$ BEGIN
    CREATE TYPE jornada_stage AS ENUM (
      'Reunião de briefing',
      'Agendamentos', 
      'Entrega final',
      'Finalizado'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. Criar tabela jornada_tasks (apenas se não existir)
CREATE TABLE IF NOT EXISTS jornada_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Relacionamento com campanhas
  campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Identificação da jornada (para campanhas agrupadas por business/mês)
  business_name VARCHAR(255) NOT NULL,
  campaign_month VARCHAR(50) NOT NULL,
  journey_stage jornada_stage NOT NULL,
  
  -- Informações da tarefa
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type jornada_task_type DEFAULT 'custom',
  
  -- Status e prioridade
  status task_status DEFAULT 'todo',
  priority task_priority DEFAULT 'medium',
  
  -- Atribuição
  assigned_to UUID REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  
  -- Datas
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Estimativas e tracking
  estimated_hours INTEGER,
  actual_hours INTEGER,
  
  -- Automação e triggers
  is_auto_generated BOOLEAN DEFAULT false,
  auto_trigger_stage jornada_stage, -- Em qual estágio esta tarefa deve ser criada automaticamente
  
  -- Dependências
  depends_on_task_id UUID REFERENCES jornada_tasks(id),
  blocks_stage_progression BOOLEAN DEFAULT false, -- Se true, impede progressão para próximo estágio
  
  -- Metadados
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar índices para performance (apenas se não existirem)
DO $$ BEGIN
    CREATE INDEX idx_jornada_tasks_organization ON jornada_tasks(organization_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_jornada_tasks_campaign ON jornada_tasks(campaign_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_jornada_tasks_business ON jornada_tasks(business_id);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_jornada_tasks_journey ON jornada_tasks(business_name, campaign_month, journey_stage);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_jornada_tasks_assigned_to ON jornada_tasks(assigned_to);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_jornada_tasks_status ON jornada_tasks(organization_id, status);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_jornada_tasks_stage ON jornada_tasks(journey_stage, status);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_jornada_tasks_due_date ON jornada_tasks(due_date) WHERE due_date IS NOT NULL;
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_jornada_tasks_auto_trigger ON jornada_tasks(auto_trigger_stage, is_auto_generated);
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

DO $$ BEGIN
    CREATE INDEX idx_jornada_tasks_dependencies ON jornada_tasks(depends_on_task_id) WHERE depends_on_task_id IS NOT NULL;
EXCEPTION
    WHEN duplicate_table THEN null;
END $$;

-- 5. Aplicar trigger de updated_at (apenas se função existir)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        CREATE TRIGGER update_jornada_tasks_updated_at 
          BEFORE UPDATE ON jornada_tasks
          FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 6. Aplicar audit trigger (apenas se função existir)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'audit_trigger_function') THEN
        CREATE TRIGGER audit_jornada_tasks 
          AFTER INSERT OR UPDATE OR DELETE ON jornada_tasks
          FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
    END IF;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 7. Comentários para documentação
COMMENT ON TABLE jornada_tasks IS 'Tarefas específicas da jornada das campanhas, organizadas por estágios';
COMMENT ON COLUMN jornada_tasks.business_name IS 'Nome da empresa (para agrupamento de campanhas)';
COMMENT ON COLUMN jornada_tasks.campaign_month IS 'Mês da campanha (para agrupamento)';
COMMENT ON COLUMN jornada_tasks.journey_stage IS 'Estágio atual da jornada onde a tarefa se aplica';
COMMENT ON COLUMN jornada_tasks.is_auto_generated IS 'Indica se a tarefa foi criada automaticamente pelo sistema';
COMMENT ON COLUMN jornada_tasks.auto_trigger_stage IS 'Estágio que deve disparar a criação automática desta tarefa';
COMMENT ON COLUMN jornada_tasks.blocks_stage_progression IS 'Se true, impede que a campanha avance para o próximo estágio até esta tarefa ser concluída';
