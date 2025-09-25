-- ========================================
-- DASHBOARD EMPRESAS - SISTEMA TRIMESTRAL
-- ========================================
-- Estrutura completa para histórico de métricas trimestrais

-- 1. TABELA PRINCIPAL DE SNAPSHOTS TRIMESTRAIS
CREATE TABLE IF NOT EXISTS business_quarterly_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
  quarter VARCHAR(10) NOT NULL, -- '2025-Q1', '2025-Q2', etc.
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
  
  -- DIAGNÓSTICO DE MERCADO
  market_diagnosis JSONB DEFAULT '{
    "focusSegmentation": [
      {"name": "Segmento Principal", "value": 60, "fill": "#e5e7eb"},
      {"name": "Segmento Secundário", "value": 30, "fill": "#d1d5db"},
      {"name": "Segmento Terciário", "value": 10, "fill": "#9ca3af"}
    ],
    "sentiment": {
      "validation": "Análise de sentimento positiva",
      "challenge": "Principais desafios identificados"
    },
    "productPortfolio": {
      "strongPoints": "Pontos fortes do portfólio",
      "opportunities": "Oportunidades de melhoria"
    }
  }'::jsonb,
  
  -- POSICIONAMENTO ESTRATÉGICO
  strategic_positioning JSONB DEFAULT '{
    "statement": "Declaração de posicionamento da empresa",
    "competitiveAdvantage": [
      {"title": "Vantagem 1", "description": "Descrição da vantagem"},
      {"title": "Vantagem 2", "description": "Descrição da vantagem"},
      {"title": "Vantagem 3", "description": "Descrição da vantagem"}
    ],
    "tacticalFronts": [
      {"title": "Frente 1", "description": "Descrição da frente tática"},
      {"title": "Frente 2", "description": "Descrição da frente tática"},
      {"title": "Frente 3", "description": "Descrição da frente tática"}
    ]
  }'::jsonb,
  
  -- MATRIZ DE AÇÕES (90 DIAS)
  action_matrix JSONB DEFAULT '{
    "agora": ["Ação imediata 1", "Ação imediata 2", "Ação imediata 3"],
    "proximas": ["Ação próxima 1", "Ação próxima 2", "Ação próxima 3"],
    "explorar": ["Ação futura 1", "Ação futura 2", "Ação futura 3"]
  }'::jsonb,
  
  -- CALENDÁRIO PROMOCIONAL
  promo_calendar JSONB DEFAULT '{
    "weeks": [
      {"week": "Semana 1", "theme": "Tema da semana", "cta": "Call to action"},
      {"week": "Semana 2", "theme": "Tema da semana", "cta": "Call to action"},
      {"week": "Semana 3", "theme": "Tema da semana", "cta": "Call to action"},
      {"week": "Semana 4", "theme": "Tema da semana", "cta": "Call to action"}
    ]
  }'::jsonb,
  
  -- GESTÃO DE RISCO
  risk_management JSONB DEFAULT '{
    "plans": [
      {"title": "Plano 1", "description": "Descrição do plano de risco"},
      {"title": "Plano 2", "description": "Descrição do plano de risco"},
      {"title": "Plano 3", "description": "Descrição do plano de risco"}
    ],
    "metric": "Meta de gestão de risco"
  }'::jsonb,
  
  -- NOTAS E OBSERVAÇÕES
  notes TEXT DEFAULT '',
  executive_summary JSONB DEFAULT '{
    "green": ["Ponto positivo 1", "Ponto positivo 2"],
    "yellow": ["Ponto de atenção 1", "Ponto de atenção 2"], 
    "red": ["Ponto crítico 1", "Ponto crítico 2"]
  }'::jsonb,
  
  -- METADADOS
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  
  -- CONSTRAINT ÚNICA POR BUSINESS E QUARTER
  UNIQUE(business_id, quarter)
);

-- 2. ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_business_snapshots_business_quarter 
ON business_quarterly_snapshots(business_id, quarter);

CREATE INDEX IF NOT EXISTS idx_business_snapshots_year_quarter 
ON business_quarterly_snapshots(year, quarter_number);

CREATE INDEX IF NOT EXISTS idx_business_snapshots_created_at 
ON business_quarterly_snapshots(created_at DESC);

-- 3. TRIGGER PARA ATUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_snapshot_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_snapshot_updated_at
  BEFORE UPDATE ON business_quarterly_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION update_snapshot_updated_at();

-- 4. FUNÇÃO PARA GERAR QUARTER AUTOMATICAMENTE
CREATE OR REPLACE FUNCTION generate_quarter_from_date(input_date DATE DEFAULT CURRENT_DATE)
RETURNS TEXT AS $$
DECLARE
  year_part INTEGER;
  quarter_num INTEGER;
BEGIN
  year_part := EXTRACT(YEAR FROM input_date);
  quarter_num := EXTRACT(QUARTER FROM input_date);
  
  RETURN year_part || '-Q' || quarter_num;
END;
$$ LANGUAGE plpgsql;

