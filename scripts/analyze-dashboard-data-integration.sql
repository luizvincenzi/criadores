-- ========================================
-- ANÁLISE DA INTEGRAÇÃO DE DADOS DO DASHBOARD
-- ========================================
-- Este script analisa se o dashboard está usando dados reais do banco

-- 1. VERIFICAR DADOS REAIS DA EMPRESA BOUSSOLÉ
SELECT 
  '=== EMPRESA BOUSSOLÉ - DADOS REAIS ===' as secao,
  id,
  name,
  business_stage,
  estimated_value,
  status,
  is_active,
  contact_info,
  address,
  metrics,
  created_at
FROM businesses 
WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000';

-- 2. CAMPANHAS REAIS DA BOUSSOLÉ
SELECT 
  '=== CAMPANHAS BOUSSOLÉ - DADOS REAIS ===' as secao,
  COUNT(*) as total_campanhas,
  COUNT(CASE WHEN status = 'Finalizado' THEN 1 END) as finalizadas,
  COUNT(CASE WHEN status = 'Agendamentos' THEN 1 END) as em_agendamentos,
  COUNT(CASE WHEN status = 'Entrega final' THEN 1 END) as em_entrega,
  COUNT(CASE WHEN status = 'Reunião de briefing' THEN 1 END) as em_briefing,
  STRING_AGG(DISTINCT status::text, ', ') as status_encontrados,
  STRING_AGG(DISTINCT title, ', ') as titulos_campanhas
FROM campaigns 
WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000';

-- 3. TAREFAS REAIS DA BOUSSOLÉ
SELECT 
  '=== TAREFAS BOUSSOLÉ - DADOS REAIS ===' as secao,
  COUNT(*) as total_tarefas,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completas,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pendentes,
  COUNT(CASE WHEN status = 'in_progress' THEN 1 END) as em_progresso,
  STRING_AGG(DISTINCT status, ', ') as status_encontrados,
  STRING_AGG(DISTINCT title, ', ') as titulos_tarefas
FROM business_tasks 
WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000';

-- 4. NOTAS REAIS DA BOUSSOLÉ
SELECT 
  '=== NOTAS BOUSSOLÉ - DADOS REAIS ===' as secao,
  COUNT(*) as total_notas,
  MAX(created_at) as ultima_nota,
  MIN(created_at) as primeira_nota,
  STRING_AGG(DISTINCT note_type, ', ') as tipos_notas
FROM business_notes 
WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000';

-- 5. SNAPSHOTS ATUAIS DO DASHBOARD
SELECT 
  '=== SNAPSHOTS DASHBOARD - DADOS ATUAIS ===' as secao,
  quarter,
  year,
  quarter_number,
  kpis->>'ocupacao' as ocupacao,
  kpis->>'ticket' as ticket,
  kpis->>'nps' as nps,
  digital_presence->>'instagram' as instagram_seguidores,
  digital_presence->'google'->>'rating' as google_rating,
  four_ps_status->>'produto' as produto_status,
  four_ps_status->>'promocao' as promocao_status,
  LENGTH(notes) as tamanho_notas,
  created_at,
  updated_at
FROM business_quarterly_snapshots 
WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000'
ORDER BY year, quarter_number;

