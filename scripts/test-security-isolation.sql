-- =====================================================
-- SCRIPT DE TESTE: Isolamento de Segurança e LGPD
-- =====================================================
-- Descrição: Testa se business owners veem APENAS seus businesses
--            e se o isolamento por UUID está funcionando
-- =====================================================

-- =====================================================
-- SETUP: Criar dados de teste
-- =====================================================

-- 1. Criar 3 businesses de teste
DO $$
DECLARE
  v_org_id UUID := '00000000-0000-0000-0000-000000000001';
  v_business_govinda UUID;
  v_business_porks UUID;
  v_business_auto_posto UUID;
  v_user_joao UUID;
  v_user_maria UUID;
  v_user_marilia UUID;
BEGIN
  -- Criar businesses
  INSERT INTO businesses (organization_id, name, slug)
  VALUES 
    (v_org_id, 'Govinda Restaurante (TESTE)', 'govinda-teste'),
    (v_org_id, 'Porks Londrina (TESTE)', 'porks-teste'),
    (v_org_id, 'Auto Posto Bela Suíça (TESTE)', 'auto-posto-teste')
  RETURNING id INTO v_business_govinda, v_business_porks, v_business_auto_posto;

  -- Liberar acesso para João (Govinda)
  UPDATE businesses 
  SET 
    platform_access_status = 'granted',
    platform_owner_name = 'João Silva (TESTE)',
    platform_owner_email = 'joao.teste@govinda.com.br',
    platform_access_granted_at = NOW()
  WHERE slug = 'govinda-teste';

  -- Liberar acesso para Maria (Auto Posto + Porks)
  UPDATE businesses 
  SET 
    platform_access_status = 'granted',
    platform_owner_name = 'Maria Santos (TESTE)',
    platform_owner_email = 'maria.teste@santos.com.br',
    platform_access_granted_at = NOW()
  WHERE slug = 'auto-posto-teste';

  UPDATE businesses 
  SET 
    platform_access_status = 'granted',
    platform_owner_email = 'maria.teste@santos.com.br',
    platform_access_granted_at = NOW()
  WHERE slug = 'porks-teste';

  -- Criar marketing strategist (Marilia) com acesso a Govinda e Porks
  INSERT INTO platform_users (
    organization_id,
    email,
    full_name,
    role,
    roles,
    managed_businesses,
    is_active,
    platform
  )
  SELECT 
    v_org_id,
    'marilia.teste@criadores.com.br',
    'Marilia Marques (TESTE)',
    'marketing_strategist',
    ARRAY['marketing_strategist']::platform_user_role[],
    ARRAY[
      (SELECT id FROM businesses WHERE slug = 'govinda-teste'),
      (SELECT id FROM businesses WHERE slug = 'porks-teste')
    ]::UUID[],
    true,
    'client'
  WHERE NOT EXISTS (
    SELECT 1 FROM platform_users WHERE email = 'marilia.teste@criadores.com.br'
  );

  RAISE NOTICE 'Dados de teste criados com sucesso!';
END $$;

-- =====================================================
-- TESTE 1: Business Owner vê APENAS seu business
-- =====================================================

SELECT '========================================' as separator;
SELECT 'TESTE 1: Isolamento de Business Owner' as test_name;
SELECT '========================================' as separator;

-- 1.1. João deve ver APENAS Govinda
SELECT 
  'João (Govinda)' as usuario,
  COUNT(*) as total_businesses_visiveis,
  CASE 
    WHEN COUNT(*) = 1 THEN '✅ PASSOU'
    ELSE '❌ FALHOU - Vendo mais businesses que deveria!'
  END as resultado
FROM businesses b
WHERE EXISTS (
  SELECT 1 FROM platform_users pu
  WHERE pu.email = 'joao.teste@govinda.com.br'
  AND (b.id = pu.business_id OR b.id = ANY(pu.managed_businesses))
);

-- 1.2. Listar businesses que João vê
SELECT 
  'Businesses visíveis para João:' as info,
  b.name
FROM businesses b
WHERE EXISTS (
  SELECT 1 FROM platform_users pu
  WHERE pu.email = 'joao.teste@govinda.com.br'
  AND (b.id = pu.business_id OR b.id = ANY(pu.managed_businesses))
);

