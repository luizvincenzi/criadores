-- Migração para adicionar coluna quantidade_criadores
-- Data: 2025-07-16
-- Descrição: Adicionar coluna quantidade_criadores para controlar número de slots por campanha

-- 1. Adicionar nova coluna quantidade_criadores
ALTER TABLE campaigns 
ADD COLUMN quantidade_criadores INTEGER DEFAULT 1;

-- 2. Atualizar campanhas existentes com base no número de criadores associados
UPDATE campaigns 
SET quantidade_criadores = COALESCE(
    (SELECT COUNT(*) 
     FROM campaign_creators cc 
     WHERE cc.campaign_id = campaigns.id 
     AND cc.status != 'Removido'),
    1
)
WHERE quantidade_criadores IS NULL OR quantidade_criadores = 1;

-- 3. Garantir que quantidade_criadores seja pelo menos 1
UPDATE campaigns 
SET quantidade_criadores = 1 
WHERE quantidade_criadores < 1 OR quantidade_criadores IS NULL;

-- 4. Tornar quantidade_criadores obrigatório
ALTER TABLE campaigns 
ALTER COLUMN quantidade_criadores SET NOT NULL;

-- 5. Adicionar constraint para garantir valor mínimo
ALTER TABLE campaigns 
ADD CONSTRAINT check_quantidade_criadores_min 
CHECK (quantidade_criadores >= 1);

-- 6. Verificar dados após migração
DO $$
DECLARE
    campaign_record RECORD;
BEGIN
    RAISE NOTICE 'Verificando campanhas após adicionar quantidade_criadores:';
    
    FOR campaign_record IN 
        SELECT 
            c.id, 
            c.title, 
            c.quantidade_criadores,
            COUNT(cc.id) as criadores_associados
        FROM campaigns c
        LEFT JOIN campaign_creators cc ON cc.campaign_id = c.id AND cc.status != 'Removido'
        GROUP BY c.id, c.title, c.quantidade_criadores
        ORDER BY c.created_at
    LOOP
        RAISE NOTICE 'Campanha: % | Quantidade: % | Criadores associados: %', 
            campaign_record.title, 
            campaign_record.quantidade_criadores,
            campaign_record.criadores_associados;
    END LOOP;
END $$;
