-- =====================================================
-- EXECUTAR NO SUPABASE SQL EDITOR
-- Migration: 031_create_business_content_social
-- =====================================================
-- IMPORTANTE: Copie e cole este SQL no Supabase SQL Editor
-- =====================================================

-- =====================================================
-- 1. CREATE TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS business_content_social (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  
  -- 🔑 RELACIONAMENTOS PRINCIPAIS (DIFERENÇA DA TABELA CRM)
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  strategist_id UUID REFERENCES creators(id) ON DELETE SET NULL,
  
  -- Informações do Conteúdo
  title VARCHAR(255) NOT NULL,
  description TEXT,
  briefing TEXT,
  
  -- Tipo e Plataformas
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('post', 'reels', 'story')),
  platforms TEXT[] NOT NULL DEFAULT '{}',
  
  -- Agendamento
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  week_number INTEGER,
  month_number INTEGER,
  year INTEGER,
  
  -- Atribuição e Criação (REFERENCIA platform_users, NÃO users)
  assigned_to UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  created_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  
  -- Status e Execução
  status VARCHAR(50) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  is_executed BOOLEAN DEFAULT false,
  executed_at TIMESTAMP WITH TIME ZONE,
  executed_by UUID REFERENCES platform_users(id) ON DELETE SET NULL,
  
  -- Metadados
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  
  -- Auditoria
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- 2. CREATE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_business_content_social_business_id 
  ON business_content_social(business_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_business_content_social_strategist_id 
  ON business_content_social(strategist_id) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_business_content_social_scheduled_date 
  ON business_content_social(scheduled_date) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_business_content_social_status 
  ON business_content_social(status) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_business_content_social_assigned_to 
  ON business_content_social(assigned_to) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_business_content_social_business_date 
  ON business_content_social(business_id, scheduled_date) 
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_business_content_social_deleted_at 
  ON business_content_social(deleted_at) 
  WHERE deleted_at IS NOT NULL;

-- =====================================================
-- 3. CREATE TRIGGERS
-- =====================================================

CREATE TRIGGER update_business_content_social_updated_at
  BEFORE UPDATE ON business_content_social
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION set_business_content_date_fields()
RETURNS TRIGGER AS $$
BEGIN
  NEW.week_number := EXTRACT(WEEK FROM NEW.scheduled_date);
  NEW.month_number := EXTRACT(MONTH FROM NEW.scheduled_date);
  NEW.year := EXTRACT(YEAR FROM NEW.scheduled_date);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_business_content_date_fields_trigger
  BEFORE INSERT OR UPDATE OF scheduled_date ON business_content_social
  FOR EACH ROW
  EXECUTE FUNCTION set_business_content_date_fields();

-- =====================================================
-- 4. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE business_content_social ENABLE ROW LEVEL SECURITY;

-- POLICY 1: Business Owners veem apenas SEU business
CREATE POLICY "Business Owners veem apenas seu conteúdo"
ON business_content_social
FOR SELECT
USING (
  business_id IN (
    SELECT business_id FROM platform_users
    WHERE id = auth.uid()
    AND role = 'business_owner'
    AND business_id IS NOT NULL
  )
);

-- POLICY 2: Strategists veem apenas businesses que GERENCIAM
CREATE POLICY "Strategists veem apenas conteúdo dos seus businesses"
ON business_content_social
FOR SELECT
USING (
  business_id IN (
    SELECT b.id FROM businesses b
    INNER JOIN platform_users pu ON pu.creator_id = b.strategist_id
    WHERE pu.id = auth.uid()
    AND 'marketing_strategist' = ANY(pu.roles)
    AND b.has_strategist = true
  )
);

-- POLICY 3: Creators veem apenas conteúdo ATRIBUÍDO
CREATE POLICY "Creators veem apenas conteúdo atribuído"
ON business_content_social
FOR SELECT
USING (
  assigned_to = auth.uid()
  AND EXISTS (
    SELECT 1 FROM platform_users
    WHERE id = auth.uid()
    AND 'creator' = ANY(roles)
  )
);

-- POLICY 4: INSERT - Apenas business_owners e strategists
CREATE POLICY "Apenas business_owners e strategists podem criar"
ON business_content_social
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM platform_users
    WHERE id = auth.uid()
    AND (
      role = 'business_owner'
      OR 'marketing_strategist' = ANY(roles)
    )
  )
);

-- POLICY 5: UPDATE - Apenas business_owners e strategists
CREATE POLICY "Apenas business_owners e strategists podem atualizar"
ON business_content_social
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM platform_users
    WHERE id = auth.uid()
    AND (
      role = 'business_owner'
      OR 'marketing_strategist' = ANY(roles)
    )
  )
);

-- POLICY 6: DELETE - Apenas business_owners e strategists (soft delete)
CREATE POLICY "Apenas business_owners e strategists podem deletar"
ON business_content_social
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM platform_users
    WHERE id = auth.uid()
    AND (
      role = 'business_owner'
      OR 'marketing_strategist' = ANY(roles)
    )
  )
)
WITH CHECK (deleted_at IS NOT NULL);

-- =====================================================
-- 5. COMMENTS
-- =====================================================

COMMENT ON TABLE business_content_social IS 'Tabela de conteúdo social para BUSINESSES (clientes externos). NÃO confundir com social_content_calendar (CRM interno).';
COMMENT ON COLUMN business_content_social.business_id IS 'ID do business (OBRIGATÓRIO) - relacionamento principal';
COMMENT ON COLUMN business_content_social.strategist_id IS 'ID do estrategista responsável (opcional) - referencia creators.id';

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

GRANT SELECT, INSERT, UPDATE ON business_content_social TO authenticated;

-- =====================================================
-- 7. VERIFICAÇÃO
-- =====================================================

SELECT 
  '✅ Tabela business_content_social criada!' as status,
  COUNT(*) as total_policies
FROM pg_policies 
WHERE tablename = 'business_content_social';

-- =====================================================
-- FIM - MIGRATION EXECUTADA COM SUCESSO!
-- =====================================================