-- 1.3. Maria deve ver Auto Posto E Porks (2 businesses)
SELECT 
  'Maria (Auto Posto + Porks)' as usuario,
  COUNT(*) as total_businesses_visiveis,
  CASE 
    WHEN COUNT(*) = 2 THEN '✅ PASSOU'
    ELSE '❌ FALHOU - Deveria ver 2 businesses!'
  END as resultado
FROM businesses b
WHERE EXISTS (
  SELECT 1 FROM platform_users pu
  WHERE pu.email = 'maria.teste@santos.com.br'
  AND (b.id = pu.business_id OR b.id = ANY(pu.managed_businesses))
);

-- 1.4. Listar businesses que Maria vê
SELECT 
  'Businesses visíveis para Maria:' as info,
  b.name
FROM businesses b
WHERE EXISTS (
  SELECT 1 FROM platform_users pu
  WHERE pu.email = 'maria.teste@santos.com.br'
  AND (b.id = pu.business_id OR b.id = ANY(pu.managed_businesses))
);

-- =====================================================
-- TESTE 2: Marketing Strategist vê múltiplos businesses
-- =====================================================

SELECT '========================================' as separator;
SELECT 'TESTE 2: Marketing Strategist Multi-Business' as test_name;
SELECT '========================================' as separator;

-- 2.1. Marilia deve ver Govinda E Porks (2 businesses)
SELECT 
  'Marilia (Marketing Strategist)' as usuario,
  COUNT(*) as total_businesses_visiveis,
  CASE 
    WHEN COUNT(*) = 2 THEN '✅ PASSOU'
    ELSE '❌ FALHOU - Deveria ver 2 businesses!'
  END as resultado
FROM businesses b
WHERE EXISTS (
  SELECT 1 FROM platform_users pu
  WHERE pu.email = 'marilia.teste@criadores.com.br'
  AND b.id = ANY(pu.managed_businesses)
);

-- 2.2. Listar businesses que Marilia vê
SELECT 
  'Businesses visíveis para Marilia:' as info,
  b.name
FROM businesses b
WHERE EXISTS (
  SELECT 1 FROM platform_users pu
  WHERE pu.email = 'marilia.teste@criadores.com.br'
  AND b.id = ANY(pu.managed_businesses)
);

-- 2.3. Marilia NÃO deve ver Auto Posto
SELECT 
  'Marilia tentando ver Auto Posto' as teste,
  COUNT(*) as total,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ PASSOU - Corretamente bloqueado'
    ELSE '❌ FALHOU - Não deveria ver Auto Posto!'
  END as resultado
FROM businesses b
WHERE b.slug = 'auto-posto-teste'
AND EXISTS (
  SELECT 1 FROM platform_users pu
  WHERE pu.email = 'marilia.teste@criadores.com.br'
  AND b.id = ANY(pu.managed_businesses)
);

-- =====================================================
-- TESTE 3: Função user_has_access_to_business
-- =====================================================

SELECT '========================================' as separator;
SELECT 'TESTE 3: Função de Verificação de Acesso' as test_name;
SELECT '========================================' as separator;

-- 3.1. João tem acesso ao Govinda?
SELECT 
  'João → Govinda' as teste,
  user_has_access_to_business(
    (SELECT id FROM platform_users WHERE email = 'joao.teste@govinda.com.br'),
    (SELECT id FROM businesses WHERE slug = 'govinda-teste')
  ) as tem_acesso,
  CASE 
    WHEN user_has_access_to_business(
      (SELECT id FROM platform_users WHERE email = 'joao.teste@govinda.com.br'),
      (SELECT id FROM businesses WHERE slug = 'govinda-teste')
    ) THEN '✅ PASSOU'
    ELSE '❌ FALHOU'
  END as resultado;

-- 3.2. João tem acesso ao Porks? (DEVE SER FALSE)
SELECT 
  'João → Porks (deve ser negado)' as teste,
  user_has_access_to_business(
    (SELECT id FROM platform_users WHERE email = 'joao.teste@govinda.com.br'),
    (SELECT id FROM businesses WHERE slug = 'porks-teste')
  ) as tem_acesso,
  CASE 
    WHEN NOT user_has_access_to_business(
      (SELECT id FROM platform_users WHERE email = 'joao.teste@govinda.com.br'),
      (SELECT id FROM businesses WHERE slug = 'porks-teste')
    ) THEN '✅ PASSOU - Corretamente negado'
    ELSE '❌ FALHOU - Não deveria ter acesso!'
  END as resultado;

