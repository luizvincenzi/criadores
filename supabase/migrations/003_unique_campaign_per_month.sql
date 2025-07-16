-- Adicionar constraint única para garantir apenas 1 campanha por mês por business
-- Isso impede a criação de campanhas duplicadas

ALTER TABLE campaigns 
ADD CONSTRAINT campaigns_business_month_unique 
UNIQUE (business_id, month, organization_id);

-- Comentário: Esta constraint garante que cada business pode ter apenas
-- uma campanha por mês dentro de cada organização
