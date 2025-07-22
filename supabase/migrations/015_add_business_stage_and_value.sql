-- Migration: Adicionar campo de etapa do negócio e valor estimado
-- Data: 2025-01-22
-- Descrição: Adiciona novo enum para etapas do negócio e campo de valor estimado

-- 1. Criar novo enum para etapas do negócio
CREATE TYPE business_stage AS ENUM (
  'Leads próprios frios',
  'Leads próprios quentes', 
  'Leads indicados',
  'Enviando proposta',
  'Marcado reunião',
  'Reunião realizada',
  'Follow up',
  'Contrato assinado',
  'Não teve interesse',
  'Não responde'
);

-- 2. Adicionar nova coluna para etapa do negócio
ALTER TABLE businesses 
ADD COLUMN business_stage business_stage DEFAULT 'Leads próprios frios';

-- 3. Adicionar nova coluna para valor estimado em R$
ALTER TABLE businesses 
ADD COLUMN estimated_value DECIMAL(12,2) DEFAULT 0.00;

-- 4. Adicionar comentários para documentação
COMMENT ON COLUMN businesses.business_stage IS 'Etapa atual do negócio no funil de vendas';
COMMENT ON COLUMN businesses.estimated_value IS 'Valor do negócio em R$ (valor total do negócio)';

-- 5. Criar índice para otimizar consultas por etapa
CREATE INDEX idx_businesses_stage ON businesses(organization_id, business_stage) WHERE is_active = true;

-- 6. Atualizar a função de trigger para incluir os novos campos no updated_at
CREATE OR REPLACE FUNCTION update_businesses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Garantir que o trigger existe para updated_at
DROP TRIGGER IF EXISTS trigger_update_businesses_updated_at ON businesses;
CREATE TRIGGER trigger_update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_businesses_updated_at();
