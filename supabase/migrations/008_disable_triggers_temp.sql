-- TEMPORÁRIO: Desabilitar triggers de slug para testes
-- Execute este script para testar rapidamente

DROP TRIGGER IF EXISTS generate_business_slug ON businesses;
DROP TRIGGER IF EXISTS generate_creator_slug ON creators;
DROP TRIGGER IF EXISTS generate_campaign_slug ON campaigns;
