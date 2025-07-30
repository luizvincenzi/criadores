-- Migration: Criar índice para etapa "Negócio Fechado"
-- Data: 2025-07-29
-- Descrição: Cria índice para otimizar consultas da nova etapa "Negócio Fechado"

-- Criar índice para otimizar consultas por etapa (executar após commit da migration anterior)
CREATE INDEX IF NOT EXISTS idx_businesses_stage_negocio_fechado 
ON businesses(organization_id, business_stage) 
WHERE business_stage = 'Negócio Fechado' AND is_active = true;
