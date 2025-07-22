-- Migration: Simplificar planos e adicionar campo de criadores
-- Data: 2025-01-22
-- Descrição: Remove números dos planos e adiciona campo para quantidade de criadores no contrato

-- 1. Adicionar campo para quantidade de criadores no contrato atual
ALTER TABLE businesses 
ADD COLUMN contract_creators_count INTEGER DEFAULT 0;

-- 2. Adicionar comentário para o novo campo
COMMENT ON COLUMN businesses.contract_creators_count IS 'Quantidade de criadores no contrato para o mês atual';

-- 3. Limpar planos existentes
DELETE FROM plans;

-- 4. Inserir planos simplificados
INSERT INTO plans (name, description, price, features, is_active) VALUES
(
  'Silver',
  'Plano Silver - Ideal para pequenos negócios',
  999.00,
  '{
    "campanhas_mes": 3,
    "suporte": "email",
    "relatorios": "basicos",
    "integracao_sheets": true,
    "dashboard": true,
    "cor": "silver",
    "icone": "🥈"
  }'::jsonb,
  true
),
(
  'Gold',
  'Plano Gold - Para negócios em crescimento',
  1999.00,
  '{
    "campanhas_mes": 6,
    "suporte": "chat",
    "relatorios": "avancados",
    "integracao_sheets": true,
    "dashboard": true,
    "analytics": true,
    "cor": "gold",
    "icone": "🥇"
  }'::jsonb,
  true
),
(
  'Diamond',
  'Plano Diamond - Para grandes empresas',
  3999.00,
  '{
    "campanhas_mes": "ilimitadas",
    "suporte": "telefone_prioritario",
    "relatorios": "completos",
    "integracao_sheets": true,
    "dashboard": true,
    "analytics": true,
    "api_access": true,
    "gerente_dedicado": true,
    "cor": "diamond",
    "icone": "💎"
  }'::jsonb,
  true
),
(
  'Personalizado',
  'Plano Personalizado - Sob medida para suas necessidades',
  0.00,
  '{
    "campanhas_mes": "customizado",
    "suporte": "dedicado",
    "relatorios": "customizados",
    "integracao_sheets": true,
    "dashboard": true,
    "analytics": true,
    "api_access": true,
    "gerente_dedicado": true,
    "features_customizadas": true,
    "cor": "personalizado",
    "icone": "⭐"
  }'::jsonb,
  true
);

-- 5. Atualizar negócios existentes - extrair número de criadores e simplificar plano
UPDATE businesses 
SET 
  custom_fields = jsonb_set(
    COALESCE(custom_fields, '{}'),
    '{plano_atual}',
    CASE 
      WHEN custom_fields->>'plano_atual' ILIKE '%silver%' THEN '"Silver"'
      WHEN custom_fields->>'plano_atual' ILIKE '%gold%' THEN '"Gold"'
      WHEN custom_fields->>'plano_atual' ILIKE '%diamond%' THEN '"Diamond"'
      WHEN custom_fields->>'plano_atual' ILIKE '%personalizado%' THEN '"Personalizado"'
      ELSE '"Silver"'
    END::jsonb
  ),
  contract_creators_count = CASE 
    WHEN custom_fields->>'plano_atual' ~ '\d+' THEN 
      CAST(regexp_replace(custom_fields->>'plano_atual', '[^0-9]', '', 'g') AS INTEGER)
    ELSE 0
  END
WHERE custom_fields->>'plano_atual' IS NOT NULL 
  AND custom_fields->>'plano_atual' != '';

-- 6. Criar índice para o novo campo
CREATE INDEX idx_businesses_creators_count ON businesses(contract_creators_count) WHERE contract_creators_count > 0;

-- 7. Atualizar comentário da tabela plans
COMMENT ON TABLE plans IS 'Planos simplificados: Silver, Gold, Diamond e Personalizado';
