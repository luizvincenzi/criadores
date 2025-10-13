-- ============================================================================
-- SISTEMA DE LANDING PAGES DINÂMICAS - CRIADORES
-- ============================================================================
-- Domínios:
-- - criadores.app: Renderização das LPs (leitura)
-- - criadores.digital: Editor/CRM (leitura + escrita)
-- ============================================================================

-- ============================================================================
-- 1. TABELA DE TEMPLATES
-- ============================================================================
-- Armazena os templates fixos de LP (estrutura)
-- Cada template define a ordem das seções e metodologia aplicada

CREATE TABLE lp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identificação
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  
  -- Metodologia aplicada
  methodology VARCHAR(50) NOT NULL, -- 'erico-rocha-completo', 'ladeira-direto', 'jeff-walker-plf'
  
  -- Estrutura fixa (ordem das seções)
  structure JSONB NOT NULL DEFAULT '{}'::jsonb,
  /* Exemplo:
  {
    "sections": [
      {
        "id": "hero",
        "name": "Hero",
        "component": "HeroSection",
        "methodology_notes": {
          "erico_rocha": "Isca - Promessa + Prova Social",
          "ladeira": "Headline magnética + CTA claro",
          "jeff_walker": "Oportunidade - O QUE"
        }
      },
      {
        "id": "problema",
        "name": "Problema",
        "component": "ProblemaSection",
        "methodology_notes": {
          "erico_rocha": "Dor + Agitação",
          "ladeira": "Identificação com a dor",
          "jeff_walker": "Contexto do problema"
        }
      },
      {
        "id": "solucao-1",
        "name": "Solução #1",
        "component": "SolucaoSection",
        "methodology_notes": {
          "erico_rocha": "Solução - Produto individual",
          "ladeira": "Bullets de benefícios",
          "jeff_walker": "Transformação - COMO"
        }
      },
      {
        "id": "combo",
        "name": "Oferta Combo",
        "component": "ComboSection",
        "methodology_notes": {
          "erico_rocha": "Oferta irresistível + Bônus",
          "ladeira": "Comparação de valor",
          "jeff_walker": "Posse - POR QUE AGORA"
        }
      },
      {
        "id": "urgencia",
        "name": "Urgência",
        "component": "UrgenciaSection",
        "methodology_notes": {
          "erico_rocha": "Escassez real",
          "ladeira": "Urgência sem fake",
          "jeff_walker": "Post-Launch - Fechamento"
        }
      }
    ],
    "methodology_summary": {
      "erico_rocha": "Funil completo: Isca → Problema → Solução → Oferta → Urgência",
      "ladeira": "Copy persuasivo em cada seção com prova social",
      "jeff_walker": "PLF adaptado: Oportunidade → Transformação → Posse"
    }
  }
  */
  
  -- Preview
  thumbnail_url VARCHAR(500),
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_lp_templates_slug ON lp_templates(slug);
CREATE INDEX idx_lp_templates_methodology ON lp_templates(methodology);

-- ============================================================================
-- 2. TABELA DE LANDING PAGES
-- ============================================================================
-- Armazena as instâncias de LPs (conteúdo editável)

