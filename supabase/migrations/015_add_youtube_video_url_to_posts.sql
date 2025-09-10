-- Adicionar campo youtube_video_url à tabela posts
-- Este campo armazenará URLs de vídeos do YouTube relacionados aos posts do blog

ALTER TABLE posts 
ADD COLUMN youtube_video_url TEXT;

-- Adicionar comentário para documentar o campo
COMMENT ON COLUMN posts.youtube_video_url IS 'URL do vídeo do YouTube relacionado ao post (opcional)';

-- Criar índice para performance nas consultas por posts com vídeo
CREATE INDEX idx_posts_youtube_video ON posts(youtube_video_url) WHERE youtube_video_url IS NOT NULL;

-- Adicionar constraint para validar URLs do YouTube (opcional)
ALTER TABLE posts 
ADD CONSTRAINT check_youtube_url 
CHECK (
  youtube_video_url IS NULL OR 
  youtube_video_url ~ '^https?://(www\.)?(youtube\.com/watch\?v=|youtu\.be/|youtube\.com/embed/)[a-zA-Z0-9_-]+.*$'
);
