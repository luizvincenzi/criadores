-- ========================================
-- VERIFICAÇÃO COMPLETA DO SETUP BOUSSOLÉ PARA DASHBOARD
-- ========================================
-- Execute este script no Supabase SQL Editor

-- 1. VERIFICAR USUÁRIO BOUSSOLÉ
SELECT 
  '=== USUÁRIO BOUSSOLÉ ===' as secao,
  id,
  email,
  full_name,
  role,
  business_id,
  is_active,
  created_at,
  updated_at,
  CASE 
    WHEN business_id IS NOT NULL THEN '✅ Business ID configurado'
    ELSE '❌ Business ID não configurado'
  END as status_business_id
FROM users 
WHERE LOWER(email) = LOWER('financeiro.brooftop@gmail.com');

-- 2. VERIFICAR EMPRESA BOUSSOLÉ
SELECT 
  '=== EMPRESA BOUSSOLÉ ===' as secao,
  id,
  name,
  business_stage,
  estimated_value,
  is_active,
  status,
  organization_id,
  owner_user_id,
  contact_info,
  address,
  created_at,
  updated_at,
  CASE 
    WHEN is_active = true THEN '✅ Empresa ativa'
    ELSE '❌ Empresa inativa'
  END as status_ativo
FROM businesses 
WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000';

-- 3. VERIFICAR DADOS RELACIONADOS À EMPRESA
SELECT
  '=== CAMPANHAS BOUSSOLÉ ===' as secao,
  COUNT(*) as total_campanhas,
  COUNT(CASE WHEN status = 'Agendamentos' THEN 1 END) as campanhas_agendamentos,
  COUNT(CASE WHEN status = 'Finalizado' THEN 1 END) as campanhas_finalizadas,
  STRING_AGG(DISTINCT status::text, ', ') as status_unicos
FROM campaigns
WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000';

SELECT 
  '=== TAREFAS BOUSSOLÉ ===' as secao,
  COUNT(*) as total_tarefas,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as tarefas_completas,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as tarefas_pendentes,
  STRING_AGG(DISTINCT status, ', ') as status_unicos
FROM business_tasks 
WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000';

SELECT 
  '=== NOTAS BOUSSOLÉ ===' as secao,
  COUNT(*) as total_notas,
  MAX(created_at) as ultima_nota,
  MIN(created_at) as primeira_nota
FROM business_notes 
WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000';

-- 4. VERIFICAR TABELA DE SNAPSHOTS
SELECT 
  '=== TABELA SNAPSHOTS ===' as secao,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'business_quarterly_snapshots'
    ) THEN '✅ Tabela business_quarterly_snapshots existe'
    ELSE '❌ Tabela business_quarterly_snapshots NÃO existe'
  END as status_tabela;

-- 5. VERIFICAR SNAPSHOTS EXISTENTES PARA BOUSSOLÉ
SELECT 
  '=== SNAPSHOTS BOUSSOLÉ ===' as secao,
  COUNT(*) as total_snapshots,
  STRING_AGG(quarter, ', ' ORDER BY year, quarter_number) as trimestres,
  MIN(created_at) as primeiro_snapshot,
  MAX(updated_at) as ultimo_update
FROM business_quarterly_snapshots 
WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000';

-- 6. VERIFICAR CONFIGURAÇÃO DO AMBIENTE
SELECT 
  '=== CONFIGURAÇÃO AMBIENTE ===' as secao,
  current_setting('app.settings.client_business_id', true) as client_business_id_setting,
  '55310ebd-0e0d-492e-8c34-cd4740000000' as boussole_business_id,
  CASE 
    WHEN current_setting('app.settings.client_business_id', true) = '55310ebd-0e0d-492e-8c34-cd4740000000' 
    THEN '✅ Client Business ID configurado para Boussolé'
    ELSE '⚠️ Client Business ID diferente ou não configurado'
  END as status_config;

-- 7. DIAGNÓSTICO COMPLETO
WITH diagnostico AS (
  SELECT 
    (SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER('financeiro.brooftop@gmail.com') AND business_id IS NOT NULL) as usuario_ok,
    (SELECT COUNT(*) FROM businesses WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000' AND is_active = true) as empresa_ok,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name = 'business_quarterly_snapshots') as tabela_ok,
    (SELECT COUNT(*) FROM campaigns WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000') as campanhas_count,
    (SELECT COUNT(*) FROM business_tasks WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000') as tarefas_count,
    (SELECT COUNT(*) FROM business_notes WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000') as notas_count
)
SELECT 
  '=== DIAGNÓSTICO FINAL ===' as secao,
  CASE 
    WHEN usuario_ok = 1 AND empresa_ok = 1 AND tabela_ok = 1 THEN '✅ SETUP COMPLETO - Dashboard pode funcionar'
    WHEN usuario_ok = 0 THEN '❌ PROBLEMA: Usuário não configurado corretamente'
    WHEN empresa_ok = 0 THEN '❌ PROBLEMA: Empresa Boussolé não ativa'
    WHEN tabela_ok = 0 THEN '❌ PROBLEMA: Tabela de snapshots não existe'
    ELSE '⚠️ SETUP PARCIAL - Verificar detalhes acima'
  END as status_geral,
  usuario_ok as usuario_configurado,
  empresa_ok as empresa_ativa,
  tabela_ok as tabela_snapshots_existe,
  campanhas_count as total_campanhas,
  tarefas_count as total_tarefas,
  notas_count as total_notas,
  CASE 
    WHEN campanhas_count + tarefas_count + notas_count > 0 THEN '✅ Dados existem para gerar snapshots'
    ELSE '⚠️ Poucos dados - snapshots serão básicos'
  END as status_dados
FROM diagnostico;

-- 8. AÇÕES RECOMENDADAS
SELECT 
  '=== AÇÕES RECOMENDADAS ===' as secao,
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM users WHERE LOWER(email) = LOWER('financeiro.brooftop@gmail.com') AND business_id IS NOT NULL)
    THEN '1. Executar: UPDATE users SET business_id = ''55310ebd-0e0d-492e-8c34-cd4740000000'' WHERE email = ''financeiro.brooftop@gmail.com'';'
    ELSE '1. ✅ Usuário já configurado'
  END as acao_usuario,
  
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM businesses WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000' AND is_active = true)
    THEN '2. Executar: UPDATE businesses SET is_active = true WHERE id = ''55310ebd-0e0d-492e-8c34-cd4740000000'';'
    ELSE '2. ✅ Empresa já ativa'
  END as acao_empresa,
  
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'business_quarterly_snapshots')
    THEN '3. Executar script: setup-dashboard-safe.sql'
    ELSE '3. ✅ Tabela já existe'
  END as acao_tabela,
  
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM business_quarterly_snapshots WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000')
    THEN '4. Executar script: integrate-dashboard-with-existing-data.sql'
    ELSE '4. ✅ Snapshots já existem'
  END as acao_snapshots;
