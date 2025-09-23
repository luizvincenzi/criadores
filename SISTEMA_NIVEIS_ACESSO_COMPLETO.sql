-- 🎯 SISTEMA COMPLETO DE NÍVEIS DE ACESSO - PLATAFORMA CRIADORES.APP
-- ================================================================

-- 1. ATUALIZAR ENUM DE USER_ROLE COM NOVOS NÍVEIS
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'business_owner';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'creator';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'creator_strategist';

-- 2. ADICIONAR CAMPOS ESPECÍFICOS PARA OS NOVOS NÍVEIS
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id),
ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES creators(id),
ADD COLUMN IF NOT EXISTS creator_type VARCHAR(50) DEFAULT 'creator', -- 'creator' ou 'creator_strategist'
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'basic', -- 'basic', 'premium', 'enterprise'
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS features_enabled JSONB DEFAULT '{}'::jsonb;

-- 3. CRIAR TABELA DE PLANOS E RECURSOS
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  type VARCHAR(50) NOT NULL, -- 'business', 'creator', 'creator_strategist'
  price_monthly DECIMAL(10,2) DEFAULT 0,
  price_yearly DECIMAL(10,2) DEFAULT 0,
  features JSONB NOT NULL DEFAULT '{}'::jsonb,
  limits JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. INSERIR PLANOS PADRÃO
INSERT INTO subscription_plans (name, type, price_monthly, price_yearly, features, limits) VALUES
-- PLANOS PARA EMPRESAS
('Empresa Básico', 'business', 297.00, 2970.00, '{
  "dashboard": true,
  "campaign_management": true,
  "creator_discovery": true,
  "basic_analytics": true,
  "email_support": true,
  "max_campaigns": 5,
  "max_creators_per_campaign": 10
}'::jsonb, '{
  "campaigns_per_month": 5,
  "creators_per_campaign": 10,
  "storage_gb": 10
}'::jsonb),

('Empresa Premium', 'business', 497.00, 4970.00, '{
  "dashboard": true,
  "campaign_management": true,
  "creator_discovery": true,
  "advanced_analytics": true,
  "priority_support": true,
  "custom_reports": true,
  "api_access": true,
  "max_campaigns": 20,
  "max_creators_per_campaign": 50
}'::jsonb, '{
  "campaigns_per_month": 20,
  "creators_per_campaign": 50,
  "storage_gb": 100
}'::jsonb),

-- PLANOS PARA CRIADORES
('Criador Gratuito', 'creator', 0.00, 0.00, '{
  "profile_management": true,
  "campaign_participation": true,
  "basic_analytics": true,
  "community_access": true,
  "max_active_campaigns": 3
}'::jsonb, '{
  "active_campaigns": 3,
  "portfolio_items": 10,
  "storage_gb": 1
}'::jsonb),

('Criador Pro', 'creator', 97.00, 970.00, '{
  "profile_management": true,
  "campaign_participation": true,
  "advanced_analytics": true,
  "priority_matching": true,
  "portfolio_unlimited": true,
  "direct_messaging": true,
  "max_active_campaigns": 10
}'::jsonb, '{
  "active_campaigns": 10,
  "portfolio_items": -1,
  "storage_gb": 10
}'::jsonb),

-- PLANOS PARA CRIADORES ESTRATEGISTAS
('Estrategista', 'creator_strategist', 197.00, 1970.00, '{
  "profile_management": true,
  "campaign_participation": true,
  "campaign_creation": true,
  "team_management": true,
  "advanced_analytics": true,
  "business_tools": true,
  "api_access": true,
  "white_label": true,
  "max_active_campaigns": 50,
  "max_team_members": 5
}'::jsonb, '{
  "active_campaigns": 50,
  "team_members": 5,
  "managed_creators": 20,
  "storage_gb": 50
}'::jsonb);

