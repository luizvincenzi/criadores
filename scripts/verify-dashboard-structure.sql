-- ========================================
-- VERIFICAÇÃO E VALIDAÇÃO DA ESTRUTURA DO DASHBOARD
-- ========================================
-- Execute este SQL para verificar se tudo está funcionando

-- 1. VERIFICAR SE A TABELA EXISTE
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'business_quarterly_snapshots';

-- 2. VERIFICAR ESTRUTURA DA TABELA
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'business_quarterly_snapshots'
ORDER BY ordinal_position;

-- 3. VERIFICAR CONSTRAINTS E ÍNDICES
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_schema = 'public' 
  AND table_name = 'business_quarterly_snapshots';

-- 4. VERIFICAR ÍNDICES
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'business_quarterly_snapshots';

-- 5. VERIFICAR POLÍTICAS RLS
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'business_quarterly_snapshots';

-- 6. VERIFICAR SE TEMOS EMPRESAS NA TABELA BUSINESSES
SELECT 
  COUNT(*) as total_businesses,
  COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as recent_businesses
FROM businesses;

-- 7. VERIFICAR SNAPSHOTS EXISTENTES
SELECT 
  COUNT(*) as total_snapshots,
  COUNT(DISTINCT business_id) as businesses_with_snapshots,
  MIN(quarter) as oldest_quarter,
  MAX(quarter) as newest_quarter
FROM business_quarterly_snapshots;

-- 8. VERIFICAR SNAPSHOTS POR EMPRESA
SELECT 
  b.name as business_name,
  COUNT(s.id) as snapshot_count,
  STRING_AGG(s.quarter, ', ' ORDER BY s.year, s.quarter_number) as quarters
FROM businesses b
LEFT JOIN business_quarterly_snapshots s ON b.id = s.business_id
GROUP BY b.id, b.name
ORDER BY snapshot_count DESC;

-- 9. VERIFICAR INTEGRIDADE DOS DADOS JSONB
SELECT 
  quarter,
  COUNT(*) as total,
  COUNT(CASE WHEN digital_presence IS NOT NULL THEN 1 END) as with_digital_presence,
  COUNT(CASE WHEN kpis IS NOT NULL THEN 1 END) as with_kpis,
  COUNT(CASE WHEN four_ps_status IS NOT NULL THEN 1 END) as with_four_ps,
  COUNT(CASE WHEN porter_forces IS NOT NULL THEN 1 END) as with_porter_forces,
  COUNT(CASE WHEN executive_summary IS NOT NULL THEN 1 END) as with_executive_summary
FROM business_quarterly_snapshots
GROUP BY quarter
ORDER BY quarter;

-- 10. TESTAR INSERÇÃO DE SNAPSHOT (EXEMPLO)
-- Descomente para testar inserção
/*
INSERT INTO business_quarterly_snapshots (
  business_id,
  quarter,
  year,
  quarter_number,
  digital_presence,
  kpis,
  four_ps_status,
  porter_forces,
  executive_summary,
  notes
) 
SELECT 
  b.id,
  '2024-Q4' as quarter,
  2024 as year,
  4 as quarter_number,
  '{"google": {"rating": 4.5, "reviews": 200}, "instagram": 1000, "facebook": 800, "tiktok": 0, "tripadvisor": {"rating": 4.0, "rank": 10}}'::jsonb,
  '{"ocupacao": 75, "ticket": 65, "margemPorcoes": 70, "nps": 80, "ruido": 0}'::jsonb,
  '{"produto": "green", "preco": "yellow", "praca": "green", "promocao": "yellow"}'::jsonb,
  '{"rivalidade": {"score": 6, "status": "yellow"}, "entrantes": {"score": 4, "status": "green"}, "fornecedores": {"score": 5, "status": "yellow"}, "clientes": {"score": 5, "status": "yellow"}, "substitutos": {"score": 6, "status": "yellow"}}'::jsonb,
  '{"green": ["Ponto forte 1", "Ponto forte 2"], "yellow": ["Atenção 1"], "red": ["Crítico 1"]}'::jsonb,
  'Snapshot de teste'
FROM businesses b 
LIMIT 1
ON CONFLICT (business_id, quarter) DO UPDATE SET
  updated_at = NOW(),
  notes = EXCLUDED.notes || ' - Atualizado em ' || NOW()::text;
*/

