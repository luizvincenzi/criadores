-- 🚀 ADICIONAR NOVOS VALORES AO ENUM LEAD_SOURCE
-- Execute este SQL no Supabase Dashboard para permitir novos valores de lead_source

-- 1. Verificar o enum atual
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid 
  FROM pg_type 
  WHERE typname = 'lead_source_enum'
);

-- 2. Adicionar novos valores ao enum lead_source (se existir)
-- Nota: Se o enum não existir, será criado automaticamente

-- Adicionar valores específicos dos chatbots
DO $$ 
BEGIN
  -- Verificar se o tipo enum existe
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_source_enum') THEN
    -- Adicionar novos valores se não existirem
    BEGIN
      ALTER TYPE lead_source_enum ADD VALUE IF NOT EXISTS 'chatcriadores-home';
    EXCEPTION WHEN duplicate_object THEN
      NULL; -- Ignorar se já existir
    END;
    
    BEGIN
      ALTER TYPE lead_source_enum ADD VALUE IF NOT EXISTS 'chatcriadores-novo';
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
    
    BEGIN
      ALTER TYPE lead_source_enum ADD VALUE IF NOT EXISTS 'indicacao';
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
    
    BEGIN
      ALTER TYPE lead_source_enum ADD VALUE IF NOT EXISTS 'socio';
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
    
    BEGIN
      ALTER TYPE lead_source_enum ADD VALUE IF NOT EXISTS 'parceiro';
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
    
    BEGIN
      ALTER TYPE lead_source_enum ADD VALUE IF NOT EXISTS 'organico';
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
    
    BEGIN
      ALTER TYPE lead_source_enum ADD VALUE IF NOT EXISTS 'pago';
    EXCEPTION WHEN duplicate_object THEN
      NULL;
    END;
    
    RAISE NOTICE 'Novos valores adicionados ao enum lead_source_enum';
  ELSE
    -- Se o enum não existir, criar com todos os valores
    CREATE TYPE lead_source_enum AS ENUM (
      'proprio',
      'chatcriadores-home',
      'chatcriadores-novo', 
      'indicacao',
      'socio',
      'parceiro',
      'organico',
      'pago'
    );
    
    -- Alterar a coluna para usar o enum
    ALTER TABLE businesses 
    ALTER COLUMN lead_source TYPE lead_source_enum 
    USING lead_source::lead_source_enum;
    
    RAISE NOTICE 'Enum lead_source_enum criado e aplicado à tabela businesses';
  END IF;
END $$;

-- 3. Verificar se a constraint foi removida/atualizada
SELECT conname, consrc 
FROM pg_constraint 
WHERE conrelid = 'businesses'::regclass 
AND conname LIKE '%lead_source%';

-- 4. Se houver constraint check antiga, remover
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conrelid = 'businesses'::regclass 
    AND conname = 'businesses_lead_source_check'
  ) THEN
    ALTER TABLE businesses DROP CONSTRAINT businesses_lead_source_check;
    RAISE NOTICE 'Constraint antiga removida';
  END IF;
END $$;

-- 5. Criar nova constraint se necessário (opcional)
-- ALTER TABLE businesses 
-- ADD CONSTRAINT businesses_lead_source_check 
-- CHECK (lead_source IN ('proprio', 'chatcriadores-home', 'chatcriadores-novo', 'indicacao', 'socio', 'parceiro', 'organico', 'pago'));

-- 6. Verificar resultado final
SELECT enumlabel 
FROM pg_enum 
WHERE enumtypid = (
  SELECT oid 
  FROM pg_type 
  WHERE typname = 'lead_source_enum'
)
ORDER BY enumsortorder;

-- 7. Testar inserção
INSERT INTO businesses (
  organization_id,
  name,
  business_stage,
  status,
  is_active,
  lead_source
) VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Teste Lead Source Chatcriadores',
  '01_PROSPECT',
  'Reunião de briefing',
  true,
  'chatcriadores-home'
) RETURNING id, name, lead_source;

-- 8. Limpar teste
DELETE FROM businesses 
WHERE name = 'Teste Lead Source Chatcriadores';

-- ✅ MIGRAÇÃO CONCLUÍDA
-- Após executar este SQL, a API poderá usar os novos valores de lead_source
