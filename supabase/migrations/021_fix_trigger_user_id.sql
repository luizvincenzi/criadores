-- Migration: Corrigir trigger para lidar com user_id null
-- Data: 2025-01-22
-- Descrição: Corrige o trigger para não falhar quando user_id é null

-- 1. Recriar trigger para tracking de mudança de etapa com tratamento de user_id null
CREATE OR REPLACE FUNCTION track_business_stage_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Se a etapa mudou
  IF OLD.business_stage IS DISTINCT FROM NEW.business_stage THEN
    DECLARE
      time_in_stage INTERVAL := NOW() - COALESCE(OLD.current_stage_since, OLD.created_at);
      activity_user_id UUID := COALESCE(NEW.owner_user_id, OLD.owner_user_id);
    BEGIN
      -- Só inserir atividade se tiver um user_id válido
      IF activity_user_id IS NOT NULL THEN
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
          'Etapa alterada de "' || COALESCE(OLD.business_stage::text, 'N/A') || '" para "' || COALESCE(NEW.business_stage::text, 'N/A') || '"',
          'Tempo na etapa anterior: ' || COALESCE(time_in_stage::text, '0'),
          OLD.business_stage,
          NEW.business_stage,
          time_in_stage
        );
      END IF;
      
      -- Atualizar timestamp da etapa atual
      NEW.current_stage_since = NOW();
    END;
  END IF;
  
  -- Se a prioridade mudou
  IF OLD.priority IS DISTINCT FROM NEW.priority THEN
    DECLARE
      activity_user_id UUID := COALESCE(NEW.owner_user_id, OLD.owner_user_id);
    BEGIN
      -- Só inserir atividade se tiver um user_id válido
      IF activity_user_id IS NOT NULL THEN
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
          activity_user_id,
          'priority_change',
          'Prioridade alterada de "' || COALESCE(OLD.priority::text, 'N/A') || '" para "' || COALESCE(NEW.priority::text, 'N/A') || '"',
          'Mudança de prioridade do negócio',
          OLD.priority,
          NEW.priority
        );
      END IF;
    END;
  END IF;
  
  -- Se o valor mudou
  IF OLD.estimated_value IS DISTINCT FROM NEW.estimated_value THEN
    DECLARE
      activity_user_id UUID := COALESCE(NEW.owner_user_id, OLD.owner_user_id);
    BEGIN
      -- Só inserir atividade se tiver um user_id válido
      IF activity_user_id IS NOT NULL THEN
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
          activity_user_id,
          'value_change',
          'Valor alterado de R$ ' || COALESCE(OLD.estimated_value::text, '0') || ' para R$ ' || COALESCE(NEW.estimated_value::text, '0'),
          'Mudança no valor estimado do negócio',
          OLD.estimated_value,
          NEW.estimated_value
        );
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Recriar trigger para registrar criação de business com tratamento de user_id null
CREATE OR REPLACE FUNCTION track_business_creation()
RETURNS TRIGGER AS $$
BEGIN
  DECLARE
    activity_user_id UUID := COALESCE(NEW.owner_user_id, NEW.responsible_user_id);
  BEGIN
    -- Só registrar criação se tiver um user_id válido
    IF activity_user_id IS NOT NULL THEN
      -- Registrar criação do business
      INSERT INTO business_activities (
        business_id,
        user_id,
        activity_type,
        title,
        description
      ) VALUES (
        NEW.id,
        activity_user_id,
        'created',
        'Empresa criada',
        'Nova empresa "' || NEW.name || '" foi adicionada ao sistema'
      );
    END IF;
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Garantir que current_stage_since tenha valor padrão
UPDATE businesses 
SET current_stage_since = COALESCE(current_stage_since, created_at, NOW())
WHERE current_stage_since IS NULL;

-- 4. Criar um usuário padrão do sistema se não existir (opcional)
INSERT INTO users (
  id,
  organization_id,
  name,
  email,
  role,
  is_active,
  created_at,
  updated_at
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  'Sistema',
  'sistema@crm.com',
  'system',
  true,
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- 5. Adicionar nova etapa "Contrato assinado" ao enum business_stage
ALTER TYPE business_stage ADD VALUE IF NOT EXISTS 'Contrato assinado';

-- 6. Comentários
COMMENT ON FUNCTION track_business_stage_change() IS 'Trigger que registra mudanças de etapa, prioridade e valor, com tratamento para user_id null';
COMMENT ON FUNCTION track_business_creation() IS 'Trigger que registra criação de empresas, com tratamento para user_id null';
