-- =====================================================
-- MIGRATION 033: Corrigir Sincronização Automática Creator → Platform_Users
-- =====================================================
-- Problema: Trigger só dispara em UPDATE, não em INSERT inicial
-- Solução: Adicionar INSERT ao trigger + sincronizar creators existentes
-- Data: 2025-10-22
-- =====================================================

-- 1. Atualizar trigger para incluir INSERT
DROP TRIGGER IF EXISTS trigger_sync_creator_platform_access ON creators;

CREATE OR REPLACE FUNCTION sync_creator_to_platform_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Se acesso foi liberado (INSERT ou UPDATE)
  IF NEW.platform_access_status = 'granted' AND 
     NEW.platform_email IS NOT NULL AND
     (TG_OP = 'INSERT' OR OLD.platform_access_status IS NULL OR OLD.platform_access_status != 'granted') THEN
    
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
      platform,
      password_hash,
      created_at,
      updated_at
    ) VALUES (
      NEW.id, -- ← MESMO UUID!
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
    )
    ON CONFLICT (id) DO UPDATE SET
      is_active = true,
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      roles = EXCLUDED.roles,
      password_hash = EXCLUDED.password_hash,
      updated_at = NOW();
      
    RAISE NOTICE '✅ Creator % sincronizado com platform_users (email: %)', NEW.name, NEW.platform_email;
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

-- Criar trigger para INSERT e UPDATE
CREATE TRIGGER trigger_sync_creator_platform_access
  AFTER INSERT OR UPDATE OF platform_access_status, platform_email, platform_roles, platform_password_hash ON creators
  FOR EACH ROW
  EXECUTE FUNCTION sync_creator_to_platform_user();

-- 2. Sincronizar creators existentes que já têm acesso granted mas não têm platform_user
DO $$
DECLARE
  creator_record RECORD;
  created_count INTEGER := 0;
  updated_count INTEGER := 0;
BEGIN
  RAISE NOTICE '🔄 Iniciando sincronização de creators existentes...';
  
  FOR creator_record IN 
    SELECT c.*
    FROM creators c
    LEFT JOIN platform_users pu ON c.id = pu.id
    WHERE c.platform_access_status = 'granted'
      AND c.platform_email IS NOT NULL
      AND pu.id IS NULL
  LOOP
    -- Criar platform_user para este creator
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
      creator_record.id,
      creator_record.organization_id,
      creator_record.platform_email,
      creator_record.name,
      CASE 
        WHEN 'marketing_strategist' = ANY(creator_record.platform_roles) THEN 'marketing_strategist'
        ELSE 'creator'
      END,
      creator_record.platform_roles,
      creator_record.id,
      true,
      'client',
      creator_record.platform_password_hash,
      NOW(),
      NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      is_active = true,
      email = EXCLUDED.email,
      full_name = EXCLUDED.full_name,
      role = EXCLUDED.role,
      roles = EXCLUDED.roles,
      password_hash = EXCLUDED.password_hash,
      updated_at = NOW();
    
    IF FOUND THEN
      updated_count := updated_count + 1;
      RAISE NOTICE '♻️  Atualizado: % (email: %)', creator_record.name, creator_record.platform_email;
    ELSE
      created_count := created_count + 1;
      RAISE NOTICE '✅ Criado: % (email: %)', creator_record.name, creator_record.platform_email;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ Sincronização concluída! Criados: %, Atualizados: %', created_count, updated_count;
END $$;

-- 3. Verificar resultado
SELECT 
  '✅ Migration 033 executada com sucesso!' as status,
  COUNT(*) as total_platform_users_creators
FROM platform_users
WHERE creator_id IS NOT NULL;

-- 4. Mostrar creators com acesso granted e seus platform_users
SELECT 
  c.id as creator_id,
  c.name as creator_name,
  c.platform_email,
  c.platform_roles,
  c.platform_access_status,
  pu.id as platform_user_id,
  pu.is_active as platform_user_active,
  CASE 
    WHEN pu.id IS NULL THEN '❌ SEM PLATFORM_USER'
    WHEN pu.is_active THEN '✅ ATIVO'
    ELSE '⚠️ INATIVO'
  END as sync_status
FROM creators c
LEFT JOIN platform_users pu ON c.id = pu.id
WHERE c.platform_access_status = 'granted'
ORDER BY c.name;