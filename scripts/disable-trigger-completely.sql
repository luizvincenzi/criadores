-- Script para desabilitar completamente o trigger que está causando problemas
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Remover o trigger da tabela campaigns
DROP TRIGGER IF EXISTS trigger_campaigns_status_change ON campaigns;

-- 2. Verificar se o trigger foi removido
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgname = 'trigger_campaigns_status_change';

-- 3. Verificar campanhas existentes para confirmar que não há problemas
SELECT 
  id,
  title,
  status,
  business_id,
  month,
  organization_id
FROM campaigns 
ORDER BY updated_at DESC
LIMIT 5;

-- 4. Testar uma atualização manual para confirmar que funciona
-- (Descomente a linha abaixo apenas para teste)
-- UPDATE campaigns SET status = 'Agendamentos' WHERE id = '01364502-b653-4ee0-8c84-f62dba6390f4';
