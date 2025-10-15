-- ========================================
-- EXECUTAR NO SUPABASE SQL EDITOR
-- ========================================
-- Este script finaliza a migração da Pietra
-- Desabilita temporariamente o trigger para evitar conflitos
-- ========================================

-- 1. Desabilitar trigger temporariamente
ALTER TABLE creators DISABLE TRIGGER sync_creator_to_platform_users_trigger;

-- 2. Atualizar Pietra original com dados de acesso
UPDATE creators 
SET 
  platform_email = 'pietramantovani98@gmail.com',
  platform_access_status = 'granted',
  platform_access_granted_at = NOW(),
  platform_access_granted_by = '00000000-0000-0000-0000-000000000001',
  platform_roles = ARRAY['creator', 'marketing_strategist']::platform_user_role[],
  contact_info = jsonb_build_object(
    'email', 'pietramantovani98@gmail.com',
    'whatsapp', '43 98807-2689',
    'phone', '',
    'preferred_contact', 'email'
  ),
  updated_at = NOW()
WHERE id = '548f643b-0e0d-4a34-8582-d682c0000000';

-- 3. Reabilitar trigger
ALTER TABLE creators ENABLE TRIGGER sync_creator_to_platform_users_trigger;

-- 4. Verificar resultado
SELECT 
  id,
  name,
  platform_email,
  platform_access_status,
  platform_roles,
  social_media->>'instagram' as instagram,
  contact_info->>'email' as contact_email
FROM creators 
WHERE id = '548f643b-0e0d-4a34-8582-d682c0000000';

-- 5. Verificar platform_users
SELECT 
  id,
  email,
  full_name,
  creator_id,
  roles,
  is_active
FROM platform_users 
WHERE email = 'pietramantovani98@gmail.com';

-- 6. Verificar campanhas
SELECT COUNT(*) as total_campanhas
FROM campaign_creators 
WHERE creator_id = '548f643b-0e0d-4a34-8582-d682c0000000';

