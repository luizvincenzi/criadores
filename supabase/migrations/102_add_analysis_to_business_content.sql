-- Migration 102: Adicionar campos de análise qualitativa para business_content_social
-- Data: 2025-10-28
-- Descrição: Adiciona campos para análise qualitativa de conteúdo (sentimento e observações)

-- Adicionar campo sentiment (sentimento da audiência)
ALTER TABLE business_content_social 
ADD COLUMN IF NOT EXISTS sentiment VARCHAR(50) 
CHECK (sentiment IN ('positive', 'neutral', 'negative'));

-- Adicionar campo analysis_notes (observações qualitativas)
ALTER TABLE business_content_social 
ADD COLUMN IF NOT EXISTS analysis_notes TEXT;

-- Comentários para documentação
COMMENT ON COLUMN business_content_social.sentiment IS 'Sentimento da audiência: positive (positivo), neutral (neutro), negative (negativo)';
COMMENT ON COLUMN business_content_social.analysis_notes IS 'Observações e insights qualitativos sobre o conteúdo executado';

-- Índice para filtrar por sentimento (útil para relatórios)
CREATE INDEX IF NOT EXISTS idx_business_content_sentiment 
ON business_content_social(sentiment) 
WHERE sentiment IS NOT NULL;

-- Índice composto para análises (conteúdos executados com sentimento)
CREATE INDEX IF NOT EXISTS idx_business_content_executed_sentiment 
ON business_content_social(is_executed, sentiment) 
WHERE is_executed = true AND sentiment IS NOT NULL;

-- Log de sucesso
DO $$ 
BEGIN 
  RAISE NOTICE '✅ Migration 102: Campos de análise qualitativa adicionados com sucesso!';
  RAISE NOTICE '   - sentiment: VARCHAR(50) CHECK (positive, neutral, negative)';
  RAISE NOTICE '   - analysis_notes: TEXT';
END $$;

