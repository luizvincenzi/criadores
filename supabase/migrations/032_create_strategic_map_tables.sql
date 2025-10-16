-- ========================================
-- Migração 032: Criar tabelas do Mapa Estratégico
-- ========================================
-- Tabelas para armazenar dados do mapa estratégico por trimestre

-- CREATE TYPE para section_type se não existir
DO $$ BEGIN
  CREATE TYPE section_type AS ENUM (
    'metrics_overview',
    'market_analysis',
    'business_diagnosis',
    'swot',
    'product_analysis',
    'icp_personas',
    'kpi_table',
    'objectives'
  );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Tabela principal do mapa estratégico
CREATE TABLE IF NOT EXISTS strategic_maps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  quarter VARCHAR(10) NOT NULL, -- Formato: 2025-Q4
  year INTEGER NOT NULL,
  quarter_number INTEGER NOT NULL CHECK (quarter_number BETWEEN 1 AND 4),
  status VARCHAR(50) DEFAULT 'draft', -- draft, in_progress, completed
  generation_progress INTEGER DEFAULT 0,
  input_data JSONB DEFAULT '{}'::jsonb,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(business_id, quarter, year)
);

-- Tabela de seções do mapa estratégico
CREATE TABLE IF NOT EXISTS strategic_map_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  strategic_map_id UUID NOT NULL REFERENCES strategic_maps(id) ON DELETE CASCADE,
  section_type section_type NOT NULL,
  section_order INTEGER NOT NULL,
  content JSONB DEFAULT '{}'::jsonb,
  ai_generated_content JSONB DEFAULT '{}'::jsonb,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(strategic_map_id, section_type)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_strategic_maps_business_id ON strategic_maps(business_id);
CREATE INDEX IF NOT EXISTS idx_strategic_maps_organization_id ON strategic_maps(organization_id);
CREATE INDEX IF NOT EXISTS idx_strategic_maps_quarter ON strategic_maps(quarter, year);
CREATE INDEX IF NOT EXISTS idx_strategic_map_sections_map_id ON strategic_map_sections(strategic_map_id);
CREATE INDEX IF NOT EXISTS idx_strategic_map_sections_type ON strategic_map_sections(section_type);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_strategic_maps_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_strategic_maps_updated_at
BEFORE UPDATE ON strategic_maps
FOR EACH ROW
EXECUTE FUNCTION update_strategic_maps_updated_at();

CREATE TRIGGER trigger_update_strategic_map_sections_updated_at
BEFORE UPDATE ON strategic_map_sections
FOR EACH ROW
EXECUTE FUNCTION update_strategic_maps_updated_at();

-- RLS Policies (se RLS está ativado)
ALTER TABLE strategic_maps ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_map_sections ENABLE ROW LEVEL SECURITY;

-- Policy: usuários podem ver mapas de sua organização
CREATE POLICY "Users can view strategic_maps of their organization"
  ON strategic_maps FOR SELECT
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Policy: managers podem inserir mapas
CREATE POLICY "Managers can insert strategic_maps"
  ON strategic_maps FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
        AND organization_id = strategic_maps.organization_id
        AND role IN ('admin', 'manager')
    )
  );

-- Policy: usuários podem atualizar mapas de sua organização
CREATE POLICY "Users can update strategic_maps of their organization"
  ON strategic_maps FOR UPDATE
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ))
  WITH CHECK (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Policies para seções (herdam comportamento do mapa pai)
CREATE POLICY "Users can view strategic_map_sections"
  ON strategic_map_sections FOR SELECT
  USING (
    strategic_map_id IN (
      SELECT id FROM strategic_maps
      WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert strategic_map_sections"
  ON strategic_map_sections FOR INSERT
  WITH CHECK (
    strategic_map_id IN (
      SELECT id FROM strategic_maps
      WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update strategic_map_sections"
  ON strategic_map_sections FOR UPDATE
  USING (
    strategic_map_id IN (
      SELECT id FROM strategic_maps
      WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  )
  WITH CHECK (
    strategic_map_id IN (
      SELECT id FROM strategic_maps
      WHERE organization_id IN (
        SELECT organization_id FROM users WHERE id = auth.uid()
      )
    )
  );
