-- ========================================
-- TESTE DOS VALORES DE ENUM CORRETOS
-- ========================================
-- Execute este script para verificar se os enums estão corretos

-- 1. VERIFICAR VALORES VÁLIDOS DOS ENUMS
SELECT 
  '=== ENUM CAMPAIGN_STATUS ===' as secao,
  unnest(enum_range(NULL::campaign_status)) AS valores_validos
ORDER BY valores_validos;

SELECT 
  '=== ENUM BUSINESS_STATUS ===' as secao,
  unnest(enum_range(NULL::business_status)) AS valores_validos
ORDER BY valores_validos;

SELECT 
  '=== ENUM TASK_STATUS ===' as secao,
  unnest(enum_range(NULL::task_status)) AS valores_validos
ORDER BY valores_validos;

-- 2. VERIFICAR SE BUSINESS_STAGE EXISTE
SELECT 
  '=== ENUM BUSINESS_STAGE ===' as secao,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_type 
      WHERE typname = 'business_stage'
    ) THEN 'Enum business_stage existe'
    ELSE 'Enum business_stage NÃO existe'
  END as status;

-- Se business_stage existir, mostrar valores
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'business_stage') THEN
    RAISE NOTICE 'Business stage enum existe, executando query...';
    PERFORM 1; -- Placeholder, a query real seria executada separadamente
  ELSE
    RAISE NOTICE 'Business stage enum NÃO existe';
  END IF;
END $$;

-- 3. TESTE SIMPLES DE CAMPANHAS
SELECT 
  '=== TESTE CAMPANHAS ===' as secao,
  COUNT(*) as total_campanhas,
  COUNT(CASE WHEN status = 'Agendamentos' THEN 1 END) as agendamentos,
  COUNT(CASE WHEN status = 'Finalizado' THEN 1 END) as finalizadas,
  STRING_AGG(DISTINCT status::text, ', ') as status_encontrados
FROM campaigns 
WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000';

-- 4. TESTE SIMPLES DE BUSINESSES
SELECT 
  '=== TESTE BUSINESSES ===' as secao,
  COUNT(*) as total_businesses,
  COUNT(CASE WHEN is_active = true THEN 1 END) as ativas,
  STRING_AGG(DISTINCT status::text, ', ') as status_encontrados
FROM businesses 
WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000';

-- 5. VERIFICAR SE TABELAS EXISTEM
SELECT 
  '=== VERIFICAR TABELAS ===' as secao,
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN '✅ Existe'
    ELSE '❌ Não existe'
  END as status
FROM information_schema.tables 
WHERE table_name IN ('businesses', 'campaigns', 'business_tasks', 'business_notes', 'business_quarterly_snapshots')
  AND table_schema = 'public'
ORDER BY table_name;

-- 6. TESTE DE BUSINESS_TASKS (se existir)
SELECT 
  '=== TESTE BUSINESS_TASKS ===' as secao,
  COUNT(*) as total_tarefas,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completas,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendentes,
  STRING_AGG(DISTINCT status, ', ') as status_encontrados
FROM business_tasks 
WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000';

-- 7. VERIFICAR USUÁRIO BOUSSOLÉ
SELECT 
  '=== USUÁRIO BOUSSOLÉ ===' as secao,
  email,
  business_id,
  role,
  is_active,
  CASE 
    WHEN business_id = '55310ebd-0e0d-492e-8c34-cd4740000000' THEN '✅ Business ID correto'
    WHEN business_id IS NULL THEN '❌ Business ID não configurado'
    ELSE '⚠️ Business ID diferente: ' || business_id
  END as status_business_id
FROM users 
WHERE LOWER(email) = LOWER('financeiro.brooftop@gmail.com');

-- 8. RESULTADO FINAL
SELECT 
  '=== DIAGNÓSTICO FINAL ===' as secao,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM users 
      WHERE LOWER(email) = LOWER('financeiro.brooftop@gmail.com') 
        AND business_id = '55310ebd-0e0d-492e-8c34-cd4740000000'
    ) AND EXISTS (
      SELECT 1 FROM businesses 
      WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000' 
        AND is_active = true
    ) THEN '✅ CONFIGURAÇÃO OK - Dashboard pode funcionar'
    ELSE '❌ PROBLEMAS ENCONTRADOS - Executar scripts de correção'
  END as resultado;
