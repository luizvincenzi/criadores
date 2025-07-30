-- Script para testar o trigger de criação de tarefas de agendamento
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar campanhas em "Reunião de briefing"
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

-- 2. Verificar tarefas existentes antes do teste
SELECT 
  COUNT(*) as total_tarefas_antes
FROM jornada_tasks 
WHERE task_type = 'scheduling_coordination'
  AND organization_id = '00000000-0000-0000-0000-000000000001';

-- 3. Simular mudança de status (escolha um ID da consulta acima)
-- DESCOMENTE a linha abaixo e substitua pelo ID de uma campanha real
-- UPDATE campaigns 
-- SET status = 'Agendamentos', updated_at = NOW()
-- WHERE id = 'COLE_AQUI_O_ID_DA_CAMPANHA';

-- 4. Verificar se a tarefa foi criada (execute após o UPDATE acima)
SELECT 
  t.id,
  t.title,
  t.description,
  t.assigned_to,
  u.email as assigned_email,
  t.due_date,
  t.created_at,
  t.campaign_id
FROM jornada_tasks t
JOIN users u ON t.assigned_to = u.id
WHERE t.task_type = 'scheduling_coordination'
  AND t.organization_id = '00000000-0000-0000-0000-000000000001'
ORDER BY t.created_at DESC
LIMIT 1;

-- 5. Verificar total de tarefas após o teste
SELECT 
  COUNT(*) as total_tarefas_depois
FROM jornada_tasks 
WHERE task_type = 'scheduling_coordination'
  AND organization_id = '00000000-0000-0000-0000-000000000001';
