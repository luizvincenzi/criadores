-- Adicionar colunas para links dos vídeos na tabela campaign_creators
-- Estas colunas armazenarão os links dos vídeos postados no Instagram e TikTok

ALTER TABLE campaign_creators 
ADD COLUMN video_instagram_link TEXT,
ADD COLUMN video_tiktok_link TEXT;

-- Criar índices para performance nas consultas por links
CREATE INDEX idx_campaign_creators_video_instagram ON campaign_creators(video_instagram_link) WHERE video_instagram_link IS NOT NULL;
CREATE INDEX idx_campaign_creators_video_tiktok ON campaign_creators(video_tiktok_link) WHERE video_tiktok_link IS NOT NULL;

-- Comentários para documentação
COMMENT ON COLUMN campaign_creators.video_instagram_link IS 'Link do vídeo postado no Instagram pelo criador';
COMMENT ON COLUMN campaign_creators.video_tiktok_link IS 'Link do vídeo postado no TikTok pelo criador';

-- Atualizar registros existentes para incluir campos vazios nos deliverables se necessário
-- Isso garante que todos os registros tenham a estrutura correta
UPDATE campaign_creators 
SET deliverables = jsonb_set(
    COALESCE(deliverables, '{}'::jsonb),
    '{content_links}',
    COALESCE(deliverables->'content_links', '[]'::jsonb)
)
WHERE deliverables IS NULL OR deliverables->'content_links' IS NULL;
