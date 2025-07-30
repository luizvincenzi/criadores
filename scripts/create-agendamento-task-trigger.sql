-- Script para criar trigger que gera tarefa quando status muda para "Agendamentos"
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Primeiro, verificar se o usuário criadores.ops@gmail.com existe
SELECT
  id,
  email,
  role
FROM users
WHERE email = 'criadores.ops@gmail.com';

-- Criar o usuário se não existir
INSERT INTO users (email, full_name, role, organization_id, is_active)
VALUES (
  'criadores.ops@gmail.com',
  'Operações Criadores',
  'user',
  '00000000-0000-0000-0000-000000000001',
  true
)
ON CONFLICT (email) DO NOTHING;

-- 2. Criar função para gerar tarefa de agendamento
CREATE OR REPLACE FUNCTION create_agendamento_task()
RETURNS TRIGGER AS $$
DECLARE
  ops_user_id UUID;
  business_name TEXT;
  task_title TEXT;
  task_description TEXT;
BEGIN
  -- Só executar se o status mudou de "Reunião de briefing" para "Agendamentos"
  IF OLD.status = 'Reunião de briefing' AND NEW.status = 'Agendamentos' THEN

    -- Primeiro, tentar usar o responsável da campanha
    IF NEW.responsible_user_id IS NOT NULL THEN
      SELECT id INTO ops_user_id
      FROM users
      WHERE id = NEW.responsible_user_id
        AND is_active = true
      LIMIT 1;
    END IF;

    -- Se não há responsável definido, usar criadores.ops@gmail.com
    IF ops_user_id IS NULL THEN
      SELECT id INTO ops_user_id
      FROM users
      WHERE email = 'criadores.ops@gmail.com'
        AND is_active = true
      LIMIT 1;
    END IF;

    -- Se ainda não encontrar, usar um usuário admin como fallback
    IF ops_user_id IS NULL THEN
      SELECT id INTO ops_user_id
      FROM users
      WHERE role = 'admin'
        AND organization_id = NEW.organization_id
        AND is_active = true
      LIMIT 1;
    END IF;
    
    -- Buscar nome do business
    SELECT name INTO business_name
    FROM businesses
    WHERE id = NEW.business_id;
    
    -- Preparar título e descrição da tarefa
    task_title := 'Iniciar agendamentos - ' || COALESCE(business_name, 'Business') || ' (' || NEW.month || ')';
    task_description := 'Precisamos iniciar o agendamento para a campanha "' || NEW.title || '" do business ' ||
                       COALESCE(business_name, 'N/A') || ' no mês ' || NEW.month ||
                       '. Status alterado em ' || TO_CHAR(NOW(), 'DD/MM/YYYY às HH24:MI') || '.';

    -- Adicionar informação sobre o responsável se houver
    IF NEW.responsible_user_id IS NOT NULL THEN
      task_description := task_description || ' Responsável pela campanha: ' ||
                         (SELECT full_name FROM users WHERE id = NEW.responsible_user_id);
    END IF;
    
    -- Criar a tarefa apenas se temos um usuário válido
    IF ops_user_id IS NOT NULL THEN
      INSERT INTO jornada_tasks (
        organization_id,
        campaign_id,
        business_id,
        business_name,
        campaign_month,
        journey_stage,
        title,
        description,
        task_type,
        status,
        priority,
        assigned_to,
        created_by,
        due_date,
        is_auto_generated,
        created_at,
        updated_at
      ) VALUES (
        NEW.organization_id,
        NEW.id,
        NEW.business_id,
        COALESCE(business_name, 'N/A'),
        NEW.month,
        'Agendamentos',
        task_title,
        task_description,
        'scheduling_coordination',
        'todo',
        'high',
        ops_user_id,
        ops_user_id,
        NOW() + INTERVAL '2 days', -- Prazo de 2 dias
        true,
        NOW(),
        NOW()
      );
      
      RAISE NOTICE 'Tarefa de agendamento criada para campanha % do business %', NEW.title, business_name;
    ELSE
      RAISE WARNING 'Não foi possível criar tarefa: usuário de operações não encontrado';
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Criar o trigger
DROP TRIGGER IF EXISTS trigger_create_agendamento_task ON campaigns;
CREATE TRIGGER trigger_create_agendamento_task
  AFTER UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION create_agendamento_task();

-- 4. Verificar se o trigger foi criado
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'trigger_create_agendamento_task';

-- 5. Teste (descomente para testar)
-- UPDATE campaigns 
-- SET status = 'Agendamentos', updated_at = NOW()
-- WHERE id = '01364502-b653-4ee0-8c84-f62dba6390f4';

-- 6. Verificar se a tarefa foi criada (após o teste)
-- SELECT 
--   title,
--   description,
--   assigned_to,
--   created_at,
--   due_date
-- FROM jornada_tasks 
-- WHERE campaign_id = '01364502-b653-4ee0-8c84-f62dba6390f4'
--   AND task_type = 'scheduling'
-- ORDER BY created_at DESC
-- LIMIT 1;
