-- Script para verificar valores válidos do enum jornada_task_type
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar valores válidos do enum jornada_task_type
SELECT 
  unnest(enum_range(NULL::jornada_task_type)) AS valid_task_type
ORDER BY valid_task_type;

-- 2. Verificar estrutura da tabela jornada_tasks
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'jornada_tasks' 
  AND table_schema = 'public'
  AND column_name IN ('task_type', 'status', 'priority')
ORDER BY column_name;

-- 3. Verificar tarefas existentes e seus tipos
SELECT 
  task_type,
  COUNT(*) as count
FROM jornada_tasks 
GROUP BY task_type
ORDER BY count DESC;

-- 4. Verificar campanhas em "Reunião de briefing" (sem filtro de task_type)
SELECT 
  id,
  title,
  status,
  month,
  business_id
FROM campaigns 
WHERE status = 'Reunião de briefing'
  AND organization_id = '00000000-0000-0000-0000-000000000001'
ORDER BY updated_at DESC
LIMIT 3;
