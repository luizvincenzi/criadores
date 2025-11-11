-- Criar tabela para tokens de ativação permanentes
-- Execute no Supabase SQL Editor

CREATE TABLE IF NOT EXISTS activation_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  token TEXT NOT NULL UNIQUE,
  user_id UUID REFERENCES platform_users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_activation_tokens_email ON activation_tokens(email);
CREATE INDEX IF NOT EXISTS idx_activation_tokens_token ON activation_tokens(token);
CREATE INDEX IF NOT EXISTS idx_activation_tokens_user_id ON activation_tokens(user_id);

-- RLS (Row Level Security)
ALTER TABLE activation_tokens ENABLE ROW LEVEL SECURITY;

-- Política: Permitir leitura pública (necessário para validar tokens)
CREATE POLICY "Permitir leitura pública de tokens" ON activation_tokens
  FOR SELECT
  USING (true);

-- Política: Apenas service role pode inserir/atualizar
CREATE POLICY "Apenas service role pode modificar tokens" ON activation_tokens
  FOR ALL
  USING (auth.role() = 'service_role');

-- Comentários
COMMENT ON TABLE activation_tokens IS 'Tokens de ativação permanentes para onboarding de usuários';
COMMENT ON COLUMN activation_tokens.email IS 'Email do usuário que receberá o link de ativação';
COMMENT ON COLUMN activation_tokens.token IS 'Token único e permanente (UUID)';
COMMENT ON COLUMN activation_tokens.user_id IS 'Referência ao usuário em platform_users';
COMMENT ON COLUMN activation_tokens.expires_at IS 'Data de expiração do token (NULL = nunca expira)';
COMMENT ON COLUMN activation_tokens.used_at IS 'Data em que o token foi usado (NULL = ainda não usado)';

