-- Adicionar organization_id à tabela campaign_creators
ALTER TABLE campaign_creators 
ADD COLUMN organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001' 
REFERENCES organizations(id) ON DELETE CASCADE;

-- Criar índice para performance
CREATE INDEX idx_campaign_creators_organization_id ON campaign_creators(organization_id);

-- Atualizar a view campaign_journey_view para incluir organization_id
DROP VIEW IF EXISTS campaign_journey_view;

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
JOIN businesses b ON b.id = camp.business_id AND b.organization_id = camp.organization_id
LEFT JOIN campaign_creators cc ON cc.campaign_id = camp.id AND cc.organization_id = camp.organization_id
WHERE camp.is_active = true
GROUP BY camp.id, camp.organization_id, camp.title, camp.month, camp.status, b.name, b.id, camp.created_at, camp.updated_at;
