-- ========================================
-- DASHBOARD EMPRESAS - CRIAÇÃO SIMPLIFICADA
-- ========================================
-- Execute este SQL diretamente no Supabase Dashboard

-- 1. CRIAR TABELA PRINCIPAL
CREATE TABLE IF NOT EXISTS business_quarterly_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  quarter VARCHAR(10) NOT NULL,
  year INTEGER NOT NULL,
  quarter_number INTEGER NOT NULL CHECK (quarter_number BETWEEN 1 AND 4),
  
  -- PRESENÇA DIGITAL
  digital_presence JSONB DEFAULT '{
    "google": {"rating": 0, "reviews": 0},
    "instagram": 0,
    "facebook": 0,
    "tiktok": 0,
    "tripadvisor": {"rating": 0, "rank": 0}
  }'::jsonb,
  
  -- KPIs PRINCIPAIS
  kpis JSONB DEFAULT '{
    "ocupacao": 0,
    "ticket": 0,
    "margemPorcoes": 0,
    "nps": 0,
    "ruido": 0
  }'::jsonb,
  
  -- 4 PS DO MARKETING
  four_ps_status JSONB DEFAULT '{
    "produto": "gray",
    "preco": "gray", 
    "praca": "gray",
    "promocao": "gray"
  }'::jsonb,
  
  -- 5 FORÇAS DE PORTER
  porter_forces JSONB DEFAULT '{
    "rivalidade": {"score": 5, "status": "yellow"},
    "entrantes": {"score": 5, "status": "yellow"},
    "fornecedores": {"score": 5, "status": "yellow"},
    "clientes": {"score": 5, "status": "yellow"},
    "substitutos": {"score": 5, "status": "yellow"}
  }'::jsonb,
  
  -- SUMÁRIO EXECUTIVO
  executive_summary JSONB DEFAULT '{
    "green": [],
    "yellow": [],
    "red": []
  }'::jsonb,
  
  -- NOTAS E OBSERVAÇÕES
  notes TEXT DEFAULT '',
  
  -- TIMESTAMPS
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- CONSTRAINT ÚNICA POR EMPRESA/TRIMESTRE
  UNIQUE(business_id, quarter)
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_business_quarterly_snapshots_business_id 
ON business_quarterly_snapshots(business_id);

CREATE INDEX IF NOT EXISTS idx_business_quarterly_snapshots_quarter 
ON business_quarterly_snapshots(quarter);

CREATE INDEX IF NOT EXISTS idx_business_quarterly_snapshots_year_quarter 
ON business_quarterly_snapshots(year, quarter_number);

-- 3. HABILITAR RLS (Row Level Security)
ALTER TABLE business_quarterly_snapshots ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS DE SEGURANÇA
CREATE POLICY "Users can view snapshots of their business" ON business_quarterly_snapshots
  FOR SELECT USING (
    business_id IN (
      SELECT id FROM businesses 
      WHERE id = business_id
    )
  );

CREATE POLICY "Business owners can manage their snapshots" ON business_quarterly_snapshots
  FOR ALL USING (
    business_id IN (
      SELECT id FROM businesses 
      WHERE id = business_id
    )
  );

-- 5. FUNÇÃO PARA ATUALIZAR TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. TRIGGER PARA AUTO-UPDATE
CREATE TRIGGER update_business_quarterly_snapshots_updated_at 
  BEFORE UPDATE ON business_quarterly_snapshots 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. INSERIR DADOS DE EXEMPLO (OPCIONAL)
-- Descomente as linhas abaixo se quiser dados de teste

/*
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
  id as business_id,
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
      "Localização estratégica na Zona Sul"
    ],
    "yellow": [
      "Ticket médio abaixo da meta (R$ 65 vs R$ 68)",
      "Presença digital precisa de mais engajamento"
    ],
    "red": [
      "Margem de porções pode ser otimizada"
    ]
  }'::jsonb as executive_summary,
  'Snapshot inicial para testes do dashboard empresarial' as notes
FROM businesses 
LIMIT 1
ON CONFLICT (business_id, quarter) DO NOTHING;
*/
