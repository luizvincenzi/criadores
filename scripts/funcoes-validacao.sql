-- 🔧 FUNÇÕES SQL PARA VALIDAÇÃO E CORREÇÃO AUTOMÁTICA
-- Execute este script no Supabase para criar as funções

-- =====================================================
-- 1. FUNÇÃO: Buscar campanhas inconsistentes
-- =====================================================

CREATE OR REPLACE FUNCTION get_inconsistent_campaigns()
RETURNS TABLE (
    campaign_id UUID,
    title TEXT,
    business_name TEXT,
    month TEXT,
    quantidade_banco INTEGER,
    criadores_reais BIGINT,
    diferenca INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.title,
        COALESCE(b.name, 'Business não encontrado'),
        COALESCE(c.month, ''),
        COALESCE(c.quantidade_criadores, 0),
        COUNT(cc.id),
        COALESCE(c.quantidade_criadores, 0) - COUNT(cc.id)::INTEGER
    FROM campaigns c
    LEFT JOIN businesses b ON c.business_id = b.id
    LEFT JOIN campaign_creators cc ON cc.campaign_id = c.id AND cc.status != 'Removido'
    GROUP BY c.id, c.title, b.name, c.month, c.quantidade_criadores
    HAVING COALESCE(c.quantidade_criadores, 0) != COUNT(cc.id);
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. FUNÇÃO: Buscar criadores duplicados
-- =====================================================

CREATE OR REPLACE FUNCTION get_duplicate_creators()
RETURNS TABLE (
    campaign_id UUID,
    creator_id UUID,
    creator_name TEXT,
    quantidade_duplicatas BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        cc.campaign_id,
        cc.creator_id,
        COALESCE(cr.name, 'Criador não encontrado'),
        COUNT(*)
    FROM campaign_creators cc
    LEFT JOIN creators cr ON cc.creator_id = cr.id
    WHERE cc.status != 'Removido'
    GROUP BY cc.campaign_id, cc.creator_id, cr.name
    HAVING COUNT(*) > 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. FUNÇÃO: Buscar múltiplas campanhas por mês
-- =====================================================

CREATE OR REPLACE FUNCTION get_multiple_campaigns_per_month()
RETURNS TABLE (
    business_name TEXT,
    month TEXT,
    quantidade_campanhas BIGINT,
    titulos_campanhas TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COALESCE(b.name, 'Business não encontrado'),
        COALESCE(c.month, ''),
        COUNT(*),
        STRING_AGG(COALESCE(c.title, 'Sem título'), ' | ')
    FROM campaigns c
    JOIN businesses b ON c.business_id = b.id
    GROUP BY b.name, c.month, c.business_id
    HAVING COUNT(*) > 1;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. FUNÇÃO: Corrigir quantidade_criadores
-- =====================================================

CREATE OR REPLACE FUNCTION fix_quantidade_criadores()
RETURNS INTEGER AS $$
DECLARE
    campaign_record RECORD;
    creator_count INTEGER;
    fixed_count INTEGER := 0;
BEGIN
    FOR campaign_record IN 
        SELECT c.id, c.quantidade_criadores
        FROM campaigns c
    LOOP
        -- Contar criadores reais ativos
        SELECT COUNT(*) INTO creator_count
        FROM campaign_creators 
        WHERE campaign_id = campaign_record.id 
        AND status != 'Removido';
        
        -- Corrigir se inconsistente
        IF campaign_record.quantidade_criadores != creator_count 
           OR campaign_record.quantidade_criadores IS NULL 
           OR campaign_record.quantidade_criadores < 1 THEN
            
            UPDATE campaigns 
            SET quantidade_criadores = GREATEST(creator_count, 1),
                updated_at = NOW()
            WHERE id = campaign_record.id;
            
            fixed_count := fixed_count + 1;
            
            -- Registrar no audit_log
            INSERT INTO audit_log (
                organization_id,
                entity_type,
                entity_id,
                action,
                user_email,
                old_value,
                new_value,
                details
            ) SELECT 
                c.organization_id,
                'campaign',
                c.id,
                'auto_fix_quantidade',
                'sistema@auto-correcao.com',
                campaign_record.quantidade_criadores::text,
                GREATEST(creator_count, 1)::text,
                json_build_object(
                    'criadores_reais', creator_count,
                    'correcao_automatica', true,
                    'timestamp', NOW()
                )
            FROM campaigns c WHERE c.id = campaign_record.id;
        END IF;
    END LOOP;
    
    RETURN fixed_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 5. FUNÇÃO: Remover criadores órfãos
-- =====================================================

CREATE OR REPLACE FUNCTION remove_orphan_creators()
RETURNS INTEGER AS $$
DECLARE
    removed_count INTEGER;
BEGIN
    -- Contar órfãos antes de remover
    SELECT COUNT(*) INTO removed_count
    FROM campaign_creators cc
    LEFT JOIN campaigns c ON cc.campaign_id = c.id
    WHERE c.id IS NULL;
    
    -- Remover órfãos
    DELETE FROM campaign_creators cc
    WHERE NOT EXISTS (
        SELECT 1 FROM campaigns c WHERE c.id = cc.campaign_id
    );
    
    RETURN removed_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 6. FUNÇÃO: Reindexar posições dos criadores
-- =====================================================

CREATE OR REPLACE FUNCTION reindex_creator_positions()
RETURNS VOID AS $$
DECLARE
    campaign_record RECORD;
    creator_record RECORD;
    new_index INTEGER;
BEGIN
    FOR campaign_record IN 
        SELECT DISTINCT campaign_id FROM campaign_creators WHERE status != 'Removido'
    LOOP
        new_index := 0;
        
        FOR creator_record IN 
            SELECT id FROM campaign_creators 
            WHERE campaign_id = campaign_record.campaign_id 
            AND status != 'Removido'
            ORDER BY COALESCE(row_index, 999), created_at
        LOOP
            UPDATE campaign_creators
            SET row_index = new_index,
                updated_at = NOW()
            WHERE id = creator_record.id;
            
            new_index := new_index + 1;
        END LOOP;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 7. FUNÇÃO: Validação completa do sistema
-- =====================================================

CREATE OR REPLACE FUNCTION validate_system_integrity()
RETURNS JSON AS $$
DECLARE
    result JSON;
    inconsistent_count INTEGER;
    orphan_count INTEGER;
    duplicate_count INTEGER;
    multiple_month_count INTEGER;
BEGIN
    -- Contar problemas
    SELECT COUNT(*) INTO inconsistent_count FROM get_inconsistent_campaigns();
    SELECT COUNT(*) INTO orphan_count FROM campaign_creators cc
        LEFT JOIN campaigns c ON cc.campaign_id = c.id WHERE c.id IS NULL;
    SELECT COUNT(*) INTO duplicate_count FROM get_duplicate_creators();
    SELECT COUNT(*) INTO multiple_month_count FROM get_multiple_campaigns_per_month();
    
    -- Construir resultado
    result := json_build_object(
        'is_valid', (inconsistent_count + orphan_count + duplicate_count) = 0,
        'problems', json_build_object(
            'inconsistent_campaigns', inconsistent_count,
            'orphan_creators', orphan_count,
            'duplicate_creators', duplicate_count,
            'multiple_campaigns_per_month', multiple_month_count
        ),
        'stats', json_build_object(
            'total_campaigns', (SELECT COUNT(*) FROM campaigns),
            'total_creators', (SELECT COUNT(*) FROM creators),
            'total_active_relations', (SELECT COUNT(*) FROM campaign_creators WHERE status != 'Removido')
        ),
        'timestamp', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 8. FUNÇÃO: Auto-correção completa
-- =====================================================

CREATE OR REPLACE FUNCTION auto_fix_system()
RETURNS JSON AS $$
DECLARE
    fixed_campaigns INTEGER;
    removed_orphans INTEGER;
    result JSON;
BEGIN
    -- Executar correções
    SELECT fix_quantidade_criadores() INTO fixed_campaigns;
    SELECT remove_orphan_creators() INTO removed_orphans;
    PERFORM reindex_creator_positions();
    
    -- Construir resultado
    result := json_build_object(
        'success', true,
        'corrections', json_build_object(
            'fixed_campaigns', fixed_campaigns,
            'removed_orphans', removed_orphans,
            'reindexed_positions', true
        ),
        'timestamp', NOW()
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CONCEDER PERMISSÕES
-- =====================================================

-- Permitir que a aplicação execute essas funções
GRANT EXECUTE ON FUNCTION get_inconsistent_campaigns() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_duplicate_creators() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_multiple_campaigns_per_month() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION fix_quantidade_criadores() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION remove_orphan_creators() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION reindex_creator_positions() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION validate_system_integrity() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION auto_fix_system() TO anon, authenticated;
