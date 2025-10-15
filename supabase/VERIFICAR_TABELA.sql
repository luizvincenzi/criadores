-- =====================================================
-- VERIFICAR SE A TABELA business_content_social EXISTE
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- 1. Verificar se a tabela existe
SELECT 
  'business_content_social' as tabela,
  CASE 
    WHEN EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'business_content_social'
    ) THEN '✅ EXISTE'
    ELSE '❌ NÃO EXISTE'
  END as status;

-- 2. Contar registros
SELECT COUNT(*) as total_registros FROM business_content_social;

-- 3. Ver estrutura da tabela
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'business_content_social'
ORDER BY ordinal_position;

-- 4. Ver policies RLS
SELECT 
  policyname as policy_name,
  cmd as command,
  qual as using_expression
FROM pg_policies
WHERE tablename = 'business_content_social';

-- 5. Verificar se RLS está habilitado
SELECT 
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE tablename = 'business_content_social';

