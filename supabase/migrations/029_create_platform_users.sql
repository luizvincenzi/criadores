-- =====================================================
-- MIGRATION 029: Criar tabela platform_users
-- =====================================================
-- Descrição: Separar usuários externos (criadores.app) dos internos (CRM)
-- Data: 2025-10-15
-- =====================================================

-- 1. CRIAR ENUM PARA ROLES DA PLATAFORMA
CREATE TYPE platform_user_role AS ENUM (
  'creator',
  'marketing_strategist',
  'business_owner'
);

-- 2. CRIAR TABELA platform_users
CREATE TABLE platform_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- Informações Básicas
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  
  -- Sistema de Roles (Múltiplos)
  role platform_user_role DEFAULT 'creator', -- Role primário
  roles platform_user_role[] DEFAULT ARRAY['creator']::platform_user_role[], -- Múltiplos roles
  
  -- Relacionamentos
  creator_id UUID REFERENCES creators(id) ON DELETE SET NULL,
  business_id UUID REFERENCES businesses(id) ON DELETE SET NULL,
  managed_businesses UUID[] DEFAULT '{}', -- Para marketing_strategist
  
  -- Permissões e Configurações
  permissions JSONB DEFAULT '{
    "campaigns": {"read": true, "write": false, "delete": false},
    "conteudo": {"read": true, "write": true, "delete": false},
    "briefings": {"read": true, "write": false, "delete": false},
    "reports": {"read": true, "write": false, "delete": false},
    "tasks": {"read": true, "write": true, "delete": false}
  }'::jsonb,
  
  preferences JSONB DEFAULT '{
    "theme": "light",
    "language": "pt-BR",
    "notifications": {
      "email": true,
      "push": true,
      "in_app": true
    }
  }'::jsonb,
  
  -- Assinatura e Planos
  subscription_plan VARCHAR(50) DEFAULT 'basic', -- basic, premium, enterprise
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  features_enabled JSONB DEFAULT '{}'::jsonb,
  
  -- Status e Metadados
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  platform VARCHAR(50) DEFAULT 'client', -- Sempre 'client' para identificação
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX idx_platform_users_organization ON platform_users(organization_id);
CREATE INDEX idx_platform_users_email ON platform_users(email);
CREATE INDEX idx_platform_users_role ON platform_users(role);
CREATE INDEX idx_platform_users_roles ON platform_users USING GIN(roles);
CREATE INDEX idx_platform_users_creator ON platform_users(creator_id);
CREATE INDEX idx_platform_users_business ON platform_users(business_id);
CREATE INDEX idx_platform_users_active ON platform_users(is_active);
CREATE INDEX idx_platform_users_managed_businesses ON platform_users USING GIN(managed_businesses);

-- 4. CRIAR FUNÇÃO PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_platform_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. CRIAR TRIGGER PARA updated_at
CREATE TRIGGER trigger_update_platform_users_updated_at
  BEFORE UPDATE ON platform_users
  FOR EACH ROW
  EXECUTE FUNCTION update_platform_users_updated_at();

