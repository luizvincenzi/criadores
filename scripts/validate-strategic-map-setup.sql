-- Script de validação da configuração do Mapa Estratégico
-- Execute este script para verificar se tudo foi configurado corretamente

\echo '========================================='
\echo 'VALIDAÇÃO DE CONFIGURAÇÃO DO MAPA ESTRATÉGICO'
\echo '========================================='

-- 1. Verificar se as tabelas existem
\echo ''
\echo '1. Verificando tabelas...'
SELECT
  table_name,
  'EXISTS' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('strategic_maps', 'strategic_map_sections')
ORDER BY table_name;

-- 2. Verificar se o ENUM section_type existe
\echo ''
\echo '2. Verificando ENUM section_type...'
SELECT
  t.typname,
  STRING_AGG(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'section_type'
GROUP BY t.typname;

-- 3. Verificar se há índices
\echo ''
\echo '3. Verificando índices...'
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('strategic_maps', 'strategic_map_sections')
ORDER BY tablename, indexname;

-- 4. Verificar se RLS está ativado
\echo ''
\echo '4. Verificando RLS (Row Level Security)...'
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('strategic_maps', 'strategic_map_sections')
ORDER BY tablename;

-- 5. Verificar se há dados do Boussolé
\echo ''
\echo '5. Verificando dados do Boussolé...'
SELECT
  sm.id,
  b.name as business_name,
  sm.quarter,
  sm.year,
  sm.status,
  COUNT(sms.id) as total_sections
FROM strategic_maps sm
JOIN businesses b ON sm.business_id = b.id
LEFT JOIN strategic_map_sections sms ON sm.id = sms.strategic_map_id
WHERE LOWER(b.name) LIKE '%bouss%'
GROUP BY sm.id, b.name, sm.quarter, sm.year, sm.status
ORDER BY sm.year DESC, sm.quarter DESC;

-- 6. Listar seções do Boussolé
\echo ''
\echo '6. Seções carregadas para Boussolé...'
SELECT
  sms.section_type,
  sms.section_order,
  sms.is_ai_generated,
  CASE
    WHEN sms.content IS NOT NULL AND sms.content != '{}'::jsonb THEN 'HAS DATA'
    ELSE 'EMPTY'
  END as content_status
FROM strategic_maps sm
JOIN businesses b ON sm.business_id = b.id
LEFT JOIN strategic_map_sections sms ON sm.id = sms.strategic_map_id
WHERE LOWER(b.name) LIKE '%bouss%'
ORDER BY sm.year DESC, sm.quarter DESC, sms.section_order;

-- 7. Contar total de registros
\echo ''
\echo '7. Resumo de registros...'
SELECT
  'strategic_maps' as table_name,
  COUNT(*) as total_records
FROM strategic_maps
UNION ALL
SELECT
  'strategic_map_sections' as table_name,
  COUNT(*) as total_records
FROM strategic_map_sections;

-- 8. Listar triggers
\echo ''
\echo '8. Verificando triggers...'
SELECT
  trigger_name,
  event_object_schema,
  event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN ('strategic_maps', 'strategic_map_sections')
ORDER BY event_object_table, trigger_name;

\echo ''
\echo '========================================='
\echo 'VALIDAÇÃO CONCLUÍDA'
\echo '========================================='
