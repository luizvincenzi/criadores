-- =====================================================
-- Migration: Create business_content_social table
-- Description: Tabela SEPARADA para conteúdo social dos BUSINESSES (clientes externos)
--              NÃO confundir com social_content_calendar (CRM interno)
-- Author: Luiz Vincenzi
-- Date: 2025-10-15
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

-- Índice principal: business_id (queries mais comuns)
CREATE INDEX IF NOT EXISTS idx_business_content_social_business_id 
  ON business_content_social(business_id) 
  WHERE deleted_at IS NULL;

-- Índice: strategist_id (para filtrar por estrategista)
CREATE INDEX IF NOT EXISTS idx_business_content_social_strategist_id 
  ON business_content_social(strategist_id) 
  WHERE deleted_at IS NULL;

-- Índice: scheduled_date (para queries de calendário)
CREATE INDEX IF NOT EXISTS idx_business_content_social_scheduled_date 
  ON business_content_social(scheduled_date) 
  WHERE deleted_at IS NULL;

-- Índice: status (para filtrar por status)
CREATE INDEX IF NOT EXISTS idx_business_content_social_status 
  ON business_content_social(status) 
  WHERE deleted_at IS NULL;

-- Índice: assigned_to (para filtrar conteúdo atribuído)
CREATE INDEX IF NOT EXISTS idx_business_content_social_assigned_to 
  ON business_content_social(assigned_to) 
  WHERE deleted_at IS NULL;

-- Índice composto: business_id + scheduled_date (query mais comum)
CREATE INDEX IF NOT EXISTS idx_business_content_social_business_date 
  ON business_content_social(business_id, scheduled_date) 
  WHERE deleted_at IS NULL;

-- Índice: deleted_at (para soft delete)
CREATE INDEX IF NOT EXISTS idx_business_content_social_deleted_at 
  ON business_content_social(deleted_at) 
  WHERE deleted_at IS NOT NULL;

-- =====================================================
-- 3. CREATE TRIGGERS
-- =====================================================

-- Trigger: Atualizar updated_at automaticamente
CREATE TRIGGER update_business_content_social_updated_at
  BEFORE UPDATE ON business_content_social
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger: Calcular week_number, month_number, year automaticamente
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

-- Habilitar RLS
ALTER TABLE business_content_social ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLICY 1: SELECT - Admins e Managers veem TUDO
-- =====================================================
CREATE POLICY "Admins e Managers veem todo conteúdo business"
ON business_content_social
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM platform_users
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager')
  )
);

-- =====================================================
-- POLICY 2: SELECT - Business Owners veem apenas SEU business
-- =====================================================
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

-- =====================================================
-- POLICY 3: SELECT - Strategists veem apenas businesses que GERENCIAM
-- =====================================================
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

-- =====================================================
-- POLICY 4: SELECT - Creators veem apenas conteúdo ATRIBUÍDO a eles
-- =====================================================
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

-- =====================================================
-- POLICY 5: INSERT - Apenas admins, managers, business_owners e strategists
-- =====================================================
CREATE POLICY "Apenas admins, managers, business_owners e strategists podem criar"
ON business_content_social
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM platform_users
    WHERE id = auth.uid()
    AND (
      role IN ('admin', 'manager', 'business_owner')
      OR 'marketing_strategist' = ANY(roles)
    )
  )
);

-- =====================================================
-- POLICY 6: UPDATE - Apenas admins, managers, business_owners e strategists
-- =====================================================
CREATE POLICY "Apenas admins, managers, business_owners e strategists podem atualizar"
ON business_content_social
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM platform_users
    WHERE id = auth.uid()
    AND (
      role IN ('admin', 'manager', 'business_owner')
      OR 'marketing_strategist' = ANY(roles)
    )
  )
);

-- =====================================================
-- POLICY 7: DELETE - Apenas admins e managers (soft delete)
-- =====================================================
CREATE POLICY "Apenas admins e managers podem deletar"
ON business_content_social
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM platform_users
    WHERE id = auth.uid()
    AND role IN ('admin', 'manager')
  )
)
WITH CHECK (deleted_at IS NOT NULL);

-- =====================================================
-- 5. COMMENTS (Documentação)
-- =====================================================

COMMENT ON TABLE business_content_social IS 'Tabela de conteúdo social para BUSINESSES (clientes externos). NÃO confundir com social_content_calendar (CRM interno).';
COMMENT ON COLUMN business_content_social.business_id IS 'ID do business (OBRIGATÓRIO) - relacionamento principal';
COMMENT ON COLUMN business_content_social.strategist_id IS 'ID do estrategista responsável (opcional) - referencia creators.id';
COMMENT ON COLUMN business_content_social.assigned_to IS 'ID do usuário atribuído (platform_users) - pode ser creator';
COMMENT ON COLUMN business_content_social.created_by IS 'ID do usuário que criou (platform_users) - geralmente strategist ou business_owner';
COMMENT ON COLUMN business_content_social.executed_by IS 'ID do usuário que executou (platform_users) - geralmente creator';
COMMENT ON COLUMN business_content_social.deleted_at IS 'Soft delete - quando não NULL, registro está deletado';

-- =====================================================
-- 6. GRANT PERMISSIONS
-- =====================================================

-- Garantir que authenticated users podem acessar (RLS controla o resto)
GRANT SELECT, INSERT, UPDATE ON business_content_social TO authenticated;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================

-- Verificação final
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 031: business_content_social criada com sucesso!';
  RAISE NOTICE '📊 Tabela: business_content_social';
  RAISE NOTICE '🔒 RLS: Habilitado com 7 policies';
  RAISE NOTICE '📈 Índices: 7 índices criados';
  RAISE NOTICE '⚡ Triggers: 2 triggers criados';
END $$;

