-- =====================================================
-- SOLUÇÃO PERMANENTE: Corrigir Trigger que Sobrescreve Role
-- =====================================================
-- Data: 2025-12-19
-- Problema: Trigger sync_creator_to_platform_user sobrescreve role mesmo quando já está correto
-- Solução: Modificar trigger para preservar role se já estiver como marketing_strategist
-- =====================================================

-- ============================================
-- 1️⃣ ATUALIZAR FUNÇÃO DO TRIGGER (VERSÃO MELHORADA)
-- ============================================
CREATE OR REPLACE FUNCTION sync_creator_to_platform_user()
RETURNS TRIGGER AS $$
DECLARE
  current_role platform_user_role;
  new_role platform_user_role;
BEGIN
  -- Se acesso foi liberado (INSERT ou UPDATE)
  IF NEW.platform_access_status = 'granted' AND 
     NEW.platform_email IS NOT NULL AND
     (TG_OP = 'INSERT' OR OLD.platform_access_status IS NULL OR OLD.platform_access_status != 'granted') THEN
    
    -- Determinar o novo role baseado em platform_roles
    new_role := CASE 
      WHEN 'marketing_strategist' = ANY(NEW.platform_roles) THEN 'marketing_strategist'
      ELSE 'creator'
    END;
    
    -- Verificar se já existe um platform_user
    SELECT role INTO current_role
    FROM platform_users
    WHERE id = NEW.id;
    
    -- Se já existe e o role atual é marketing_strategist, preservar
    IF current_role IS NOT NULL AND current_role = 'marketing_strategist' THEN
      -- Preservar marketing_strategist se já estiver definido
      new_role := 'marketing_strategist';
      RAISE NOTICE '🔒 Preservando role marketing_strategist para %', NEW.name;
    END IF;
    
    -- Criar ou ativar em platform_users com MESMO UUID
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
      new_role,  -- ← Usar o role determinado (preservando se necessário)
      NEW.platform_roles,
      NEW.id,
      true,
      'client',
      NEW.platform_password_hash,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      is_active = true,
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = CASE
        -- Se o role atual é marketing_strategist E está em platform_roles, preservar
        WHEN platform_users.role = 'marketing_strategist' 
             AND 'marketing_strategist' = ANY(EXCLUDED.roles) 
        THEN 'marketing_strategist'
        -- Caso contrário, usar o novo role
        ELSE EXCLUDED.role
      END,
      roles = EXCLUDED.roles,
      password_hash = COALESCE(EXCLUDED.password_hash, platform_users.password_hash),
      updated_at = NOW();
      
    RAISE NOTICE '✅ Creator % sincronizado com platform_users (email: %, role: %)', 
                 NEW.name, NEW.platform_email, new_role;
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

-- ============================================
-- 2️⃣ RECRIAR TRIGGER (mesmo nome, função atualizada)
-- ============================================
DROP TRIGGER IF EXISTS trigger_sync_creator_platform_access ON creators;

CREATE TRIGGER trigger_sync_creator_platform_access
  AFTER INSERT OR UPDATE OF platform_access_status, platform_email, platform_roles, platform_password_hash ON creators
  FOR EACH ROW
  EXECUTE FUNCTION sync_creator_to_platform_user();

-- ============================================
-- 3️⃣ CORRIGIR BARBARA GONZALES ESPECIFICAMENTE
-- ============================================

-- 3.1. Atualizar platform_roles na tabela creators
UPDATE creators
SET 
  platform_roles = ARRAY['marketing_strategist', 'creator']::platform_user_role[],
  updated_at = NOW()
WHERE platform_email ILIKE '%barbara%gonzales%'
  OR name ILIKE '%barbara%gonzales%';

-- 3.2. Atualizar role em platform_users
UPDATE platform_users
SET 
  role = 'marketing_strategist'::platform_user_role,
  roles = ARRAY['marketing_strategist', 'creator']::platform_user_role[],
  updated_at = NOW()
WHERE email ILIKE '%barbara%gonzales%'
  OR full_name ILIKE '%barbara%gonzales%';

-- ============================================
-- 4️⃣ VERIFICAR RESULTADO
-- ============================================
SELECT 
  '✅ VERIFICAÇÃO FINAL' as status,
  c.name as creator_name,
  c.platform_email,
  c.platform_roles as creator_platform_roles,
  pu.email as platform_user_email,
  pu.role as platform_user_role,
  pu.roles as platform_user_roles,
  CASE 
    WHEN pu.role = 'marketing_strategist' THEN '✅ CORRETO'
    ELSE '❌ AINDA ERRADO'
  END as status_role
FROM creators c
LEFT JOIN platform_users pu ON c.id = pu.creator_id
WHERE c.platform_email ILIKE '%barbara%gonzales%'
  OR c.name ILIKE '%barbara%gonzales%';

-- ============================================
-- 📝 NOTAS IMPORTANTES
-- ============================================
-- ✅ O trigger agora PRESERVA marketing_strategist se já estiver definido
-- ✅ Mesmo que creators seja atualizado, o role não será sobrescrito
-- ✅ Barbara Gonzales terá role permanente como marketing_strategist
-- ✅ Outros usuários não serão afetados

