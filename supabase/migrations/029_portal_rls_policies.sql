-- Migration 029: Políticas RLS para o Portal de Clientes
-- Data: 2025-01-29
-- Descrição: Row Level Security para isolamento de dados entre CRM e Portal

-- 1. Habilitar RLS nas novas tabelas
ALTER TABLE portal_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_portal_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portal_notifications ENABLE ROW LEVEL SECURITY;

-- 2. Políticas para portal_users
-- Usuários só veem seus próprios dados
CREATE POLICY "portal_users_own_data" ON portal_users
  FOR ALL USING (
    auth.uid()::text = id::text
  );

-- Admins do CRM podem ver todos os usuários do portal
CREATE POLICY "portal_users_admin_access" ON portal_users
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id::text = auth.uid()::text 
      AND u.role = 'admin'
      AND u.organization_id = portal_users.organization_id
    )
  );

-- 3. Políticas para portal_sessions
-- Usuários só veem suas próprias sessões
CREATE POLICY "portal_sessions_own_data" ON portal_sessions
  FOR ALL USING (
    auth.uid()::text = user_id::text
  );

-- 4. Políticas para business_portal_settings
-- Empresas veem apenas suas configurações
CREATE POLICY "business_portal_settings_own_data" ON business_portal_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM portal_users pu 
      WHERE pu.id::text = auth.uid()::text 
      AND pu.user_type = 'empresa' 
      AND pu.entity_id = business_portal_settings.business_id
    )
    OR
    -- Admins do CRM podem ver todas as configurações
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id::text = auth.uid()::text 
      AND u.role = 'admin'
    )
  );

-- 5. Políticas para portal_notifications
-- Usuários só veem suas próprias notificações
CREATE POLICY "portal_notifications_own_data" ON portal_notifications
  FOR ALL USING (
    auth.uid()::text = user_id::text
  );

-- 6. Políticas para businesses (acesso do portal)
CREATE POLICY "businesses_portal_access" ON businesses
  FOR SELECT USING (
    -- Empresa vê apenas seus dados
    EXISTS (
      SELECT 1 FROM portal_users pu 
      WHERE pu.id::text = auth.uid()::text 
      AND pu.user_type = 'empresa' 
      AND pu.entity_id = businesses.id
    )
    OR
    -- Funcionários internos veem tudo (CRM)
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id::text = auth.uid()::text 
      AND u.organization_id = businesses.organization_id
    )
  );

-- 7. Políticas para campaigns (acesso do portal)
CREATE POLICY "campaigns_portal_access" ON campaigns
  FOR SELECT USING (
    -- Empresa vê suas campanhas
    EXISTS (
      SELECT 1 FROM portal_users pu 
      WHERE pu.id::text = auth.uid()::text 
      AND pu.user_type = 'empresa' 
      AND pu.entity_id = campaigns.business_id
    )
    OR
    -- Criador vê campanhas onde participa
    EXISTS (
      SELECT 1 FROM portal_users pu 
      JOIN campaign_creators cc ON cc.creator_id = pu.entity_id
      WHERE pu.id::text = auth.uid()::text 
      AND pu.user_type = 'criador' 
      AND cc.campaign_id = campaigns.id
      AND cc.status != 'Removido'
    )
    OR
    -- Funcionários internos veem tudo (CRM)
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id::text = auth.uid()::text 
      AND u.organization_id = campaigns.organization_id
    )
  );

-- 8. Políticas para creators (acesso do portal)
CREATE POLICY "creators_portal_access" ON creators
  FOR SELECT USING (
    -- Criador vê apenas seus próprios dados
    EXISTS (
      SELECT 1 FROM portal_users pu 
      WHERE pu.id::text = auth.uid()::text 
      AND pu.user_type = 'criador' 
      AND pu.entity_id = creators.id
    )
    OR
    -- Empresa vê criadores de suas campanhas
    EXISTS (
      SELECT 1 FROM portal_users pu 
      JOIN campaigns c ON c.business_id = pu.entity_id
      JOIN campaign_creators cc ON cc.campaign_id = c.id
      WHERE pu.id::text = auth.uid()::text 
      AND pu.user_type = 'empresa' 
      AND cc.creator_id = creators.id
      AND cc.status != 'Removido'
    )
    OR
    -- Funcionários internos veem tudo (CRM)
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id::text = auth.uid()::text 
      AND u.organization_id = creators.organization_id
    )
  );

-- 9. Políticas para tasks (acesso do portal)
CREATE POLICY "tasks_portal_access" ON tasks
  FOR SELECT USING (
    -- Empresa vê tarefas relacionadas a seus negócios
    EXISTS (
      SELECT 1 FROM portal_users pu 
      WHERE pu.id::text = auth.uid()::text 
      AND pu.user_type = 'empresa'
      AND (
        tasks.title ILIKE '%' || (SELECT name FROM businesses WHERE id = pu.entity_id) || '%' 
        OR tasks.description ILIKE '%' || (SELECT name FROM businesses WHERE id = pu.entity_id) || '%'
      )
    )
    OR
    -- Criador vê tarefas atribuídas a ele (se houver campo para isso)
    EXISTS (
      SELECT 1 FROM portal_users pu 
      WHERE pu.id::text = auth.uid()::text 
      AND pu.user_type = 'criador'
      AND tasks.assigned_to::text = pu.entity_id::text
    )
    OR
    -- Funcionários internos veem tudo (CRM)
    EXISTS (
      SELECT 1 FROM users u 
      WHERE u.id::text = auth.uid()::text 
      AND u.organization_id = tasks.organization_id
    )
  );

-- 10. Comentários nas políticas
COMMENT ON POLICY "portal_users_own_data" ON portal_users IS 'Usuários do portal só veem seus próprios dados';
COMMENT ON POLICY "businesses_portal_access" ON businesses IS 'Empresas veem apenas seus dados, criadores veem empresas de suas campanhas';
COMMENT ON POLICY "campaigns_portal_access" ON campaigns IS 'Acesso às campanhas baseado no tipo de usuário do portal';
COMMENT ON POLICY "creators_portal_access" ON creators IS 'Criadores veem seus dados, empresas veem criadores de suas campanhas';
COMMENT ON POLICY "tasks_portal_access" ON tasks IS 'Acesso às tarefas baseado no contexto do usuário';
