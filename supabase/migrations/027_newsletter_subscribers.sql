-- Migration: Sistema de Newsletter Subscribers
-- Data: 2025-09-16
-- Descrição: Adiciona tabela para armazenar emails de newsletter

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

-- 5. Criar view para estatísticas de newsletter
CREATE OR REPLACE VIEW newsletter_stats AS
SELECT 
  COUNT(*) as total_subscribers,
  COUNT(*) FILTER (WHERE status = 'active') as active_subscribers,
  COUNT(*) FILTER (WHERE status = 'unsubscribed') as unsubscribed_count,
  COUNT(*) FILTER (WHERE audience_target = 'EMPRESAS') as empresas_count,
  COUNT(*) FILTER (WHERE audience_target = 'CRIADORES') as criadores_count,
  COUNT(*) FILTER (WHERE audience_target = 'AMBOS') as ambos_count,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as new_this_week,
  COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days') as new_this_month,
  
  -- Top sources
  (SELECT source FROM newsletter_subscribers 
   WHERE status = 'active' AND source IS NOT NULL 
   GROUP BY source ORDER BY COUNT(*) DESC LIMIT 1) as top_source,
   
  -- Growth rate (últimos 30 dias vs 30 dias anteriores)
  CASE 
    WHEN COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days') > 0
    THEN ROUND(
      (COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '30 days')::DECIMAL / 
       COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days')) * 100 - 100, 2
    )
    ELSE 0
  END as growth_rate_30d
FROM newsletter_subscribers;

-- 6. Criar função para inscrever usuário
CREATE OR REPLACE FUNCTION subscribe_to_newsletter(
  p_email VARCHAR(255),
  p_audience_target VARCHAR(50) DEFAULT 'AMBOS',
  p_source VARCHAR(100) DEFAULT 'blog',
  p_variant VARCHAR(50) DEFAULT 'default',
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_referrer TEXT DEFAULT NULL
)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  subscriber_id UUID
) AS $$
DECLARE
  v_subscriber_id UUID;
  v_existing_status VARCHAR(50);
BEGIN
  -- Verificar se email já existe
  SELECT id, status INTO v_subscriber_id, v_existing_status
  FROM newsletter_subscribers 
  WHERE email = p_email;
  
  IF v_subscriber_id IS NOT NULL THEN
    -- Email já existe
    IF v_existing_status = 'unsubscribed' THEN
      -- Reativar inscrição
      UPDATE newsletter_subscribers 
      SET 
        status = 'active',
        audience_target = p_audience_target,
        source = p_source,
        variant = p_variant,
        unsubscribed_at = NULL,
        updated_at = NOW()
      WHERE id = v_subscriber_id;
      
      RETURN QUERY SELECT true, 'Inscrição reativada com sucesso!'::TEXT, v_subscriber_id;
    ELSE
      -- Já está ativo
      RETURN QUERY SELECT false, 'Email já está inscrito na newsletter.'::TEXT, v_subscriber_id;
    END IF;
  ELSE
    -- Novo subscriber
    INSERT INTO newsletter_subscribers (
      email,
      audience_target,
      source,
      variant,
      ip_address,
      user_agent,
      referrer,
      status
    ) VALUES (
      p_email,
      p_audience_target,
      p_source,
      p_variant,
      p_ip_address,
      p_user_agent,
      p_referrer,
      'active'
    ) RETURNING id INTO v_subscriber_id;
    
    RETURN QUERY SELECT true, 'Inscrição realizada com sucesso!'::TEXT, v_subscriber_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- 7. Comentários sobre o sistema
-- Este sistema permite:
-- 1. Armazenamento seguro de emails de newsletter
-- 2. Segmentação por audiência (empresas, criadores, ambos)
-- 3. Tracking de origem e campanhas UTM
-- 4. Gestão de status (ativo, cancelado, bounced)
-- 5. Estatísticas e analytics de crescimento
-- 6. Função para inscrição com validação automática
-- 7. Suporte a reativação de inscrições canceladas
