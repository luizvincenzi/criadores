-- Migration 028: Criar tabelas para o Portal de Clientes
-- Data: 2025-01-29
-- Descrição: Tabelas para autenticação e gestão do portal criadores.app

-- 1. Tabela de usuários do portal (empresas e criadores)
CREATE TABLE IF NOT EXISTS portal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  user_type TEXT NOT NULL CHECK (user_type IN ('empresa', 'criador')),
  entity_id UUID NOT NULL, -- ID da empresa ou criador
  full_name TEXT,
  avatar_url TEXT,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  organization_id UUID REFERENCES organizations(id) DEFAULT '00000000-0000-0000-0000-000000000001',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabela de sessões do portal
CREATE TABLE IF NOT EXISTS portal_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES portal_users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Configurações de acesso por empresa
CREATE TABLE IF NOT EXISTS business_portal_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  show_financial_data BOOLEAN DEFAULT false,
  show_creator_details BOOLEAN DEFAULT true,
  show_campaign_metrics BOOLEAN DEFAULT true,
  show_task_system BOOLEAN DEFAULT true,
  custom_branding JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Notificações do portal
CREATE TABLE IF NOT EXISTS portal_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES portal_users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')) DEFAULT 'info',
  is_read BOOLEAN DEFAULT false,
  related_entity_type TEXT, -- 'campaign', 'task', 'business'
  related_entity_id UUID,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Índices para performance
CREATE INDEX IF NOT EXISTS idx_portal_users_email ON portal_users(email);
CREATE INDEX IF NOT EXISTS idx_portal_users_entity ON portal_users(entity_id, user_type);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_token ON portal_sessions(token);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_user ON portal_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_business_portal_settings_business ON business_portal_settings(business_id);
CREATE INDEX IF NOT EXISTS idx_portal_notifications_user ON portal_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_portal_notifications_unread ON portal_notifications(user_id, is_read);

-- 6. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_portal_users_updated_at 
  BEFORE UPDATE ON portal_users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_business_portal_settings_updated_at 
  BEFORE UPDATE ON business_portal_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Função para limpar sessões expiradas
CREATE OR REPLACE FUNCTION clean_expired_portal_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM portal_sessions WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- 8. Comentários nas tabelas
COMMENT ON TABLE portal_users IS 'Usuários do portal criadores.app (empresas e criadores)';
COMMENT ON TABLE portal_sessions IS 'Sessões ativas do portal';
COMMENT ON TABLE business_portal_settings IS 'Configurações de acesso por empresa';
COMMENT ON TABLE portal_notifications IS 'Notificações do portal para usuários';
