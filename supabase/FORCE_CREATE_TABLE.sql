-- =====================================================
-- FORÇAR CRIAÇÃO DA TABELA (se não existir)
-- Execute este SQL se a tabela não aparecer
-- =====================================================

-- 1. Dropar tabela se existir (CUIDADO!)
-- DROP TABLE IF EXISTS business_content_social CASCADE;

-- 2. Criar tabela (com IF NOT EXISTS)
CREATE TABLE IF NOT EXISTS public.business_content_social (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  
  business_id UUID NOT NULL,
  strategist_id UUID,
  
  title VARCHAR(255) NOT NULL,
  description TEXT,
  briefing TEXT,
  
  content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('post', 'reels', 'story')),
  platforms TEXT[] NOT NULL DEFAULT '{}',
  
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  week_number INTEGER,
  month_number INTEGER,
  year INTEGER,
  
  assigned_to UUID,
  created_by UUID,
  
  status VARCHAR(50) NOT NULL DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled')),
  is_executed BOOLEAN DEFAULT false,
  executed_at TIMESTAMP WITH TIME ZONE,
  executed_by UUID,
  
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  tags TEXT[] DEFAULT '{}',
  order_index INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE
);

-- 3. Garantir que está no schema public
ALTER TABLE IF EXISTS business_content_social SET SCHEMA public;

-- 4. Dar permissões
GRANT SELECT, INSERT, UPDATE ON public.business_content_social TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.business_content_social TO anon;

-- 5. Verificar
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename = 'business_content_social';

