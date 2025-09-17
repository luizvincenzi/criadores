-- Migration: Implementar novas 14 etapas de negócio numeradas
-- Data: 2025-09-17
-- Descrição: Substitui as etapas antigas pelas novas 14 etapas numeradas

-- 1. Criar novo enum com as 14 etapas numeradas
CREATE TYPE business_stage_new AS ENUM (
  '1 prospect',
  '2 1contato',
  '3 2contato',
  '4 3contato',
  '5 proposta enviada',
  '6 proposta aceita',
  '7 contrato enviado',
  '8 contrato assinado',
  '9 briefing',
  '10 agendamentos',
  '11 producao',
  '12 entrega',
  '13 aprovacao',
  '14 negocio fechado'
);

-- 2. Adicionar nova coluna temporária
ALTER TABLE businesses 
ADD COLUMN business_stage_new business_stage_new DEFAULT '1 prospect';

-- 3. Migrar dados existentes para as novas etapas
UPDATE businesses SET business_stage_new = 
  CASE 
    WHEN business_stage = 'Leads próprios frios' THEN '1 prospect'
    WHEN business_stage = 'Leads próprios quentes' THEN '1 prospect'
    WHEN business_stage = 'Leads indicados' THEN '1 prospect'
    WHEN business_stage = 'Enviando proposta' THEN '5 proposta enviada'
    WHEN business_stage = 'Marcado reunião' THEN '2 1contato'
    WHEN business_stage = 'Reunião realizada' THEN '3 2contato'
    WHEN business_stage = 'Follow up' THEN '4 3contato'
    WHEN business_stage = 'Contrato assinado' THEN '8 contrato assinado'
    WHEN business_stage = 'Negócio Fechado' THEN '14 negocio fechado'
    WHEN business_stage = 'Não teve interesse' THEN '1 prospect'
    WHEN business_stage = 'Não responde' THEN '1 prospect'
    WHEN business_stage = 'Declinado' THEN '1 prospect'
    ELSE '1 prospect'
  END;

-- 4. Remover coluna antiga
ALTER TABLE businesses DROP COLUMN business_stage;

-- 5. Renomear nova coluna
ALTER TABLE businesses RENAME COLUMN business_stage_new TO business_stage;

-- 6. Remover enum antigo
DROP TYPE business_stage;

-- 7. Renomear novo enum
ALTER TYPE business_stage_new RENAME TO business_stage;

-- 8. Adicionar campo lead_source na tabela leads
ALTER TABLE leads 
ADD COLUMN lead_source VARCHAR(50) DEFAULT '1 prospect';

-- 9. Atualizar leads existentes dos chatbots para ter lead_source = '1 prospect'
UPDATE leads 
SET lead_source = '1 prospect'
WHERE source IN ('criavoz-chatbot', 'criavoz-novo', 'criavoz-instagram');

-- 10. Atualizar businesses existentes dos chatbots para ter business_stage = '1 prospect'
UPDATE businesses 
SET business_stage = '1 prospect'
WHERE custom_fields->>'responsavel' = 'Chatbot';

-- 11. Recriar índices
DROP INDEX IF EXISTS idx_businesses_stage;
CREATE INDEX idx_businesses_stage ON businesses(organization_id, business_stage) WHERE is_active = true;

-- 12. Criar índice para lead_source
CREATE INDEX idx_leads_lead_source ON leads(organization_id, lead_source);

-- 13. Adicionar comentários
COMMENT ON TYPE business_stage IS 'Novas 14 etapas do funil de vendas: 1 prospect, 2 1contato, 3 2contato, 4 3contato, 5 proposta enviada, 6 proposta aceita, 7 contrato enviado, 8 contrato assinado, 9 briefing, 10 agendamentos, 11 producao, 12 entrega, 13 aprovacao, 14 negocio fechado';
COMMENT ON COLUMN businesses.business_stage IS 'Nova etapa do negócio (1-14) no funil de vendas';
COMMENT ON COLUMN leads.lead_source IS 'Etapa inicial do lead para automações (sempre 1 prospect para chatbots)';

-- 14. Atualizar triggers se existirem
-- O trigger track_business_stage_change continuará funcionando com as novas etapas

-- 15. Log da migração
INSERT INTO audit_log (
  id, timestamp, action, entity_type, entity_id, entity_name,
  old_value, new_value, user_id, user_name, details
) VALUES (
  gen_random_uuid(),
  NOW(),
  'migration_applied',
  'system',
  '031',
  'new_business_stages_14_steps',
  'old_business_stage_enum',
  'new_14_stages_enum',
  '00000000-0000-0000-0000-000000000001',
  'System Migration',
  'Migração para novas 14 etapas de negócio numeradas aplicada com sucesso'
);
