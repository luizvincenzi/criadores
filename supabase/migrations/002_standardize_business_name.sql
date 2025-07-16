-- =====================================================
-- MIGRAÇÃO: PADRONIZAÇÃO DO CAMPO NOME DO BUSINESS
-- =====================================================
-- 
-- OBJETIVO: Consolidar todos os campos de nome do business
-- em um único campo 'name' para evitar inconsistências
--
-- PROBLEMA ATUAL:
-- - API retorna: business.nome (mapeado de business.name)
-- - Frontend usa: business.businessName, business.nome, business.name
-- - Store usa: businessName
-- - Modal mapeia: business.name || business.businessName || ''
--
-- SOLUÇÃO: Usar apenas 'name' em toda a aplicação
-- =====================================================

-- 1. VERIFICAR ESTRUTURA ATUAL
DO $$
BEGIN
    RAISE NOTICE '🔍 VERIFICANDO ESTRUTURA ATUAL DA TABELA BUSINESSES...';
    
    -- Verificar se a coluna 'name' já existe
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'businesses' 
        AND column_name = 'name'
        AND table_schema = 'public'
    ) THEN
        RAISE NOTICE '✅ Coluna "name" já existe na tabela businesses';
    ELSE
        RAISE NOTICE '❌ Coluna "name" NÃO existe na tabela businesses';
    END IF;
    
    -- Contar registros atuais
    DECLARE
        total_businesses INTEGER;
    BEGIN
        SELECT COUNT(*) INTO total_businesses FROM businesses;
        RAISE NOTICE '📊 Total de negócios na tabela: %', total_businesses;
    END;
END $$;

-- 2. BACKUP DOS DADOS ATUAIS (se necessário)
DO $$
BEGIN
    RAISE NOTICE '💾 CRIANDO BACKUP DOS DADOS ATUAIS...';
    
    -- Criar tabela de backup se não existir
    CREATE TABLE IF NOT EXISTS businesses_backup_name_migration AS 
    SELECT * FROM businesses WHERE 1=0; -- Estrutura sem dados
    
    -- Limpar backup anterior se existir
    DELETE FROM businesses_backup_name_migration;
    
    -- Fazer backup dos dados atuais
    INSERT INTO businesses_backup_name_migration 
    SELECT * FROM businesses;
    
    DECLARE
        backup_count INTEGER;
    BEGIN
        SELECT COUNT(*) INTO backup_count FROM businesses_backup_name_migration;
        RAISE NOTICE '✅ Backup criado com % registros', backup_count;
    END;
END $$;

-- 3. VERIFICAR DADOS EXISTENTES
DO $$
DECLARE
    empty_names INTEGER;
    total_businesses INTEGER;
BEGIN
    RAISE NOTICE '🔍 ANALISANDO DADOS EXISTENTES...';
    
    SELECT COUNT(*) INTO total_businesses FROM businesses;
    SELECT COUNT(*) INTO empty_names FROM businesses WHERE name IS NULL OR name = '';
    
    RAISE NOTICE '📊 ESTATÍSTICAS ATUAIS:';
    RAISE NOTICE '   - Total de negócios: %', total_businesses;
    RAISE NOTICE '   - Nomes vazios: %', empty_names;
    RAISE NOTICE '   - Nomes preenchidos: %', (total_businesses - empty_names);
    
    -- Mostrar alguns exemplos
    RAISE NOTICE '📋 EXEMPLOS DE NOMES ATUAIS:';
    FOR rec IN (
        SELECT id, name, slug 
        FROM businesses 
        WHERE name IS NOT NULL AND name != '' 
        LIMIT 5
    ) LOOP
        RAISE NOTICE '   - ID: % | Nome: "%" | Slug: "%"', rec.id, rec.name, rec.slug;
    END LOOP;
END $$;

-- 4. VALIDAR INTEGRIDADE DOS DADOS
DO $$
DECLARE
    duplicate_names INTEGER;
    invalid_names INTEGER;
