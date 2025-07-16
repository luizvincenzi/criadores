-- Habilitar extensão unaccent
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Corrigir função de slug para não usar unaccent se não disponível
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Versão simplificada sem unaccent
    RETURN lower(
        regexp_replace(
            regexp_replace(
                input_text,
                '[^a-zA-Z0-9\s]', '', 'g'
            ),
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;
