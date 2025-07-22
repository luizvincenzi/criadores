-- Migration: Adicionar proprietário do negócio e prioridade
-- Data: 2025-01-22
-- Descrição: Adiciona campos para proprietário (referência a users) e prioridade do negócio

-- 1. Criar enum para prioridade
CREATE TYPE business_priority AS ENUM (
  'Baixa',
  'Média', 
  'Alta'
);

-- 2. Adicionar campo para proprietário do negócio (referência à tabela users)
ALTER TABLE businesses 
ADD COLUMN owner_user_id UUID REFERENCES users(id);

-- 3. Adicionar campo para prioridade
ALTER TABLE businesses 
ADD COLUMN priority business_priority DEFAULT 'Média';

-- 4. Adicionar comentários para documentação
COMMENT ON COLUMN businesses.owner_user_id IS 'ID do usuário proprietário/responsável pelo negócio';
COMMENT ON COLUMN businesses.priority IS 'Prioridade do negócio: Baixa, Média ou Alta';

-- 5. Criar índices para otimizar consultas
CREATE INDEX idx_businesses_owner ON businesses(owner_user_id) WHERE owner_user_id IS NOT NULL;
CREATE INDEX idx_businesses_priority ON businesses(organization_id, priority) WHERE is_active = true;

-- 6. Criar índice composto para consultas por proprietário e prioridade
CREATE INDEX idx_businesses_owner_priority ON businesses(owner_user_id, priority) WHERE is_active = true;

-- 7. Atualizar função de trigger para incluir os novos campos no updated_at
CREATE OR REPLACE FUNCTION update_businesses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Garantir que o trigger existe
DROP TRIGGER IF EXISTS trigger_update_businesses_updated_at ON businesses;
CREATE TRIGGER trigger_update_businesses_updated_at
  BEFORE UPDATE ON businesses
  FOR EACH ROW
  EXECUTE FUNCTION update_businesses_updated_at();

-- 9. Adicionar constraint para garantir que owner_user_id seja da mesma organização (opcional)
-- ALTER TABLE businesses 
-- ADD CONSTRAINT fk_businesses_owner_same_org 
-- FOREIGN KEY (owner_user_id) REFERENCES users(id) 
-- WHERE users.organization_id = businesses.organization_id;