CREATE TABLE landing_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL DEFAULT '00000000-0000-0000-0000-000000000001',
  
  -- Identificação
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50), -- 'combo', 'produto-unico', 'segmento-medicos', 'segmento-advogados'
  
  -- Template usado
  template_id UUID REFERENCES lp_templates(id) ON DELETE RESTRICT,
  
  -- Variáveis editáveis (todo o conteúdo da LP)
  variables JSONB NOT NULL DEFAULT '{}'::jsonb,
  /* Estrutura completa das variáveis - ver arquivo separado:
     database/schemas/lp_variables_schema.json
  */
  
  -- Configurações
  config JSONB DEFAULT '{}'::jsonb,
  /* Exemplo:
  {
    "chatbot_url": "/chatcriadores-empresas",
    "conversion_goal": "chatbot_click",
    "analytics": {
      "ga4_id": "G-XXXXXXXXXX",
      "meta_pixel_id": "123456789",
      "hotjar_id": "123456"
    },
    "features": {
      "show_urgency": true,
      "show_countdown": false,
      "enable_ab_test": false
    }
  }
  */
  
  -- SEO
  seo JSONB DEFAULT '{}'::jsonb,
  /* Exemplo:
  {
    "title": "Transforme Sua Empresa Numa Referência Regional | crIAdores",
    "description": "Mentoria + Social Media + Criadores Locais. Escolha a solução ideal para seu negócio crescer no digital.",
    "keywords": ["marketing digital", "empresas locais", "criadores de conteúdo"],
    "og_image": "/assets/og-empresas.jpg",
    "og_type": "website",
    "canonical": "https://criadores.app/empresas",
    "robots": "index, follow"
  }
  */
  
  -- Status
  status VARCHAR(20) DEFAULT 'draft', -- 'draft', 'active', 'archived'
  is_active BOOLEAN DEFAULT true,
  
  -- A/B Testing
  variant VARCHAR(50) DEFAULT 'A', -- 'A', 'B', 'C', etc
  parent_lp_id UUID REFERENCES landing_pages(id) ON DELETE SET NULL,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  published_at TIMESTAMP WITH TIME ZONE,
  
  -- Auditoria
  created_by UUID,
  updated_by UUID
);

-- Índices
CREATE INDEX idx_lp_slug ON landing_pages(slug);
CREATE INDEX idx_lp_template ON landing_pages(template_id);
CREATE INDEX idx_lp_status ON landing_pages(status, is_active);
CREATE INDEX idx_lp_category ON landing_pages(category);
CREATE INDEX idx_lp_parent ON landing_pages(parent_lp_id);

-- ============================================================================
-- 3. TABELA DE PRODUTOS DA LP
-- ============================================================================
-- Relacionamento entre LPs e produtos (tabela products já existe)

CREATE TABLE lp_products (
  lp_id UUID REFERENCES landing_pages(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  
  -- Ordem de exibição
  order_index INTEGER DEFAULT 0,
  
  -- Customização específica para essa LP
  custom_data JSONB DEFAULT '{}'::jsonb,
  /* Exemplo:
  {
    "custom_title": "Mentoria Estratégica VIP",
    "custom_description": "Copy específica para essa LP",
    "custom_price": 1500,
    "show_discount": true,
    "discount_percentage": 20,
    "urgency_message": "Últimas 8 vagas para dezembro",
    "bonus": [
      "Bônus 1: Acesso vitalício à comunidade",
      "Bônus 2: 10 templates de conteúdo"
    ],
    "guarantee": "30 dias de garantia incondicional"
  }
  */
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY (lp_id, product_id)
);

-- Índices
CREATE INDEX idx_lp_products_lp ON lp_products(lp_id);
CREATE INDEX idx_lp_products_product ON lp_products(product_id);

-- ============================================================================
-- 4. TABELA DE ANALYTICS
-- ============================================================================
-- Métricas agregadas por LP e por dia

CREATE TABLE lp_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lp_id UUID REFERENCES landing_pages(id) ON DELETE CASCADE,
  
  -- Período
  date DATE NOT NULL,
  
  -- Métricas gerais
  metrics JSONB DEFAULT '{}'::jsonb,
  /* Exemplo:
  {
    "views": 1500,
    "unique_visitors": 1200,
    "clicks_cta": 120,
    "conversions": 45,
    "conversion_rate": 3.0,
    "avg_time_on_page": 180,
    "bounce_rate": 35.5,
    "scroll_depth_avg": 75,
    "sections_viewed": {
      "hero": 1500,
      "problema": 1200,
      "solucao-1": 900,
      "solucao-2": 800,
      "solucao-3": 700,
      "combo": 600,
      "urgencia": 500,
      "cta-final": 450
    },
    "cta_clicks_by_section": {
      "hero": 30,
      "solucao-1": 25,
      "solucao-2": 20,
      "solucao-3": 15,
      "combo": 20,
      "cta-final": 10
    },
    "devices": {
      "mobile": 900,
      "desktop": 500,
      "tablet": 100
    },
    "traffic_sources": {
      "organic": 600,
      "direct": 400,
      "social": 300,
      "paid": 200
    }
  }
  */
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(lp_id, date)
);

