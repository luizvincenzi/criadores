-- =====================================================
-- MIGRATION 030: Adicionar Controle de Acesso à Plataforma (CORRIGIDO)
-- =====================================================
-- Descrição: Adiciona campos de controle de acesso nas tabelas
--            creators e businesses para gerenciar acesso à plataforma
--            criadores.app a partir do CRM criadores.digital
-- Data: 2025-10-15
-- Versão: FIXED - Corrige erros de trigger duplicado e query múltipla
-- =====================================================

-- =====================================================
-- PARTE 1: CREATORS
-- =====================================================

-- 1.1. Adicionar campos de controle à tabela creators
ALTER TABLE creators 
  ADD COLUMN IF NOT EXISTS platform_access_status VARCHAR(50) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS platform_access_granted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS platform_access_granted_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS platform_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS platform_password_hash TEXT,
  ADD COLUMN IF NOT EXISTS platform_roles platform_user_role[] DEFAULT ARRAY['creator']::platform_user_role[];

-- 1.2. Criar índices para creators
CREATE INDEX IF NOT EXISTS idx_creators_platform_access 
  ON creators(platform_access_status);
  
CREATE INDEX IF NOT EXISTS idx_creators_platform_email 
  ON creators(platform_email);

-- 1.3. Comentários para creators
COMMENT ON COLUMN creators.platform_access_status IS 
  'Status de acesso à plataforma: pending, granted, denied, suspended, revoked';
  
COMMENT ON COLUMN creators.platform_email IS 
  'Email para login na plataforma criadores.app';
  
COMMENT ON COLUMN creators.platform_roles IS 
  'Roles do criador na plataforma (pode ter creator + marketing_strategist)';

-- =====================================================
-- PARTE 2: BUSINESSES
-- =====================================================

-- 2.1. Adicionar campos de controle à tabela businesses
ALTER TABLE businesses 
  ADD COLUMN IF NOT EXISTS platform_access_status VARCHAR(50) DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS platform_access_granted_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS platform_access_granted_by UUID REFERENCES users(id),
  ADD COLUMN IF NOT EXISTS platform_owner_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS platform_owner_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS platform_owner_whatsapp VARCHAR(50),
  ADD COLUMN IF NOT EXISTS platform_additional_users JSONB DEFAULT '[]'::jsonb;

-- 2.2. Criar índices para businesses
CREATE INDEX IF NOT EXISTS idx_businesses_platform_access 
  ON businesses(platform_access_status);
  
CREATE INDEX IF NOT EXISTS idx_businesses_platform_owner_email 
  ON businesses(platform_owner_email);

-- 2.3. Comentários para businesses
COMMENT ON COLUMN businesses.platform_access_status IS 
  'Status de acesso à plataforma: pending, granted, denied, suspended, revoked';
  
COMMENT ON COLUMN businesses.platform_owner_name IS 
  'Nome do proprietário principal que terá acesso à plataforma';
  
COMMENT ON COLUMN businesses.platform_owner_email IS 
  'Email do proprietário para login na plataforma';
  
COMMENT ON COLUMN businesses.platform_additional_users IS 
  'Array de usuários adicionais: [{"name": "...", "email": "...", "role": "business_owner"}]';

-- =====================================================
-- PARTE 3: TRIGGERS DE SINCRONIZAÇÃO
-- =====================================================

-- 3.1. Remover triggers existentes (se houver)
DROP TRIGGER IF EXISTS trigger_sync_creator_platform_access ON creators;
DROP TRIGGER IF EXISTS trigger_sync_business_platform_access ON businesses;

