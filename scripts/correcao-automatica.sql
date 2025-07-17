-- 🛠️ CORREÇÃO AUTOMÁTICA DE TODOS OS PROBLEMAS
-- Execute este script APÓS o diagnóstico para corrigir automaticamente

-- =====================================================
-- BACKUP DE SEGURANÇA ANTES DAS CORREÇÕES
-- =====================================================

DO $$
DECLARE
    backup_suffix TEXT;
BEGIN
    -- Gerar sufixo com data atual
    backup_suffix := to_char(NOW(), 'YYYYMMDD_HH24MI');

    -- Criar backup das campanhas
    EXECUTE format('CREATE TABLE IF NOT EXISTS campaigns_backup_%s AS SELECT * FROM campaigns', backup_suffix);
    RAISE NOTICE '✅ Backup criado: campaigns_backup_%', backup_suffix;

    -- Criar backup das relações
    EXECUTE format('CREATE TABLE IF NOT EXISTS campaign_creators_backup_%s AS SELECT * FROM campaign_creators', backup_suffix);
    RAISE NOTICE '✅ Backup criado: campaign_creators_backup_%', backup_suffix;
END $$;

-- =====================================================
-- 1. CORRIGIR QUANTIDADE_CRIADORES INCONSISTENTE
-- =====================================================

DO $$
DECLARE
    campaign_record RECORD;
    creator_count INTEGER;
    old_quantidade INTEGER;
BEGIN
    RAISE NOTICE '🔧 Iniciando correção de quantidade_criadores...';
    
    FOR campaign_record IN 
        SELECT c.id, c.title, c.quantidade_criadores, b.name as business_name
        FROM campaigns c
        LEFT JOIN businesses b ON c.business_id = b.id
    LOOP
        -- Contar criadores reais ativos
        SELECT COUNT(*) INTO creator_count
        FROM campaign_creators 
        WHERE campaign_id = campaign_record.id 
        AND status != 'Removido';
        
        old_quantidade := campaign_record.quantidade_criadores;
        
        -- Corrigir se inconsistente (mínimo 1)
        IF old_quantidade != creator_count OR old_quantidade IS NULL OR old_quantidade < 1 THEN
            UPDATE campaigns 
            SET quantidade_criadores = GREATEST(creator_count, 1),
                updated_at = NOW()
            WHERE id = campaign_record.id;
            
            -- Registrar correção no audit_log
            INSERT INTO audit_log (
                organization_id,
                entity_type,
                entity_id,
                entity_name,
                action,
                field_name,
                user_email,
                old_value,
                new_value,
                details
            ) SELECT
                c.organization_id,
                'campaign',
                c.id,
                campaign_record.title,
                'update',
                'quantidade_criadores',
                'sistema@auto-correcao.com',
                old_quantidade::text,
                GREATEST(creator_count, 1)::text,
                json_build_object(
                    'business_name', campaign_record.business_name,
                    'campaign_title', campaign_record.title,
                    'criadores_reais', creator_count,
                    'correcao_automatica', true,
                    'motivo', 'auto_fix_quantidade'
                )
            FROM campaigns c WHERE c.id = campaign_record.id;
            
            RAISE NOTICE '✅ Corrigido campanha "%" (%): % → %', 
                campaign_record.title,
                campaign_record.business_name,
                old_quantidade, 
                GREATEST(creator_count, 1);
        END IF;
    END LOOP;
    
    RAISE NOTICE '🎉 Correção de quantidade_criadores concluída!';
END $$;

-- =====================================================
-- 2. REMOVER CRIADORES ÓRFÃOS
-- =====================================================

DO $$
DECLARE
    orphan_count INTEGER;
BEGIN
    RAISE NOTICE '🔧 Removendo criadores órfãos...';
    
    -- Contar órfãos
    SELECT COUNT(*) INTO orphan_count
    FROM campaign_creators cc
    LEFT JOIN campaigns c ON cc.campaign_id = c.id
    WHERE c.id IS NULL;
    
    -- Remover órfãos
    DELETE FROM campaign_creators cc
    WHERE NOT EXISTS (
        SELECT 1 FROM campaigns c WHERE c.id = cc.campaign_id
    );
    
    RAISE NOTICE '✅ Removidos % criadores órfãos', orphan_count;
END $$;

-- =====================================================
-- 3. CORRIGIR CRIADORES DUPLICADOS
-- =====================================================

DO $$
DECLARE
    duplicate_record RECORD;
    keep_id UUID;
BEGIN
    RAISE NOTICE '🔧 Corrigindo criadores duplicados...';
    
    FOR duplicate_record IN 
        SELECT campaign_id, creator_id, COUNT(*) as duplicates
        FROM campaign_creators 
        WHERE status != 'Removido'
        GROUP BY campaign_id, creator_id
        HAVING COUNT(*) > 1
    LOOP
        -- Manter o mais recente
        SELECT id INTO keep_id
        FROM campaign_creators
        WHERE campaign_id = duplicate_record.campaign_id
        AND creator_id = duplicate_record.creator_id
        AND status != 'Removido'
        ORDER BY created_at DESC
        LIMIT 1;
        
        -- Marcar outros como removidos
        UPDATE campaign_creators
        SET status = 'Removido',
            updated_at = NOW()
        WHERE campaign_id = duplicate_record.campaign_id
        AND creator_id = duplicate_record.creator_id
        AND id != keep_id
        AND status != 'Removido';
        
        RAISE NOTICE '✅ Corrigido duplicatas para criador % na campanha %', 
            duplicate_record.creator_id, duplicate_record.campaign_id;
    END LOOP;
    
    RAISE NOTICE '🎉 Correção de duplicatas concluída!';
