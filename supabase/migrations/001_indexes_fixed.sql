-- ÍNDICES OTIMIZADOS CORRIGIDOS
-- Execute este script APÓS o schema principal

-- Organizations
CREATE INDEX idx_organizations_domain ON organizations(domain);
CREATE INDEX idx_organizations_active ON organizations(is_active) WHERE is_active = true;

-- Users
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(organization_id, is_active) WHERE is_active = true;

-- Businesses
CREATE INDEX idx_businesses_organization ON businesses(organization_id);
CREATE INDEX idx_businesses_status ON businesses(organization_id, status);
CREATE INDEX idx_businesses_responsible ON businesses(responsible_user_id);
CREATE INDEX idx_businesses_category ON businesses(category_id);
CREATE INDEX idx_businesses_active ON businesses(organization_id, is_active) WHERE is_active = true;
CREATE INDEX idx_businesses_name_search ON businesses USING gin(name gin_trgm_ops);
CREATE INDEX idx_businesses_tags ON businesses USING gin(tags);
-- Índice para cidade dos negócios
CREATE INDEX idx_businesses_city ON businesses((address->>'city'));

-- Creators (CORRIGIDOS)
CREATE INDEX idx_creators_organization ON creators(organization_id);
CREATE INDEX idx_creators_status ON creators(organization_id, status);
-- CORRIGIDO: Acesso correto ao JSONB aninhado
CREATE INDEX idx_creators_city ON creators((profile_info->'location'->>'city'));
CREATE INDEX idx_creators_category ON creators((profile_info->>'category'));
CREATE INDEX idx_creators_name_search ON creators USING gin(name gin_trgm_ops);
CREATE INDEX idx_creators_tags ON creators USING gin(tags);
CREATE INDEX idx_creators_social_media ON creators USING gin(social_media);
-- Índice para seguidores do Instagram
CREATE INDEX idx_creators_instagram_followers ON creators(((social_media->'instagram'->>'followers')::integer));

-- Campaigns
CREATE INDEX idx_campaigns_organization ON campaigns(organization_id);
CREATE INDEX idx_campaigns_business ON campaigns(business_id);
CREATE INDEX idx_campaigns_status ON campaigns(organization_id, status);
CREATE INDEX idx_campaigns_month ON campaigns(organization_id, month);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);

-- Campaign Creators
CREATE INDEX idx_campaign_creators_campaign ON campaign_creators(campaign_id);
CREATE INDEX idx_campaign_creators_creator ON campaign_creators(creator_id);
CREATE INDEX idx_campaign_creators_status ON campaign_creators(campaign_id, status);
CREATE INDEX idx_campaign_creators_role ON campaign_creators(campaign_id, role);

-- Leads
CREATE INDEX idx_leads_organization ON leads(organization_id);
CREATE INDEX idx_leads_assigned_to ON leads(assigned_to);
CREATE INDEX idx_leads_status ON leads(organization_id, status);
CREATE INDEX idx_leads_source ON leads(organization_id, source);

-- Tasks
CREATE INDEX idx_tasks_organization ON tasks(organization_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(organization_id, status);
CREATE INDEX idx_tasks_priority ON tasks(organization_id, priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;

-- Audit Logs
CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Índices compostos para consultas frequentes
CREATE INDEX idx_businesses_org_status_active ON businesses(organization_id, status, is_active);
CREATE INDEX idx_creators_org_status_city ON creators(organization_id, status, (profile_info->'location'->>'city'));
CREATE INDEX idx_campaigns_org_business_month ON campaigns(organization_id, business_id, month);

-- Índices para performance de JSONB
CREATE INDEX idx_businesses_contact_gin ON businesses USING gin(contact_info);
CREATE INDEX idx_creators_profile_gin ON creators USING gin(profile_info);
CREATE INDEX idx_campaigns_objectives_gin ON campaigns USING gin(objectives);
CREATE INDEX idx_campaign_creators_deliverables_gin ON campaign_creators USING gin(deliverables);