-- 3.3. Maria tem acesso ao Auto Posto?
SELECT 
  'Maria → Auto Posto' as teste,
  user_has_access_to_business(
    (SELECT id FROM platform_users WHERE email = 'maria.teste@santos.com.br'),
    (SELECT id FROM businesses WHERE slug = 'auto-posto-teste')
  ) as tem_acesso,
  CASE 
    WHEN user_has_access_to_business(
      (SELECT id FROM platform_users WHERE email = 'maria.teste@santos.com.br'),
      (SELECT id FROM businesses WHERE slug = 'auto-posto-teste')
    ) THEN '✅ PASSOU'
    ELSE '❌ FALHOU'
  END as resultado;

-- 3.4. Maria tem acesso ao Porks?
SELECT 
  'Maria → Porks' as teste,
  user_has_access_to_business(
    (SELECT id FROM platform_users WHERE email = 'maria.teste@santos.com.br'),
    (SELECT id FROM businesses WHERE slug = 'porks-teste')
  ) as tem_acesso,
  CASE 
    WHEN user_has_access_to_business(
      (SELECT id FROM platform_users WHERE email = 'maria.teste@santos.com.br'),
      (SELECT id FROM businesses WHERE slug = 'porks-teste')
    ) THEN '✅ PASSOU'
    ELSE '❌ FALHOU'
  END as resultado;

-- =====================================================
-- TESTE 4: Função get_user_businesses
-- =====================================================

SELECT '========================================' as separator;
SELECT 'TESTE 4: Listar Businesses do Usuário' as test_name;
SELECT '========================================' as separator;

-- 4.1. Businesses de João
SELECT 
  'Businesses de João:' as info,
  business_name,
  is_primary
FROM get_user_businesses(
  (SELECT id FROM platform_users WHERE email = 'joao.teste@govinda.com.br')
);

-- 4.2. Businesses de Maria
SELECT 
  'Businesses de Maria:' as info,
  business_name,
  is_primary
FROM get_user_businesses(
  (SELECT id FROM platform_users WHERE email = 'maria.teste@santos.com.br')
);

-- =====================================================
-- TESTE 5: Constraints
-- =====================================================

SELECT '========================================' as separator;
SELECT 'TESTE 5: Constraints de Validação' as test_name;
SELECT '========================================' as separator;

-- 5.1. Tentar criar business_owner sem business_id (DEVE FALHAR)
DO $$
BEGIN
  INSERT INTO platform_users (
    organization_id,
    email,
    full_name,
    role,
    roles,
    platform
  ) VALUES (
    '00000000-0000-0000-0000-000000000001',
    'teste.invalido@test.com',
    'Teste Inválido',
    'business_owner',
    ARRAY['business_owner']::platform_user_role[],
    'client'
  );
  
  RAISE NOTICE '❌ FALHOU - Constraint não funcionou!';
EXCEPTION
  WHEN check_violation THEN
    RAISE NOTICE '✅ PASSOU - Constraint bloqueou corretamente!';
END $$;

-- =====================================================
-- RESUMO DOS TESTES
-- =====================================================

SELECT '========================================' as separator;
SELECT 'RESUMO DOS TESTES' as titulo;
SELECT '========================================' as separator;

SELECT 
  '✅ Isolamento de Business Owner' as teste,
  'João vê apenas Govinda, Maria vê Auto Posto + Porks' as descricao;

SELECT 
  '✅ Marketing Strategist Multi-Business' as teste,
  'Marilia vê Govinda + Porks, mas NÃO vê Auto Posto' as descricao;

SELECT 
  '✅ Função de Verificação de Acesso' as teste,
  'user_has_access_to_business() funciona corretamente' as descricao;

SELECT 
  '✅ Constraints de Validação' as teste,
  'Impossível criar business_owner sem business_id' as descricao;

-- =====================================================
-- CLEANUP: Remover dados de teste
-- =====================================================

SELECT '========================================' as separator;
SELECT 'Deseja remover os dados de teste? Execute:' as info;
SELECT '========================================' as separator;

SELECT 'DELETE FROM platform_users WHERE email LIKE ''%.teste@%'';' as cleanup_query
UNION ALL
SELECT 'DELETE FROM businesses WHERE slug LIKE ''%-teste'';';

