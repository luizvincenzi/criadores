-- Script para remover TODOS os triggers relacionados a campanhas
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Listar todos os triggers na tabela campaigns ANTES da remoção
SELECT 
  'ANTES DA REMOÇÃO:' as status,
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgrelid = 'campaigns'::regclass
ORDER BY tgname;

-- 2. Remover TODOS os triggers da tabela campaigns
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT tgname 
        FROM pg_trigger 
        WHERE tgrelid = 'campaigns'::regclass
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.tgname || ' ON campaigns';
        RAISE NOTICE 'Trigger removido: %', trigger_record.tgname;
    END LOOP;
END $$;

-- 3. Verificar se todos os triggers foram removidos
SELECT 
  'APÓS REMOÇÃO:' as status,
  tgname as trigger_name,
  tgrelid::regclass as table_name,
  tgenabled as enabled
FROM pg_trigger 
WHERE tgrelid = 'campaigns'::regclass
ORDER BY tgname;

-- 4. Remover também triggers que podem estar em outras tabelas mas afetam campaigns
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    FOR trigger_record IN 
        SELECT t.tgname, t.tgrelid::regclass as table_name
        FROM pg_trigger t
        WHERE pg_get_triggerdef(t.oid) ILIKE '%campaign%'
           OR pg_get_triggerdef(t.oid) ILIKE '%jornada%'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.tgname || ' ON ' || trigger_record.table_name;
        RAISE NOTICE 'Trigger relacionado removido: % da tabela %', trigger_record.tgname, trigger_record.table_name;
    END LOOP;
END $$;

-- 5. Teste simples para verificar se a atualização funciona
-- (Descomente apenas para teste)
-- UPDATE campaigns 
-- SET status = 'Agendamentos', updated_at = NOW() 
-- WHERE business_id = '5032df40-0e0d-4949-8507-804f60000000' 
--   AND month = '202508' 
--   AND organization_id = '00000000-0000-0000-0000-000000000001';

-- 6. Verificar o resultado
SELECT 
  'VERIFICAÇÃO FINAL:' as status,
  id,
  title,
  status,
  business_id,
  month
FROM campaigns 
WHERE business_id = '5032df40-0e0d-4949-8507-804f60000000' 
  AND month = '202508'
LIMIT 1;
