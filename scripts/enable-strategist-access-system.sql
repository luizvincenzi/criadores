-- ===============================================
-- SISTEMA DE ACESSO DE ESTRATEGISTAS ÀS CONTAS DE CLIENTES
-- ===============================================
-- Data: 2025-09-27
-- Descrição: Implementa sistema completo para estrategistas acessarem múltiplas contas de clientes

-- 1. CRIAR TABELA DE RELACIONAMENTO ESTRATEGISTA-EMPRESA
-- ===============================================

CREATE TABLE IF NOT EXISTS strategist_business_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategist_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  access_level VARCHAR(50) NOT NULL DEFAULT 'read_write', -- 'read_only', 'read_write', 'full_access'
  permissions JSONB DEFAULT '{
    "campaigns": {"read": true, "write": true, "delete": false},
    "creators": {"read": true, "write": true, "delete": false},
    "analytics": {"read": true, "write": false, "delete": false},
    "briefings": {"read": true, "write": true, "delete": false},
    "tasks": {"read": true, "write": true, "delete": false},
    "billing": {"read": false, "write": false, "delete": false}
  }'::jsonb,
  granted_by_user_id UUID REFERENCES users(id), -- Quem concedeu o acesso
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE, -- Acesso temporário (opcional)
  is_active BOOLEAN DEFAULT true,
  notes TEXT, -- Observações sobre o acesso
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Garantir que um estrategista não tenha acesso duplicado à mesma empresa
  UNIQUE(strategist_user_id, business_id)
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- ===============================================

CREATE INDEX IF NOT EXISTS idx_strategist_business_access_strategist ON strategist_business_access(strategist_user_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_strategist_business_access_business ON strategist_business_access(business_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_strategist_business_access_level ON strategist_business_access(access_level) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_strategist_business_access_expires ON strategist_business_access(expires_at) WHERE expires_at IS NOT NULL;

-- 3. ATUALIZAR ENUM DE USER_ROLE (se necessário)
-- ===============================================

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role' AND typelem = 0) THEN
        CREATE TYPE user_role AS ENUM ('admin', 'manager', 'user', 'viewer', 'business_owner', 'creator', 'creator_strategist', 'marketing_strategist');
    ELSE
        -- Adicionar novos valores se não existirem
        BEGIN
            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'creator_strategist';
        EXCEPTION WHEN duplicate_object THEN
            NULL; -- Valor já existe
        END;
        
        BEGIN
            ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'marketing_strategist';
        EXCEPTION WHEN duplicate_object THEN
            NULL; -- Valor já existe
        END;
    END IF;
END $$;

-- 4. ATUALIZAR TABELA USERS PARA ESTRATEGISTAS
-- ===============================================

-- Adicionar campos específicos para estrategistas (se não existirem)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS creator_type VARCHAR(50) DEFAULT 'creator',
ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) DEFAULT 'basic',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS features_enabled JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS managed_businesses UUID[] DEFAULT '{}'; -- Array de business_ids gerenciados

-- 5. CRIAR VIEW PARA ACESSO DE ESTRATEGISTAS
-- ===============================================

CREATE OR REPLACE VIEW strategist_business_view AS
SELECT 
    sba.id as access_id,
    sba.strategist_user_id,
    sba.business_id,
    sba.access_level,
    sba.permissions,
    sba.granted_at,
    sba.expires_at,
    sba.is_active,
    
    -- Dados do estrategista
    u.full_name as strategist_name,
    u.email as strategist_email,
    u.role as strategist_role,
    u.creator_type,
    u.subscription_plan,
    
    -- Dados da empresa
    b.name as business_name,
    b.slug as business_slug,
    b.business_stage,
    b.contact_info,
    b.status as business_status,
    
    -- Dados de quem concedeu o acesso
    granter.full_name as granted_by_name,
    granter.email as granted_by_email
    
FROM strategist_business_access sba
JOIN users u ON sba.strategist_user_id = u.id
JOIN businesses b ON sba.business_id = b.id
LEFT JOIN users granter ON sba.granted_by_user_id = granter.id
WHERE sba.is_active = true
AND u.is_active = true
AND b.is_active = true
AND (sba.expires_at IS NULL OR sba.expires_at > NOW());

-- 6. FUNÇÃO PARA CONCEDER ACESSO A ESTRATEGISTA
-- ===============================================

CREATE OR REPLACE FUNCTION grant_strategist_access(
    p_strategist_email VARCHAR(255),
    p_business_id UUID,
    p_access_level VARCHAR(50) DEFAULT 'read_write',
    p_granted_by_user_id UUID DEFAULT NULL,
    p_expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_notes TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
    v_strategist_id UUID;
    v_access_id UUID;
    v_result JSON;
BEGIN
    -- Buscar ID do estrategista
    SELECT id INTO v_strategist_id 
    FROM users 
    WHERE email = p_strategist_email 
    AND role IN ('creator_strategist', 'marketing_strategist')
    AND is_active = true;
    
    IF v_strategist_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Estrategista não encontrado ou não ativo'
        );
    END IF;
    
    -- Verificar se a empresa existe
    IF NOT EXISTS (SELECT 1 FROM businesses WHERE id = p_business_id AND is_active = true) THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Empresa não encontrada ou não ativa'
        );
    END IF;
    
    -- Inserir ou atualizar acesso
    INSERT INTO strategist_business_access (
        strategist_user_id,
        business_id,
        access_level,
        granted_by_user_id,
        expires_at,
        notes
    ) VALUES (
        v_strategist_id,
        p_business_id,
        p_access_level,
        p_granted_by_user_id,
        p_expires_at,
        p_notes
    )
    ON CONFLICT (strategist_user_id, business_id) 
    DO UPDATE SET
        access_level = EXCLUDED.access_level,
        granted_by_user_id = EXCLUDED.granted_by_user_id,
        expires_at = EXCLUDED.expires_at,
        notes = EXCLUDED.notes,
        is_active = true,
        updated_at = NOW()
    RETURNING id INTO v_access_id;
    
    -- Atualizar array managed_businesses do usuário
    UPDATE users 
    SET managed_businesses = array_append(
        COALESCE(managed_businesses, '{}'), 
        p_business_id::text
    )
    WHERE id = v_strategist_id
    AND NOT (p_business_id::text = ANY(COALESCE(managed_businesses, '{}')));
    
    RETURN json_build_object(
        'success', true,
        'access_id', v_access_id,
        'strategist_id', v_strategist_id,
        'business_id', p_business_id,
        'message', 'Acesso concedido com sucesso'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- 7. FUNÇÃO PARA REVOGAR ACESSO DE ESTRATEGISTA
-- ===============================================

CREATE OR REPLACE FUNCTION revoke_strategist_access(
    p_strategist_email VARCHAR(255),
    p_business_id UUID
) RETURNS JSON AS $$
DECLARE
    v_strategist_id UUID;
    v_result JSON;
BEGIN
    -- Buscar ID do estrategista
    SELECT id INTO v_strategist_id 
    FROM users 
    WHERE email = p_strategist_email;
    
    IF v_strategist_id IS NULL THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Estrategista não encontrado'
        );
    END IF;
    
    -- Desativar acesso
    UPDATE strategist_business_access 
    SET is_active = false, updated_at = NOW()
    WHERE strategist_user_id = v_strategist_id 
    AND business_id = p_business_id;
    
    -- Remover do array managed_businesses
    UPDATE users 
    SET managed_businesses = array_remove(managed_businesses, p_business_id::text)
    WHERE id = v_strategist_id;
    
    RETURN json_build_object(
        'success', true,
        'message', 'Acesso revogado com sucesso'
    );
    
