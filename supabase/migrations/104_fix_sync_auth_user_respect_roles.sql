-- Fix: sync_auth_user_to_platform_users trigger was overwriting roles on every auth.users update
-- This caused strategists (with entity_type='creator' in auth metadata) to have their
-- role reset to 'creator' every time they logged in or refreshed their token.
--
-- Changes:
-- 1. If platform_user already exists, preserve role/roles (only update non-sensitive fields)
-- 2. For new creators, check creators.platform_roles as source of truth
-- 3. Also check raw_user_meta_data->>'role' for marketing_strategist override
-- 4. Use ON CONFLICT DO NOTHING instead of DO UPDATE to prevent overwrites

CREATE OR REPLACE FUNCTION sync_auth_user_to_platform_users()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_entity_type TEXT;
  v_metadata_role TEXT;
  v_creator_id UUID;
  v_business_id UUID;
  v_full_name TEXT;
  v_organization_id UUID := '00000000-0000-0000-0000-000000000001';
  v_creator_platform_roles TEXT[];
  v_creator_is_strategist BOOLEAN;
  v_existing_platform_user RECORD;
BEGIN
  BEGIN
    RAISE LOG '🔔 [503] Trigger on_auth_user_created para: % (ID: %)', NEW.email, NEW.id;

    v_entity_type := NEW.raw_user_meta_data->>'entity_type';
    v_metadata_role := NEW.raw_user_meta_data->>'role';
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));

    IF v_entity_type IS NULL THEN
      RAISE LOG '⏭️ [503] Usuário % sem entity_type, pulando', NEW.email;
      RETURN NEW;
    END IF;

    -- Se platform_user já existe, NÃO sobrescrever role/roles
    SELECT id, role, roles INTO v_existing_platform_user
    FROM platform_users WHERE id = NEW.id;

    IF v_existing_platform_user.id IS NOT NULL THEN
      RAISE LOG '⏭️ [503] Platform user % já existe com role=%, preservando roles', NEW.email, v_existing_platform_user.role;

      UPDATE platform_users SET
        email = NEW.email,
        full_name = COALESCE(v_full_name, full_name),
        is_active = true,
        email_verified = NEW.email_confirmed_at IS NOT NULL,
        updated_at = NOW()
      WHERE id = NEW.id;

      RETURN NEW;
    END IF;

    -- Determinar role para NOVOS platform_users
    IF v_entity_type = 'creator' THEN
      v_role := 'creator';
      BEGIN
        v_creator_id := (NEW.raw_user_meta_data->>'creator_id')::UUID;
      EXCEPTION WHEN OTHERS THEN
        RAISE LOG '⚠️ [503] Erro ao converter creator_id: %', SQLERRM;
        RETURN NEW;
      END;
      v_business_id := NULL;

      -- Checar metadata_role
      IF v_metadata_role = 'marketing_strategist' THEN
        v_role := 'marketing_strategist';
        RAISE LOG '🔄 [503] Creator % promovido a marketing_strategist via metadata role', NEW.email;
      END IF;

      -- Checar creators.platform_roles como fonte de verdade
      IF v_creator_id IS NOT NULL THEN
        SELECT platform_roles, is_strategist
        INTO v_creator_platform_roles, v_creator_is_strategist
        FROM creators WHERE id = v_creator_id;

        IF v_creator_is_strategist = true OR 'marketing_strategist' = ANY(COALESCE(v_creator_platform_roles, ARRAY[]::TEXT[])) THEN
          v_role := 'marketing_strategist';
          RAISE LOG '🔄 [503] Creator % promovido a marketing_strategist via creators.platform_roles', NEW.email;
        END IF;
      END IF;

    ELSIF v_entity_type = 'business' THEN
      v_role := 'business_owner';
      v_creator_id := NULL;
      BEGIN
        v_business_id := (NEW.raw_user_meta_data->>'business_id')::UUID;
      EXCEPTION WHEN OTHERS THEN
        RAISE LOG '⚠️ [503] Erro ao converter business_id: %', SQLERRM;
        RETURN NEW;
      END;

    ELSIF v_entity_type = 'marketing_strategist' THEN
      v_role := 'marketing_strategist';
      BEGIN
        v_creator_id := (NEW.raw_user_meta_data->>'creator_id')::UUID;
      EXCEPTION WHEN OTHERS THEN
        RAISE LOG '⚠️ [503] Erro ao converter creator_id (strategist): %', SQLERRM;
        RETURN NEW;
      END;
      v_business_id := NULL;

    ELSIF v_entity_type = 'internal_user' THEN
      RAISE LOG '⏭️ [503] Usuário interno %, pulando platform_users', NEW.email;
      RETURN NEW;

    ELSE
      RAISE LOG '⚠️ [503] Entity type desconhecido: %, pulando', v_entity_type;
      RETURN NEW;
    END IF;

    RAISE LOG '💾 [503] Inserindo novo platform_user: role=%, creator_id=%, business_id=%', v_role, v_creator_id, v_business_id;

    BEGIN
      INSERT INTO platform_users (
        id, organization_id, email, full_name, role, roles,
        creator_id, business_id, is_active, email_verified,
        created_at, updated_at
      ) VALUES (
        NEW.id, v_organization_id, NEW.email, v_full_name,
        v_role::platform_user_role,
        CASE
          WHEN v_role = 'marketing_strategist' THEN ARRAY['creator'::platform_user_role, 'marketing_strategist'::platform_user_role]
          ELSE ARRAY[v_role::platform_user_role]
        END,
        v_creator_id, v_business_id, true,
        NEW.email_confirmed_at IS NOT NULL,
        NOW(), NOW()
      )
      ON CONFLICT (id) DO NOTHING;

      RAISE LOG '✅ [503] Platform user criado: %', NEW.email;

    EXCEPTION
      WHEN foreign_key_violation THEN
        RAISE LOG '⚠️ [503] FK violation para %, tentando sem FKs', NEW.email;
        BEGIN
          INSERT INTO platform_users (
            id, organization_id, email, full_name, role, roles,
            is_active, email_verified, created_at, updated_at
          ) VALUES (
            NEW.id, v_organization_id, NEW.email, v_full_name,
            v_role::platform_user_role, ARRAY[v_role::platform_user_role],
            true, NEW.email_confirmed_at IS NOT NULL,
            NOW(), NOW()
          )
          ON CONFLICT (id) DO NOTHING;
          RAISE LOG '✅ [503] Platform user criado sem FKs: %', NEW.email;
        EXCEPTION WHEN OTHERS THEN
          RAISE LOG '❌ [503] Falha no fallback sem FKs: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
        END;
      WHEN OTHERS THEN
        RAISE LOG '❌ [503] Erro ao inserir platform_user: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
    END;

    IF v_entity_type = 'business' AND v_business_id IS NOT NULL THEN
      BEGIN
        UPDATE businesses
        SET platform_auth_user_id = NEW.id,
            platform_access_status = 'granted',
            platform_invitation_sent_at = NOW(),
            updated_at = NOW()
        WHERE id = v_business_id;
        RAISE LOG '✅ [503] Business % vinculado', v_business_id;
      EXCEPTION WHEN OTHERS THEN
        RAISE LOG '❌ [503] Erro ao atualizar business: % (SQLSTATE: %)', SQLERRM, SQLSTATE;
      END;
    END IF;

  EXCEPTION WHEN OTHERS THEN
    RAISE LOG '🚨 [503] ERRO FATAL no trigger on_auth_user_created: % (SQLSTATE: %) - NÃO impedindo auth', SQLERRM, SQLSTATE;
  END;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
