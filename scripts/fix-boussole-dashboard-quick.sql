-- ========================================
-- CORREÇÃO RÁPIDA PARA DASHBOARD BOUSSOLÉ
-- ========================================
-- Execute este script se o diagnóstico mostrar problemas

-- 1. CORRIGIR USUÁRIO BOUSSOLÉ
UPDATE users 
SET 
  business_id = '55310ebd-0e0d-492e-8c34-cd4740000000',
  role = 'business_owner',
  is_active = true,
  updated_at = NOW()
WHERE LOWER(email) = LOWER('financeiro.brooftop@gmail.com')
  AND (business_id IS NULL OR business_id != '55310ebd-0e0d-492e-8c34-cd4740000000');

-- 2. ATIVAR EMPRESA BOUSSOLÉ
UPDATE businesses
SET
  is_active = true,
  status = 'Reunião de briefing',
  updated_at = NOW()
WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000'
  AND (is_active = false OR status IS NULL);

-- 3. CRIAR TABELA DE SNAPSHOTS SE NÃO EXISTIR
CREATE TABLE IF NOT EXISTS business_quarterly_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  quarter VARCHAR(10) NOT NULL, -- Ex: "2024-Q3"
  year INTEGER NOT NULL,
  quarter_number INTEGER NOT NULL CHECK (quarter_number BETWEEN 1 AND 4),
  
  -- Dados do snapshot
  digital_presence JSONB DEFAULT '{}',
  kpis JSONB DEFAULT '{}',
  four_ps_status JSONB DEFAULT '{}',
  porter_forces JSONB DEFAULT '{}',
  market_diagnosis JSONB DEFAULT '{}',
  strategic_positioning JSONB DEFAULT '{}',
  action_matrix JSONB DEFAULT '{}',
  promo_calendar JSONB DEFAULT '{}',
  risk_management JSONB DEFAULT '{}',
  executive_summary JSONB DEFAULT '{}',
  notes TEXT,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraint para evitar duplicatas
  UNIQUE(business_id, quarter)
);

-- 4. CRIAR ÍNDICES SE NÃO EXISTIREM
CREATE INDEX IF NOT EXISTS idx_business_quarterly_snapshots_business_id 
ON business_quarterly_snapshots(business_id);

CREATE INDEX IF NOT EXISTS idx_business_quarterly_snapshots_quarter 
ON business_quarterly_snapshots(quarter);

CREATE INDEX IF NOT EXISTS idx_business_quarterly_snapshots_year_quarter 
ON business_quarterly_snapshots(year, quarter_number);

-- 5. CRIAR POLÍTICAS RLS SE NÃO EXISTIREM
ALTER TABLE business_quarterly_snapshots ENABLE ROW LEVEL SECURITY;

-- Política para leitura
DROP POLICY IF EXISTS "Users can read their business snapshots" ON business_quarterly_snapshots;
CREATE POLICY "Users can read their business snapshots" 
ON business_quarterly_snapshots FOR SELECT 
USING (
  business_id IN (
    SELECT b.id FROM businesses b 
    WHERE b.id = auth.uid()::text::uuid 
       OR b.owner_user_id = auth.uid()
       OR EXISTS (
         SELECT 1 FROM users u 
         WHERE u.id = auth.uid() 
           AND (u.business_id = b.id OR u.role IN ('admin', 'manager'))
       )
  )
);

-- Política para inserção
DROP POLICY IF EXISTS "Users can insert their business snapshots" ON business_quarterly_snapshots;
CREATE POLICY "Users can insert their business snapshots" 
ON business_quarterly_snapshots FOR INSERT 
WITH CHECK (
  business_id IN (
    SELECT b.id FROM businesses b 
    WHERE b.owner_user_id = auth.uid()
       OR EXISTS (
         SELECT 1 FROM users u 
         WHERE u.id = auth.uid() 
           AND (u.business_id = b.id OR u.role IN ('admin', 'manager'))
       )
  )
);

-- Política para atualização
DROP POLICY IF EXISTS "Users can update their business snapshots" ON business_quarterly_snapshots;
CREATE POLICY "Users can update their business snapshots" 
ON business_quarterly_snapshots FOR UPDATE 
USING (
  business_id IN (
    SELECT b.id FROM businesses b 
    WHERE b.owner_user_id = auth.uid()
       OR EXISTS (
         SELECT 1 FROM users u 
         WHERE u.id = auth.uid() 
           AND (u.business_id = b.id OR u.role IN ('admin', 'manager'))
       )
  )
);

-- 6. CRIAR TRIGGER PARA UPDATED_AT
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_business_quarterly_snapshots_updated_at ON business_quarterly_snapshots;
CREATE TRIGGER update_business_quarterly_snapshots_updated_at
  BEFORE UPDATE ON business_quarterly_snapshots
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 7. CRIAR SNAPSHOT INICIAL PARA BOUSSOLÉ SE NÃO EXISTIR
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
  '55310ebd-0e0d-492e-8c34-cd4740000000'::uuid,
  '2024-Q4',
  2024,
  4,
  jsonb_build_object(
    'google', jsonb_build_object('rating', 4.2, 'reviews', 45),
    'instagram', 850,
    'facebook', 420,
    'tiktok', 0,
    'tripadvisor', jsonb_build_object('rating', 4.0, 'rank', 15)
  ),
  jsonb_build_object(
    'ocupacao', 75,
    'ticket', 65,
    'margemPorcoes', 58,
    'nps', 72,
    'ruido', 2
  ),
  jsonb_build_object(
    'produto', 'green',
    'preco', 'yellow',
    'praca', 'green',
    'promocao', 'yellow'
  ),
  jsonb_build_object(
    'rivalidade', jsonb_build_object('score', 6, 'status', 'yellow'),
    'entrantes', jsonb_build_object('score', 4, 'status', 'green'),
    'fornecedores', jsonb_build_object('score', 5, 'status', 'yellow'),
    'clientes', jsonb_build_object('score', 7, 'status', 'green'),
    'substitutos', jsonb_build_object('score', 5, 'status', 'yellow')
  ),
  jsonb_build_object(
    'green', ARRAY['Empresa ativa no sistema', 'Presença digital estabelecida'],
    'yellow', ARRAY['Margem de porções pode ser otimizada', 'Estratégia de preços em revisão'],
    'red', ARRAY[]::text[]
  ),
  'Snapshot inicial criado automaticamente para Boussolé - Q4 2024'
WHERE NOT EXISTS (
  SELECT 1 FROM business_quarterly_snapshots 
  WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000'
    AND quarter = '2024-Q4'
);

-- 8. VERIFICAR RESULTADO
SELECT 
  '=== CORREÇÃO APLICADA ===' as resultado,
  (SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER('financeiro.brooftop@gmail.com') AND business_id = '55310ebd-0e0d-492e-8c34-cd4740000000') as usuario_corrigido,
  (SELECT COUNT(*) FROM businesses WHERE id = '55310ebd-0e0d-492e-8c34-cd4740000000' AND is_active = true) as empresa_ativa,
  (SELECT COUNT(*) FROM business_quarterly_snapshots WHERE business_id = '55310ebd-0e0d-492e-8c34-cd4740000000') as snapshots_criados,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM users u
      JOIN businesses b ON u.business_id = b.id
      WHERE LOWER(u.email) = LOWER('financeiro.brooftop@gmail.com')
        AND b.is_active = true
        AND EXISTS (SELECT 1 FROM business_quarterly_snapshots WHERE business_id = b.id)
    ) THEN '✅ DASHBOARD PRONTO PARA USO'
    ELSE '❌ Ainda há problemas - verificar logs'
  END as status_final;