EXCEPTION WHEN OTHERS THEN
    RETURN json_build_object(
        'success', false,
        'error', SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- 8. FUNÇÃO PARA VERIFICAR ACESSO DE ESTRATEGISTA
-- ===============================================

CREATE OR REPLACE FUNCTION check_strategist_access(
    p_strategist_user_id UUID,
    p_business_id UUID,
    p_permission_type VARCHAR(50) DEFAULT 'read'
) RETURNS BOOLEAN AS $$
DECLARE
    v_has_access BOOLEAN := false;
    v_permissions JSONB;
BEGIN
    -- Verificar se tem acesso ativo
    SELECT permissions INTO v_permissions
    FROM strategist_business_access
    WHERE strategist_user_id = p_strategist_user_id
    AND business_id = p_business_id
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW());
    
    IF v_permissions IS NOT NULL THEN
        -- Verificar permissão específica (implementação básica)
        v_has_access := true;
    END IF;
    
    RETURN v_has_access;
END;
$$ LANGUAGE plpgsql;

-- 9. INSERIR DADOS DE EXEMPLO
-- ===============================================

-- Criar usuário estrategista de exemplo (se não existir)
INSERT INTO users (
    organization_id,
    email,
    full_name,
    role,
    creator_type,
    subscription_plan,
    permissions
) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'estrategista@criadores.app',
    'Estrategista Exemplo',
    'creator_strategist',
    'creator_strategist',
    'strategist',
    '{
        "businesses": {"read": true, "write": true, "delete": false},
        "campaigns": {"read": true, "write": true, "delete": false},
        "creators": {"read": true, "write": true, "delete": false},
        "analytics": {"read": true, "write": false, "delete": false},
        "briefings": {"read": true, "write": true, "delete": false}
    }'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- 10. COMENTÁRIOS E DOCUMENTAÇÃO
-- ===============================================

COMMENT ON TABLE strategist_business_access IS 'Tabela que controla o acesso de estrategistas às empresas clientes';
COMMENT ON COLUMN strategist_business_access.access_level IS 'Nível de acesso: read_only, read_write, full_access';
COMMENT ON COLUMN strategist_business_access.permissions IS 'Permissões específicas por recurso em formato JSONB';
COMMENT ON COLUMN strategist_business_access.expires_at IS 'Data de expiração do acesso (opcional para acesso temporário)';

COMMENT ON FUNCTION grant_strategist_access IS 'Concede acesso de um estrategista a uma empresa específica';
COMMENT ON FUNCTION revoke_strategist_access IS 'Revoga acesso de um estrategista a uma empresa específica';
COMMENT ON FUNCTION check_strategist_access IS 'Verifica se um estrategista tem acesso a uma empresa específica';

-- ===============================================
-- FIM DO SCRIPT
-- ===============================================
