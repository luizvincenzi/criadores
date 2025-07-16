-- CONFIGURAR ROW LEVEL SECURITY (RLS)

-- Habilitar RLS em todas as tabelas
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_creators ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA ORGANIZATIONS
CREATE POLICY "Users can view their organization" ON organizations
  FOR SELECT USING (
    id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can update their organization" ON organizations
  FOR UPDATE USING (
    id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- POLÍTICAS PARA USERS
CREATE POLICY "Users can view users in their organization" ON users
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON users
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can manage users in their organization" ON users
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM users 
      WHERE id = auth.uid() AND role IN ('admin', 'manager')
    )
  );

-- POLÍTICAS PARA BUSINESSES
CREATE POLICY "Users can view businesses in their organization" ON businesses
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage businesses based on permissions" ON businesses
  FOR ALL USING (
    organization_id IN (
      SELECT u.organization_id FROM users u
      WHERE u.id = auth.uid() 
      AND (
        u.role IN ('admin', 'manager') 
        OR (u.permissions->'businesses'->>'write')::boolean = true
      )
    )
  );

-- POLÍTICAS PARA CREATORS
CREATE POLICY "Users can view creators in their organization" ON creators
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage creators based on permissions" ON creators
  FOR ALL USING (
    organization_id IN (
      SELECT u.organization_id FROM users u
      WHERE u.id = auth.uid() 
      AND (
        u.role IN ('admin', 'manager') 
        OR (u.permissions->'creators'->>'write')::boolean = true
      )
    )
  );

-- POLÍTICAS PARA CAMPAIGNS
CREATE POLICY "Users can view campaigns in their organization" ON campaigns
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage campaigns based on permissions" ON campaigns
  FOR ALL USING (
    organization_id IN (
      SELECT u.organization_id FROM users u
      WHERE u.id = auth.uid() 
      AND (
        u.role IN ('admin', 'manager') 
        OR (u.permissions->'campaigns'->>'write')::boolean = true
        OR created_by = auth.uid()
        OR responsible_user_id = auth.uid()
      )
    )
  );

-- POLÍTICAS PARA CAMPAIGN_CREATORS
CREATE POLICY "Users can view campaign creators in their organization" ON campaign_creators
  FOR SELECT USING (
    campaign_id IN (
      SELECT id FROM campaigns 
      WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can manage campaign creators based on permissions" ON campaign_creators
  FOR ALL USING (
    campaign_id IN (
      SELECT c.id FROM campaigns c
      JOIN users u ON u.organization_id = c.organization_id
      WHERE u.id = auth.uid() 
      AND (
        u.role IN ('admin', 'manager') 
        OR (u.permissions->'campaigns'->>'write')::boolean = true
        OR c.created_by = auth.uid()
        OR c.responsible_user_id = auth.uid()
      )
    )
  );

-- POLÍTICAS PARA LEADS
CREATE POLICY "Users can view leads in their organization" ON leads
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage leads based on permissions" ON leads
  FOR ALL USING (
    organization_id IN (
      SELECT u.organization_id FROM users u
      WHERE u.id = auth.uid() 
      AND (
        u.role IN ('admin', 'manager') 
        OR (u.permissions->'leads'->>'write')::boolean = true
        OR assigned_to = auth.uid()
      )
    )
  );

-- POLÍTICAS PARA TASKS
CREATE POLICY "Users can view tasks in their organization" ON tasks
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their own tasks" ON tasks
  FOR ALL USING (
    assigned_to = auth.uid() OR created_by = auth.uid()
  );

CREATE POLICY "Managers can manage all tasks in their organization" ON tasks
  FOR ALL USING (
    organization_id IN (
      SELECT u.organization_id FROM users u
      WHERE u.id = auth.uid() 
      AND u.role IN ('admin', 'manager')
    )
  );

-- POLÍTICAS PARA AUDIT_LOGS
CREATE POLICY "Users can view audit logs in their organization" ON audit_logs
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM users WHERE id = auth.uid()
    )
  );

-- POLÍTICAS PARA BUSINESS_CATEGORIES E PLANS (Globais)
CREATE POLICY "Everyone can view business categories" ON business_categories
  FOR SELECT USING (true);

CREATE POLICY "Everyone can view plans" ON plans
  FOR SELECT USING (true);

-- FUNÇÕES AUXILIARES PARA RLS

-- Função para verificar se usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para verificar se usuário tem permissão
CREATE OR REPLACE FUNCTION has_permission(resource TEXT, action TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  user_permissions JSONB;
  user_role TEXT;
BEGIN
  SELECT permissions, role INTO user_permissions, user_role
  FROM users WHERE id = auth.uid();
  
  -- Admin tem todas as permissões
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Verificar permissão específica
  RETURN (user_permissions->resource->>action)::boolean = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter organization_id do usuário atual
CREATE OR REPLACE FUNCTION current_organization_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
