-- Migration: Criar sistema de audit logs
-- Criado em: 2025-01-15
-- Descrição: Implementa sistema completo de auditoria para rastrear mudanças no sistema

-- 1. Criar tabela audit_log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Informações da entidade afetada
  entity_type VARCHAR(50) NOT NULL, -- 'business', 'creator', 'campaign', 'user'
  entity_id VARCHAR(255) NOT NULL, -- ID da entidade afetada
  entity_name VARCHAR(255), -- Nome da entidade para referência
  
  -- Informações da ação
  action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'status_change'
  field_name VARCHAR(100), -- Campo que foi alterado (para updates)
  old_value TEXT, -- Valor anterior
  new_value TEXT, -- Novo valor
  
  -- Informações do usuário
  user_id UUID REFERENCES users(id), -- Usuário que fez a ação
  user_email VARCHAR(255), -- Email do usuário para referência
  
  -- Metadados e contexto
  metadata JSONB DEFAULT '{}'::jsonb, -- Dados adicionais
  ip_address INET, -- IP do usuário
  user_agent TEXT, -- User agent do browser
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_organization ON audit_log(organization_id);

-- 3. Criar tabela detailed_logs (para compatibilidade com Google Sheets)
CREATE TABLE IF NOT EXISTS detailed_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Campos do Google Sheets
  timestamp_column TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_email VARCHAR(255),
  action_type VARCHAR(100),
  entity_type VARCHAR(50),
  entity_id VARCHAR(255),
  entity_name VARCHAR(255),
  field_changed VARCHAR(100),
  old_value TEXT,
  new_value TEXT,
  additional_info TEXT,
  
  -- Metadados
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar índices para detailed_logs
CREATE INDEX IF NOT EXISTS idx_detailed_logs_timestamp ON detailed_logs(timestamp_column);
CREATE INDEX IF NOT EXISTS idx_detailed_logs_entity ON detailed_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_detailed_logs_user ON detailed_logs(user_email);
CREATE INDEX IF NOT EXISTS idx_detailed_logs_organization ON detailed_logs(organization_id);

