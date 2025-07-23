-- Migration: Adicionar etapa "Declinado" ao business_stage
-- Data: 2025-07-23
-- Descrição: Adiciona nova etapa "Declinado" para negócios que foram rejeitados

-- 1. Adicionar nova etapa "Declinado" ao enum business_stage
ALTER TYPE business_stage ADD VALUE IF NOT EXISTS 'Declinado';

-- 2. Adicionar comentário para documentação
COMMENT ON TYPE business_stage IS 'Etapas do funil de vendas: Leads próprios frios, Leads próprios quentes, Leads indicados, Enviando proposta, Marcado reunião, Reunião realizada, Follow up, Contrato assinado, Não teve interesse, Não responde, Declinado';

-- 3. Verificar se a nova etapa foi adicionada
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'Declinado' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'business_stage')
    ) THEN
        RAISE NOTICE '✅ Etapa "Declinado" adicionada com sucesso ao enum business_stage';
    ELSE
        RAISE EXCEPTION '❌ Falha ao adicionar etapa "Declinado"';
    END IF;
END $$;