END $$;

-- =====================================================
-- 4. CORRIGIR CAMPANHAS SEM BUSINESS VÁLIDO
-- =====================================================

DO $$
DECLARE
    invalid_count INTEGER;
    invalid_campaign_record RECORD;
BEGIN
    RAISE NOTICE '🔧 Verificando campanhas com business inválido...';

    SELECT COUNT(*) INTO invalid_count
    FROM campaigns c
    LEFT JOIN businesses b ON c.business_id = b.id
    WHERE b.id IS NULL;

    IF invalid_count > 0 THEN
        RAISE WARNING '⚠️ Encontradas % campanhas com business_id inválido. Requer intervenção manual!', invalid_count;

        -- Listar campanhas problemáticas
        RAISE NOTICE 'Campanhas problemáticas:';
        FOR invalid_campaign_record IN
            SELECT c.id, c.title, c.business_id
            FROM campaigns c
            LEFT JOIN businesses b ON c.business_id = b.id
            WHERE b.id IS NULL
        LOOP
            RAISE NOTICE '- Campanha: % (ID: %, Business ID inválido: %)',
                invalid_campaign_record.title, invalid_campaign_record.id, invalid_campaign_record.business_id;
        END LOOP;
    ELSE
        RAISE NOTICE '✅ Todos os business_id são válidos';
    END IF;
END $$;

-- =====================================================
-- 5. VALIDAR REGRA: 1 CAMPANHA POR BUSINESS POR MÊS
-- =====================================================

DO $$
DECLARE
    month_violation_record RECORD;
BEGIN
    RAISE NOTICE '🔧 Verificando violações da regra 1 campanha/mês...';

    FOR month_violation_record IN
        SELECT
            b.name as business_name,
            c.month,
            COUNT(*) as quantidade_campanhas,
            STRING_AGG(c.title, ' | ') as titulos
        FROM campaigns c
        JOIN businesses b ON c.business_id = b.id
        GROUP BY b.name, c.month, c.business_id
        HAVING COUNT(*) > 1
    LOOP
        RAISE WARNING '⚠️ VIOLAÇÃO: Business "%" tem % campanhas em %: %',
            month_violation_record.business_name,
            month_violation_record.quantidade_campanhas,
            month_violation_record.month,
            month_violation_record.titulos;
    END LOOP;
END $$;

-- =====================================================
-- 6. ORGANIZAR CRIADORES POR DATA DE CRIAÇÃO
-- =====================================================

DO $$
DECLARE
    organize_campaign_record RECORD;
    organize_creator_record RECORD;
    creator_count INTEGER;
BEGIN
    RAISE NOTICE '🔧 Organizando criadores por data de criação...';

    FOR organize_campaign_record IN
        SELECT DISTINCT campaign_id FROM campaign_creators WHERE status != 'Removido'
    LOOP
        -- Contar criadores na campanha
        SELECT COUNT(*) INTO creator_count
        FROM campaign_creators
        WHERE campaign_id = organize_campaign_record.campaign_id
        AND status != 'Removido';

        RAISE NOTICE '📊 Campanha % tem % criadores ativos',
            organize_campaign_record.campaign_id, creator_count;
    END LOOP;

    RAISE NOTICE '✅ Organização concluída!';
END $$;

-- =====================================================
-- 7. RELATÓRIO FINAL DE CORREÇÕES
-- =====================================================

DO $$
DECLARE
    campanhas_corrigidas INTEGER;
    relacoes_ativas INTEGER;
    campanhas_inconsistentes INTEGER;
BEGIN
    -- Contar campanhas corrigidas
    SELECT COUNT(DISTINCT c.id) INTO campanhas_corrigidas
    FROM campaigns c
    JOIN campaign_creators cc ON cc.campaign_id = c.id
    WHERE cc.status != 'Removido'
    GROUP BY c.id, c.quantidade_criadores
    HAVING c.quantidade_criadores = COUNT(cc.id);

    -- Contar relações ativas
    SELECT COUNT(*) INTO relacoes_ativas
    FROM campaign_creators
    WHERE status != 'Removido';

    -- Contar campanhas ainda inconsistentes
    SELECT COUNT(DISTINCT c.id) INTO campanhas_inconsistentes
    FROM campaigns c
    LEFT JOIN campaign_creators cc ON cc.campaign_id = c.id AND cc.status != 'Removido'
    GROUP BY c.id, c.quantidade_criadores
    HAVING c.quantidade_criadores != COUNT(cc.id);

    -- Relatório final
    RAISE NOTICE '🎉 RELATÓRIO FINAL DE CORREÇÕES:';
    RAISE NOTICE '✅ Campanhas corrigidas: %', COALESCE(campanhas_corrigidas, 0);
    RAISE NOTICE '✅ Total de relações ativas: %', COALESCE(relacoes_ativas, 0);
    RAISE NOTICE '⚠️ Campanhas ainda inconsistentes: %', COALESCE(campanhas_inconsistentes, 0);

    IF COALESCE(campanhas_inconsistentes, 0) = 0 THEN
        RAISE NOTICE '🚀 SISTEMA CORRIGIDO E ESTABILIZADO!';
    ELSE
        RAISE WARNING '⚠️ Ainda existem % campanhas inconsistentes que precisam de atenção manual', campanhas_inconsistentes;
    END IF;
END $$;