-- 6. ANÁLISE DE CORRELAÇÃO: DADOS REAIS vs SNAPSHOTS
WITH dados_reais AS (
  SELECT 
    (SELECT COUNT(*) FROM campaigns WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000') as campanhas_reais,
    (SELECT COUNT(*) FROM business_tasks WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000') as tarefas_reais,
    (SELECT COUNT(*) FROM business_notes WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000') as notas_reais,
    (SELECT estimated_value FROM businesses WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000') as valor_estimado_real,
    (SELECT business_stage FROM businesses WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000') as estagio_real,
    (SELECT contact_info->>'instagram' FROM businesses WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000') as instagram_real
),
dados_snapshot AS (
  SELECT 
    quarter,
    (kpis->>'ocupacao')::numeric as ocupacao_snapshot,
    (digital_presence->>'instagram')::numeric as instagram_snapshot,
    four_ps_status->>'produto' as produto_snapshot,
    notes
  FROM business_quarterly_snapshots 
  WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000'
  ORDER BY year DESC, quarter_number DESC
  LIMIT 1
)
SELECT 
  '=== ANÁLISE DE CORRELAÇÃO ===' as secao,
  dr.campanhas_reais,
  dr.tarefas_reais,
  dr.notas_reais,
  dr.valor_estimado_real,
  dr.estagio_real::text as estagio_real,
  dr.instagram_real,
  ds.quarter as ultimo_snapshot,
  ds.ocupacao_snapshot,
  ds.instagram_snapshot,
  ds.produto_snapshot,
  CASE 
    WHEN dr.campanhas_reais > 0 AND ds.ocupacao_snapshot > 0 THEN '✅ Snapshots baseados em dados reais'
    WHEN dr.campanhas_reais = 0 AND ds.ocupacao_snapshot = 0 THEN '⚠️ Sem dados reais, snapshots zerados'
    ELSE '❌ Snapshots não refletem dados reais'
  END as status_correlacao,
  CASE 
    WHEN dr.instagram_real IS NOT NULL AND dr.instagram_real != '' AND ds.instagram_snapshot > 0 THEN '✅ Instagram configurado'
    WHEN dr.instagram_real IS NULL OR dr.instagram_real = '' THEN '⚠️ Instagram não configurado na empresa'
    ELSE '❌ Inconsistência no Instagram'
  END as status_instagram
FROM dados_reais dr
CROSS JOIN dados_snapshot ds;

-- 7. VERIFICAR SE SNAPSHOTS FORAM GERADOS AUTOMATICAMENTE
SELECT 
  '=== ORIGEM DOS SNAPSHOTS ===' as secao,
  quarter,
  CASE 
    WHEN notes LIKE '%automaticamente%' THEN '🤖 Gerado automaticamente'
    WHEN notes LIKE '%manual%' THEN '👤 Criado manualmente'
    WHEN notes IS NULL OR notes = '' THEN '❓ Origem desconhecida'
    ELSE '📝 ' || LEFT(notes, 50) || '...'
  END as origem,
  created_at,
  updated_at,
  CASE 
    WHEN updated_at > created_at THEN '🔄 Foi atualizado'
    ELSE '📅 Nunca atualizado'
  END as status_atualizacao
FROM business_quarterly_snapshots 
WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000'
ORDER BY created_at;

-- 8. RECOMENDAÇÕES BASEADAS NA ANÁLISE
WITH analise AS (
  SELECT 
    (SELECT COUNT(*) FROM campaigns WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000') as campanhas,
    (SELECT COUNT(*) FROM business_tasks WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000') as tarefas,
    (SELECT COUNT(*) FROM business_notes WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000') as notas,
    (SELECT COUNT(*) FROM business_quarterly_snapshots WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000') as snapshots
)
SELECT 
  '=== RECOMENDAÇÕES ===' as secao,
  CASE 
    WHEN campanhas = 0 THEN '1. ⚠️ Criar campanhas de exemplo para a Boussolé'
    ELSE '1. ✅ Campanhas existem (' || campanhas || ')'
  END as recomendacao_campanhas,
  CASE 
    WHEN tarefas = 0 THEN '2. ⚠️ Criar tarefas de exemplo para a Boussolé'
    ELSE '2. ✅ Tarefas existem (' || tarefas || ')'
  END as recomendacao_tarefas,
  CASE 
    WHEN notas = 0 THEN '3. ⚠️ Criar notas de exemplo para a Boussolé'
    ELSE '3. ✅ Notas existem (' || notas || ')'
  END as recomendacao_notas,
  CASE 
    WHEN snapshots = 0 THEN '4. 🚨 EXECUTAR script de integração para gerar snapshots'
    ELSE '4. ✅ Snapshots existem (' || snapshots || ') - Verificar se estão atualizados'
  END as recomendacao_snapshots,
  '5. 🔄 Executar função generate_snapshot_from_existing_data() para atualizar com dados reais' as recomendacao_atualizacao
FROM analise;

-- 9. VERIFICAR CONFIGURAÇÃO DO USUÁRIO FINANCEIRO
SELECT 
  '=== USUÁRIO FINANCEIRO ===' as secao,
  u.email,
  u.business_id,
  u.role,
  u.is_active,
  b.name as empresa_nome,
  b.is_active as empresa_ativa,
  CASE 
    WHEN u.business_id = b.id AND u.is_active = true AND b.is_active = true THEN '✅ Configuração correta'
    WHEN u.business_id != b.id THEN '❌ Business ID incorreto'
    WHEN u.is_active = false THEN '❌ Usuário inativo'
    WHEN b.is_active = false THEN '❌ Empresa inativa'
    ELSE '⚠️ Verificar configuração'
  END as status_configuracao
FROM users u
LEFT JOIN businesses b ON u.business_id = b.id
WHERE LOWER(u.email) = LOWER('financeiro.brooftop@gmail.com');
