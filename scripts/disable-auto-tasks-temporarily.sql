-- Script para desabilitar temporariamente a criação automática de tarefas
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Criar uma versão simplificada da função que não cria tarefas automáticas
CREATE OR REPLACE FUNCTION trigger_create_jornada_tasks()
RETURNS TRIGGER AS $$
BEGIN
  -- Por enquanto, apenas retornar NEW sem criar tarefas automáticas
  -- Isso permite que o drag & drop funcione sem problemas de foreign key
  
  -- Log para debug (opcional)
  RAISE NOTICE 'Campanha % teve status alterado de % para %', 
    NEW.title, 
    COALESCE(OLD.status, 'NULL'), 
    NEW.status;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Verificar se a função foi atualizada
SELECT 
  proname as function_name,
  prosrc as source_code
FROM pg_proc 
WHERE proname = 'trigger_create_jornada_tasks';

-- 3. Verificar organizações disponíveis para debug futuro
SELECT 
  id,
  name,
  is_active,
  created_at
FROM organizations
ORDER BY created_at;

-- 4. Verificar se há campanhas que podem ser testadas
SELECT 
  c.id,
  c.title,
  c.status,
  b.name as business_name,
  c.organization_id
FROM campaigns c
JOIN businesses b ON c.business_id = b.id
LIMIT 5;
