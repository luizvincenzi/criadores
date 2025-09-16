-- Migration: Sistema de tracking completo para blog
-- Data: 2025-09-16
-- Descrição: Adiciona tracking de likes, shares, views e interações do blog

-- 1. Criar tabela de interações do blog
CREATE TABLE IF NOT EXISTS blog_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação do post
  post_id UUID NOT NULL, -- Referência ao post (pode ser slug ou ID)
  post_slug VARCHAR(255) NOT NULL,
  post_title VARCHAR(255) NOT NULL,
  
  -- Identificação do usuário (pode ser anônimo)
  user_id UUID, -- NULL para usuários anônimos
  user_email VARCHAR(255), -- Email se fornecido
  session_id VARCHAR(255), -- ID da sessão para tracking anônimo
  ip_address INET, -- IP do usuário
  user_agent TEXT, -- User agent do browser
  
  -- Tipo de interação
  interaction_type VARCHAR(50) NOT NULL, -- 'like', 'share', 'view', 'copy_link', 'newsletter_signup'
  
  -- Dados específicos da interação
  platform VARCHAR(50), -- Para shares: 'twitter', 'linkedin', 'whatsapp', 'instagram', 'copy'
  metadata JSONB DEFAULT '{}'::jsonb, -- Dados adicionais
  
  -- Localização geográfica (opcional)
  country VARCHAR(2), -- Código do país
  city VARCHAR(100), -- Cidade
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT blog_interactions_type_check CHECK (interaction_type IN (
    'like', 'share', 'view', 'copy_link', 'newsletter_signup', 'cta_click'
  )),
  CONSTRAINT blog_interactions_platform_check CHECK (platform IN (
    'twitter', 'linkedin', 'whatsapp', 'instagram', 'copy', 'email', 'sms', 'telegram'
  ) OR platform IS NULL)
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_blog_interactions_post_slug ON blog_interactions(post_slug);
CREATE INDEX IF NOT EXISTS idx_blog_interactions_type ON blog_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_blog_interactions_created_at ON blog_interactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_interactions_session ON blog_interactions(session_id);
CREATE INDEX IF NOT EXISTS idx_blog_interactions_user ON blog_interactions(user_id);

-- 3. Criar tabela de estatísticas agregadas do blog (para performance)
CREATE TABLE IF NOT EXISTS blog_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_slug VARCHAR(255) UNIQUE NOT NULL,
  post_title VARCHAR(255) NOT NULL,
  
  -- Contadores
  total_views INTEGER DEFAULT 0,
  total_likes INTEGER DEFAULT 0,
  total_shares INTEGER DEFAULT 0,
  total_copy_links INTEGER DEFAULT 0,
  
  -- Shares por plataforma
  twitter_shares INTEGER DEFAULT 0,
  linkedin_shares INTEGER DEFAULT 0,
  whatsapp_shares INTEGER DEFAULT 0,
  instagram_shares INTEGER DEFAULT 0,
  
  -- Métricas de engajamento
  engagement_rate DECIMAL(5,2) DEFAULT 0, -- (likes + shares) / views * 100
  bounce_rate DECIMAL(5,2) DEFAULT 0, -- % de usuários que saíram sem interagir
  
  -- Timestamps
  last_interaction_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Criar função para atualizar estatísticas
