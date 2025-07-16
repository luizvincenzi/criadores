-- Corrigir trigger de slug que está causando erro
-- Execute este script no Supabase SQL Editor

-- 1. Remover triggers problemáticos
DROP TRIGGER IF EXISTS generate_business_slug ON businesses;
DROP TRIGGER IF EXISTS generate_creator_slug ON creators;
DROP TRIGGER IF EXISTS generate_campaign_slug ON campaigns;

-- 2. Corrigir função de slug para usar campos corretos
CREATE OR REPLACE FUNCTION generate_slug_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Para businesses: usar campo 'name'
    IF TG_TABLE_NAME = 'businesses' THEN
        IF NEW.slug IS NULL OR NEW.slug = '' THEN
            NEW.slug = generate_slug(NEW.name) || '-' || substring(NEW.id::text from 1 for 8);
        END IF;
    END IF;
    
    -- Para creators: usar campo 'name'
    IF TG_TABLE_NAME = 'creators' THEN
        IF NEW.slug IS NULL OR NEW.slug = '' THEN
            NEW.slug = generate_slug(NEW.name) || '-' || substring(NEW.id::text from 1 for 8);
        END IF;
    END IF;
    
    -- Para campaigns: usar campo 'title'
    IF TG_TABLE_NAME = 'campaigns' THEN
        IF NEW.slug IS NULL OR NEW.slug = '' THEN
            NEW.slug = generate_slug(NEW.title) || '-' || substring(NEW.id::text from 1 for 8);
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Recriar triggers com função corrigida
CREATE TRIGGER generate_business_slug BEFORE INSERT OR UPDATE ON businesses
    FOR EACH ROW EXECUTE FUNCTION generate_slug_trigger();

CREATE TRIGGER generate_creator_slug BEFORE INSERT OR UPDATE ON creators
    FOR EACH ROW EXECUTE FUNCTION generate_slug_trigger();

CREATE TRIGGER generate_campaign_slug BEFORE INSERT OR UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION generate_slug_trigger();