-- 3.2. Trigger para sincronizar CREATORS → PLATFORM_USERS
CREATE OR REPLACE FUNCTION sync_creator_to_platform_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Se acesso foi liberado
  IF NEW.platform_access_status = 'granted' AND 
     (OLD.platform_access_status IS NULL OR OLD.platform_access_status != 'granted') THEN
    
    -- Criar ou ativar em platform_users com MESMO UUID
    INSERT INTO platform_users (
      id, -- ← IMPORTANTE: Mesmo UUID do creator!
      organization_id,
      email,
      full_name,
      role,
      roles,
      creator_id,
      is_active,
      platform
    ) VALUES (
      NEW.id, -- ← MESMO UUID!
      NEW.organization_id,
      NEW.platform_email,
      NEW.name,
      'creator',
      NEW.platform_roles,
      NEW.id,
      true,
      'client'
    )
    ON CONFLICT (id) DO UPDATE SET
      is_active = true,
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      roles = EXCLUDED.roles,
      updated_at = NOW();
      
    RAISE NOTICE 'Creator % sincronizado com platform_users', NEW.name;
  END IF;
  
  -- Se acesso foi negado/revogado
  IF NEW.platform_access_status IN ('denied', 'revoked', 'suspended') THEN
    UPDATE platform_users 
    SET is_active = false, updated_at = NOW()
    WHERE creator_id = NEW.id;
    
    RAISE NOTICE 'Acesso do creator % desativado', NEW.name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_creator_platform_access
  AFTER UPDATE OF platform_access_status ON creators
  FOR EACH ROW
  EXECUTE FUNCTION sync_creator_to_platform_user();

-- 3.3. Trigger para sincronizar BUSINESSES → PLATFORM_USERS
CREATE OR REPLACE FUNCTION sync_business_to_platform_user()
RETURNS TRIGGER AS $$
DECLARE
  additional_user JSONB;
  existing_user_id UUID;
BEGIN
  -- Se acesso foi liberado
  IF NEW.platform_access_status = 'granted' AND 
     (OLD.platform_access_status IS NULL OR OLD.platform_access_status != 'granted') THEN
    
    -- Criar/ativar proprietário principal
    IF NEW.platform_owner_email IS NOT NULL THEN
      -- Verificar se usuário já existe
      SELECT id INTO existing_user_id 
      FROM platform_users 
      WHERE email = NEW.platform_owner_email;
      
      IF existing_user_id IS NOT NULL THEN
        -- Usuário existe: adicionar business ao managed_businesses
        UPDATE platform_users 
        SET 
          is_active = true,
          managed_businesses = array_append(
            COALESCE(managed_businesses, ARRAY[]::UUID[]), 
            NEW.id
          ),
          updated_at = NOW()
        WHERE id = existing_user_id
        AND NOT (NEW.id = ANY(COALESCE(managed_businesses, ARRAY[]::UUID[])));
        
        RAISE NOTICE 'Business % adicionado ao usuário existente %', NEW.name, NEW.platform_owner_email;
      ELSE
        -- Usuário novo: criar com business_id
        INSERT INTO platform_users (
          organization_id,
          email,
          full_name,
          role,
          roles,
          business_id,
          managed_businesses,
          is_active,
          platform
        ) VALUES (
          NEW.organization_id,
          NEW.platform_owner_email,
          NEW.platform_owner_name,
          'business_owner',
          ARRAY['business_owner']::platform_user_role[],
          NEW.id, -- Business principal
          ARRAY[NEW.id]::UUID[], -- Também em managed_businesses
          true,
          'client'
        );
        
        RAISE NOTICE 'Business owner % criado para %', NEW.platform_owner_name, NEW.name;
      END IF;
    END IF;
    
    -- Criar usuários adicionais
    IF NEW.platform_additional_users IS NOT NULL AND 
       jsonb_array_length(NEW.platform_additional_users) > 0 THEN
      FOR additional_user IN SELECT * FROM jsonb_array_elements(NEW.platform_additional_users)
      LOOP
        -- Verificar se usuário adicional já existe
        SELECT id INTO existing_user_id 
        FROM platform_users 
        WHERE email = additional_user->>'email';
        
        IF existing_user_id IS NOT NULL THEN
          -- Adicionar business ao managed_businesses
          UPDATE platform_users 
          SET 
            is_active = true,
            managed_businesses = array_append(
              COALESCE(managed_businesses, ARRAY[]::UUID[]), 
              NEW.id
            ),
            updated_at = NOW()
          WHERE id = existing_user_id
          AND NOT (NEW.id = ANY(COALESCE(managed_businesses, ARRAY[]::UUID[])));
        ELSE
          -- Criar novo usuário
          INSERT INTO platform_users (
            organization_id,
            email,
            full_name,
            role,
            roles,
            business_id,
            managed_businesses,
            is_active,
            platform
          ) VALUES (
            NEW.organization_id,
            additional_user->>'email',
            additional_user->>'name',
            'business_owner',
            ARRAY['business_owner']::platform_user_role[],
            NEW.id,
            ARRAY[NEW.id]::UUID[],
            true,
            'client'
          );
        END IF;
      END LOOP;
      
      RAISE NOTICE 'Usuários adicionais processados para %', NEW.name;
    END IF;
  END IF;
  
  -- Se acesso foi negado/revogado
  IF NEW.platform_access_status IN ('denied', 'revoked', 'suspended') THEN
    -- Remover business do managed_businesses de todos os usuários
    UPDATE platform_users 
    SET 
      managed_businesses = array_remove(managed_businesses, NEW.id),
      is_active = CASE 
        WHEN business_id = NEW.id AND array_length(array_remove(managed_businesses, NEW.id), 1) IS NULL 
        THEN false 
        ELSE is_active 
      END,
      updated_at = NOW()
    WHERE NEW.id = ANY(managed_businesses) OR business_id = NEW.id;
    
    RAISE NOTICE 'Acesso da empresa % desativado', NEW.name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_business_platform_access
  AFTER UPDATE OF platform_access_status ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION sync_business_to_platform_user();

