-- =====================================================
-- 🔍 PASSO 1: VERIFICAR OUTROS USUÁRIOS COM MESMO PROBLEMA
-- =====================================================
-- Usuários que são marketing_strategist em platform_users
-- mas NÃO têm marketing_strategist em creators.platform_roles
-- =====================================================

-- 1️⃣ LISTAR TODOS OS MARKETING STRATEGISTS EM PLATFORM_USERS
SELECT 
  pu.id as platform_user_id,
  pu.email,
  pu.full_name,
  pu.role as pu_role,
  pu.roles as pu_roles,
  pu.creator_id,
  c.platform_roles as creator_platform_roles,
  CASE 
    WHEN c.id IS NULL THEN '⚠️ SEM CREATOR VINCULADO'
    WHEN 'marketing_strategist' = ANY(c.platform_roles) THEN '✅ OK'
    ELSE '🔴 PROBLEMA! platform_roles não tem marketing_strategist'
  END as status
FROM platform_users pu
LEFT JOIN creators c ON pu.creator_id = c.id
WHERE pu.role = 'marketing_strategist'
   OR 'marketing_strategist' = ANY(pu.roles);

-- 2️⃣ LISTAR TODOS OS CREATORS QUE TÊM PLATFORM_ACCESS
SELECT 
  c.id as creator_id,
  c.name,
  c.platform_email,
  c.platform_roles,
  c.platform_access_status,
  pu.id as platform_user_id,
  pu.role as pu_role,
  pu.roles as pu_roles,
  CASE 
    WHEN pu.id IS NULL THEN '⚠️ SEM PLATFORM_USER'
    WHEN pu.role = 'marketing_strategist' AND NOT ('marketing_strategist' = ANY(c.platform_roles)) 
      THEN '🔴 PROBLEMA! pu.role é marketing_strategist mas creator não tem'
    WHEN pu.role != 'marketing_strategist' AND 'marketing_strategist' = ANY(c.platform_roles)
      THEN '🔴 PROBLEMA! creator tem marketing_strategist mas pu.role não é'
    ELSE '✅ OK'
  END as status
FROM creators c
LEFT JOIN platform_users pu ON c.id = pu.creator_id OR c.platform_email = pu.email
WHERE c.platform_access_status = 'granted';

-- 3️⃣ VERIFICAR INCONSISTÊNCIAS (RESUMO)
SELECT 
  'TOTAL MARKETING STRATEGISTS em platform_users' as metrica,
  COUNT(*) as total
FROM platform_users
WHERE role = 'marketing_strategist';

SELECT 
  'TOTAL CREATORS com marketing_strategist em platform_roles' as metrica,
  COUNT(*) as total
FROM creators
WHERE 'marketing_strategist' = ANY(platform_roles);

-- 4️⃣ LISTAR USUÁRIOS QUE PRECISAM DE CORREÇÃO
SELECT 
  pu.email,
  pu.full_name,
  pu.role as pu_role,
  c.platform_roles as creator_platform_roles,
  '🔴 PRECISA CORRIGIR: adicionar marketing_strategist em creators.platform_roles' as acao
FROM platform_users pu
JOIN creators c ON pu.creator_id = c.id
WHERE pu.role = 'marketing_strategist'
  AND NOT ('marketing_strategist' = ANY(COALESCE(c.platform_roles, ARRAY[]::platform_user_role[])));

-- 5️⃣ SCRIPT DE CORREÇÃO AUTOMÁTICA (EXECUTE SE HOUVER PROBLEMAS)
/*
-- Desabilitar trigger
ALTER TABLE creators DISABLE TRIGGER trigger_sync_creator_platform_access;

-- Corrigir TODOS os creators que têm platform_users como marketing_strategist
UPDATE creators c
SET 
  platform_roles = ARRAY['marketing_strategist', 'creator']::platform_user_role[],
  updated_at = NOW()
FROM platform_users pu
WHERE pu.creator_id = c.id
  AND pu.role = 'marketing_strategist'
  AND NOT ('marketing_strategist' = ANY(COALESCE(c.platform_roles, ARRAY[]::platform_user_role[])));

-- Reabilitar trigger
ALTER TABLE creators ENABLE TRIGGER trigger_sync_creator_platform_access;

-- Verificar resultado
SELECT c.name, c.platform_roles, pu.role
FROM creators c
JOIN platform_users pu ON pu.creator_id = c.id
WHERE pu.role = 'marketing_strategist';
*/

