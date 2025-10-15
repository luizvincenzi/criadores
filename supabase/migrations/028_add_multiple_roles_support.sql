-- Migration: Adicionar suporte a múltiplos roles por usuário
-- Data: 2025-01-15
-- Descrição: Permite que um usuário tenha múltiplos roles (ex: creator + marketing_strategist)

-- 1. Adicionar coluna roles (array de roles)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS roles user_role[] DEFAULT ARRAY['user']::user_role[];

-- 2. Migrar dados existentes: copiar role para roles
UPDATE users 
SET roles = ARRAY[role]::user_role[] 
WHERE roles IS NULL OR roles = '{}';

-- 3. Criar índice GIN para performance em queries de array
CREATE INDEX IF NOT EXISTS idx_users_roles ON users USING GIN(roles);

-- 4. Criar índice para buscar usuários com um role específico
CREATE INDEX IF NOT EXISTS idx_users_has_role ON users 
USING GIN(roles) 
WHERE is_active = true;

-- 5. Função para verificar se usuário tem um role específico
CREATE OR REPLACE FUNCTION user_has_role(user_id UUID, check_role user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    SELECT check_role = ANY(roles)
    FROM users
    WHERE id = user_id
  );
END;
$$ LANGUAGE plpgsql STABLE;

-- 6. Função para obter permissões combinadas de todos os roles
CREATE OR REPLACE FUNCTION get_combined_permissions(user_id UUID)
RETURNS JSONB AS $$
DECLARE
  combined_perms JSONB := '{}'::jsonb;
  user_roles user_role[];
  current_role user_role;
BEGIN
  -- Obter roles do usuário
  SELECT roles INTO user_roles FROM users WHERE id = user_id;
  
  -- Iterar sobre cada role e combinar permissões
  FOREACH current_role IN ARRAY user_roles
  LOOP
    CASE current_role
      WHEN 'admin' THEN
        combined_perms := combined_perms || '{
          "businesses": {"read": true, "write": true, "delete": true},
          "campaigns": {"read": true, "write": true, "delete": true},
          "creators": {"read": true, "write": true, "delete": true},
          "conteudo": {"read": true, "write": true, "delete": true},
          "reports": {"read": true, "write": true, "delete": true},
          "tasks": {"read": true, "write": true, "delete": true}
        }'::jsonb;
      WHEN 'manager' THEN
        combined_perms := combined_perms || '{
          "businesses": {"read": true, "write": true, "delete": false},
          "campaigns": {"read": true, "write": true, "delete": false},
          "creators": {"read": true, "write": true, "delete": false},
          "conteudo": {"read": true, "write": true, "delete": false},
          "reports": {"read": true, "write": false, "delete": false},
          "tasks": {"read": true, "write": true, "delete": false}
        }'::jsonb;
      WHEN 'creator' THEN
        combined_perms := combined_perms || '{
          "campaigns": {"read": true, "write": false, "delete": false},
          "conteudo": {"read": true, "write": true, "delete": true},
          "reports": {"read": true, "write": false, "delete": false},
          "tasks": {"read": true, "write": true, "delete": false}
        }'::jsonb;
      WHEN 'marketing_strategist' THEN
        combined_perms := combined_perms || '{
          "campaigns": {"read": true, "write": true, "delete": false},
          "conteudo": {"read": true, "write": true, "delete": false},
          "briefings": {"read": true, "write": true, "delete": false},
          "reports": {"read": true, "write": false, "delete": false},
          "tasks": {"read": true, "write": true, "delete": false}
        }'::jsonb;
      WHEN 'business_owner' THEN
        combined_perms := combined_perms || '{
          "campaigns": {"read": true, "write": false, "delete": false},
          "conteudo": {"read": true, "write": false, "delete": false},
          "reports": {"read": true, "write": false, "delete": false},
          "tasks": {"read": true, "write": false, "delete": false}
        }'::jsonb;
    END CASE;
  END LOOP;
  
  RETURN combined_perms;
END;
$$ LANGUAGE plpgsql STABLE;

-- 7. Criar view para usuários com múltiplos roles
CREATE OR REPLACE VIEW users_with_multiple_roles AS
SELECT 
  id,
  email,
  full_name,
  role,
  roles,
  array_length(roles, 1) as role_count,
  is_active,
  created_at
FROM users
WHERE array_length(roles, 1) > 1
ORDER BY created_at DESC;

-- 8. Comentários para documentação
COMMENT ON COLUMN users.roles IS 'Array de roles que o usuário possui. Permite múltiplos acessos.';
COMMENT ON FUNCTION user_has_role(UUID, user_role) IS 'Verifica se um usuário tem um role específico';
COMMENT ON FUNCTION get_combined_permissions(UUID) IS 'Obtém permissões combinadas de todos os roles do usuário';

