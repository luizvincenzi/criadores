-- Migration: Criar tabela de backup para leads que falharam
-- Data: 2025-01-22
-- Descrição: Tabela para armazenar leads do chatbot que falharam ao ser salvos na tabela principal

-- 1. Criar tabela failed_leads
CREATE TABLE IF NOT EXISTS failed_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
  
  -- Dados do lead
  lead_id VARCHAR(50) NOT NULL, -- Protocolo gerado (ex: CRI781988)
  user_data JSONB NOT NULL, -- Dados completos do usuário do chatbot
  
  -- Informações do erro
  error_message TEXT NOT NULL,
  error_details JSONB,
  
  -- Metadados
  source VARCHAR(50) DEFAULT 'chatbot',
  ip_address INET,
  user_agent TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE, -- Quando foi reprocessado com sucesso
  is_processed BOOLEAN DEFAULT false
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_failed_leads_lead_id ON failed_leads(lead_id);
CREATE INDEX IF NOT EXISTS idx_failed_leads_created_at ON failed_leads(created_at);
CREATE INDEX IF NOT EXISTS idx_failed_leads_processed ON failed_leads(is_processed);
CREATE INDEX IF NOT EXISTS idx_failed_leads_source ON failed_leads(source);

-- 3. Trigger para updated_at
CREATE OR REPLACE FUNCTION update_failed_leads_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.processed_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_failed_leads_processed_at 
  BEFORE UPDATE ON failed_leads
  FOR EACH ROW 
  WHEN (NEW.is_processed = true AND OLD.is_processed = false)
  EXECUTE FUNCTION update_failed_leads_updated_at();

-- 4. Função para reprocessar leads falhados
CREATE OR REPLACE FUNCTION reprocess_failed_lead(failed_lead_id UUID)
RETURNS JSONB AS $$
DECLARE
  lead_record failed_leads%ROWTYPE;
  business_data JSONB;
  new_business_id UUID;
BEGIN
  -- Buscar o lead falhado
  SELECT * INTO lead_record FROM failed_leads WHERE id = failed_lead_id AND is_processed = false;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Lead não encontrado ou já processado');
  END IF;
  
  -- Preparar dados para businesses
  business_data := jsonb_build_object(
    'organization_id', '00000000-0000-0000-0000-000000000001',
    'name', CASE 
      WHEN lead_record.user_data->>'userType' = 'empresa' 
      THEN lead_record.user_data->>'businessName' 
      ELSE lead_record.user_data->>'name' 
    END,
    'slug', lower(regexp_replace(
      CASE 
        WHEN lead_record.user_data->>'userType' = 'empresa' 
        THEN lead_record.user_data->>'businessName' 
        ELSE lead_record.user_data->>'name' 
      END || '-' || extract(epoch from now())::text, 
      '[^a-z0-9\-]', '-', 'g'
    )),
    'contact_info', jsonb_build_object(
      'email', lead_record.user_data->>'email',
      'phone', lead_record.user_data->>'whatsapp',
      'whatsapp', lead_record.user_data->>'whatsapp',
      'instagram', lead_record.user_data->>'instagram',
      'primary_contact', lead_record.user_data->>'name'
    ),
    'address', jsonb_build_object(
      'city', '',
      'state', '',
      'street', '',
      'country', 'Brasil',
      'zip_code', ''
    ),
    'contract_info', jsonb_build_object(
      'files', '[]'::jsonb,
      'terms', '{}'::jsonb,
      'signed', false,
      'valid_until', null,
      'signature_date', null
    ),
    'status', 'Reunião de briefing',
    'tags', '[]'::jsonb,
    'custom_fields', jsonb_build_object(
      'notes', 'Lead reprocessado do chatbot - Protocolo: ' || lead_record.lead_id,
      'categoria', CASE 
        WHEN lead_record.user_data->>'userType' = 'empresa' 
        THEN lead_record.user_data->>'businessSegment'
        ELSE lead_record.user_data->>'creatorNiche'
      END,
      'comercial', '',
      'planoAtual', '',
      'responsavel', 'Chatbot',
      'grupoWhatsappCriado', 'Não',
      'tipoUsuario', lead_record.user_data->>'userType',
      'dadosCompletos', lead_record.user_data,
      'protocoloChatbot', lead_record.lead_id,
      'timestampChatbot', lead_record.created_at,
      'reprocessedAt', NOW()
    ),
    'metrics', jsonb_build_object(
      'roi', 0,
      'total_spent', 0,
      'total_campaigns', 0,
      'active_campaigns', 0
    ),
    'is_active', true,
    'business_stage', 'Leads próprios quentes',
    'estimated_value', 0.00,
    'contract_creators_count', 0,
    'priority', 'Média',
    'current_stage_since', NOW(),
    'expected_close_date', null,
    'actual_close_date', null,
    'is_won', false,
    'is_lost', false,
    'lost_reason', null,
    'apresentacao_empresa', ''
  );
  
  -- Inserir na tabela businesses
  INSERT INTO businesses (
    organization_id, name, slug, contact_info, address, contract_info,
    status, tags, custom_fields, metrics, is_active, business_stage,
    estimated_value, contract_creators_count, priority, current_stage_since,
    expected_close_date, actual_close_date, is_won, is_lost, lost_reason,
    apresentacao_empresa
  ) VALUES (
    (business_data->>'organization_id')::UUID,
    business_data->>'name',
    business_data->>'slug',
    business_data->'contact_info',
    business_data->'address',
    business_data->'contract_info',
    business_data->>'status',
    (business_data->'tags')::text[],
    business_data->'custom_fields',
    business_data->'metrics',
    (business_data->>'is_active')::boolean,
    (business_data->>'business_stage')::business_stage,
    (business_data->>'estimated_value')::numeric,
    (business_data->>'contract_creators_count')::integer,
    (business_data->>'priority')::business_priority,
    (business_data->>'current_stage_since')::timestamp with time zone,
    (business_data->>'expected_close_date')::date,
    (business_data->>'actual_close_date')::date,
    (business_data->>'is_won')::boolean,
    (business_data->>'is_lost')::boolean,
    business_data->>'lost_reason',
    business_data->>'apresentacao_empresa'
  ) RETURNING id INTO new_business_id;
  
  -- Marcar como processado
  UPDATE failed_leads 
  SET is_processed = true, processed_at = NOW() 
  WHERE id = failed_lead_id;
  
  RETURN jsonb_build_object(
    'success', true, 
    'business_id', new_business_id,
    'lead_id', lead_record.lead_id
  );
  
EXCEPTION WHEN OTHERS THEN
  RETURN jsonb_build_object(
    'success', false, 
    'error', SQLERRM,
    'lead_id', lead_record.lead_id
  );
END;
$$ LANGUAGE plpgsql;

-- 5. Comentários
COMMENT ON TABLE failed_leads IS 'Tabela de backup para leads do chatbot que falharam ao ser salvos';
COMMENT ON COLUMN failed_leads.lead_id IS 'Protocolo gerado pelo chatbot (ex: CRI781988)';
COMMENT ON COLUMN failed_leads.user_data IS 'Dados completos do usuário coletados pelo chatbot';
COMMENT ON COLUMN failed_leads.error_message IS 'Mensagem de erro que causou a falha';
COMMENT ON COLUMN failed_leads.error_details IS 'Detalhes completos do erro em JSON';
COMMENT ON FUNCTION reprocess_failed_lead IS 'Função para reprocessar leads que falharam e inserir na tabela businesses';