-- 5. FUNÇÃO PARA OBTER PERMISSÕES BASEADAS NO NÍVEL DE ACESSO
CREATE OR REPLACE FUNCTION get_user_permissions(user_role TEXT, creator_type TEXT DEFAULT NULL, subscription_plan TEXT DEFAULT 'basic')
RETURNS JSONB AS $$
BEGIN
  CASE user_role
    -- ADMINISTRADORES (CRM INTERNO)
    WHEN 'admin' THEN
      RETURN '{
        "dashboard": {"read": true, "write": true, "delete": true},
        "businesses": {"read": true, "write": true, "delete": true},
        "campaigns": {"read": true, "write": true, "delete": true},
        "creators": {"read": true, "write": true, "delete": true},
        "analytics": {"read": true, "write": true, "delete": true},
        "users": {"read": true, "write": true, "delete": true},
        "billing": {"read": true, "write": true, "delete": true},
        "scope": "global"
      }'::jsonb;
    
    -- GERENTES (CRM INTERNO)
    WHEN 'manager' THEN
      RETURN '{
        "dashboard": {"read": true, "write": true, "delete": false},
        "businesses": {"read": true, "write": true, "delete": false},
        "campaigns": {"read": true, "write": true, "delete": false},
        "creators": {"read": true, "write": true, "delete": false},
        "analytics": {"read": true, "write": false, "delete": false},
        "users": {"read": true, "write": false, "delete": false},
        "scope": "organization"
      }'::jsonb;
    
    -- EMPRESAS (CLIENTES)
    WHEN 'business_owner' THEN
      CASE subscription_plan
        WHEN 'Empresa Premium' THEN
          RETURN '{
            "dashboard": {"read": true, "write": true, "delete": false},
            "campaigns": {"read": true, "write": true, "delete": true},
            "creators": {"read": true, "write": false, "delete": false},
            "analytics": {"read": true, "write": false, "delete": false},
            "reports": {"read": true, "write": true, "delete": false},
            "api_access": true,
            "custom_reports": true,
            "priority_support": true,
            "scope": "business"
          }'::jsonb;
        ELSE -- Empresa Básico
          RETURN '{
            "dashboard": {"read": true, "write": true, "delete": false},
            "campaigns": {"read": true, "write": true, "delete": true},
            "creators": {"read": true, "write": false, "delete": false},
            "analytics": {"read": true, "write": false, "delete": false},
            "scope": "business"
          }'::jsonb;
      END CASE;
    
    -- CRIADORES ESTRATEGISTAS
    WHEN 'creator_strategist' THEN
      RETURN '{
        "dashboard": {"read": true, "write": true, "delete": false},
        "profile": {"read": true, "write": true, "delete": false},
        "campaigns": {"read": true, "write": true, "delete": true},
        "team_management": {"read": true, "write": true, "delete": false},
        "business_tools": {"read": true, "write": true, "delete": false},
        "analytics": {"read": true, "write": false, "delete": false},
        "api_access": true,
        "white_label": true,
        "campaign_creation": true,
        "scope": "creator_strategist"
      }'::jsonb;
    
    -- CRIADORES
    WHEN 'creator' THEN
      CASE subscription_plan
        WHEN 'Criador Pro' THEN
          RETURN '{
            "dashboard": {"read": true, "write": true, "delete": false},
            "profile": {"read": true, "write": true, "delete": false},
            "campaigns": {"read": true, "write": false, "delete": false},
            "analytics": {"read": true, "write": false, "delete": false},
            "portfolio": {"read": true, "write": true, "delete": true},
            "direct_messaging": true,
            "priority_matching": true,
            "scope": "creator"
          }'::jsonb;
        ELSE -- Criador Gratuito
          RETURN '{
            "dashboard": {"read": true, "write": false, "delete": false},
            "profile": {"read": true, "write": true, "delete": false},
            "campaigns": {"read": true, "write": false, "delete": false},
            "analytics": {"read": true, "write": false, "delete": false},
            "scope": "creator"
          }'::jsonb;
      END CASE;
    
    -- USUÁRIOS PADRÃO
    ELSE
      RETURN '{
        "dashboard": {"read": true, "write": false, "delete": false},
        "scope": "limited"
      }'::jsonb;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- 6. FUNÇÃO PARA VERIFICAR SE USUÁRIO PODE ACESSAR RECURSO
CREATE OR REPLACE FUNCTION can_access_resource(
  user_id UUID,
  resource_type TEXT,
  resource_id UUID DEFAULT NULL
) RETURNS BOOLEAN AS $$
DECLARE
  user_record RECORD;
  user_permissions JSONB;
BEGIN
  -- Buscar dados do usuário
  SELECT role, creator_type, subscription_plan, business_id, creator_id 
  INTO user_record
  FROM users 
  WHERE id = user_id AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Obter permissões do usuário
  user_permissions := get_user_permissions(user_record.role, user_record.creator_type, user_record.subscription_plan);
  
  -- Verificar acesso baseado no tipo de recurso e escopo
  CASE user_record.role
    WHEN 'admin', 'manager' THEN
      RETURN true; -- Acesso total
    
    WHEN 'business_owner' THEN
      -- Empresas só acessam seus próprios recursos
      IF resource_type = 'business' THEN
        RETURN resource_id = user_record.business_id;
      ELSIF resource_type = 'campaign' THEN
        -- Verificar se a campanha pertence à empresa
        RETURN EXISTS (
          SELECT 1 FROM campaigns 
          WHERE id = resource_id AND business_id = user_record.business_id
        );
      END IF;
      RETURN true; -- Outros recursos permitidos
    
    WHEN 'creator_strategist' THEN
      -- Estrategistas têm acesso amplo mas limitado
      RETURN true;
    
    WHEN 'creator' THEN
      -- Criadores só acessam seus próprios recursos
      IF resource_type = 'creator' THEN
        RETURN resource_id = user_record.creator_id;
      ELSIF resource_type = 'campaign' THEN
        -- Verificar se está participando da campanha
        RETURN EXISTS (
          SELECT 1 FROM campaign_creators 
          WHERE campaign_id = resource_id AND creator_id = user_record.creator_id
        );
      END IF;
      RETURN false;
    
    ELSE
      RETURN false;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- 7. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_users_role_type ON users(role, creator_type) WHERE creator_type IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_plan) WHERE subscription_plan IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_subscription_plans_type ON subscription_plans(type, is_active);

-- 8. COMENTÁRIOS PARA DOCUMENTAÇÃO
COMMENT ON COLUMN users.creator_type IS 'Subtipo para criadores: creator ou creator_strategist';
COMMENT ON COLUMN users.subscription_plan IS 'Plano de assinatura ativo do usuário';
COMMENT ON COLUMN users.features_enabled IS 'Recursos específicos habilitados para o usuário';
COMMENT ON TABLE subscription_plans IS 'Planos de assinatura disponíveis na plataforma';

-- ✅ SISTEMA DE NÍVEIS DE ACESSO IMPLEMENTADO COM SUCESSO!
