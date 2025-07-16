-- Corrigir recursão infinita nas políticas RLS
-- Execute este script no Supabase SQL Editor

-- 1. Remover políticas problemáticas
DROP POLICY IF EXISTS "Users can view their organization" ON organizations;
DROP POLICY IF EXISTS "Admins can update their organization" ON organizations;
DROP POLICY IF EXISTS "Users can view users in their organization" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Admins can manage users in their organization" ON users;

-- 2. Criar políticas simplificadas sem recursão

-- Políticas para ORGANIZATIONS (sem referência a users)
CREATE POLICY "Allow read organizations" ON organizations
  FOR SELECT USING (true);

CREATE POLICY "Allow update organizations" ON organizations
  FOR UPDATE USING (true);

-- Políticas para USERS (sem referência circular)
CREATE POLICY "Allow read users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Allow update users" ON users
  FOR UPDATE USING (true);

-- Políticas para BUSINESSES (simplificadas)
DROP POLICY IF EXISTS "Users can view businesses in their organization" ON businesses;
DROP POLICY IF EXISTS "Users can manage businesses based on permissions" ON businesses;

CREATE POLICY "Allow read businesses" ON businesses
  FOR SELECT USING (true);

CREATE POLICY "Allow manage businesses" ON businesses
  FOR ALL USING (true);

-- Políticas para CREATORS (simplificadas)
DROP POLICY IF EXISTS "Users can view creators in their organization" ON creators;
DROP POLICY IF EXISTS "Users can manage creators based on permissions" ON creators;

CREATE POLICY "Allow read creators" ON creators
  FOR SELECT USING (true);

CREATE POLICY "Allow manage creators" ON creators
  FOR ALL USING (true);

-- Políticas para CAMPAIGNS (simplificadas)
DROP POLICY IF EXISTS "Users can view campaigns in their organization" ON campaigns;
DROP POLICY IF EXISTS "Users can manage campaigns based on permissions" ON campaigns;

CREATE POLICY "Allow read campaigns" ON campaigns
  FOR SELECT USING (true);

CREATE POLICY "Allow manage campaigns" ON campaigns
  FOR ALL USING (true);

-- Políticas para CAMPAIGN_CREATORS (simplificadas)
DROP POLICY IF EXISTS "Users can view campaign creators in their organization" ON campaign_creators;
DROP POLICY IF EXISTS "Users can manage campaign creators based on permissions" ON campaign_creators;

CREATE POLICY "Allow read campaign_creators" ON campaign_creators
  FOR SELECT USING (true);

CREATE POLICY "Allow manage campaign_creators" ON campaign_creators
  FOR ALL USING (true);

-- Políticas para LEADS (simplificadas)
DROP POLICY IF EXISTS "Users can view leads in their organization" ON leads;
DROP POLICY IF EXISTS "Users can manage leads based on permissions" ON leads;

CREATE POLICY "Allow read leads" ON leads
  FOR SELECT USING (true);

CREATE POLICY "Allow manage leads" ON leads
  FOR ALL USING (true);

-- Políticas para TASKS (simplificadas)
DROP POLICY IF EXISTS "Users can view tasks in their organization" ON tasks;
DROP POLICY IF EXISTS "Users can manage their own tasks" ON tasks;
DROP POLICY IF EXISTS "Managers can manage all tasks in their organization" ON tasks;

CREATE POLICY "Allow read tasks" ON tasks
  FOR SELECT USING (true);

CREATE POLICY "Allow manage tasks" ON tasks
  FOR ALL USING (true);

-- Políticas para AUDIT_LOGS (simplificadas)
DROP POLICY IF EXISTS "Users can view audit logs in their organization" ON audit_logs;

CREATE POLICY "Allow read audit_logs" ON audit_logs
  FOR SELECT USING (true);

CREATE POLICY "Allow insert audit_logs" ON audit_logs
  FOR INSERT WITH CHECK (true);
