-- ========================================
-- INSERIR DADOS DE TESTE PARA DASHBOARD EMPRESARIAL
-- ========================================
-- Execute este SQL após criar a tabela business_quarterly_snapshots

-- Primeiro, vamos verificar se temos empresas na tabela businesses
-- Se não houver, vamos criar uma empresa de teste

-- Inserir empresa de teste se não existir
INSERT INTO businesses (
  id,
  name,
  email,
  phone,
  address,
  city,
  state,
  business_type,
  created_at
) 
SELECT 
  gen_random_uuid(),
  'Restaurante Família & Música',
  'contato@familiamusica.com.br',
  '+55 43 9193-6400',
  'Rua das Palmeiras, 123',
  'Londrina',
  'PR',
  'Restaurante',
  NOW()
WHERE NOT EXISTS (SELECT 1 FROM businesses LIMIT 1);

-- Agora vamos inserir snapshots trimestrais para teste
-- Snapshot Q3 2024 (trimestre anterior)
INSERT INTO business_quarterly_snapshots (
  business_id,
  quarter,
  year,
  quarter_number,
  digital_presence,
  kpis,
  four_ps_status,
  porter_forces,
  executive_summary,
  notes
) 
SELECT 
  b.id as business_id,
  '2024-Q3' as quarter,
  2024 as year,
  3 as quarter_number,
  '{
    "google": {"rating": 4.3, "reviews": 189},
    "instagram": 1180,
    "facebook": 850,
    "tiktok": 0,
    "tripadvisor": {"rating": 4.0, "rank": 18}
  }'::jsonb as digital_presence,
  '{
    "ocupacao": 72,
    "ticket": 62,
    "margemPorcoes": 65,
    "nps": 68,
    "ruido": 1
  }'::jsonb as kpis,
  '{
    "produto": "green",
    "preco": "yellow",
    "praca": "green",
    "promocao": "red"
  }'::jsonb as four_ps_status,
  '{
    "rivalidade": {"score": 7, "status": "red"},
    "entrantes": {"score": 5, "status": "yellow"},
    "fornecedores": {"score": 6, "status": "yellow"},
    "clientes": {"score": 6, "status": "yellow"},
    "substitutos": {"score": 7, "status": "red"}
  }'::jsonb as porter_forces,
  '{
    "green": [
      "Música ao vivo bem recebida pelos clientes",
      "Playground atrai famílias",
      "Localização estratégica"
    ],
    "yellow": [
      "Ticket médio abaixo da meta",
      "Presença digital precisa melhorar",
      "Margem de porções no limite"
    ],
    "red": [
      "Estratégia de promoção inexistente",
      "Reclamação de ruído dos vizinhos"
    ]
  }'::jsonb as executive_summary,
  'Snapshot do Q3 2024 - Base para comparação' as notes
FROM businesses b 
LIMIT 1
ON CONFLICT (business_id, quarter) DO NOTHING;

-- Snapshot Q4 2024 (trimestre atual)
INSERT INTO business_quarterly_snapshots (
  business_id,
  quarter,
  year,
  quarter_number,
  digital_presence,
  kpis,
  four_ps_status,
  porter_forces,
  executive_summary,
  notes
) 
SELECT 
  b.id as business_id,
  '2024-Q4' as quarter,
  2024 as year,
  4 as quarter_number,
  '{
    "google": {"rating": 4.5, "reviews": 216},
    "instagram": 1250,
    "facebook": 890,
    "tiktok": 0,
    "tripadvisor": {"rating": 4.2, "rank": 15}
  }'::jsonb as digital_presence,
  '{
    "ocupacao": 78,
    "ticket": 65,
    "margemPorcoes": 68,
    "nps": 72,
    "ruido": 0
  }'::jsonb as kpis,
  '{
    "produto": "green",
    "preco": "yellow",
    "praca": "green",
    "promocao": "yellow"
  }'::jsonb as four_ps_status,
  '{
    "rivalidade": {"score": 6, "status": "yellow"},
    "entrantes": {"score": 4, "status": "green"},
    "fornecedores": {"score": 7, "status": "red"},
    "clientes": {"score": 5, "status": "yellow"},
    "substitutos": {"score": 6, "status": "yellow"}
  }'::jsonb as porter_forces,
  '{
    "green": [
      "Música ao vivo consolidada nos fins de semana",
      "Playground bem utilizado pelas famílias",
      "Localização estratégica na Zona Sul",
      "Zero reclamações de ruído este trimestre"
    ],
    "yellow": [
      "Ticket médio abaixo da meta (R$ 65 vs R$ 68)",
      "Presença digital precisa de mais engajamento",
      "Estratégia promocional em desenvolvimento"
    ],
    "red": [
      "Margem de porções pode ser otimizada"
    ]
  }'::jsonb as executive_summary,
  'Snapshot do Q4 2024 - Melhorias implementadas' as notes
FROM businesses b 
LIMIT 1
ON CONFLICT (business_id, quarter) DO NOTHING;

-- Snapshot Q1 2025 (projeção futura)
INSERT INTO business_quarterly_snapshots (
  business_id,
  quarter,
  year,
  quarter_number,
  digital_presence,
  kpis,
  four_ps_status,
  porter_forces,
  executive_summary,
  notes
) 
SELECT 
  b.id as business_id,
  '2025-Q1' as quarter,
  2025 as year,
  1 as quarter_number,
  '{
    "google": {"rating": 4.6, "reviews": 245},
    "instagram": 1350,
    "facebook": 920,
    "tiktok": 150,
    "tripadvisor": {"rating": 4.4, "rank": 12}
  }'::jsonb as digital_presence,
  '{
    "ocupacao": 82,
    "ticket": 70,
    "margemPorcoes": 72,
    "nps": 78,
    "ruido": 0
  }'::jsonb as kpis,
  '{
    "produto": "green",
    "preco": "green",
    "praca": "green",
    "promocao": "green"
  }'::jsonb as four_ps_status,
  '{
    "rivalidade": {"score": 5, "status": "yellow"},
    "entrantes": {"score": 4, "status": "green"},
    "fornecedores": {"score": 6, "status": "yellow"},
    "clientes": {"score": 4, "status": "green"},
    "substitutos": {"score": 5, "status": "yellow"}
  }'::jsonb as porter_forces,
  '{
    "green": [
      "Todos os 4 Ps do marketing otimizados",
      "Ticket médio acima da meta",
      "NPS excelente",
      "TikTok implementado com sucesso",
      "Ocupação nos fins de semana consistente"
    ],
    "yellow": [
      "Monitorar concorrência crescente"
    ],
    "red": []
  }'::jsonb as executive_summary,
  'Snapshot Q1 2025 - Metas alcançadas' as notes
FROM businesses b 
LIMIT 1
ON CONFLICT (business_id, quarter) DO NOTHING;

-- Verificar dados inseridos
SELECT 
  b.name as empresa,
  s.quarter,
  s.kpis->>'ocupacao' as ocupacao,
  s.kpis->>'ticket' as ticket,
  s.digital_presence->>'instagram' as instagram,
  s.four_ps_status->>'produto' as produto_status,
  s.notes
FROM business_quarterly_snapshots s
JOIN businesses b ON s.business_id = b.id
ORDER BY s.year, s.quarter_number;