-- =====================================================
-- PARTE 4: VIEWS ÚTEIS
-- =====================================================

-- 4.1. View de creators com acesso à plataforma
CREATE OR REPLACE VIEW v_creators_platform_access AS
SELECT 
  c.id,
  c.name,
  c.slug,
  c.platform_access_status,
  c.platform_email,
  c.platform_roles,
  c.platform_access_granted_at,
  u.full_name as granted_by_name,
  pu.id as platform_user_id,
  pu.is_active as platform_user_active,
  pu.last_login
FROM creators c
LEFT JOIN users u ON c.platform_access_granted_by = u.id
LEFT JOIN platform_users pu ON c.id = pu.creator_id
WHERE c.platform_access_status IS NOT NULL;

-- 4.2. View de businesses com acesso à plataforma
CREATE OR REPLACE VIEW v_businesses_platform_access AS
SELECT 
  b.id,
  b.name,
  b.slug,
  b.platform_access_status,
  b.platform_owner_name,
  b.platform_owner_email,
  b.platform_additional_users,
  b.platform_access_granted_at,
  u.full_name as granted_by_name,
  COUNT(pu.id) as total_platform_users
FROM businesses b
LEFT JOIN users u ON b.platform_access_granted_by = u.id
LEFT JOIN platform_users pu ON b.id = pu.business_id
WHERE b.platform_access_status IS NOT NULL
GROUP BY b.id, b.name, b.slug, b.platform_access_status, 
         b.platform_owner_name, b.platform_owner_email, 
         b.platform_additional_users, b.platform_access_granted_at, u.full_name;

-- =====================================================
-- PARTE 5: FUNÇÕES AUXILIARES
-- =====================================================

