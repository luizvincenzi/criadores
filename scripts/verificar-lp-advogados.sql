-- ============================================================================
-- SCRIPT DE VERIFICAÇÃO - LP Advogados
-- ============================================================================
-- Execute este script no Supabase SQL Editor para diagnosticar o problema
-- ============================================================================

-- 1. VERIFICAR LP BÁSICA
SELECT 
  '=== LP BÁSICA ===' as secao,
  id,
  slug,
  name,
  status,
  is_active,
  created_at
FROM landing_pages 
WHERE slug = 'empresas/social-media-advogados';

-- 2. CONTAR VERSÕES
SELECT 
  '=== TOTAL DE VERSÕES ===' as secao,
  COUNT(*) as total_versoes,
  MIN(version_number) as primeira_versao,
  MAX(version_number) as ultima_versao
FROM lp_versions 
WHERE lp_id = (
  SELECT id FROM landing_pages 
  WHERE slug = 'empresas/social-media-advogados'
);

-- 3. LISTAR TODAS AS VERSÕES (resumo)
SELECT 
  '=== HISTÓRICO DE VERSÕES ===' as secao,
  version_number,
  created_at,
  created_by,
  snapshot->'variables'->'hero'->>'headline' as headline_hero,
  LENGTH(snapshot::text) as tamanho_snapshot_bytes
FROM lp_versions 
WHERE lp_id = (
  SELECT id FROM landing_pages 
  WHERE slug = 'empresas/social-media-advogados'
)
ORDER BY version_number DESC;

-- 4. VER VERSÃO QUE O SISTEMA ESTÁ USANDO (última)
SELECT 
  '=== VERSÃO ATIVA (que aparece no site) ===' as secao,
  version_number,
  created_at,
  created_by,
  snapshot->'variables'->'hero'->>'headline' as headline,
  snapshot->'variables'->'hero'->>'subheadline' as subheadline,
  snapshot->'variables'->'problema'->>'titulo' as problema_titulo
FROM lp_versions 
WHERE lp_id = (
  SELECT id FROM landing_pages 
  WHERE slug = 'empresas/social-media-advogados'
)
ORDER BY version_number DESC
LIMIT 1;

-- 5. COMPARAR ÚLTIMAS 3 VERSÕES
SELECT 
  '=== COMPARAÇÃO ÚLTIMAS 3 VERSÕES ===' as secao,
  version_number,
  created_at,
  snapshot->'variables'->'hero'->>'headline' as headline,
  CASE 
    WHEN version_number = (
      SELECT MAX(version_number) 
      FROM lp_versions 
      WHERE lp_id = (SELECT id FROM landing_pages WHERE slug = 'empresas/social-media-advogados')
    ) THEN '← ESTA APARECE NO SITE'
    ELSE ''
  END as status
FROM lp_versions 
WHERE lp_id = (
  SELECT id FROM landing_pages 
  WHERE slug = 'empresas/social-media-advogados'
)
ORDER BY version_number DESC
LIMIT 3;

-- 6. VER SNAPSHOT COMPLETO DA ÚLTIMA VERSÃO (para debug)
SELECT 
  '=== SNAPSHOT COMPLETO DA VERSÃO ATIVA ===' as secao,
  version_number,
  snapshot
FROM lp_versions 
WHERE lp_id = (
  SELECT id FROM landing_pages 
  WHERE slug = 'empresas/social-media-advogados'
)
ORDER BY version_number DESC
LIMIT 1;

-- ============================================================================
-- INSTRUÇÕES:
-- ============================================================================
-- 1. Execute este script no Supabase SQL Editor
-- 2. Veja qual é a version_number da última versão
-- 3. Se você editou uma versão antiga, ela NÃO vai aparecer no site
-- 4. Você precisa criar uma NOVA versão com version_number MAIOR
-- ============================================================================

