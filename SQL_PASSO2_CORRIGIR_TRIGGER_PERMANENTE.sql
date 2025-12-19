-- =====================================================
-- 🔧 PASSO 2: CORRIGIR TRIGGER PERMANENTEMENTE
-- =====================================================
-- Este trigger PRESERVA o role existente se já for marketing_strategist
-- Usa creator_id para encontrar o registro (não id)
-- =====================================================

-- 1️⃣ RECRIAR A FUNÇÃO DO TRIGGER COM LÓGICA CORRIGIDA
CREATE OR REPLACE FUNCTION sync_creator_to_platform_user()
RETURNS TRIGGER AS $$
DECLARE
  existing_user_id UUID;
  existing_role platform_user_role;
BEGIN
  -- Se acesso foi liberado (INSERT ou UPDATE)
  IF NEW.platform_access_status = 'granted' AND 
     NEW.platform_email IS NOT NULL AND
     (TG_OP = 'INSERT' OR OLD.platform_access_status IS NULL OR OLD.platform_access_status != 'granted') THEN
    
    -- Verificar se já existe um platform_user com este creator_id OU email
    SELECT id, role INTO existing_user_id, existing_role
    FROM platform_users 
    WHERE creator_id = NEW.id OR email = NEW.platform_email
    LIMIT 1;
    
    IF existing_user_id IS NOT NULL THEN
      -- Atualizar o registro existente (usando creator_id ou email)
      UPDATE platform_users SET
        is_active = true,
        email = NEW.platform_email,
        full_name = NEW.name,
        creator_id = NEW.id,
        -- 🔒 PRESERVAR role se já é marketing_strategist
        role = CASE 
          WHEN existing_role = 'marketing_strategist' THEN 'marketing_strategist'
          WHEN 'marketing_strategist' = ANY(NEW.platform_roles) THEN 'marketing_strategist'
          ELSE 'creator'
        END,
        -- 🔒 PRESERVAR marketing_strategist no array se já existe
        roles = CASE
          WHEN existing_role = 'marketing_strategist' AND NOT ('marketing_strategist' = ANY(NEW.platform_roles))
            THEN array_cat(ARRAY['marketing_strategist']::platform_user_role[], NEW.platform_roles)
          ELSE NEW.platform_roles
        END,
        password_hash = COALESCE(NEW.platform_password_hash, password_hash),
        updated_at = NOW()
      WHERE id = existing_user_id;
      
      RAISE NOTICE '✅ Creator % atualizado em platform_users (role preservado: %)', NEW.name, existing_role;
    ELSE
      -- Criar novo registro
      INSERT INTO platform_users (
        id,
        organization_id,
        email,
        full_name,
        role,
        roles,
        creator_id,
        is_active,
        platform,
        password_hash,
        created_at,
        updated_at
      ) VALUES (
        NEW.id,
        NEW.organization_id,
        NEW.platform_email,
        NEW.name,
        CASE 
          WHEN 'marketing_strategist' = ANY(NEW.platform_roles) THEN 'marketing_strategist'
          ELSE 'creator'
        END,
        NEW.platform_roles,
        NEW.id,
        true,
        'client',
        NEW.platform_password_hash,
        NOW(),
        NOW()
      );
      
      RAISE NOTICE '✅ Creator % criado em platform_users', NEW.name;
    END IF;
  END IF;
  
  -- Se acesso foi negado/revogado
  IF NEW.platform_access_status IN ('denied', 'revoked', 'suspended') THEN
    UPDATE platform_users 
    SET is_active = false, updated_at = NOW()
    WHERE creator_id = NEW.id;
    
    RAISE NOTICE '❌ Acesso do creator % desativado', NEW.name;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2️⃣ RECRIAR O TRIGGER (usa a função atualizada)
DROP TRIGGER IF EXISTS trigger_sync_creator_platform_access ON creators;

CREATE TRIGGER trigger_sync_creator_platform_access
  AFTER INSERT OR UPDATE OF platform_access_status, platform_email, platform_roles, platform_password_hash ON creators
  FOR EACH ROW
  EXECUTE FUNCTION sync_creator_to_platform_user();

-- 3️⃣ VERIFICAR SE O TRIGGER FOI CRIADO CORRETAMENTE
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_sync_creator_platform_access';

-- =====================================================
-- ✅ MUDANÇAS FEITAS:
-- =====================================================
-- 1. Busca por creator_id OU email (não apenas por id)
-- 2. Preserva role = 'marketing_strategist' se já existir
-- 3. Preserva 'marketing_strategist' no array roles se já existir
-- 4. Usa UPDATE por id do registro existente (não ON CONFLICT)
-- 5. Logs mais claros para debugging
-- =====================================================

-- 4️⃣ TESTE: Simular update no creator para ver se funciona
-- (Descomente para testar)
/*
UPDATE creators
SET updated_at = NOW()
WHERE platform_email = 'mkt.boussole@gmail.com';

-- Verificar se o role foi preservado
SELECT email, role, roles
FROM platform_users
WHERE email = 'mkt.boussole@gmail.com';
*/

