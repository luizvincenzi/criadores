-- Migration: Atualizar sistema de user roles para plataforma criadores.app
-- Data: 2025-09-09
-- Descrição: Adiciona novos tipos de usuário para a plataforma cliente

-- 1. Atualizar ENUM de user_role com novos tipos
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'business_owner';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'creator';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'marketing_strategist';

-- 2. Adicionar campos específicos para relacionamentos na tabela users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS business_id UUID REFERENCES businesses(id),
ADD COLUMN IF NOT EXISTS creator_id UUID REFERENCES creators(id),
ADD COLUMN IF NOT EXISTS managed_businesses UUID[] DEFAULT '{}';

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_users_business_id ON users(business_id) WHERE business_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_creator_id ON users(creator_id) WHERE creator_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_users_role_business ON users(role, business_id) WHERE business_id IS NOT NULL;

-- 4. Criar função para validar consistência de dados
CREATE OR REPLACE FUNCTION validate_user_role_consistency()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar business_owner
  IF NEW.role = 'business_owner' THEN
    IF NEW.business_id IS NULL THEN
      RAISE EXCEPTION 'business_owner deve ter business_id definido';
    END IF;
  END IF;
  
  -- Validar creator
  IF NEW.role = 'creator' THEN
    IF NEW.creator_id IS NULL THEN
      RAISE EXCEPTION 'creator deve ter creator_id definido';
    END IF;
  END IF;
  
  -- Validar marketing_strategist
  IF NEW.role = 'marketing_strategist' THEN
    IF NEW.managed_businesses IS NULL OR array_length(NEW.managed_businesses, 1) = 0 THEN
      RAISE EXCEPTION 'marketing_strategist deve ter pelo menos um business em managed_businesses';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Criar trigger para validação
DROP TRIGGER IF EXISTS trigger_validate_user_role ON users;
CREATE TRIGGER trigger_validate_user_role
  BEFORE INSERT OR UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION validate_user_role_consistency();

