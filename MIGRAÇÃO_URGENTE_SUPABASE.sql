-- ⚠️ MIGRAÇÃO URGENTE - Execute IMEDIATAMENTE no Supabase Dashboard
-- Esta migração corrige o problema dos leads dos chatbots

-- 1. Primeiro, vamos adicionar os novos valores ao enum existente
ALTER TYPE business_stage ADD VALUE IF NOT EXISTS '1 prospect';
ALTER TYPE business_stage ADD VALUE IF NOT EXISTS '2 1contato';
ALTER TYPE business_stage ADD VALUE IF NOT EXISTS '3 2contato';
ALTER TYPE business_stage ADD VALUE IF NOT EXISTS '4 3contato';
ALTER TYPE business_stage ADD VALUE IF NOT EXISTS '5 proposta enviada';
ALTER TYPE business_stage ADD VALUE IF NOT EXISTS '6 proposta aceita';
ALTER TYPE business_stage ADD VALUE IF NOT EXISTS '7 contrato enviado';
ALTER TYPE business_stage ADD VALUE IF NOT EXISTS '8 contrato assinado';
ALTER TYPE business_stage ADD VALUE IF NOT EXISTS '9 briefing';
ALTER TYPE business_stage ADD VALUE IF NOT EXISTS '10 agendamentos';
ALTER TYPE business_stage ADD VALUE IF NOT EXISTS '11 producao';
ALTER TYPE business_stage ADD VALUE IF NOT EXISTS '12 entrega';
ALTER TYPE business_stage ADD VALUE IF NOT EXISTS '13 aprovacao';
ALTER TYPE business_stage ADD VALUE IF NOT EXISTS '14 negocio fechado';

-- 2. Adicionar campo lead_source na tabela leads
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS lead_source VARCHAR(50) DEFAULT '1 prospect';

-- 3. Atualizar todos os leads dos chatbots para ter lead_source correto
UPDATE leads 
SET lead_source = '1 prospect'
WHERE source IN ('criavoz-chatbot', 'criavoz-novo', 'criavoz-instagram', 'chatcriadores-home', 'chatcriadores-novo');

-- 4. Atualizar businesses dos chatbots para usar a nova etapa
UPDATE businesses 
SET business_stage = '1 prospect'
WHERE custom_fields->>'responsavel' = 'Chatbot';

-- 5. Atualizar businesses dos chatbots para usar o status correto
UPDATE businesses 
SET status = 'Reunião de briefing'
WHERE custom_fields->>'responsavel' = 'Chatbot';

-- 6. Criar índice para lead_source
CREATE INDEX IF NOT EXISTS idx_leads_lead_source ON leads(organization_id, lead_source);

-- 7. Verificar resultado
SELECT 
  'LEADS DOS CHATBOTS' as tipo,
  source,
  lead_source,
  COUNT(*) as total
FROM leads 
WHERE source IN ('criavoz-chatbot', 'criavoz-novo', 'criavoz-instagram', 'chatcriadores-home', 'chatcriadores-novo')
GROUP BY source, lead_source
ORDER BY source;

SELECT 
  'BUSINESSES DOS CHATBOTS' as tipo,
  business_stage,
  status,
  COUNT(*) as total
FROM businesses 
WHERE custom_fields->>'responsavel' = 'Chatbot'
GROUP BY business_stage, status
ORDER BY business_stage;

-- 8. Log da migração
INSERT INTO audit_log (
  id, timestamp, action, entity_type, entity_id, entity_name,
  old_value, new_value, user_id, user_name, details
) VALUES (
  gen_random_uuid(),
  NOW(),
  'migration_applied',
  'system',
  'urgent_fix',
  'chatbot_leads_fix',
  'old_enum_values',
  'new_14_stages_added',
  '00000000-0000-0000-0000-000000000001',
  'System Migration',
  'Migração urgente aplicada: novos valores de business_stage adicionados e leads dos chatbots corrigidos'
);

-- 9. Comentários para documentação
COMMENT ON TYPE business_stage IS 'Etapas do funil de vendas: inclui as 14 novas etapas numeradas (1 prospect até 14 negocio fechado) além das etapas antigas';
COMMENT ON COLUMN leads.lead_source IS 'Etapa inicial do lead para automações (sempre 1 prospect para chatbots)';

-- ✅ MIGRAÇÃO CONCLUÍDA
-- Após executar este SQL, a API do chatbot funcionará corretamente
