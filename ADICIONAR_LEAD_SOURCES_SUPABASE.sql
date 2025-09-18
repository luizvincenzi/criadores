-- 🚀 ADICIONAR NOVOS VALORES AO ENUM LEAD_SOURCE
-- Execute este SQL no Supabase Dashboard para permitir novos valores de lead_source
-- IMPORTANTE: Execute cada seção separadamente para evitar problemas de transação

-- ========================================
-- SEÇÃO 1: VERIFICAR ESTADO ATUAL
-- ========================================

-- 1. Verificar se existe enum lead_source
SELECT
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_source_enum')
    THEN 'ENUM EXISTE'
    ELSE 'ENUM NÃO EXISTE'
  END as status_enum;

-- 2. Verificar valores atuais do enum (se existir)
SELECT enumlabel as valores_atuais
FROM pg_enum
WHERE enumtypid = (
  SELECT oid
  FROM pg_type
  WHERE typname = 'lead_source_enum'
)
ORDER BY enumsortorder;

-- 3. Verificar constraint atual
SELECT conname, consrc
FROM pg_constraint
WHERE conrelid = 'businesses'::regclass
AND conname LIKE '%lead_source%';

-- ========================================
-- SEÇÃO 2: REMOVER CONSTRAINT ANTIGA
-- ========================================

-- 4. Remover constraint check se existir
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'businesses'::regclass
    AND conname = 'businesses_lead_source_check'
  ) THEN
    ALTER TABLE businesses DROP CONSTRAINT businesses_lead_source_check;
    RAISE NOTICE 'Constraint businesses_lead_source_check removida';
  ELSE
    RAISE NOTICE 'Constraint businesses_lead_source_check não existe';
  END IF;
END $$;

-- ========================================
-- SEÇÃO 3: ALTERAR COLUNA PARA VARCHAR (TEMPORÁRIO)
-- ========================================

-- 5. Alterar coluna lead_source para VARCHAR para permitir novos valores
ALTER TABLE businesses
ALTER COLUMN lead_source TYPE VARCHAR(50);

-- 6. Verificar se a alteração funcionou
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'businesses'
AND column_name = 'lead_source';

-- ========================================
-- SEÇÃO 4: TESTAR NOVOS VALORES
-- ========================================

-- 7. Testar inserção com novos valores
INSERT INTO businesses (
  organization_id,
  name,
  business_stage,
  status,
  is_active,
  lead_source
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Teste ChatCriadores Home',
  '01_PROSPECT',
  'Reunião de briefing',
  true,
  'chatcriadores-home'
) RETURNING id, name, lead_source;

-- 8. Testar inserção com outro valor
INSERT INTO businesses (
  organization_id,
  name,
  business_stage,
  status,
  is_active,
  lead_source
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Teste ChatCriadores Novo',
  '01_PROSPECT',
  'Reunião de briefing',
  true,
  'chatcriadores-novo'
) RETURNING id, name, lead_source;

-- 9. Verificar se os testes funcionaram
SELECT name, lead_source
FROM businesses
WHERE name LIKE 'Teste ChatCriadores%';

-- 10. Limpar testes
DELETE FROM businesses
WHERE name LIKE 'Teste ChatCriadores%';

-- ========================================
-- SEÇÃO 5: VERIFICAÇÃO FINAL
-- ========================================

-- 11. Verificar estado final
SELECT
  'COLUNA ALTERADA PARA VARCHAR' as status,
  data_type as tipo_atual
FROM information_schema.columns
WHERE table_name = 'businesses'
AND column_name = 'lead_source';

-- ✅ MIGRAÇÃO CONCLUÍDA
-- A coluna lead_source agora aceita qualquer string até 50 caracteres
-- A API poderá usar os novos valores de lead_source imediatamente
