-- Tabela para armazenar conexões Instagram dos businesses
CREATE TABLE IF NOT EXISTS instagram_connections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  instagram_user_id VARCHAR(255) NOT NULL,
  username VARCHAR(255) NOT NULL,
  account_type VARCHAR(50) DEFAULT 'PERSONAL',
  access_token TEXT NOT NULL,
  token_expires_at TIMESTAMP WITH TIME ZONE,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_sync TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar posts do Instagram
CREATE TABLE IF NOT EXISTS instagram_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  instagram_media_id VARCHAR(255) NOT NULL UNIQUE,
  media_type VARCHAR(50) NOT NULL, -- IMAGE, VIDEO, CAROUSEL_ALBUM
  media_url TEXT,
  permalink TEXT,
  caption TEXT,
  timestamp TIMESTAMP WITH TIME ZONE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  shares INTEGER DEFAULT 0,
  saves INTEGER DEFAULT 0,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para armazenar menções da empresa em posts de criadores
CREATE TABLE IF NOT EXISTS instagram_mentions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id UUID NOT NULL,
  creator_instagram_id VARCHAR(255),
  creator_username VARCHAR(255),
  post_id VARCHAR(255) NOT NULL,
  post_url TEXT,
  mention_type VARCHAR(50) DEFAULT 'username', -- username, hashtag, tag
  caption TEXT,
  timestamp TIMESTAMP WITH TIME ZONE,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  impressions INTEGER DEFAULT 0,
  reach INTEGER DEFAULT 0,
  engagement INTEGER DEFAULT 0,
  campaign_id UUID, -- Relacionar com campanha se aplicável
  detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_instagram_connections_business_id ON instagram_connections(business_id);
CREATE INDEX IF NOT EXISTS idx_instagram_connections_active ON instagram_connections(business_id, is_active);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_business_id ON instagram_posts(business_id);
CREATE INDEX IF NOT EXISTS idx_instagram_posts_timestamp ON instagram_posts(business_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_instagram_mentions_business_id ON instagram_mentions(business_id);
CREATE INDEX IF NOT EXISTS idx_instagram_mentions_campaign ON instagram_mentions(campaign_id);

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_instagram_connections_updated_at 
  BEFORE UPDATE ON instagram_connections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instagram_posts_updated_at 
  BEFORE UPDATE ON instagram_posts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS (Row Level Security) para garantir que businesses só vejam seus próprios dados
ALTER TABLE instagram_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE instagram_mentions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Businesses can only see their own Instagram connections" ON instagram_connections
  FOR ALL USING (business_id = current_setting('app.current_business_id')::UUID);

CREATE POLICY "Businesses can only see their own Instagram posts" ON instagram_posts
  FOR ALL USING (business_id = current_setting('app.current_business_id')::UUID);

CREATE POLICY "Businesses can only see their own Instagram mentions" ON instagram_mentions
  FOR ALL USING (business_id = current_setting('app.current_business_id')::UUID);

-- Comentários para documentação
COMMENT ON TABLE instagram_connections IS 'Armazena as conexões Instagram dos businesses';
COMMENT ON TABLE instagram_posts IS 'Armazena posts do Instagram com métricas';
COMMENT ON TABLE instagram_mentions IS 'Armazena menções da empresa em posts de criadores';

COMMENT ON COLUMN instagram_connections.access_token IS 'Token de acesso do Instagram (criptografado)';
COMMENT ON COLUMN instagram_connections.token_expires_at IS 'Data de expiração do token';
COMMENT ON COLUMN instagram_posts.instagram_media_id IS 'ID único do post no Instagram';
COMMENT ON COLUMN instagram_mentions.mention_type IS 'Tipo de menção: username, hashtag, tag';
