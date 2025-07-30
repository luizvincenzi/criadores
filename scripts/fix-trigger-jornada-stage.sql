-- Script para corrigir a função trigger_create_jornada_tasks
-- Execute no SQL Editor do Supabase Dashboard

-- 1. Primeiro, vamos recriar a função trigger_create_jornada_tasks corrigida
CREATE OR REPLACE FUNCTION trigger_create_jornada_tasks()
RETURNS TRIGGER AS $$
DECLARE
  business_name_val VARCHAR(255);
  campaign_month_val VARCHAR(50);
  default_user_id UUID;
  valid_org_id UUID;
BEGIN
  -- Buscar informações da campanha
  SELECT b.name, NEW.month INTO business_name_val, campaign_month_val
  FROM businesses b
  WHERE b.id = NEW.business_id;

  -- Verificar se a organization_id é válida, senão usar a padrão
  SELECT id INTO valid_org_id
  FROM organizations
  WHERE id = NEW.organization_id
  LIMIT 1;

  -- Se não encontrar a organização, usar a organização padrão
  IF valid_org_id IS NULL THEN
    SELECT id INTO valid_org_id
    FROM organizations
    WHERE is_active = true
    ORDER BY created_at ASC
    LIMIT 1;
  END IF;

  -- Se ainda não encontrar, usar UUID padrão
  IF valid_org_id IS NULL THEN
    valid_org_id := '00000000-0000-0000-0000-000000000001'::UUID;
  END IF;

  -- Buscar um usuário padrão para created_by (não pode ser NULL)
  SELECT id INTO default_user_id
  FROM users
  WHERE organization_id = valid_org_id
  ORDER BY created_at ASC
  LIMIT 1;

  -- Se não encontrar usuário, usar um UUID padrão do sistema
  IF default_user_id IS NULL THEN
    default_user_id := '00000000-0000-0000-0000-000000000001'::UUID;
  END IF;

  -- Se o status da campanha mudou, criar tarefas automáticas
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    PERFORM create_automatic_jornada_tasks(
      business_name_val,
      campaign_month_val,
      NEW.status::campaign_status,  -- ✅ CORRIGIDO: usar campaign_status em vez de jornada_stage
      valid_org_id,                 -- ✅ CORRIGIDO: usar organization_id válida
      NEW.business_id,
      NEW.id,
      default_user_id -- ✅ CORRIGIDO: usar usuário válido em vez de NULL
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Verificar organizações disponíveis
SELECT
  id,
  name,
  is_active,
  created_at
FROM organizations
ORDER BY created_at;

-- 3. Verificar se a função foi atualizada corretamente
SELECT
  proname as function_name,
  prosrc as source_code
FROM pg_proc
WHERE proname = 'trigger_create_jornada_tasks';

-- 4. Verificar se ainda há outras referências a jornada_stage
SELECT
  proname as function_name,
  pg_get_function_arguments(oid) as arguments
FROM pg_proc
WHERE pg_get_function_arguments(oid) LIKE '%jornada_stage%'
   OR prosrc LIKE '%jornada_stage%'
ORDER BY proname;
