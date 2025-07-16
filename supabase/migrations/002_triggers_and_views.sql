-- TRIGGERS E FUNÇÕES

-- 1. Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 2. Aplicar trigger de updated_at em todas as tabelas
CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_businesses_updated_at BEFORE UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_creators_updated_at BEFORE UPDATE ON creators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaign_creators_updated_at BEFORE UPDATE ON campaign_creators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. Função para audit log automático
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (
            organization_id,
            table_name,
            record_id,
            action,
            new_values,
            user_id
        ) VALUES (
            NEW.organization_id,
            TG_TABLE_NAME,
            NEW.id,
            'INSERT',
            to_jsonb(NEW),
            auth.uid()
        );
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (
            organization_id,
            table_name,
            record_id,
            action,
            old_values,
            new_values,
            user_id
        ) VALUES (
            NEW.organization_id,
            TG_TABLE_NAME,
            NEW.id,
            'UPDATE',
            to_jsonb(OLD),
            to_jsonb(NEW),
            auth.uid()
        );
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (
            organization_id,
            table_name,
            record_id,
            action,
            old_values,
            user_id
        ) VALUES (
            OLD.organization_id,
            TG_TABLE_NAME,
            OLD.id,
            'DELETE',
            to_jsonb(OLD),
            auth.uid()
        );
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 4. Aplicar audit triggers nas tabelas principais
CREATE TRIGGER audit_businesses AFTER INSERT OR UPDATE OR DELETE ON businesses
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_creators AFTER INSERT OR UPDATE OR DELETE ON creators
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_campaigns AFTER INSERT OR UPDATE OR DELETE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_campaign_creators AFTER INSERT OR UPDATE OR DELETE ON campaign_creators
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_leads AFTER INSERT OR UPDATE OR DELETE ON leads
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_tasks AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- 5. Função para gerar slugs automaticamente
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                unaccent(input_text),
                '[^a-zA-Z0-9\s]', '', 'g'
            ),
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- 6. Trigger para gerar slugs automaticamente
CREATE OR REPLACE FUNCTION generate_slug_trigger()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug = generate_slug(NEW.name) || '-' || substring(NEW.id::text from 1 for 8);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_business_slug BEFORE INSERT OR UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION generate_slug_trigger();

CREATE TRIGGER generate_creator_slug BEFORE INSERT OR UPDATE ON creators
    FOR EACH ROW EXECUTE FUNCTION generate_slug_trigger();

CREATE TRIGGER generate_campaign_slug BEFORE INSERT OR UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION generate_slug_trigger();

-- VIEWS OTIMIZADAS

-- 1. View para Dashboard
CREATE VIEW dashboard_stats AS
SELECT 
    o.id as organization_id,
    o.name as organization_name,
    
    -- Estatísticas de negócios
    COUNT(DISTINCT b.id) as total_businesses,
    COUNT(DISTINCT CASE WHEN b.status != 'Finalizado' THEN b.id END) as active_businesses,
    
    -- Estatísticas de criadores
    COUNT(DISTINCT c.id) as total_creators,
    COUNT(DISTINCT CASE WHEN c.status = 'Ativo' THEN c.id END) as active_creators,
    
    -- Estatísticas de campanhas
    COUNT(DISTINCT camp.id) as total_campaigns,
    COUNT(DISTINCT CASE WHEN camp.status != 'Finalizado' THEN camp.id END) as active_campaigns,
    
    -- Métricas financeiras
    COALESCE(SUM(camp.budget), 0) as total_budget,
    COALESCE(SUM(camp.spent_amount), 0) as total_spent,
    
    -- Performance
    COALESCE(AVG((camp.results->>'roi')::numeric), 0) as avg_roi
    
FROM organizations o
LEFT JOIN businesses b ON b.organization_id = o.id AND b.is_active = true
LEFT JOIN creators c ON c.organization_id = o.id AND c.is_active = true
LEFT JOIN campaigns camp ON camp.organization_id = o.id AND camp.is_active = true
GROUP BY o.id, o.name;

-- 2. View para Jornada de Campanhas
CREATE VIEW campaign_journey_view AS
SELECT 
    camp.id,
    camp.organization_id,
    camp.title,
    camp.month,
    camp.status,
    b.name as business_name,
    b.id as business_id,
    
    -- Contagem de criadores por status
    COUNT(cc.id) as total_creators,
    COUNT(CASE WHEN cc.status = 'Confirmado' THEN 1 END) as confirmed_creators,
    COUNT(CASE WHEN cc.status = 'Concluído' THEN 1 END) as completed_creators,
    
    -- Progresso geral
    CASE 
        WHEN COUNT(cc.id) = 0 THEN 0
        ELSE ROUND((COUNT(CASE WHEN cc.status = 'Concluído' THEN 1 END)::numeric / COUNT(cc.id)::numeric) * 100, 2)
    END as completion_percentage,
    
    camp.created_at,
    camp.updated_at
    
FROM campaigns camp
JOIN businesses b ON b.id = camp.business_id
LEFT JOIN campaign_creators cc ON cc.campaign_id = camp.id
WHERE camp.is_active = true
GROUP BY camp.id, camp.organization_id, camp.title, camp.month, camp.status, b.name, b.id, camp.created_at, camp.updated_at;

-- 3. View para Criadores com Métricas
CREATE VIEW creators_with_metrics AS
SELECT 
    c.*,
    COUNT(cc.id) as total_campaigns,
    COUNT(CASE WHEN cc.status = 'Concluído' THEN 1 END) as completed_campaigns,
    AVG((cc.performance_data->>'engagement')::numeric) as avg_engagement,
    MAX(cc.assigned_at) as last_campaign_date
FROM creators c
LEFT JOIN campaign_creators cc ON cc.creator_id = c.id
WHERE c.is_active = true
GROUP BY c.id;

-- 4. View para Negócios com Métricas
CREATE VIEW businesses_with_metrics AS
SELECT 
    b.*,
    COUNT(camp.id) as total_campaigns,
    COUNT(CASE WHEN camp.status != 'Finalizado' THEN 1 END) as active_campaigns,
    SUM(camp.budget) as total_budget,
    SUM(camp.spent_amount) as total_spent,
    AVG((camp.results->>'roi')::numeric) as avg_roi
FROM businesses b
LEFT JOIN campaigns camp ON camp.business_id = b.id AND camp.is_active = true
WHERE b.is_active = true
GROUP BY b.id;