-- 5. Criar função para inserir audit log automaticamente
CREATE OR REPLACE FUNCTION insert_audit_log(
  p_organization_id UUID,
  p_entity_type VARCHAR(50),
  p_entity_id VARCHAR(255),
  p_entity_name VARCHAR(255),
  p_action VARCHAR(50),
  p_field_name VARCHAR(100) DEFAULT NULL,
  p_old_value TEXT DEFAULT NULL,
  p_new_value TEXT DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_user_email VARCHAR(255) DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  log_id UUID;
BEGIN
  INSERT INTO audit_log (
    organization_id,
    entity_type,
    entity_id,
    entity_name,
    action,
    field_name,
    old_value,
    new_value,
    user_id,
    user_email,
    metadata,
    ip_address,
    user_agent
  ) VALUES (
    p_organization_id,
    p_entity_type,
    p_entity_id,
    p_entity_name,
    p_action,
    p_field_name,
    p_old_value,
    p_new_value,
    p_user_id,
    p_user_email,
    p_metadata,
    p_ip_address,
    p_user_agent
  ) RETURNING id INTO log_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar triggers para auditoria automática

-- Trigger para businesses
CREATE OR REPLACE FUNCTION audit_businesses_changes() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM insert_audit_log(
      NEW.organization_id,
      'business',
      NEW.id::text,
      NEW.name,
      'create',
      NULL,
      NULL,
      NULL,
      NULL,
      'system',
      jsonb_build_object('trigger', 'auto_insert')
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Verificar mudanças específicas
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      PERFORM insert_audit_log(
        NEW.organization_id,
        'business',
        NEW.id::text,
        NEW.name,
        'status_change',
        'status',
        OLD.status,
        NEW.status,
        NULL,
        'system',
        jsonb_build_object('trigger', 'auto_update')
      );
    END IF;
    
    IF OLD.current_plan IS DISTINCT FROM NEW.current_plan THEN
      PERFORM insert_audit_log(
        NEW.organization_id,
        'business',
        NEW.id::text,
        NEW.name,
        'update',
        'current_plan',
        OLD.current_plan,
        NEW.current_plan,
        NULL,
        'system',
        jsonb_build_object('trigger', 'auto_update')
      );
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM insert_audit_log(
      OLD.organization_id,
      'business',
      OLD.id::text,
      OLD.name,
      'delete',
      NULL,
      NULL,
      NULL,
      NULL,
      'system',
      jsonb_build_object('trigger', 'auto_delete')
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para creators
CREATE OR REPLACE FUNCTION audit_creators_changes() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM insert_audit_log(
      NEW.organization_id,
      'creator',
      NEW.id::text,
      NEW.nome,
      'create',
      NULL,
      NULL,
      NULL,
      NULL,
      'system',
      jsonb_build_object('trigger', 'auto_insert')
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Verificar mudanças específicas
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      PERFORM insert_audit_log(
        NEW.organization_id,
        'creator',
        NEW.id::text,
        NEW.nome,
        'status_change',
        'status',
        OLD.status,
        NEW.status,
        NULL,
        'system',
        jsonb_build_object('trigger', 'auto_update')
      );
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM insert_audit_log(
      OLD.organization_id,
      'creator',
      OLD.id::text,
      OLD.nome,
      'delete',
      NULL,
      NULL,
      NULL,
      NULL,
      'system',
      jsonb_build_object('trigger', 'auto_delete')
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para campaigns
CREATE OR REPLACE FUNCTION audit_campaigns_changes() RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM insert_audit_log(
      NEW.organization_id,
      'campaign',
      NEW.id::text,
      NEW.title,
      'create',
      NULL,
      NULL,
      NULL,
      NULL,
      'system',
      jsonb_build_object('trigger', 'auto_insert')
    );
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    -- Verificar mudanças específicas
    IF OLD.status IS DISTINCT FROM NEW.status THEN
      PERFORM insert_audit_log(
        NEW.organization_id,
        'campaign',
        NEW.id::text,
        NEW.title,
        'status_change',
        'status',
        OLD.status,
        NEW.status,
        NULL,
        'system',
        jsonb_build_object('trigger', 'auto_update')
      );
    END IF;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM insert_audit_log(
      OLD.organization_id,
      'campaign',
      OLD.id::text,
      OLD.title,
      'delete',
      NULL,
      NULL,
      NULL,
      NULL,
      'system',
      jsonb_build_object('trigger', 'auto_delete')
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 7. Aplicar triggers às tabelas
DROP TRIGGER IF EXISTS trigger_audit_businesses ON businesses;
CREATE TRIGGER trigger_audit_businesses
  AFTER INSERT OR UPDATE OR DELETE ON businesses
  FOR EACH ROW EXECUTE FUNCTION audit_businesses_changes();

DROP TRIGGER IF EXISTS trigger_audit_creators ON creators;
CREATE TRIGGER trigger_audit_creators
  AFTER INSERT OR UPDATE OR DELETE ON creators
  FOR EACH ROW EXECUTE FUNCTION audit_creators_changes();

DROP TRIGGER IF EXISTS trigger_audit_campaigns ON campaigns;
CREATE TRIGGER trigger_audit_campaigns
  AFTER INSERT OR UPDATE OR DELETE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION audit_campaigns_changes();

-- 8. Inserir log de criação do sistema de auditoria
INSERT INTO audit_log (
  organization_id,
  entity_type,
  entity_id,
  entity_name,
  action,
  user_email,
  metadata
) SELECT 
  id,
  'system',
  'audit_system',
  'Sistema de Auditoria',
  'create',
  'sistema@crmcriadores.com',
  jsonb_build_object(
    'migration', '002_audit_logs',
    'version', '1.0',
    'created_at', NOW()
  )
FROM organizations
LIMIT 1;
