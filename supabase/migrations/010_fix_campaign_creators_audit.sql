-- Corrigir trigger de auditoria para campaign_creators
-- A tabela campaign_creators não tem organization_id, então precisamos buscar via campaign

-- 1. Remover trigger existente
DROP TRIGGER IF EXISTS audit_campaign_creators ON campaign_creators;

-- 2. Criar função específica para campaign_creators
CREATE OR REPLACE FUNCTION audit_campaign_creators_function()
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
            (SELECT organization_id FROM campaigns WHERE id = NEW.campaign_id),
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
            (SELECT organization_id FROM campaigns WHERE id = NEW.campaign_id),
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
            (SELECT organization_id FROM campaigns WHERE id = OLD.campaign_id),
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

-- 3. Aplicar novo trigger
CREATE TRIGGER audit_campaign_creators 
    AFTER INSERT OR UPDATE OR DELETE ON campaign_creators
    FOR EACH ROW EXECUTE FUNCTION audit_campaign_creators_function();