BEGIN
    RAISE NOTICE '🔍 VALIDANDO INTEGRIDADE DOS DADOS...';
    
    -- Verificar nomes duplicados
    SELECT COUNT(*) INTO duplicate_names FROM (
        SELECT name, COUNT(*) 
        FROM businesses 
        WHERE name IS NOT NULL AND name != ''
        GROUP BY name 
        HAVING COUNT(*) > 1
    ) duplicates;
    
    -- Verificar nomes inválidos (muito curtos, caracteres especiais, etc.)
    SELECT COUNT(*) INTO invalid_names FROM businesses 
    WHERE name IS NOT NULL 
    AND (LENGTH(TRIM(name)) < 2 OR name ~ '[<>"\\/|*?:]');
    
    RAISE NOTICE '⚠️ PROBLEMAS ENCONTRADOS:';
    RAISE NOTICE '   - Nomes duplicados: %', duplicate_names;
    RAISE NOTICE '   - Nomes inválidos: %', invalid_names;
    
    IF duplicate_names > 0 THEN
        RAISE NOTICE '📋 NOMES DUPLICADOS:';
        FOR rec IN (
            SELECT name, COUNT(*) as count
            FROM businesses 
            WHERE name IS NOT NULL AND name != ''
            GROUP BY name 
            HAVING COUNT(*) > 1
            ORDER BY count DESC
        ) LOOP
            RAISE NOTICE '   - "%" aparece % vezes', rec.name, rec.count;
        END LOOP;
    END IF;
END $$;

-- 5. CRIAR ÍNDICES OTIMIZADOS PARA BUSCA POR NOME
DO $$
BEGIN
    RAISE NOTICE '🔧 CRIANDO ÍNDICES OTIMIZADOS...';
    
    -- Índice para busca exata por nome
    CREATE INDEX IF NOT EXISTS idx_businesses_name_exact 
    ON businesses(name) 
    WHERE name IS NOT NULL AND name != '';
    
    -- Índice para busca por texto (trigram para busca fuzzy)
    CREATE INDEX IF NOT EXISTS idx_businesses_name_trigram 
    ON businesses USING gin(name gin_trgm_ops)
    WHERE name IS NOT NULL AND name != '';
    
    -- Índice para busca case-insensitive
    CREATE INDEX IF NOT EXISTS idx_businesses_name_lower 
    ON businesses(LOWER(name))
    WHERE name IS NOT NULL AND name != '';
    
    -- Índice composto para organização + nome
    CREATE INDEX IF NOT EXISTS idx_businesses_org_name 
    ON businesses(organization_id, name)
    WHERE name IS NOT NULL AND name != '' AND is_active = true;
    
    RAISE NOTICE '✅ Índices criados com sucesso';
END $$;

