-- Migration: Adicionar etapa "Negócio Fechado" ao business_stage
-- Data: 2025-07-29
-- Descrição: Adiciona nova etapa "Negócio Fechado" para negócios que foram fechados com sucesso

-- 1. Adicionar nova etapa "Negócio Fechado" ao enum business_stage
ALTER TYPE business_stage ADD VALUE IF NOT EXISTS 'Negócio Fechado';

-- 2. Adicionar comentário para documentação
COMMENT ON TYPE business_stage IS 'Etapas do funil de vendas: Leads próprios frios, Leads próprios quentes, Leads indicados, Enviando proposta, Marcado reunião, Reunião realizada, Follow up, Negócio Fechado, Contrato assinado, Não teve interesse, Não responde, Declinado';
