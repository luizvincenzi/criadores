-- =====================================================
-- INVESTIGAR PROBLEMA: Barbara Gonzales - Role mudando de marketing_strategist para creator
-- =====================================================
-- Data: 2025-12-19
-- Problema: Role está sendo sobrescrito automaticamente pelo trigger
-- =====================================================

-- ============================================
-- 1️⃣ VERIFICAR DADOS ATUAIS EM PLATFORM_USERS
-- ============================================
SELECT 
  id,
  email,
  full_name,
  role,
  roles,
  creator_id,
  is_active,
  created_at,
  updated_at
FROM platform_users
WHERE email ILIKE '%barbara%gonzales%' OR full_name ILIKE '%barbara%gonzales%';

-- ============================================
-- 2️⃣ VERIFICAR DADOS NA TABELA CREATORS
-- ============================================
SELECT 
  id,
  name,
  platform_email,
  platform_roles,  -- ← ESTE É O CAMPO CRÍTICO!
  platform_access_status,
  platform_access_granted_at,
  platform_access_granted_by,
  platform_password_hash,
  created_at,
  updated_at
FROM creators
WHERE platform_email ILIKE '%barbara%gonzales%' OR name ILIKE '%barbara%gonzales%';

-- ============================================
-- 3️⃣ VERIFICAR SE HÁ MÚLTIPLOS REGISTROS
-- ============================================
SELECT 
  'platform_users' as tabela,
  COUNT(*) as total
FROM platform_users
WHERE email ILIKE '%barbara%' OR full_name ILIKE '%barbara%'
UNION ALL
SELECT 
  'creators' as tabela,
  COUNT(*) as total
FROM creators
WHERE platform_email ILIKE '%barbara%' OR name ILIKE '%barbara%';

-- ============================================
-- 4️⃣ VERIFICAR AUDIT LOG (se existir)
-- ============================================
SELECT 
  id,
  table_name,
  action,
  old_data,
  new_data,
  changed_by,
  created_at
FROM audit_logs
WHERE 
  (old_data::text ILIKE '%barbara%' OR new_data::text ILIKE '%barbara%')
  AND created_at > NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 20;

-- ============================================
-- 5️⃣ VERIFICAR TRIGGER ATIVO
-- ============================================
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trigger_sync_creator_platform_access';

-- ============================================
-- 📝 DIAGNÓSTICO
-- ============================================
-- Se platform_roles em creators NÃO contém 'marketing_strategist':
--   → O trigger vai sobrescrever role para 'creator' toda vez que creators for atualizado
--
-- Se platform_roles em creators CONTÉM 'marketing_strategist':
--   → Algo está atualizando a tabela creators e removendo o role
--
-- ============================================
-- ✅ SOLUÇÃO TEMPORÁRIA (se platform_roles estiver errado)
-- ============================================
-- Descomente e execute APENAS se platform_roles não tiver 'marketing_strategist':

/*
-- 1. Atualizar platform_roles na tabela creators
UPDATE creators
SET 
  platform_roles = ARRAY['marketing_strategist', 'creator']::platform_user_role[],
  updated_at = NOW()
WHERE platform_email ILIKE '%barbara%gonzales%';

-- 2. Atualizar role em platform_users (será sobrescrito pelo trigger, mas vamos garantir)
UPDATE platform_users
SET 
  role = 'marketing_strategist'::platform_user_role,
  roles = ARRAY['marketing_strategist', 'creator']::platform_user_role[],
  updated_at = NOW()
WHERE email ILIKE '%barbara%gonzales%';

-- 3. Verificar resultado
SELECT 
  c.name as creator_name,
  c.platform_email,
  c.platform_roles as creator_platform_roles,
  pu.email as platform_user_email,
  pu.role as platform_user_role,
  pu.roles as platform_user_roles
FROM creators c
LEFT JOIN platform_users pu ON c.id = pu.creator_id
WHERE c.platform_email ILIKE '%barbara%gonzales%';
*/

-- ============================================
-- 🔧 SOLUÇÃO PERMANENTE
-- ============================================
-- Se o problema persistir, precisamos:
-- 1. Modificar o trigger para NÃO sobrescrever role se já estiver correto
-- 2. OU adicionar uma flag para "lock" o role e impedir alterações automáticas
-- 3. OU desabilitar o trigger para usuários específicos

-- ============================================
-- 📊 RESULTADO ESPERADO
-- ============================================
-- creators.platform_roles deve conter: ['marketing_strategist', 'creator']
-- platform_users.role deve ser: 'marketing_strategist'
-- platform_users.roles deve conter: ['marketing_strategist', 'creator']

