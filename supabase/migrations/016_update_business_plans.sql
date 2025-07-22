-- Migration: Atualizar planos de negócio
-- Data: 2025-01-22
-- Descrição: Atualiza os planos disponíveis para Silver, Gold, Diamond e Personalizado

-- 1. Limpar planos existentes
DELETE FROM plans WHERE name IN ('Básico', 'Intermediário', 'Premium', 'Enterprise', 'Basic - 3', 'Gold - 6', 'Premium - 12', 'Enterprise - 24');

-- 2. Inserir novos planos (compatível com formato existente)
INSERT INTO plans (name, description, price, features, is_active) VALUES
(
  'Silver - 3',
  'Plano Silver - 3 criadores por campanha',
  999.00,
  '{
    "campanhas_mes": 2,
    "criadores_por_campanha": 3,
    "suporte": "email",
    "relatorios": "basicos",
    "integracao_sheets": true,
    "dashboard": true
  }'::jsonb,
  true
),
(
  'Silver - 4',
  'Plano Silver - 4 criadores por campanha',
  1299.00,
  '{
    "campanhas_mes": 3,
    "criadores_por_campanha": 4,
    "suporte": "email",
    "relatorios": "basicos",
    "integracao_sheets": true,
    "dashboard": true
  }'::jsonb,
  true
),
(
  'Gold - 6',
  'Plano Gold - 6 criadores por campanha',
  1999.00,
  '{
    "campanhas_mes": 5,
    "criadores_por_campanha": 6,
    "suporte": "chat",
    "relatorios": "avancados",
    "integracao_sheets": true,
    "dashboard": true,
    "analytics": true
  }'::jsonb,
  true
),
(
  'Gold - 8',
  'Plano Gold - 8 criadores por campanha',
  2499.00,
  '{
    "campanhas_mes": 6,
    "criadores_por_campanha": 8,
    "suporte": "chat",
    "relatorios": "avancados",
    "integracao_sheets": true,
    "dashboard": true,
    "analytics": true
  }'::jsonb,
  true
),
(
  'Diamond - 12',
  'Plano Diamond - 12 criadores por campanha',
  3999.00,
  '{
    "campanhas_mes": "ilimitadas",
    "criadores_por_campanha": 12,
    "suporte": "telefone_prioritario",
    "relatorios": "completos",
    "integracao_sheets": true,
    "dashboard": true,
    "analytics": true,
    "api_access": true,
    "gerente_dedicado": true
  }'::jsonb,
  true
),
(
  'Diamond - 15',
  'Plano Diamond - 15 criadores por campanha',
  4999.00,
  '{
    "campanhas_mes": "ilimitadas",
    "criadores_por_campanha": 15,
    "suporte": "telefone_prioritario",
    "relatorios": "completos",
    "integracao_sheets": true,
    "dashboard": true,
    "analytics": true,
    "api_access": true,
    "gerente_dedicado": true
  }'::jsonb,
  true
),
(
  'Personalizado',
  'Plano Personalizado - Sob medida para suas necessidades',
  0.00,
  '{
    "campanhas_mes": "customizado",
    "criadores_por_campanha": "customizado",
    "suporte": "dedicado",
    "relatorios": "customizados",
    "integracao_sheets": true,
    "dashboard": true,
    "analytics": true,
    "api_access": true,
    "gerente_dedicado": true,
    "features_customizadas": true
  }'::jsonb,
  true
);

-- 3. Atualizar negócios existentes com planos antigos
UPDATE businesses 
SET custom_fields = jsonb_set(
  COALESCE(custom_fields, '{}'),
  '{plano_atual}',
  CASE 
    WHEN custom_fields->>'plano_atual' LIKE '%Basic%' OR custom_fields->>'plano_atual' LIKE '%Básico%' THEN '"Silver"'
    WHEN custom_fields->>'plano_atual' LIKE '%Gold%' OR custom_fields->>'plano_atual' LIKE '%Intermediário%' THEN '"Gold"'
    WHEN custom_fields->>'plano_atual' LIKE '%Premium%' OR custom_fields->>'plano_atual' LIKE '%Diamond%' THEN '"Diamond"'
    WHEN custom_fields->>'plano_atual' LIKE '%Enterprise%' OR custom_fields->>'plano_atual' LIKE '%Personalizado%' THEN '"Personalizado"'
    ELSE '"Silver"'
  END::jsonb
)
WHERE custom_fields->>'plano_atual' IS NOT NULL 
  AND custom_fields->>'plano_atual' != '';

-- 4. Criar índice para busca por planos
CREATE INDEX IF NOT EXISTS idx_businesses_plan ON businesses((custom_fields->>'plano_atual'));

-- 5. Adicionar comentário
COMMENT ON TABLE plans IS 'Planos disponíveis: Silver, Gold, Diamond e Personalizado';
