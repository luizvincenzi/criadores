-- Script para testar o fluxo completo: criar campanha com responsável e testar trigger
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar usuários disponíveis
SELECT 
  id,
  email,
  full_name,
  role
FROM users 
WHERE is_active = true
  AND organization_id = '00000000-0000-0000-0000-000000000001'
ORDER BY role, full_name;

-- 2. Verificar se o trigger foi atualizado
SELECT
  trigger_name,
  event_object_table as table_name,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'trigger_create_agendamento_task';

-- 3. Verificar campanhas existentes em "Reunião de briefing"
SELECT 
  id,
  title,
  status,
  month,
  responsible_user_id,
  business_id
FROM campaigns 
WHERE status = 'Reunião de briefing'
  AND organization_id = '00000000-0000-0000-0000-000000000001'
ORDER BY updated_at DESC
LIMIT 3;