-- 5.1. Função para liberar acesso de creator
CREATE OR REPLACE FUNCTION grant_creator_platform_access(
  p_creator_id UUID,
  p_email VARCHAR,
  p_roles platform_user_role[],
  p_granted_by UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE creators
  SET
    platform_access_status = 'granted',
    platform_email = p_email,
    platform_roles = p_roles,
    platform_access_granted_at = NOW(),
    platform_access_granted_by = p_granted_by
  WHERE id = p_creator_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 5.2. Função para liberar acesso de business
CREATE OR REPLACE FUNCTION grant_business_platform_access(
  p_business_id UUID,
  p_owner_name VARCHAR,
  p_owner_email VARCHAR,
  p_owner_whatsapp VARCHAR,
  p_additional_users JSONB,
  p_granted_by UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE businesses
  SET
    platform_access_status = 'granted',
    platform_owner_name = p_owner_name,
    platform_owner_email = p_owner_email,
    platform_owner_whatsapp = p_owner_whatsapp,
    platform_additional_users = p_additional_users,
    platform_access_granted_at = NOW(),
    platform_access_granted_by = p_granted_by
  WHERE id = p_business_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 5.3. Função auxiliar para verificar acesso a business
CREATE OR REPLACE FUNCTION user_has_access_to_business(
  p_user_id UUID,
  p_business_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM platform_users
    WHERE id = p_user_id
    AND (
      business_id = p_business_id
      OR p_business_id = ANY(managed_businesses)
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5.4. Função auxiliar para listar businesses do usuário
CREATE OR REPLACE FUNCTION get_user_businesses(p_user_id UUID)
RETURNS TABLE (
  business_id UUID,
  business_name VARCHAR,
  is_primary BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id,
    b.name,
    (b.id = pu.business_id) as is_primary
  FROM platform_users pu
  CROSS JOIN LATERAL (
    SELECT id, name FROM businesses
    WHERE id = pu.business_id OR id = ANY(pu.managed_businesses)
  ) b
  WHERE pu.id = p_user_id
  AND 'business_owner' = ANY(pu.roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- PARTE 6: CONSTRAINTS DE SEGURANÇA
-- =====================================================

-- 6.1. Remover constraints existentes (se houver)
ALTER TABLE platform_users DROP CONSTRAINT IF EXISTS check_business_owner_has_business;
ALTER TABLE platform_users DROP CONSTRAINT IF EXISTS check_creator_has_creator_id;

-- 6.2. Constraint para garantir que business_owner tem business_id
ALTER TABLE platform_users
  ADD CONSTRAINT check_business_owner_has_business
  CHECK (
    (NOT ('business_owner' = ANY(roles)))
    OR
    (business_id IS NOT NULL OR array_length(managed_businesses, 1) > 0)
  );

-- 6.3. Constraint para garantir que creator tem creator_id
ALTER TABLE platform_users
  ADD CONSTRAINT check_creator_has_creator_id
  CHECK (
    (NOT ('creator' = ANY(roles)))
    OR
    (creator_id IS NOT NULL)
  );

-- =====================================================
-- PARTE 7: ÍNDICES PARA PERFORMANCE E SEGURANÇA
-- =====================================================

-- 7.1. Índices para RLS queries
CREATE INDEX IF NOT EXISTS idx_platform_users_business_id
  ON platform_users(business_id);

CREATE INDEX IF NOT EXISTS idx_platform_users_managed_businesses
  ON platform_users USING GIN(managed_businesses);

CREATE INDEX IF NOT EXISTS idx_platform_users_creator_id
  ON platform_users(creator_id);

CREATE INDEX IF NOT EXISTS idx_platform_users_roles
  ON platform_users USING GIN(roles);

CREATE INDEX IF NOT EXISTS idx_campaigns_business_id
  ON campaigns(business_id) WHERE business_id IS NOT NULL;

-- =====================================================
-- PARTE 8: AUDITORIA E LOGS
-- =====================================================

-- 8.1. Tabela de auditoria de acesso
CREATE TABLE IF NOT EXISTS platform_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES platform_users(id),
  action VARCHAR(50), -- 'login', 'access_business', 'access_campaign', etc
  resource_type VARCHAR(50), -- 'business', 'campaign', 'creator', etc
  resource_id UUID,
  ip_address INET,
  user_agent TEXT,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_audit_user
  ON platform_access_audit(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_access_audit_resource
  ON platform_access_audit(resource_type, resource_id);

-- 8.2. Função para registrar acesso
CREATE OR REPLACE FUNCTION log_platform_access(
  p_user_id UUID,
  p_action VARCHAR,
  p_resource_type VARCHAR,
  p_resource_id UUID,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_audit_id UUID;
BEGIN
  INSERT INTO platform_access_audit (
    user_id,
    action,
    resource_type,
    resource_id,
    ip_address,
    user_agent
  ) VALUES (
    p_user_id,
    p_action,
    p_resource_type,
    p_resource_id,
    p_ip_address,
    p_user_agent
  )
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

SELECT 'Migration 030 executada com sucesso!' as status;
SELECT 'Triggers criados e funções auxiliares disponíveis!' as info;
SELECT 'RLS será configurado separadamente para evitar conflitos' as rls_info;

