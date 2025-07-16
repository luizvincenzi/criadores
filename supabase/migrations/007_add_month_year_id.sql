-- Migração para adicionar month_year_id e corrigir formato de mês
-- Data: 2025-07-16
-- Descrição: Adicionar coluna month_year_id para busca consistente de campanhas por mês

-- 1. Adicionar nova coluna month_year_id
ALTER TABLE campaigns 
ADD COLUMN month_year_id INTEGER;

-- 2. Função para converter mês string para month_year_id
CREATE OR REPLACE FUNCTION convert_month_to_id(month_str TEXT)
RETURNS INTEGER AS $$
DECLARE
    year_part INTEGER;
    month_part INTEGER;
    month_name TEXT;
BEGIN
    -- Se já é um formato YYYY-MM, extrair diretamente
    IF month_str ~ '^\d{4}-\d{2}$' THEN
        year_part := CAST(SPLIT_PART(month_str, '-', 1) AS INTEGER);
        month_part := CAST(SPLIT_PART(month_str, '-', 2) AS INTEGER);
        RETURN year_part * 100 + month_part;
    END IF;
    
    -- Se é formato "MMM YY" (ex: "jul 25")
    IF month_str ~ '^[a-z]{3} \d{2}$' THEN
        month_name := SPLIT_PART(month_str, ' ', 1);
        year_part := 2000 + CAST(SPLIT_PART(month_str, ' ', 2) AS INTEGER);
        
        month_part := CASE month_name
            WHEN 'jan' THEN 1
            WHEN 'fev' THEN 2
            WHEN 'mar' THEN 3
            WHEN 'abr' THEN 4
            WHEN 'mai' THEN 5
            WHEN 'jun' THEN 6
            WHEN 'jul' THEN 7
            WHEN 'ago' THEN 8
            WHEN 'set' THEN 9
            WHEN 'out' THEN 10
            WHEN 'nov' THEN 11
            WHEN 'dez' THEN 12
            ELSE 1
        END;
        
        RETURN year_part * 100 + month_part;
    END IF;
    
    -- Se é formato "MMM YYYY" (ex: "jul 2025")
    IF month_str ~ '^[a-z]{3} \d{4}$' THEN
        month_name := SPLIT_PART(month_str, ' ', 1);
        year_part := CAST(SPLIT_PART(month_str, ' ', 2) AS INTEGER);
        
        month_part := CASE month_name
            WHEN 'jan' THEN 1
            WHEN 'fev' THEN 2
            WHEN 'mar' THEN 3
            WHEN 'abr' THEN 4
            WHEN 'mai' THEN 5
            WHEN 'jun' THEN 6
            WHEN 'jul' THEN 7
            WHEN 'ago' THEN 8
            WHEN 'set' THEN 9
            WHEN 'out' THEN 10
            WHEN 'nov' THEN 11
            WHEN 'dez' THEN 12
            ELSE 1
        END;
        
        RETURN year_part * 100 + month_part;
    END IF;
    
    -- Default: assumir julho 2025
    RETURN 202507;
END;
$$ LANGUAGE plpgsql;

-- 3. Atualizar campanhas existentes com month_year_id
UPDATE campaigns 
SET month_year_id = convert_month_to_id(month)
WHERE month_year_id IS NULL;

-- 4. Tornar month_year_id obrigatório
ALTER TABLE campaigns 
ALTER COLUMN month_year_id SET NOT NULL;

-- 5. Adicionar índice para performance
CREATE INDEX idx_campaigns_month_year_id ON campaigns(month_year_id);
CREATE INDEX idx_campaigns_business_month ON campaigns(business_id, month_year_id);

-- 6. Função para converter month_year_id de volta para formato display
CREATE OR REPLACE FUNCTION format_month_display(month_year_id INTEGER)
RETURNS TEXT AS $$
DECLARE
    year_part INTEGER;
    month_part INTEGER;
    month_names TEXT[] := ARRAY['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
                                'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
BEGIN
    year_part := month_year_id / 100;
    month_part := month_year_id % 100;
    
    IF month_part < 1 OR month_part > 12 THEN
        month_part := 7; -- Default para julho
    END IF;
    
    RETURN month_names[month_part] || ' de ' || year_part;
END;
$$ LANGUAGE plpgsql;

-- 7. Verificar dados após migração
DO $$
DECLARE
    campaign_record RECORD;
BEGIN
    RAISE NOTICE 'Verificando campanhas após migração:';
    
    FOR campaign_record IN 
        SELECT id, title, month, month_year_id, format_month_display(month_year_id) as display_month
        FROM campaigns 
        ORDER BY month_year_id
    LOOP
        RAISE NOTICE 'Campanha: % | Mês original: % | ID: % | Display: %', 
            campaign_record.title, 
            campaign_record.month, 
            campaign_record.month_year_id,
            campaign_record.display_month;
    END LOOP;
END $$;