-- 6. CRIAR FUNÇÃO PARA VERIFICAR SE USUÁRIO TEM ROLE
CREATE OR REPLACE FUNCTION platform_user_has_role(
  user_roles platform_user_role[],
  check_role platform_user_role
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN check_role = ANY(user_roles);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 7. CRIAR FUNÇÃO PARA COMBINAR PERMISSÕES DE MÚLTIPLOS ROLES
CREATE OR REPLACE FUNCTION get_combined_platform_permissions(
  user_roles platform_user_role[]
)
RETURNS JSONB AS $$
DECLARE
  combined_perms JSONB := '{}'::jsonb;
  has_creator BOOLEAN := 'creator' = ANY(user_roles);
  has_strategist BOOLEAN := 'marketing_strategist' = ANY(user_roles);
  has_business BOOLEAN := 'business_owner' = ANY(user_roles);
BEGIN
  -- Permissões base
  combined_perms := '{
    "campaigns": {"read": false, "write": false, "delete": false},
    "conteudo": {"read": false, "write": false, "delete": false},
    "briefings": {"read": false, "write": false, "delete": false},
    "reports": {"read": false, "write": false, "delete": false},
    "tasks": {"read": false, "write": false, "delete": false}
  }'::jsonb;
  
  -- Adicionar permissões de creator
  IF has_creator THEN
    combined_perms := jsonb_set(combined_perms, '{campaigns,read}', 'true');
    combined_perms := jsonb_set(combined_perms, '{conteudo,read}', 'true');
    combined_perms := jsonb_set(combined_perms, '{conteudo,write}', 'true');
    combined_perms := jsonb_set(combined_perms, '{conteudo,delete}', 'true');
    combined_perms := jsonb_set(combined_perms, '{reports,read}', 'true');
    combined_perms := jsonb_set(combined_perms, '{tasks,read}', 'true');
    combined_perms := jsonb_set(combined_perms, '{tasks,write}', 'true');
  END IF;
  
  -- Adicionar permissões de marketing_strategist
  IF has_strategist THEN
    combined_perms := jsonb_set(combined_perms, '{campaigns,read}', 'true');
    combined_perms := jsonb_set(combined_perms, '{campaigns,write}', 'true');
    combined_perms := jsonb_set(combined_perms, '{conteudo,read}', 'true');
    combined_perms := jsonb_set(combined_perms, '{conteudo,write}', 'true');
    combined_perms := jsonb_set(combined_perms, '{briefings,read}', 'true');
    combined_perms := jsonb_set(combined_perms, '{briefings,write}', 'true');
    combined_perms := jsonb_set(combined_perms, '{reports,read}', 'true');
    combined_perms := jsonb_set(combined_perms, '{tasks,read}', 'true');
    combined_perms := jsonb_set(combined_perms, '{tasks,write}', 'true');
  END IF;
  
  -- Adicionar permissões de business_owner
  IF has_business THEN
    combined_perms := jsonb_set(combined_perms, '{campaigns,read}', 'true');
    combined_perms := jsonb_set(combined_perms, '{conteudo,read}', 'true');
    combined_perms := jsonb_set(combined_perms, '{briefings,read}', 'true');
    combined_perms := jsonb_set(combined_perms, '{reports,read}', 'true');
  END IF;
  
  RETURN combined_perms;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 8. ADICIONAR COMENTÁRIOS
COMMENT ON TABLE platform_users IS 'Usuários externos da plataforma criadores.app (creators, marketing_strategists, business_owners)';
COMMENT ON COLUMN platform_users.role IS 'Role primário do usuário';
COMMENT ON COLUMN platform_users.roles IS 'Array de roles - permite múltiplos roles por usuário';
COMMENT ON COLUMN platform_users.creator_id IS 'Referência ao criador (obrigatório para role creator)';
COMMENT ON COLUMN platform_users.business_id IS 'Referência à empresa (obrigatório para role business_owner)';
COMMENT ON COLUMN platform_users.managed_businesses IS 'Array de IDs de empresas gerenciadas (para marketing_strategist)';
COMMENT ON COLUMN platform_users.platform IS 'Identificador da plataforma - sempre "client" para platform_users';

-- 9. CRIAR VIEW PARA FACILITAR QUERIES
CREATE OR REPLACE VIEW v_platform_users_with_details AS
SELECT
  pu.*,
  c.name as creator_name,
  c.slug as creator_slug,
  c.social_media->>'instagram' as creator_instagram,
  b.name as business_name,
  o.name as organization_name,
  get_combined_platform_permissions(pu.roles) as combined_permissions
FROM platform_users pu
LEFT JOIN creators c ON pu.creator_id = c.id
LEFT JOIN businesses b ON pu.business_id = b.id
LEFT JOIN organizations o ON pu.organization_id = o.id;

COMMENT ON VIEW v_platform_users_with_details IS 'View com detalhes completos dos usuários da plataforma incluindo permissões combinadas';

-- 10. CRIAR CONSTRAINT PARA VALIDAR RELACIONAMENTOS
ALTER TABLE platform_users
ADD CONSTRAINT check_creator_role_has_creator_id
CHECK (
  (role = 'creator' AND creator_id IS NOT NULL) OR
  (role != 'creator')
);

ALTER TABLE platform_users
ADD CONSTRAINT check_business_owner_has_business_id
CHECK (
  (role = 'business_owner' AND business_id IS NOT NULL) OR
  (role != 'business_owner')
);

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

