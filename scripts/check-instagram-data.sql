-- =================================================================================
-- VERIFICAR DADOS DO INSTAGRAM EM SETEMBRO 2025
-- =================================================================================

-- 1. Verificar se existem campanhas em setembro 2025
SELECT
    id,
    business_name,
    month,
    month_year,
    created_at
FROM campaigns
WHERE month = '2025-09'
ORDER BY created_at DESC;

-- 2. Verificar campaign_creators relacionados
SELECT
    cc.id,
    cc.campaign_id,
    cc.creator_id,
    cc.status,
    cc.video_instagram_link,
    cc.created_at,
    c.business_name,
    c.month
FROM campaign_creators cc
LEFT JOIN campaigns c ON cc.campaign_id = c.id
WHERE c.month = '2025-09'
ORDER BY cc.created_at DESC;

-- 3. Verificar todos os registros com video_instagram_link preenchido
SELECT
    cc.id,
    cc.video_instagram_link,
    cc.status,
    cc.created_at,
    c.business_name,
    c.month,
    cr.name as creator_name
FROM campaign_creators cc
LEFT JOIN campaigns c ON cc.campaign_id = c.id
LEFT JOIN creators cr ON cc.creator_id = cr.id
WHERE cc.video_instagram_link IS NOT NULL
    AND cc.video_instagram_link != ''
ORDER BY cc.created_at DESC
LIMIT 50;

-- 4. Contagem por status
SELECT
    cc.status,
    COUNT(*) as quantidade
FROM campaign_creators cc
LEFT JOIN campaigns c ON cc.campaign_id = c.id
WHERE c.month = '2025-09'
GROUP BY cc.status;

-- 5. Verificar se existem dados de outubro 2025 (próximo mês)
SELECT
    cc.id,
    cc.video_instagram_link,
    cc.status,
    cc.created_at,
    c.business_name,
    c.month
FROM campaign_creators cc
LEFT JOIN campaigns c ON cc.campaign_id = c.id
WHERE c.month = '2025-10'
    AND cc.video_instagram_link IS NOT NULL
    AND cc.video_instagram_link != ''
ORDER BY cc.created_at DESC;