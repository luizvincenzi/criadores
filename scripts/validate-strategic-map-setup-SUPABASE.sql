-- Script de validação da configuração do Mapa Estratégico
-- Para executar NO SUPABASE (sem comandos \echo)
-- Execute este script para verificar se tudo foi configurado corretamente

-- 1. Verificar se as tabelas existem
SELECT 'CHECKLIST: Tabelas' as check_type;
SELECT
  table_name,
  'EXISTS' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('strategic_maps', 'strategic_map_sections')
ORDER BY table_name;

-- 2. Verificar se o ENUM section_type existe
SELECT 'CHECKLIST: ENUM section_type' as check_type;
SELECT
  t.typname,
  STRING_AGG(e.enumlabel, ', ' ORDER BY e.enumsortorder) as enum_values
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'section_type'
GROUP BY t.typname;

-- 3. Verificar se há índices
SELECT 'CHECKLIST: Índices' as check_type;
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN ('strategic_maps', 'strategic_map_sections')
ORDER BY tablename, indexname;

-- 4. Verificar se RLS está ativado
SELECT 'CHECKLIST: RLS habilitado' as check_type;
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('strategic_maps', 'strategic_map_sections')
ORDER BY tablename;

-- 5. Verificar se há dados do Boussolé
SELECT 'CHECKLIST: Dados do Boussolé' as check_type;
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
SELECT 'CHECKLIST: Seções do Boussolé' as check_type;
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
SELECT 'CHECKLIST: Resumo de registros' as check_type;
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
SELECT 'CHECKLIST: Triggers' as check_type;
SELECT
  trigger_name,
  event_object_schema,
  event_object_table
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN ('strategic_maps', 'strategic_map_sections')
ORDER BY event_object_table, trigger_name;

-- RESUMO FINAL
SELECT 'STATUS FINAL' as check_type;
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'strategic_maps')
      AND EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'strategic_map_sections')
      AND EXISTS (SELECT typname FROM pg_type WHERE typname = 'section_type')
    THEN '✅ Setup completo e correto'
    ELSE '❌ Há problemas na configuração'
  END as validation_result;
