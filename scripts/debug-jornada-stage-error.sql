-- Script para debugar o erro de jornada_stage
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Verificar se o tipo jornada_stage ainda existe
SELECT 
  typname, 
  typtype,
  CASE 
    WHEN typtype = 'e' THEN 'enum'
    WHEN typtype = 'b' THEN 'base'
    WHEN typtype = 'c' THEN 'composite'
    ELSE 'other'
  END as type_description
FROM pg_type 
WHERE typname IN ('jornada_stage', 'campaign_status')
ORDER BY typname;

-- 2. Verificar colunas que ainda usam jornada_stage
SELECT 
  table_schema,
  table_name, 
  column_name, 
  udt_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE udt_name = 'jornada_stage'
ORDER BY table_name, column_name;

-- 3. Verificar funções que ainda usam jornada_stage
SELECT 
  proname as function_name,
  pg_get_function_arguments(oid) as arguments,
  pg_get_function_result(oid) as return_type
FROM pg_proc 
WHERE pg_get_function_arguments(oid) LIKE '%jornada_stage%'
   OR pg_get_function_result(oid) LIKE '%jornada_stage%'
ORDER BY proname;

-- 4. Verificar triggers que podem usar jornada_stage
SELECT 
  t.tgname as trigger_name,
  c.relname as table_name,
  p.proname as function_name,
  pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE pg_get_triggerdef(t.oid) LIKE '%jornada_stage%'
ORDER BY c.relname, t.tgname;

-- 5. Verificar estrutura atual da tabela jornada_tasks
SELECT 
  column_name, 
  udt_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'jornada_tasks'
AND column_name IN ('journey_stage', 'auto_trigger_stage')
ORDER BY column_name;

-- 6. Verificar se há views que usam jornada_stage
SELECT 
  table_name,
  view_definition
FROM information_schema.views 
WHERE view_definition LIKE '%jornada_stage%'
ORDER BY table_name;

-- 7. Verificar constraints que podem usar jornada_stage
SELECT 
  tc.constraint_name,
  tc.table_name,
  tc.constraint_type,
  cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
  ON tc.constraint_name = cc.constraint_name
WHERE cc.check_clause LIKE '%jornada_stage%'
   OR tc.constraint_name LIKE '%jornada_stage%'
ORDER BY tc.table_name, tc.constraint_name;