-- Índices
CREATE INDEX idx_lp_analytics_lp ON lp_analytics(lp_id);
CREATE INDEX idx_lp_analytics_date ON lp_analytics(date);
CREATE INDEX idx_lp_analytics_lp_date ON lp_analytics(lp_id, date);

-- ============================================================================
-- 5. TABELA DE VERSÕES (Histórico de mudanças)
-- ============================================================================
-- Armazena histórico de todas as mudanças nas LPs

CREATE TABLE lp_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lp_id UUID REFERENCES landing_pages(id) ON DELETE CASCADE,
  
  -- Snapshot completo da LP
  snapshot JSONB NOT NULL,
  /* Exemplo:
  {
    "variables": {...},
    "config": {...},
    "seo": {...},
    "products": [...]
  }
  */
  
  -- Metadados da versão
  version_number INTEGER NOT NULL,
  change_description TEXT,
  
  -- Auditoria
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_lp_versions_lp ON lp_versions(lp_id);
CREATE INDEX idx_lp_versions_lp_version ON lp_versions(lp_id, version_number);

-- ============================================================================
-- 6. FUNÇÕES E TRIGGERS
-- ============================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_lp_templates_updated_at BEFORE UPDATE ON lp_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_landing_pages_updated_at BEFORE UPDATE ON landing_pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lp_products_updated_at BEFORE UPDATE ON lp_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lp_analytics_updated_at BEFORE UPDATE ON lp_analytics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para criar versão automaticamente ao atualizar LP
CREATE OR REPLACE FUNCTION create_lp_version()
RETURNS TRIGGER AS $$
DECLARE
  next_version INTEGER;
BEGIN
  -- Buscar próximo número de versão
  SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
  FROM lp_versions
  WHERE lp_id = NEW.id;
  
  -- Criar snapshot
  INSERT INTO lp_versions (lp_id, snapshot, version_number, created_by)
  VALUES (
    NEW.id,
    jsonb_build_object(
      'variables', NEW.variables,
      'config', NEW.config,
      'seo', NEW.seo,
      'status', NEW.status
    ),
    next_version,
    NEW.updated_by
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar versão
CREATE TRIGGER create_lp_version_trigger AFTER UPDATE ON landing_pages
  FOR EACH ROW
  WHEN (OLD.variables IS DISTINCT FROM NEW.variables OR 
        OLD.config IS DISTINCT FROM NEW.config OR 
        OLD.seo IS DISTINCT FROM NEW.seo)
  EXECUTE FUNCTION create_lp_version();

-- ============================================================================
-- 7. POLÍTICAS DE SEGURANÇA (RLS - Row Level Security)
-- ============================================================================

-- Habilitar RLS
ALTER TABLE lp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE landing_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE lp_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE lp_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE lp_versions ENABLE ROW LEVEL SECURITY;

-- Política: criadores.app pode LER tudo (LPs ativas)
CREATE POLICY "criadores_app_read_templates" ON lp_templates
  FOR SELECT USING (is_active = true);

CREATE POLICY "criadores_app_read_lps" ON landing_pages
  FOR SELECT USING (is_active = true AND status = 'active');

CREATE POLICY "criadores_app_read_lp_products" ON lp_products
  FOR SELECT USING (true);

CREATE POLICY "criadores_app_read_analytics" ON lp_analytics
  FOR SELECT USING (true);

-- Política: criadores.digital pode LER e ESCREVER tudo (autenticado)
-- Nota: Implementar autenticação com Supabase Auth
-- Por enquanto, permitir tudo para organization_id específico

CREATE POLICY "criadores_digital_all_templates" ON lp_templates
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "criadores_digital_all_lps" ON landing_pages
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "criadores_digital_all_lp_products" ON lp_products
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "criadores_digital_all_analytics" ON lp_analytics
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "criadores_digital_all_versions" ON lp_versions
  FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