-- 5. FUNÇÃO PARA BUSCAR SNAPSHOT ANTERIOR
CREATE OR REPLACE FUNCTION get_previous_snapshot(
  p_business_id UUID,
  p_current_quarter TEXT
)
RETURNS business_quarterly_snapshots AS $$
DECLARE
  result business_quarterly_snapshots;
  current_year INTEGER;
  current_q INTEGER;
  prev_year INTEGER;
  prev_q INTEGER;
  prev_quarter TEXT;
BEGIN
  -- Extrair ano e quarter atual
  current_year := CAST(SPLIT_PART(p_current_quarter, '-Q', 1) AS INTEGER);
  current_q := CAST(SPLIT_PART(p_current_quarter, '-Q', 2) AS INTEGER);
  
  -- Calcular quarter anterior
  IF current_q = 1 THEN
    prev_year := current_year - 1;
    prev_q := 4;
  ELSE
    prev_year := current_year;
    prev_q := current_q - 1;
  END IF;
  
  prev_quarter := prev_year || '-Q' || prev_q;
  
  -- Buscar snapshot anterior
  SELECT * INTO result
  FROM business_quarterly_snapshots
  WHERE business_id = p_business_id 
    AND quarter = prev_quarter;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 6. VIEW PARA DASHBOARD COM COMPARAÇÕES
CREATE OR REPLACE VIEW dashboard_snapshots_with_comparison AS
SELECT 
  current_snap.*,
  prev_snap.kpis as previous_kpis,
  prev_snap.digital_presence as previous_digital_presence,
  prev_snap.four_ps_status as previous_four_ps,
  prev_snap.porter_forces as previous_porter_forces,
  
  -- Calcular deltas automaticamente
  (current_snap.kpis->>'ocupacao')::numeric - COALESCE((prev_snap.kpis->>'ocupacao')::numeric, 0) as ocupacao_delta,
  (current_snap.kpis->>'ticket')::numeric - COALESCE((prev_snap.kpis->>'ticket')::numeric, 0) as ticket_delta,
  (current_snap.kpis->>'nps')::numeric - COALESCE((prev_snap.kpis->>'nps')::numeric, 0) as nps_delta,
  
  -- Metadados de comparação
  prev_snap.quarter as previous_quarter,
  prev_snap.notes as previous_notes
  
FROM business_quarterly_snapshots current_snap
LEFT JOIN business_quarterly_snapshots prev_snap ON (
  current_snap.business_id = prev_snap.business_id AND
  (
    (current_snap.quarter_number = 1 AND prev_snap.quarter_number = 4 AND prev_snap.year = current_snap.year - 1) OR
    (current_snap.quarter_number > 1 AND prev_snap.quarter_number = current_snap.quarter_number - 1 AND prev_snap.year = current_snap.year)
  )
);

-- 7. DADOS EXEMPLO PARA TESTE
INSERT INTO business_quarterly_snapshots (
  business_id, quarter, year, quarter_number,
  digital_presence, kpis, four_ps_status, porter_forces, notes
) VALUES (
  '00000000-0000-0000-0000-000000000002', -- Business ID exemplo
  '2025-Q3', 2025, 3,
  '{
    "google": {"rating": 4.5, "reviews": 216},
    "instagram": 8120,
    "facebook": 5430,
    "tiktok": 0,
    "tripadvisor": {"rating": 4.3, "rank": 20}
  }',
  '{
    "ocupacao": 66,
    "ticket": 59,
    "margemPorcoes": 61,
    "nps": 79,
    "ruido": 1
  }',
  '{
    "produto": "green",
    "preco": "yellow",
    "praca": "green", 
    "promocao": "yellow"
  }',
  '{
    "rivalidade": {"score": 6, "status": "yellow"},
    "entrantes": {"score": 5, "status": "yellow"},
    "fornecedores": {"score": 4, "status": "green"},
    "clientes": {"score": 6, "status": "yellow"},
    "substitutos": {"score": 7, "status": "red"}
  }',
  'Implementação de roteiro de conteúdo'
) ON CONFLICT (business_id, quarter) DO NOTHING;

-- 8. COMENTÁRIOS E DOCUMENTAÇÃO
COMMENT ON TABLE business_quarterly_snapshots IS 'Snapshots trimestrais de métricas e análises estratégicas para dashboard empresarial';
COMMENT ON COLUMN business_quarterly_snapshots.quarter IS 'Formato: YYYY-QN (ex: 2025-Q1)';
COMMENT ON COLUMN business_quarterly_snapshots.digital_presence IS 'Métricas de presença digital (Google, Instagram, Facebook, etc.)';
COMMENT ON COLUMN business_quarterly_snapshots.kpis IS 'KPIs principais: ocupação, ticket médio, NPS, margem, ruído';
COMMENT ON COLUMN business_quarterly_snapshots.four_ps_status IS 'Status dos 4 Ps do Marketing (green/yellow/red)';
COMMENT ON COLUMN business_quarterly_snapshots.porter_forces IS '5 Forças de Porter com scores e status';

-- ✅ ESTRUTURA COMPLETA CRIADA
-- Execute este arquivo no Supabase Dashboard para criar toda a estrutura trimestral