CREATE OR REPLACE FUNCTION update_blog_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir ou atualizar estatísticas do post
  INSERT INTO blog_stats (
    post_slug, 
    post_title,
    total_views,
    total_likes,
    total_shares,
    total_copy_links,
    twitter_shares,
    linkedin_shares,
    whatsapp_shares,
    instagram_shares,
    last_interaction_at
  )
  VALUES (
    NEW.post_slug,
    NEW.post_title,
    CASE WHEN NEW.interaction_type = 'view' THEN 1 ELSE 0 END,
    CASE WHEN NEW.interaction_type = 'like' THEN 1 ELSE 0 END,
    CASE WHEN NEW.interaction_type = 'share' THEN 1 ELSE 0 END,
    CASE WHEN NEW.interaction_type = 'copy_link' THEN 1 ELSE 0 END,
    CASE WHEN NEW.interaction_type = 'share' AND NEW.platform = 'twitter' THEN 1 ELSE 0 END,
    CASE WHEN NEW.interaction_type = 'share' AND NEW.platform = 'linkedin' THEN 1 ELSE 0 END,
    CASE WHEN NEW.interaction_type = 'share' AND NEW.platform = 'whatsapp' THEN 1 ELSE 0 END,
    CASE WHEN NEW.interaction_type = 'share' AND NEW.platform = 'instagram' THEN 1 ELSE 0 END,
    NEW.created_at
  )
  ON CONFLICT (post_slug) DO UPDATE SET
    total_views = blog_stats.total_views + CASE WHEN NEW.interaction_type = 'view' THEN 1 ELSE 0 END,
    total_likes = blog_stats.total_likes + CASE WHEN NEW.interaction_type = 'like' THEN 1 ELSE 0 END,
    total_shares = blog_stats.total_shares + CASE WHEN NEW.interaction_type = 'share' THEN 1 ELSE 0 END,
    total_copy_links = blog_stats.total_copy_links + CASE WHEN NEW.interaction_type = 'copy_link' THEN 1 ELSE 0 END,
    twitter_shares = blog_stats.twitter_shares + CASE WHEN NEW.interaction_type = 'share' AND NEW.platform = 'twitter' THEN 1 ELSE 0 END,
    linkedin_shares = blog_stats.linkedin_shares + CASE WHEN NEW.interaction_type = 'share' AND NEW.platform = 'linkedin' THEN 1 ELSE 0 END,
    whatsapp_shares = blog_stats.whatsapp_shares + CASE WHEN NEW.interaction_type = 'share' AND NEW.platform = 'whatsapp' THEN 1 ELSE 0 END,
    instagram_shares = blog_stats.instagram_shares + CASE WHEN NEW.interaction_type = 'share' AND NEW.platform = 'instagram' THEN 1 ELSE 0 END,
    engagement_rate = CASE 
      WHEN (blog_stats.total_views + CASE WHEN NEW.interaction_type = 'view' THEN 1 ELSE 0 END) > 0 
      THEN ((blog_stats.total_likes + blog_stats.total_shares + 
             CASE WHEN NEW.interaction_type = 'like' THEN 1 ELSE 0 END +
             CASE WHEN NEW.interaction_type = 'share' THEN 1 ELSE 0 END) * 100.0) / 
           (blog_stats.total_views + CASE WHEN NEW.interaction_type = 'view' THEN 1 ELSE 0 END)
      ELSE 0 
    END,
    last_interaction_at = NEW.created_at,
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar trigger para atualizar estatísticas automaticamente
CREATE TRIGGER trigger_update_blog_stats
  AFTER INSERT ON blog_interactions
  FOR EACH ROW
  EXECUTE FUNCTION update_blog_stats();

-- 6. Criar função para obter estatísticas de um post
CREATE OR REPLACE FUNCTION get_blog_post_stats(slug_param VARCHAR(255))
RETURNS TABLE (
  post_slug VARCHAR(255),
  total_views INTEGER,
  total_likes INTEGER,
  total_shares INTEGER,
  engagement_rate DECIMAL(5,2),
  platform_breakdown JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    bs.post_slug,
    bs.total_views,
    bs.total_likes,
    bs.total_shares,
    bs.engagement_rate,
    jsonb_build_object(
      'twitter', bs.twitter_shares,
      'linkedin', bs.linkedin_shares,
      'whatsapp', bs.whatsapp_shares,
      'instagram', bs.instagram_shares,
      'copy_links', bs.total_copy_links
    ) as platform_breakdown
  FROM blog_stats bs
  WHERE bs.post_slug = slug_param;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar view para relatórios de blog
CREATE OR REPLACE VIEW blog_analytics AS
SELECT 
  bs.post_slug,
  bs.post_title,
  bs.total_views,
  bs.total_likes,
  bs.total_shares,
  bs.engagement_rate,
  bs.last_interaction_at,
  
  -- Top interações das últimas 24h
  (SELECT COUNT(*) FROM blog_interactions bi 
   WHERE bi.post_slug = bs.post_slug 
   AND bi.created_at >= NOW() - INTERVAL '24 hours') as interactions_24h,
   
  -- Top interações da última semana
  (SELECT COUNT(*) FROM blog_interactions bi 
   WHERE bi.post_slug = bs.post_slug 
   AND bi.created_at >= NOW() - INTERVAL '7 days') as interactions_7d,
   
  bs.created_at,
  bs.updated_at
FROM blog_stats bs
ORDER BY bs.total_views DESC, bs.engagement_rate DESC;

-- 8. Inserir dados iniciais para posts existentes (se houver)
-- Esta parte será executada apenas se já existirem posts
DO $$
BEGIN
  -- Verificar se existe a tabela de posts do blog
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'posts') THEN
    INSERT INTO blog_stats (post_slug, post_title, total_views)
    SELECT 
      slug as post_slug,
      title as post_title,
      COALESCE(view_count, 0) as total_views
    FROM posts 
    WHERE status = 'PUBLICADO'
    ON CONFLICT (post_slug) DO NOTHING;
  END IF;
END $$;

-- 9. Comentários sobre o sistema
-- Este sistema permite:
-- 1. Tracking completo de interações (likes, shares, views)
-- 2. Suporte a usuários anônimos via session_id
-- 3. Estatísticas agregadas para performance
-- 4. Relatórios e analytics detalhados
-- 5. Suporte a múltiplas plataformas de compartilhamento
-- 6. Geolocalização opcional
-- 7. Metadados flexíveis via JSONB
