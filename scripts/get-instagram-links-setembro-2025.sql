-- =================================================================================
-- RELATÓRIO: Links dos Vídeos do Instagram - Setembro 2025
-- Tabela: campaign_creators
-- Coluna: video_instagram_link
-- Filtro: campaigns.month = '2025-09' AND video_instagram_link IS NOT NULL
-- =================================================================================

-- QUERY PARA OBTER TODOS OS LINKS DOS VÍDEOS DO INSTAGRAM DE SETEMBRO 2025
SELECT
    cc.video_instagram_link,
    cc.created_at,
    campaigns.month as campaign_month,
    cc.status,
    -- Informações do criador
    creators.name as creator_name,
    creators.instagram_username as creator_instagram,
    -- Informações da campanha/empresa
    campaigns.business_name as business_name,
    campaigns.month_year as campaign_period
FROM campaign_creators cc
LEFT JOIN creators ON cc.creator_id = creators.id
LEFT JOIN campaigns ON cc.campaign_id = campaigns.id
WHERE campaigns.month = '2025-09'
    AND cc.video_instagram_link IS NOT NULL
    AND cc.video_instagram_link != ''
    AND cc.status = 'Ativo'
ORDER BY cc.created_at DESC;

-- =================================================================================
-- VERSÃO SIMPLIFICADA - APENAS OS LINKS PARA COPY/PASTE
-- =================================================================================

-- SELECT video_instagram_link
-- FROM campaign_creators cc
-- LEFT JOIN campaigns c ON cc.campaign_id = c.id
-- WHERE c.month = '2025-09'
--     AND cc.video_instagram_link IS NOT NULL
--     AND cc.video_instagram_link != ''
--     AND cc.status = 'Ativo'
-- ORDER BY cc.created_at DESC;

-- =================================================================================
-- CONTAGEM TOTAL DE VÍDEOS
-- =================================================================================

-- SELECT COUNT(*) as total_videos_setembro_2025
-- FROM campaign_creators cc
-- LEFT JOIN campaigns c ON cc.campaign_id = c.id
-- WHERE c.month = '2025-09'
--     AND cc.video_instagram_link IS NOT NULL
--     AND cc.video_instagram_link != ''
--     AND cc.status = 'Ativo';

-- =================================================================================
-- ESTATÍSTICAS POR CRIADOR
-- =================================================================================

-- SELECT
--     creators.name as creator_name,
--     COUNT(*) as total_videos
-- FROM campaign_creators cc
-- LEFT JOIN creators ON cc.creator_id = creators.id
-- LEFT JOIN campaigns c ON cc.campaign_id = c.id
-- WHERE c.month = '2025-09'
--     AND cc.video_instagram_link IS NOT NULL
--     AND cc.video_instagram_link != ''
--     AND cc.status = 'Ativo'
-- GROUP BY creators.name
-- ORDER BY total_videos DESC;

-- =================================================================================
-- ESTATÍSTICAS POR EMPRESA
-- =================================================================================

-- SELECT
--     campaigns.business_name,
--     COUNT(*) as total_videos
-- FROM campaign_creators cc
-- LEFT JOIN campaigns ON cc.campaign_id = campaigns.id
-- WHERE campaigns.month = '2025-09'
--     AND cc.video_instagram_link IS NOT NULL
--     AND cc.video_instagram_link != ''
--     AND cc.status = 'Ativo'
-- GROUP BY campaigns.business_name
-- ORDER BY total_videos DESC;