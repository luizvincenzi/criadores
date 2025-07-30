-- Migration: Adicionar campo apresentacao_empresa
-- Data: 2025-07-30
-- Descrição: Adiciona campo para apresentação da empresa

-- 1. Adicionar campo apresentacao_empresa como TEXT
ALTER TABLE businesses 
ADD COLUMN apresentacao_empresa TEXT;

-- 2. Adicionar comentário explicativo
COMMENT ON COLUMN businesses.apresentacao_empresa IS 'Apresentação detalhada da empresa para landing pages e detalhes';

-- 3. Atualizar empresas existentes com valor padrão vazio
UPDATE businesses 
SET apresentacao_empresa = ''
WHERE apresentacao_empresa IS NULL;