-- 6. CRIAR FUNÇÃO PARA VALIDAÇÃO DE NOMES
CREATE OR REPLACE FUNCTION validate_business_name(business_name TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se o nome não é nulo ou vazio
    IF business_name IS NULL OR TRIM(business_name) = '' THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar comprimento mínimo
    IF LENGTH(TRIM(business_name)) < 2 THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar comprimento máximo
    IF LENGTH(business_name) > 255 THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar caracteres inválidos
    IF business_name ~ '[<>"\\/|*?:]' THEN
        RETURN FALSE;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 7. CRIAR FUNÇÃO PARA GERAR SLUG ÚNICO
CREATE OR REPLACE FUNCTION generate_unique_slug(business_name TEXT, business_id UUID DEFAULT NULL)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    final_slug TEXT;
    counter INTEGER := 0;
    max_attempts INTEGER := 100;
BEGIN
    -- Gerar slug base a partir do nome
    base_slug := LOWER(
        REGEXP_REPLACE(
            REGEXP_REPLACE(
                UNACCENT(TRIM(business_name)),
                '[^a-zA-Z0-9\s-]', '', 'g'
            ),
            '\s+', '-', 'g'
        )
    );
    
    -- Limitar tamanho do slug
    base_slug := LEFT(base_slug, 50);
    
    -- Remover hífens no início e fim
    base_slug := TRIM(base_slug, '-');
    
    -- Se o slug ficou vazio, usar um padrão
    IF base_slug = '' THEN
        base_slug := 'business';
    END IF;
    
    final_slug := base_slug;
    
    -- Verificar unicidade e adicionar sufixo se necessário
    WHILE counter < max_attempts LOOP
        IF NOT EXISTS (
            SELECT 1 FROM businesses 
            WHERE slug = final_slug 
            AND (business_id IS NULL OR id != business_id)
        ) THEN
            RETURN final_slug;
        END IF;
        
        counter := counter + 1;
        final_slug := base_slug || '-' || counter;
    END LOOP;
    
    -- Se não conseguiu gerar slug único, usar UUID
    RETURN base_slug || '-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
END;
$$ LANGUAGE plpgsql;

-- 8. ATUALIZAR SLUGS PARA NEGÓCIOS EXISTENTES SEM SLUG
DO $$
DECLARE
    business_record RECORD;
    new_slug TEXT;
    updated_count INTEGER := 0;
BEGIN
    RAISE NOTICE '🔧 ATUALIZANDO SLUGS PARA NEGÓCIOS EXISTENTES...';
    
    FOR business_record IN (
        SELECT id, name 
        FROM businesses 
        WHERE (slug IS NULL OR slug = '') 
        AND name IS NOT NULL 
        AND name != ''
    ) LOOP
        new_slug := generate_unique_slug(business_record.name, business_record.id);
        
        UPDATE businesses 
        SET slug = new_slug, updated_at = NOW()
        WHERE id = business_record.id;
        
        updated_count := updated_count + 1;
        
        IF updated_count <= 5 THEN
            RAISE NOTICE '   ✅ Slug criado: "%" → "%"', business_record.name, new_slug;
        END IF;
    END LOOP;
    
    RAISE NOTICE '✅ % slugs atualizados', updated_count;
END $$;

-- 9. CRIAR TRIGGER PARA MANTER SLUG ATUALIZADO
CREATE OR REPLACE FUNCTION update_business_slug()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualizar slug quando o nome mudar
    IF TG_OP = 'UPDATE' AND (OLD.name IS DISTINCT FROM NEW.name) THEN
        NEW.slug := generate_unique_slug(NEW.name, NEW.id);
    END IF;
    
    -- Gerar slug para novos registros
    IF TG_OP = 'INSERT' AND (NEW.slug IS NULL OR NEW.slug = '') THEN
        NEW.slug := generate_unique_slug(NEW.name, NEW.id);
    END IF;
    
    -- Atualizar timestamp
    NEW.updated_at := NOW();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar trigger se não existir
DROP TRIGGER IF EXISTS trigger_update_business_slug ON businesses;
CREATE TRIGGER trigger_update_business_slug
    BEFORE INSERT OR UPDATE ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION update_business_slug();

-- 10. ESTATÍSTICAS FINAIS
DO $$
DECLARE
    total_businesses INTEGER;
    valid_names INTEGER;
    valid_slugs INTEGER;
BEGIN
    RAISE NOTICE '📊 ESTATÍSTICAS FINAIS DA MIGRAÇÃO...';
    
    SELECT COUNT(*) INTO total_businesses FROM businesses;
    SELECT COUNT(*) INTO valid_names FROM businesses WHERE validate_business_name(name);
    SELECT COUNT(*) INTO valid_slugs FROM businesses WHERE slug IS NOT NULL AND slug != '';
    
    RAISE NOTICE '✅ MIGRAÇÃO CONCLUÍDA:';
    RAISE NOTICE '   - Total de negócios: %', total_businesses;
    RAISE NOTICE '   - Nomes válidos: % (%.1f%%)', valid_names, (valid_names::FLOAT / total_businesses * 100);
    RAISE NOTICE '   - Slugs válidos: % (%.1f%%)', valid_slugs, (valid_slugs::FLOAT / total_businesses * 100);
    RAISE NOTICE '   - Índices criados: 4';
    RAISE NOTICE '   - Funções criadas: 2';
    RAISE NOTICE '   - Triggers criados: 1';
    
    RAISE NOTICE '🎯 PRÓXIMOS PASSOS:';
    RAISE NOTICE '   1. Atualizar APIs para usar apenas "name"';
    RAISE NOTICE '   2. Atualizar frontend para usar apenas "name"';
    RAISE NOTICE '   3. Remover referências a "businessName" e "nome"';
    RAISE NOTICE '   4. Testar todas as funcionalidades';
END $$;