-- 6. Função para obter permissões padrão por role
CREATE OR REPLACE FUNCTION get_default_permissions(user_role TEXT, business_id UUID DEFAULT NULL)
RETURNS JSONB AS $$
BEGIN
  CASE user_role
    WHEN 'admin' THEN
      RETURN '{
        "businesses": {"read": true, "write": true, "delete": true},
        "campaigns": {"read": true, "write": true, "delete": true},
        "creators": {"read": true, "write": true, "delete": true},
        "leads": {"read": true, "write": true, "delete": true},
        "tasks": {"read": true, "write": true, "delete": true},
        "analytics": {"read": true, "write": true, "delete": true},
        "users": {"read": true, "write": true, "delete": true},
        "scope": "global"
      }'::jsonb;
      
    WHEN 'manager' THEN
      RETURN '{
        "businesses": {"read": true, "write": true, "delete": false},
        "campaigns": {"read": true, "write": true, "delete": false},
        "creators": {"read": true, "write": true, "delete": false},
        "leads": {"read": true, "write": true, "delete": false},
        "tasks": {"read": true, "write": true, "delete": false},
        "analytics": {"read": true, "write": false, "delete": false},
        "users": {"read": true, "write": false, "delete": false},
        "scope": "organization"
      }'::jsonb;
      
    WHEN 'business_owner' THEN
      RETURN jsonb_build_object(
        'businesses', jsonb_build_object('read', true, 'write', true, 'delete', false),
        'campaigns', jsonb_build_object('read', true, 'write', true, 'delete', false),
        'creators', jsonb_build_object('read', true, 'write', false, 'delete', false),
        'leads', jsonb_build_object('read', true, 'write', true, 'delete', false),
        'tasks', jsonb_build_object('read', true, 'write', true, 'delete', false),
        'analytics', jsonb_build_object('read', true, 'write', false, 'delete', false),
        'users', jsonb_build_object('read', false, 'write', false, 'delete', false),
        'scope', 'business',
        'business_id', business_id
      );
      
    WHEN 'creator' THEN
      RETURN '{
        "businesses": {"read": false, "write": false, "delete": false},
        "campaigns": {"read": true, "write": false, "delete": false},
        "creators": {"read": true, "write": true, "delete": false},
        "leads": {"read": false, "write": false, "delete": false},
        "tasks": {"read": true, "write": true, "delete": false},
        "analytics": {"read": true, "write": false, "delete": false},
        "users": {"read": false, "write": false, "delete": false},
        "scope": "creator"
      }'::jsonb;
      
    WHEN 'marketing_strategist' THEN
      RETURN '{
        "businesses": {"read": true, "write": true, "delete": false},
        "campaigns": {"read": true, "write": true, "delete": false},
        "creators": {"read": true, "write": true, "delete": false},
        "leads": {"read": true, "write": true, "delete": false},
        "tasks": {"read": true, "write": true, "delete": false},
        "analytics": {"read": true, "write": true, "delete": false},
        "users": {"read": false, "write": false, "delete": false},
        "scope": "managed_businesses"
      }'::jsonb;
      
    WHEN 'user' THEN
      RETURN '{
        "businesses": {"read": true, "write": false, "delete": false},
        "campaigns": {"read": true, "write": false, "delete": false},
        "creators": {"read": true, "write": false, "delete": false},
        "leads": {"read": true, "write": false, "delete": false},
        "tasks": {"read": true, "write": true, "delete": false},
        "analytics": {"read": true, "write": false, "delete": false},
        "users": {"read": false, "write": false, "delete": false},
        "scope": "limited"
      }'::jsonb;
      
    WHEN 'viewer' THEN
      RETURN '{
        "businesses": {"read": true, "write": false, "delete": false},
        "campaigns": {"read": true, "write": false, "delete": false},
        "creators": {"read": true, "write": false, "delete": false},
        "leads": {"read": true, "write": false, "delete": false},
        "tasks": {"read": true, "write": false, "delete": false},
        "analytics": {"read": true, "write": false, "delete": false},
        "users": {"read": false, "write": false, "delete": false},
        "scope": "read_only"
      }'::jsonb;
      
    ELSE
      RETURN '{
        "businesses": {"read": false, "write": false, "delete": false},
        "campaigns": {"read": false, "write": false, "delete": false},
        "creators": {"read": false, "write": false, "delete": false},
        "leads": {"read": false, "write": false, "delete": false},
        "tasks": {"read": false, "write": false, "delete": false},
        "analytics": {"read": false, "write": false, "delete": false},
        "users": {"read": false, "write": false, "delete": false},
        "scope": "none"
      }'::jsonb;
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- 7. Função para criar usuário com role específico
CREATE OR REPLACE FUNCTION create_user_with_role(
  p_email TEXT,
  p_full_name TEXT,
  p_role user_role,
  p_organization_id UUID,
  p_business_id UUID DEFAULT NULL,
  p_creator_id UUID DEFAULT NULL,
  p_managed_businesses UUID[] DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  new_user_id UUID;
  default_permissions JSONB;
BEGIN
  -- Gerar ID do usuário
  new_user_id := gen_random_uuid();
  
  -- Obter permissões padrão
  default_permissions := get_default_permissions(p_role::TEXT, p_business_id);
  
  -- Inserir usuário
  INSERT INTO users (
    id,
    organization_id,
    email,
    full_name,
    role,
    business_id,
    creator_id,
    managed_businesses,
    permissions,
    is_active
  ) VALUES (
    new_user_id,
    p_organization_id,
    lower(p_email),
    p_full_name,
    p_role,
    p_business_id,
    p_creator_id,
    COALESCE(p_managed_businesses, '{}'),
    default_permissions,
    true
  );
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;

-- 8. Comentários para documentação
COMMENT ON COLUMN users.business_id IS 'ID da empresa para business_owner - acesso exclusivo a esta empresa';
COMMENT ON COLUMN users.creator_id IS 'ID do criador para role creator - acesso aos próprios dados';
COMMENT ON COLUMN users.managed_businesses IS 'Array de business_ids para marketing_strategist - empresas que pode gerenciar';

-- 9. Atualizar RLS policies se necessário
-- (As policies existentes devem ser revisadas para incluir os novos roles)

COMMIT;
