-- Script para investigar TODOS os triggers e funções relacionadas a campanhas
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Listar TODOS os triggers na tabela campaigns
SELECT 
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled,
  tgtype as trigger_type,
  pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger 
WHERE tgrelid = 'campaigns'::regclass
ORDER BY tgname;

-- 2. Listar TODAS as funções que contêm 'jornada' ou 'campaign' no nome
SELECT 
  proname as function_name,
  pronamespace::regnamespace as schema_name,
  pg_get_functiondef(oid) as function_definition
FROM pg_proc 
WHERE proname ILIKE '%jornada%' 
   OR proname ILIKE '%campaign%'
   OR proname ILIKE '%trigger%'
ORDER BY proname;

-- 3. Verificar se há triggers em outras tabelas que podem afetar campaigns
SELECT 
  t.tgname as trigger_name,
  t.tgrelid::regclass as table_name,
  t.tgenabled as enabled,
  pg_get_triggerdef(t.oid) as trigger_definition
FROM pg_trigger t
JOIN pg_class c ON t.tgrelid = c.oid
WHERE pg_get_triggerdef(t.oid) ILIKE '%campaign%'
   OR pg_get_triggerdef(t.oid) ILIKE '%jornada%'
ORDER BY t.tgname;

-- 4. Verificar se há regras (rules) na tabela campaigns
SELECT 
  rulename,
  tablename,
  definition
FROM pg_rules 
WHERE tablename = 'campaigns';

-- 5. Verificar constraints e foreign keys que podem ter triggers
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'campaigns'::regclass
ORDER BY conname;
