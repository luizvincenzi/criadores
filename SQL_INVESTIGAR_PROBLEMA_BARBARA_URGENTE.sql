-- =====================================================
-- 🚨 SOLUÇÃO DEFINITIVA: Barbara Gonzales
-- =====================================================
-- O role voltou a ser 'creator' mesmo após correção!
--
-- PROBLEMA IDENTIFICADO:
-- - platform_user.id = 62c5018f-a252-43d4-8bb3-96aa547a18d0
-- - creator_id = e17a2423-e5da-4f0d-8cf4-0cc4a164b010
-- - IDs são DIFERENTES! O trigger usa o ID do creator!
-- - O trigger usa ON CONFLICT (id) mas o ID é diferente!
-- - O platform_roles do creator NÃO contém marketing_strategist!
-- =====================================================

-- ============================================
-- 🔴 EXECUTE ESTE BLOCO PRIMEIRO (SOLUÇÃO DEFINITIVA)
-- ============================================

-- PASSO 1: Desabilitar o trigger temporariamente
ALTER TABLE creators DISABLE TRIGGER trigger_sync_creator_platform_access;

-- PASSO 2: Corrigir platform_users (role e roles)
UPDATE platform_users
SET
  role = 'marketing_strategist'::platform_user_role,
  roles = ARRAY['marketing_strategist', 'creator']::platform_user_role[],
  updated_at = NOW()
WHERE email = 'mkt.boussole@gmail.com';

-- PASSO 3: Corrigir creators (platform_roles) - ISSO É CRÍTICO!
-- Se platform_roles não contém marketing_strategist, o trigger vai sobrescrever!
UPDATE creators
SET
  platform_roles = ARRAY['marketing_strategist', 'creator']::platform_user_role[],
  updated_at = NOW()
WHERE id = 'e17a2423-e5da-4f0d-8cf4-0cc4a164b010';

-- PASSO 4: Reabilitar o trigger
ALTER TABLE creators ENABLE TRIGGER trigger_sync_creator_platform_access;

-- PASSO 5: Verificar resultado
SELECT
  'PLATFORM_USERS' as tabela,
  pu.id,
  pu.email,
  pu.role,
  pu.roles,
  pu.creator_id,
  pu.updated_at
FROM platform_users pu
WHERE email = 'mkt.boussole@gmail.com';

SELECT
  'CREATORS' as tabela,
  c.id,
  c.name,
  c.platform_email,
  c.platform_roles,
  c.updated_at
FROM creators c
WHERE c.id = 'e17a2423-e5da-4f0d-8cf4-0cc4a164b010';

-- ============================================
-- ✅ SE TUDO ESTIVER CORRETO, VOCÊ VERÁ:
-- platform_users.role = 'marketing_strategist'
-- platform_users.roles = ['marketing_strategist', 'creator']
-- creators.platform_roles = ['marketing_strategist', 'creator']
-- ============================================

-- ============================================
-- 1️⃣ VERIFICAR SE HÁ MÚLTIPLOS REGISTROS EM PLATFORM_USERS
-- ============================================
SELECT 
  id,
  email,
  full_name,
  role,
  roles,
  creator_id,
  created_at,
  updated_at,
  last_login,
  'ESTE É O REGISTRO ATUAL' as nota
FROM platform_users
WHERE email ILIKE '%mkt.boussole%' OR email ILIKE '%barbara%';

-- ============================================
-- 2️⃣ VERIFICAR DADOS DO CREATOR (FONTE DO TRIGGER)
-- ============================================
SELECT 
  id as creator_id,
  name,
  platform_email,
  platform_roles,
  platform_access_status,
  platform_password_hash IS NOT NULL as has_password,
  created_at,
  updated_at,
  'SE platform_roles NÃO CONTÉM marketing_strategist, É AQUI O PROBLEMA!' as alerta
FROM creators
WHERE id = 'e17a2423-e5da-4f0d-8cf4-0cc4a164b010'
   OR platform_email ILIKE '%mkt.boussole%'
   OR name ILIKE '%barbara%';

-- ============================================
-- 3️⃣ VERIFICAR SE O TRIGGER EXISTE E ESTÁ ATIVO
-- ============================================
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_timing,
  action_statement
FROM information_schema.triggers
WHERE trigger_name LIKE '%sync_creator%';

-- ============================================
-- 4️⃣ VERIFICAR A FUNÇÃO DO TRIGGER (QUAL VERSÃO ESTÁ ATIVA?)
-- ============================================
SELECT 
  routine_name,
  routine_definition
FROM information_schema.routines
WHERE routine_name = 'sync_creator_to_platform_user'
  AND routine_type = 'FUNCTION';

-- ============================================
-- 5️⃣ VERIFICAR LOGS DE MUDANÇAS RECENTES
-- ============================================
SELECT 
  id,
  table_name,
  action,
  old_data->>'role' as old_role,
  new_data->>'role' as new_role,
  changed_by,
  created_at
FROM audit_logs
WHERE (table_name = 'platform_users' OR table_name = 'creators')
  AND (old_data::text ILIKE '%barbara%' OR new_data::text ILIKE '%barbara%' OR 
       old_data::text ILIKE '%mkt.boussole%' OR new_data::text ILIKE '%mkt.boussole%')
ORDER BY created_at DESC
LIMIT 20;

-- ============================================
-- 6️⃣ CORREÇÃO PERMANENTE DO TRIGGER (OPCIONAL)
-- ============================================
-- Execute este bloco APENAS se quiser corrigir o trigger permanentemente
-- para que ele use creator_id ao invés de id para encontrar o registro

/*
CREATE OR REPLACE FUNCTION sync_creator_to_platform_user()
RETURNS TRIGGER AS $$
DECLARE
  existing_user_id UUID;
BEGIN
  -- Se acesso foi liberado (INSERT ou UPDATE)
  IF NEW.platform_access_status = 'granted' AND
     NEW.platform_email IS NOT NULL AND
     (TG_OP = 'INSERT' OR OLD.platform_access_status IS NULL OR OLD.platform_access_status != 'granted') THEN

    -- Verificar se já existe um platform_user com este creator_id
    SELECT id INTO existing_user_id
    FROM platform_users
    WHERE creator_id = NEW.id;

    IF existing_user_id IS NOT NULL THEN
      -- Atualizar o registro existente (usando creator_id, não id)
      UPDATE platform_users SET
        is_active = true,
        email = NEW.platform_email,
        full_name = NEW.name,
        -- PRESERVAR role se já é marketing_strategist
        role = CASE
          WHEN role = 'marketing_strategist' THEN 'marketing_strategist'
          WHEN 'marketing_strategist' = ANY(NEW.platform_roles) THEN 'marketing_strategist'
          ELSE 'creator'
        END,
        roles = NEW.platform_roles,
        password_hash = COALESCE(NEW.platform_password_hash, password_hash),
        updated_at = NOW()
      WHERE creator_id = NEW.id;

      RAISE NOTICE '✅ Creator % atualizado em platform_users (preservando role)', NEW.name;
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
*/

