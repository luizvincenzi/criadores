-- 🔧 FUNÇÕES SQL ATÔMICAS PARA OPERAÇÕES SEGURAS
-- Execute este script no Supabase para criar operações 100% consistentes

-- =====================================================
-- 1. FUNÇÃO: Adicionar criador de forma atômica
-- =====================================================

CREATE OR REPLACE FUNCTION add_creator_atomic(
  p_campaign_id UUID,
  p_creator_id UUID,
  p_user_email TEXT,
  p_increase_slots BOOLEAN DEFAULT FALSE
) RETURNS JSON AS $$
DECLARE
  v_campaign RECORD;
  v_creator RECORD;
  v_existing_relation RECORD;
  v_placeholder_slot RECORD;
  v_placeholder_creator_id UUID;
  v_new_index INTEGER;
  v_new_quantidade INTEGER;
  v_result JSON;
BEGIN
  -- 1. Buscar campanha
  SELECT * INTO v_campaign FROM campaigns WHERE id = p_campaign_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Campanha não encontrada');
  END IF;
  
  -- 2. Buscar criador
  SELECT * INTO v_creator FROM creators WHERE id = p_creator_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Criador não encontrado');
  END IF;
  
  -- 3. Verificar se já existe relação ativa com este criador
  SELECT * INTO v_existing_relation
  FROM campaign_creators
  WHERE campaign_id = p_campaign_id
  AND creator_id = p_creator_id
  AND status != 'Removido';

  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Criador ' || v_creator.name || ' já estava na campanha',
      'newQuantidade', v_campaign.quantidade_criadores,
      'data', json_build_object('existing', true)
    );
  END IF;

  -- 4. Verificar se existe slot vazio (com placeholder) para substituir
  -- Buscar ID do criador placeholder
  SELECT id INTO v_placeholder_creator_id
  FROM creators
  WHERE name = '[SLOT VAZIO]'
  LIMIT 1;

  -- Se existe placeholder, buscar slot vazio para substituir
  IF v_placeholder_creator_id IS NOT NULL THEN
    SELECT * INTO v_placeholder_slot
    FROM campaign_creators
    WHERE campaign_id = p_campaign_id
    AND creator_id = v_placeholder_creator_id
    AND status != 'Removido'
    LIMIT 1;
  END IF;

  -- 5. Se increase_slots = true, aumentar quantidade_criadores
  IF p_increase_slots THEN
    v_new_quantidade := v_campaign.quantidade_criadores + 1;

    UPDATE campaigns
    SET quantidade_criadores = v_new_quantidade,
        updated_at = NOW()
    WHERE id = p_campaign_id;
  ELSE
    v_new_quantidade := v_campaign.quantidade_criadores;
  END IF;

  -- 6. Inserir ou atualizar relação criador-campanha
  IF v_placeholder_slot.id IS NOT NULL THEN
    -- ATUALIZAR slot vazio existente
    UPDATE campaign_creators
    SET creator_id = p_creator_id,
        updated_at = NOW()
    WHERE id = v_placeholder_slot.id;

    v_new_index := (
      SELECT COUNT(*) - 1
      FROM campaign_creators
      WHERE campaign_id = p_campaign_id
      AND status != 'Removido'
      AND id <= v_placeholder_slot.id
    );
  ELSE
    -- INSERIR novo slot (quando não há placeholder disponível)
    SELECT COUNT(*) INTO v_new_index
    FROM campaign_creators
    WHERE campaign_id = p_campaign_id
    AND status != 'Removido';

    INSERT INTO campaign_creators (
      campaign_id,
      creator_id,
      status,
      deliverables,
      organization_id,
      created_at,
      updated_at
    ) VALUES (
      p_campaign_id,
      p_creator_id,
      'Ativo',
      json_build_object(
        'briefing_complete', 'Pendente',
        'visit_confirmed', 'Pendente',
        'video_approved', 'Pendente',
        'video_posted', 'Não'
      ),
      v_campaign.organization_id,
      NOW(),
      NOW()
    );
  END IF;
  
  -- 7. Registrar no audit_log
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
  ) VALUES (
    v_campaign.organization_id,
    'campaign',
    p_campaign_id,
    v_campaign.title,
    'update',
    'criadores',
    p_user_email,
    'vazio',
    v_creator.name,
    json_build_object(
      'creator_id', p_creator_id,
      'creator_name', v_creator.name,
      'position', v_new_index,
      'increased_slots', p_increase_slots,
      'old_quantidade', v_campaign.quantidade_criadores,
      'new_quantidade', v_new_quantidade,
      'operacao', CASE WHEN p_increase_slots THEN 'add_creator_new_slot' ELSE 'add_creator_existing_slot' END
    )
  );
  
  -- 8. Construir resultado
  v_result := json_build_object(
    'success', true,
    'message', 'Criador ' || v_creator.name || ' adicionado com sucesso',
    'newQuantidade', v_new_quantidade,
    'data', json_build_object(
      'creatorId', p_creator_id,
      'creatorName', v_creator.name,
      'rowIndex', v_new_index,
      'increasedSlots', p_increase_slots
    )
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Erro interno: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 2. FUNÇÃO: Remover criador de forma atômica
-- =====================================================

CREATE OR REPLACE FUNCTION remove_creator_atomic(
  p_campaign_id UUID,
  p_creator_id UUID,
  p_user_email TEXT,
  p_delete_line BOOLEAN DEFAULT FALSE
) RETURNS JSON AS $$
DECLARE
  v_campaign RECORD;
  v_creator RECORD;
  v_relation RECORD;
  v_new_quantidade INTEGER;
  v_result JSON;
BEGIN
  -- 1. Buscar campanha
  SELECT * INTO v_campaign FROM campaigns WHERE id = p_campaign_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Campanha não encontrada');
  END IF;
  
  -- 2. Buscar criador (pode ser NULL para linhas vazias)
  IF p_creator_id IS NOT NULL THEN
    SELECT * INTO v_creator FROM creators WHERE id = p_creator_id;
    IF NOT FOUND THEN
      RETURN json_build_object('success', false, 'error', 'Criador não encontrado');
    END IF;
    
    -- 3. Buscar relação ativa
    SELECT * INTO v_relation 
    FROM campaign_creators 
    WHERE campaign_id = p_campaign_id 
    AND creator_id = p_creator_id 
    AND status != 'Removido';
    
    IF NOT FOUND THEN
      RETURN json_build_object('success', false, 'error', 'Relação não encontrada');
    END IF;
    
    -- 4. Marcar como removido
    UPDATE campaign_creators
    SET status = 'Removido',
        updated_at = NOW()
    WHERE id = v_relation.id;
  END IF;
  
  -- 5. Se delete_line = true, reduzir quantidade_criadores
  IF p_delete_line THEN
    v_new_quantidade := GREATEST(v_campaign.quantidade_criadores - 1, 1);
    
    UPDATE campaigns 
    SET quantidade_criadores = v_new_quantidade,
        updated_at = NOW()
    WHERE id = p_campaign_id;
  ELSE
    v_new_quantidade := v_campaign.quantidade_criadores;
  END IF;
  
  -- 6. Registrar no audit_log
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
  ) VALUES (
    v_campaign.organization_id,
    'campaign',
    p_campaign_id,
    v_campaign.title,
    'delete',
    'criadores',
    p_user_email,
    COALESCE(v_creator.name, 'linha_vazia'),
    'removido',
    json_build_object(
      'creator_id', p_creator_id,
      'creator_name', COALESCE(v_creator.name, 'linha_vazia'),
      'delete_line', p_delete_line,
      'old_quantidade', v_campaign.quantidade_criadores,
      'new_quantidade', v_new_quantidade,
      'operacao', CASE WHEN p_delete_line THEN 'delete_line' ELSE 'remove_creator' END
    )
  );
  
  -- 7. Construir resultado
  v_result := json_build_object(
    'success', true,
    'message', CASE 
      WHEN p_delete_line THEN 'Linha excluída. Slots reduzidos para ' || v_new_quantidade
      ELSE 'Criador ' || COALESCE(v_creator.name, 'vazio') || ' removido'
    END,
    'newQuantidade', v_new_quantidade,
    'data', json_build_object(
      'creatorId', p_creator_id,
      'creatorName', COALESCE(v_creator.name, 'vazio'),
      'deleteLine', p_delete_line
    )
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Erro interno: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 3. FUNÇÃO: Trocar criador de forma atômica
-- =====================================================

CREATE OR REPLACE FUNCTION swap_creator_atomic(
  p_campaign_id UUID,
  p_old_creator_id UUID,
  p_new_creator_id UUID,
  p_user_email TEXT
) RETURNS JSON AS $$
DECLARE
  v_campaign RECORD;
  v_old_creator RECORD;
  v_new_creator RECORD;
  v_relation RECORD;
  v_result JSON;
BEGIN
  -- 1. Buscar campanha
  SELECT * INTO v_campaign FROM campaigns WHERE id = p_campaign_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Campanha não encontrada');
  END IF;
  
  -- 2. Buscar criadores
  SELECT * INTO v_old_creator FROM creators WHERE id = p_old_creator_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Criador antigo não encontrado');
  END IF;

  SELECT * INTO v_new_creator FROM creators WHERE id = p_new_creator_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Criador novo não encontrado');
  END IF;
  
  -- 3. Buscar relação existente
  SELECT * INTO v_relation 
  FROM campaign_creators 
  WHERE campaign_id = p_campaign_id 
  AND creator_id = p_old_creator_id 
  AND status != 'Removido';
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Relação não encontrada');
  END IF;
  
  -- 4. Atualizar relação para novo criador
  UPDATE campaign_creators
  SET creator_id = p_new_creator_id,
      updated_at = NOW()
  WHERE id = v_relation.id;
  
  -- 5. Registrar no audit_log
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
  ) VALUES (
    v_campaign.organization_id,
    'campaign',
    p_campaign_id,
    v_campaign.title,
    'update',
    'criadores',
    p_user_email,
    v_old_creator.name,
    v_new_creator.name,
    json_build_object(
      'old_creator_id', p_old_creator_id,
      'new_creator_id', p_new_creator_id,
      'old_creator_name', v_old_creator.name,
      'new_creator_name', v_new_creator.name,
      'relation_id', v_relation.id,
      'operacao', 'swap_creator'
    )
  );
  
  -- 6. Construir resultado
  v_result := json_build_object(
    'success', true,
    'message', 'Criador trocado: ' || v_old_creator.name || ' → ' || v_new_creator.name,
    'data', json_build_object(
      'oldCreatorId', p_old_creator_id,
      'newCreatorId', p_new_creator_id,
      'oldCreatorName', v_old_creator.name,
      'newCreatorName', v_new_creator.name
    )
  );
  
  RETURN v_result;
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Erro interno: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. FUNÇÃO: Corrigir integridade de campanha
-- =====================================================

