-- 🔍 DIAGNÓSTICO COMPLETO DO SISTEMA
-- Execute este script no Supabase SQL Editor para mapear TODOS os problemas

-- =====================================================
-- 1. ANÁLISE DE INCONSISTÊNCIAS DE DADOS
-- =====================================================

-- Campanhas com quantidade_criadores inconsistente
SELECT 
    'INCONSISTÊNCIA CRÍTICA' as tipo_problema,
    c.id as campaign_id,
    c.title,
    b.name as business_name,
    c.month,
    c.quantidade_criadores as quantidade_banco,
    COUNT(cc.id) as criadores_reais,
    (c.quantidade_criadores - COUNT(cc.id)) as diferenca,
    CASE 
        WHEN c.quantidade_criadores > COUNT(cc.id) THEN 'BANCO MAIOR QUE REAL'
        WHEN c.quantidade_criadores < COUNT(cc.id) THEN 'BANCO MENOR QUE REAL'
        ELSE 'CONSISTENTE'
    END as status_problema
FROM campaigns c
LEFT JOIN businesses b ON c.business_id = b.id
LEFT JOIN campaign_creators cc ON cc.campaign_id = c.id AND cc.status != 'Removido'
GROUP BY c.id, c.title, b.name, c.month, c.quantidade_criadores
HAVING c.quantidade_criadores != COUNT(cc.id)
ORDER BY ABS(c.quantidade_criadores - COUNT(cc.id)) DESC;

-- =====================================================
-- 2. CAMPANHAS COM PROBLEMAS DE DADOS
-- =====================================================

-- Campanhas sem business_id válido
SELECT 
    'BUSINESS INVÁLIDO' as tipo_problema,
    c.id as campaign_id,
    c.title,
    c.business_id,
    'Business não existe' as detalhes
FROM campaigns c
LEFT JOIN businesses b ON c.business_id = b.id
WHERE b.id IS NULL;

-- Campanhas com quantidade_criadores inválida
SELECT 
    'QUANTIDADE INVÁLIDA' as tipo_problema,
    c.id as campaign_id,
    c.title,
    b.name as business_name,
    c.quantidade_criadores,
    CASE 
        WHEN c.quantidade_criadores IS NULL THEN 'NULL'
        WHEN c.quantidade_criadores < 1 THEN 'MENOR QUE 1'
        WHEN c.quantidade_criadores > 50 THEN 'MAIOR QUE 50'
    END as detalhes
FROM campaigns c
LEFT JOIN businesses b ON c.business_id = b.id
WHERE c.quantidade_criadores IS NULL 
   OR c.quantidade_criadores < 1 
   OR c.quantidade_criadores > 50;

-- =====================================================
-- 3. CRIADORES COM PROBLEMAS
-- =====================================================

-- Criadores órfãos (sem campanha válida)
SELECT 
    'CRIADOR ÓRFÃO' as tipo_problema,
    cc.id as relation_id,
    cc.campaign_id,
    cc.creator_id,
    cr.name as creator_name,
    'Campanha não existe' as detalhes
FROM campaign_creators cc
LEFT JOIN campaigns c ON cc.campaign_id = c.id
LEFT JOIN creators cr ON cc.creator_id = cr.id
WHERE c.id IS NULL;

-- Criadores duplicados na mesma campanha
SELECT 
    'CRIADOR DUPLICADO' as tipo_problema,
    cc.campaign_id,
    cc.creator_id,
    cr.name as creator_name,
    COUNT(*) as quantidade_duplicatas
FROM campaign_creators cc
LEFT JOIN creators cr ON cc.creator_id = cr.id
WHERE cc.status != 'Removido'
GROUP BY cc.campaign_id, cc.creator_id, cr.name
HAVING COUNT(*) > 1;

-- =====================================================
-- 4. MÚLTIPLAS CAMPANHAS NO MESMO MÊS (REGRA VIOLADA)
-- =====================================================

SELECT 
    'MÚLTIPLAS CAMPANHAS/MÊS' as tipo_problema,
    b.name as business_name,
    c.month,
    COUNT(*) as quantidade_campanhas,
    STRING_AGG(c.title, ' | ') as titulos_campanhas
FROM campaigns c
JOIN businesses b ON c.business_id = b.id
GROUP BY b.name, c.month, c.business_id
HAVING COUNT(*) > 1
ORDER BY COUNT(*) DESC;

-- =====================================================
-- 5. RESUMO GERAL DO SISTEMA
-- =====================================================

SELECT 
    'RESUMO GERAL' as categoria,
    'Total de Campanhas' as metrica,
    COUNT(*)::text as valor
FROM campaigns
UNION ALL
SELECT 
    'RESUMO GERAL',
    'Total de Businesses',
    COUNT(*)::text
FROM businesses
UNION ALL
SELECT 
    'RESUMO GERAL',
    'Total de Criadores',
    COUNT(*)::text
FROM creators
UNION ALL
SELECT 
    'RESUMO GERAL',
    'Total de Relações Ativas',
    COUNT(*)::text
FROM campaign_creators 
WHERE status != 'Removido'
UNION ALL
SELECT 
    'RESUMO GERAL',
    'Campanhas Inconsistentes',
    COUNT(DISTINCT c.id)::text
FROM campaigns c
LEFT JOIN campaign_creators cc ON cc.campaign_id = c.id AND cc.status != 'Removido'
GROUP BY c.id, c.quantidade_criadores
HAVING c.quantidade_criadores != COUNT(cc.id);

-- =====================================================
-- 6. CAMPANHAS POR STATUS
-- =====================================================

SELECT
    'STATUS DISTRIBUTION' as categoria,
    CASE
        WHEN status IS NULL THEN 'SEM_STATUS'
        ELSE status::text
    END as status_campanha,
    COUNT(*) as quantidade
FROM campaigns
GROUP BY status
ORDER BY COUNT(*) DESC;