-- 11. VERIFICAR PERMISSÕES DA API
-- Verificar se o usuário de serviço tem as permissões necessárias
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'business_quarterly_snapshots';

-- 12. FUNÇÃO PARA CRIAR SNAPSHOT PADRÃO
CREATE OR REPLACE FUNCTION create_default_snapshot(
  p_business_id UUID,
  p_quarter VARCHAR(10),
  p_year INTEGER,
  p_quarter_number INTEGER
) RETURNS UUID AS $$
DECLARE
  snapshot_id UUID;
BEGIN
  INSERT INTO business_quarterly_snapshots (
    business_id,
    quarter,
    year,
    quarter_number,
    digital_presence,
    kpis,
    four_ps_status,
    porter_forces,
    executive_summary,
    notes
  ) VALUES (
    p_business_id,
    p_quarter,
    p_year,
    p_quarter_number,
    '{"google": {"rating": 0, "reviews": 0}, "instagram": 0, "facebook": 0, "tiktok": 0, "tripadvisor": {"rating": 0, "rank": 0}}'::jsonb,
    '{"ocupacao": 0, "ticket": 0, "margemPorcoes": 0, "nps": 0, "ruido": 0}'::jsonb,
    '{"produto": "gray", "preco": "gray", "praca": "gray", "promocao": "gray"}'::jsonb,
    '{"rivalidade": {"score": 5, "status": "yellow"}, "entrantes": {"score": 5, "status": "yellow"}, "fornecedores": {"score": 5, "status": "yellow"}, "clientes": {"score": 5, "status": "yellow"}, "substitutos": {"score": 5, "status": "yellow"}}'::jsonb,
    '{"green": [], "yellow": [], "red": []}'::jsonb,
    'Snapshot criado automaticamente'
  )
  ON CONFLICT (business_id, quarter) DO NOTHING
  RETURNING id INTO snapshot_id;
  
  RETURN snapshot_id;
END;
$$ LANGUAGE plpgsql;

-- 13. FUNÇÃO PARA ATUALIZAR CAMPO ESPECÍFICO
CREATE OR REPLACE FUNCTION update_snapshot_field(
  p_snapshot_id UUID,
  p_field_name VARCHAR(50),
  p_field_value JSONB
) RETURNS BOOLEAN AS $$
BEGIN
  CASE p_field_name
    WHEN 'digital_presence' THEN
      UPDATE business_quarterly_snapshots 
      SET digital_presence = p_field_value, updated_at = NOW()
      WHERE id = p_snapshot_id;
    WHEN 'kpis' THEN
      UPDATE business_quarterly_snapshots 
      SET kpis = p_field_value, updated_at = NOW()
      WHERE id = p_snapshot_id;
    WHEN 'four_ps_status' THEN
      UPDATE business_quarterly_snapshots 
      SET four_ps_status = p_field_value, updated_at = NOW()
      WHERE id = p_snapshot_id;
    WHEN 'porter_forces' THEN
      UPDATE business_quarterly_snapshots 
      SET porter_forces = p_field_value, updated_at = NOW()
      WHERE id = p_snapshot_id;
    WHEN 'executive_summary' THEN
      UPDATE business_quarterly_snapshots 
      SET executive_summary = p_field_value, updated_at = NOW()
      WHERE id = p_snapshot_id;
    ELSE
      RETURN FALSE;
  END CASE;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- 14. RELATÓRIO FINAL
SELECT 
  'Dashboard Structure Verification Complete' as status,
  NOW() as verified_at;