CREATE OR REPLACE FUNCTION fix_campaign_integrity(
  p_campaign_id UUID
) RETURNS JSON AS $$
DECLARE
  v_campaign RECORD;
  v_creator_count INTEGER;
  v_old_quantidade INTEGER;
  v_new_quantidade INTEGER;
BEGIN
  -- 1. Buscar campanha
  SELECT * INTO v_campaign FROM campaigns WHERE id = p_campaign_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Campanha não encontrada');
  END IF;
  
  -- 2. Contar criadores reais
  SELECT COUNT(*) INTO v_creator_count
  FROM campaign_creators 
  WHERE campaign_id = p_campaign_id 
  AND status != 'Removido';
  
  v_old_quantidade := v_campaign.quantidade_criadores;
  v_new_quantidade := GREATEST(v_creator_count, 1);
  
  -- 3. Corrigir se necessário
  IF v_old_quantidade != v_new_quantidade THEN
    UPDATE campaigns 
    SET quantidade_criadores = v_new_quantidade,
        updated_at = NOW()
    WHERE id = p_campaign_id;
    
    -- Registrar correção
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
    ) VALUES (
      v_campaign.organization_id,
      'campaign',
      p_campaign_id,
      v_campaign.title,
      'update',
      'quantidade_criadores',
      'sistema@auto-correcao.com',
      v_old_quantidade::text,
      v_new_quantidade::text,
      json_build_object(
        'criadores_reais', v_creator_count,
        'correcao_automatica', true,
        'operacao', 'auto_fix_integrity'
      )
    );
  END IF;
  
  RETURN json_build_object(
    'success', true,
    'fixed', v_old_quantidade != v_new_quantidade,
    'oldQuantidade', v_old_quantidade,
    'newQuantidade', v_new_quantidade,
    'criadoresReais', v_creator_count
  );
  
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false, 
      'error', 'Erro interno: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- CONCEDER PERMISSÕES
-- =====================================================

GRANT EXECUTE ON FUNCTION add_creator_atomic(UUID, UUID, TEXT, BOOLEAN) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION remove_creator_atomic(UUID, UUID, TEXT, BOOLEAN) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION swap_creator_atomic(UUID, UUID, UUID, TEXT) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION fix_campaign_integrity(UUID) TO anon, authenticated;
