-- Verificar se a função generate_slug existe
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'generate_slug';

-- Se não existir, criar a função
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN lower(
        regexp_replace(
            regexp_replace(
                regexp_replace(input_text, '[áàâãäå]', 'a', 'gi'),
                '[éèêë]', 'e', 'gi'
            ),
            '[^a-z0-9]+', '-', 'gi'
        )
    );
END;
$$ LANGUAGE plpgsql;