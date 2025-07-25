-- Migração para adicionar integração com Google Calendar
-- Criado em: 2025-01-25

-- 1. Adicionar campo calendar_event_id na tabela jornada_tasks
ALTER TABLE jornada_tasks 
ADD COLUMN IF NOT EXISTS calendar_event_id VARCHAR(255);

-- 2. Adicionar campo calendar_synced para controlar status de sincronização
ALTER TABLE jornada_tasks 
ADD COLUMN IF NOT EXISTS calendar_synced BOOLEAN DEFAULT false;

-- 3. Adicionar campo calendar_sync_error para armazenar erros de sincronização
ALTER TABLE jornada_tasks 
ADD COLUMN IF NOT EXISTS calendar_sync_error TEXT;

-- 4. Adicionar campo calendar_last_sync para timestamp da última sincronização
ALTER TABLE jornada_tasks 
ADD COLUMN IF NOT EXISTS calendar_last_sync TIMESTAMP WITH TIME ZONE;

-- 5. Criar índice para busca por calendar_event_id
CREATE INDEX IF NOT EXISTS idx_jornada_tasks_calendar_event 
ON jornada_tasks(calendar_event_id) 
WHERE calendar_event_id IS NOT NULL;

-- 6. Criar índice para tarefas sincronizadas
CREATE INDEX IF NOT EXISTS idx_jornada_tasks_calendar_synced 
ON jornada_tasks(calendar_synced, due_date) 
WHERE due_date IS NOT NULL;

-- 7. Adicionar comentários para documentação
COMMENT ON COLUMN jornada_tasks.calendar_event_id IS 'ID do evento no Google Calendar';
COMMENT ON COLUMN jornada_tasks.calendar_synced IS 'Indica se a tarefa está sincronizada com o Google Calendar';
COMMENT ON COLUMN jornada_tasks.calendar_sync_error IS 'Último erro de sincronização com o Google Calendar';
COMMENT ON COLUMN jornada_tasks.calendar_last_sync IS 'Timestamp da última sincronização com o Google Calendar';

-- 8. Criar função para limpar dados de sincronização quando due_date é removida
CREATE OR REPLACE FUNCTION clear_calendar_sync_on_due_date_removal()
RETURNS TRIGGER AS $$
BEGIN
  -- Se due_date foi removida, limpar dados de sincronização
  IF OLD.due_date IS NOT NULL AND NEW.due_date IS NULL THEN
    NEW.calendar_event_id := NULL;
    NEW.calendar_synced := false;
    NEW.calendar_sync_error := NULL;
    NEW.calendar_last_sync := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Criar trigger para executar a função
DROP TRIGGER IF EXISTS trigger_clear_calendar_sync ON jornada_tasks;
CREATE TRIGGER trigger_clear_calendar_sync
  BEFORE UPDATE ON jornada_tasks
  FOR EACH ROW
  EXECUTE FUNCTION clear_calendar_sync_on_due_date_removal();

-- 10. Atualizar função de updated_at para incluir novos campos
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de updated_at se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_jornada_tasks_updated_at'
  ) THEN
    CREATE TRIGGER trigger_jornada_tasks_updated_at
      BEFORE UPDATE ON jornada_tasks
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;
