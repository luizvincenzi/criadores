-- ⚠️ EXECUTE ESTE SQL NO SUPABASE DASHBOARD
-- Vá em: Database > SQL Editor > New Query
-- Cole este código e clique em "Run"

-- 1. Criar tabela de newsletter subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados do subscriber
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255), -- Nome completo (opcional)
  
  -- Segmentação
  audience_target VARCHAR(50) DEFAULT 'AMBOS', -- 'EMPRESAS', 'CRIADORES', 'AMBOS'
  source VARCHAR(100), -- De onde veio a inscrição: 'blog', 'homepage', 'popup', etc.
  variant VARCHAR(50), -- Variante do formulário: 'default', 'compact', 'featured'
  
  -- Status da inscrição
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'unsubscribed', 'bounced'
  confirmed_at TIMESTAMP WITH TIME ZONE, -- Quando confirmou o email (double opt-in)
  unsubscribed_at TIMESTAMP WITH TIME ZONE, -- Quando cancelou
  
  -- Dados de tracking
  ip_address INET, -- IP de onde se inscreveu
  user_agent TEXT, -- Browser usado
  referrer TEXT, -- Página de onde veio
  utm_source VARCHAR(100), -- UTM tracking
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  
  -- Preferências
  preferences JSONB DEFAULT '{
    "frequency": "weekly",
    "topics": ["marketing", "criadores", "empresas"],
    "format": "html"
  }'::jsonb,
  
  -- Metadados adicionais
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT newsletter_subscribers_status_check CHECK (status IN (
    'active', 'unsubscribed', 'bounced', 'pending_confirmation'
  )),
  CONSTRAINT newsletter_subscribers_audience_check CHECK (audience_target IN (
    'EMPRESAS', 'CRIADORES', 'AMBOS'
  ))
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_audience ON newsletter_subscribers(audience_target);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_source ON newsletter_subscribers(source);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_created_at ON newsletter_subscribers(created_at DESC);

-- 3. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_newsletter_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Criar trigger para updated_at
CREATE TRIGGER trigger_newsletter_subscribers_updated_at
  BEFORE UPDATE ON newsletter_subscribers
  FOR EACH ROW
  EXECUTE FUNCTION update_newsletter_subscribers_updated_at();

-- 5. Testar inserção
INSERT INTO newsletter_subscribers (email, audience_target, source, variant, status)
VALUES ('teste@criadores.app', 'AMBOS', 'test', 'default', 'active');

-- 6. Verificar se funcionou
SELECT * FROM newsletter_subscribers WHERE email = 'teste@criadores.app';

-- 7. Remover teste
DELETE FROM newsletter_subscribers WHERE email = 'teste@criadores.app';

-- ✅ PRONTO! Agora a tabela está criada e funcionando.
