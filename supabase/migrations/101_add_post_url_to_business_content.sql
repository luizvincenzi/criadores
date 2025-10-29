-- Migration 101: Adicionar campo post_url para business_content_social
-- Data: 2025-10-28
-- Descrição: Adiciona campo para armazenar URL da postagem publicada (Instagram, TikTok, YouTube, etc.)

-- Adicionar campo post_url
ALTER TABLE business_content_social 
ADD COLUMN IF NOT EXISTS post_url VARCHAR(500);

-- Comentário para documentação
COMMENT ON COLUMN business_content_social.post_url IS 'URL da postagem publicada (Instagram, TikTok, YouTube, etc.)';

-- Índice para performance (opcional, útil para buscar conteúdos com link)
CREATE INDEX IF NOT EXISTS idx_business_content_post_url 
ON business_content_social(post_url) 
WHERE post_url IS NOT NULL;

-- Log de sucesso
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Migration 101: Campo post_url adicionado com sucesso!';
END $$;

