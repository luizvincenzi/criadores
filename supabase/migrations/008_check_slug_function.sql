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
                regexp_replace(
                    regexp_replace(
                        regexp_replace(
                            regexp_replace(
                                regexp_replace(
                                    regexp_replace(input_text, '[áàâãäå]', 'a', 'gi'),
                                    '[éèêë]', 'e', 'gi'
                                ),
                                '[íìîï]', 'i', 'gi'
                            ),
                            '[óòôõö]', 'o', 'gi'
                        ),
                        '[úùûü]', 'u', 'gi'
                    ),
                    '[ç]', 'c', 'gi'
                ),
                '[^a-z0-9\s]', '', 'g'
            ),
            '\s+', '-', 'g'
        )
    );
END;
$$ LANGUAGE plpgsql;

-- Testar a função
SELECT generate_slug('Clínica Odontológica Natália') as test_slug;
