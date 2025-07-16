-- =====================================================
-- SCRIPT PARA ADICIONAR CAMPOS DE BRIEFING
-- Execute este script no Supabase Dashboard > SQL Editor
-- =====================================================

-- 1. Verificar se a coluna já existe
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'campaigns' 
  AND column_name = 'briefing_details';

-- 2. Adicionar campo briefing_details se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'campaigns' AND column_name = 'briefing_details'
  ) THEN
    
    -- Adicionar a coluna
    ALTER TABLE campaigns 
    ADD COLUMN briefing_details JSONB DEFAULT '{
      "formato": "",
      "perfil_criador": "",
      "objetivo_detalhado": "",
      "comunicacao_secundaria": "",
      "datas_gravacao": {
        "data_inicio": null,
        "data_fim": null,
        "horarios_preferenciais": [],
        "observacoes": ""
      },
      "roteiro_video": {
        "o_que_falar": "",
        "historia": "",
        "promocao_cta": "",
        "tom_comunicacao": "",
        "pontos_obrigatorios": []
      },
      "requisitos_tecnicos": {
        "duracao_video": "",
        "qualidade": "",
        "formato_entrega": "",
        "hashtags_obrigatorias": []
      }
    }'::jsonb;
    
    -- Adicionar comentário
    COMMENT ON COLUMN campaigns.briefing_details IS 'Detalhes específicos do briefing da campanha incluindo formato, perfil do criador, roteiro, datas de gravação e requisitos técnicos';
    
    -- Criar índice para performance
    CREATE INDEX idx_campaigns_briefing_details_gin 
    ON campaigns USING gin(briefing_details);
    
    RAISE NOTICE 'Campo briefing_details adicionado com sucesso!';
    
  ELSE
    RAISE NOTICE 'Campo briefing_details já existe na tabela campaigns';
  END IF;
END $$;

-- 3. Atualizar campanhas existentes com estrutura padrão
UPDATE campaigns 
SET briefing_details = '{
  "formato": "",
  "perfil_criador": "",
  "objetivo_detalhado": "",
  "comunicacao_secundaria": "",
  "datas_gravacao": {
    "data_inicio": null,
    "data_fim": null,
    "horarios_preferenciais": [],
    "observacoes": ""
  },
  "roteiro_video": {
    "o_que_falar": "",
    "historia": "",
    "promocao_cta": "",
    "tom_comunicacao": "",
    "pontos_obrigatorios": []
  },
  "requisitos_tecnicos": {
    "duracao_video": "",
    "qualidade": "",
    "formato_entrega": "",
    "hashtags_obrigatorias": []
  }
}'::jsonb
WHERE briefing_details IS NULL;

-- 4. Verificar se a migração foi aplicada corretamente
SELECT 
  'campaigns' as tabela,
  COUNT(*) as total_registros,
  COUNT(CASE WHEN briefing_details IS NOT NULL THEN 1 END) as com_briefing_details,
  COUNT(CASE WHEN briefing_details->>'formato' IS NOT NULL THEN 1 END) as com_formato
FROM campaigns;

-- 5. Exemplo de consulta para verificar a estrutura
SELECT 
  id,
  title,
  briefing_details->>'formato' as formato,
  briefing_details->>'perfil_criador' as perfil_criador,
  briefing_details->'datas_gravacao'->>'data_inicio' as data_inicio,
  briefing_details->'roteiro_video'->>'promocao_cta' as promocao_cta
FROM campaigns 
LIMIT 3;

-- =====================================================
-- INSTRUÇÕES DE USO:
-- 
-- 1. Acesse o Supabase Dashboard
-- 2. Vá para "SQL Editor"
-- 3. Cole este script completo
-- 4. Execute o script
-- 5. Verifique se aparece "Campo briefing_details adicionado com sucesso!"
-- 6. Teste o modal de campanha em http://localhost:3000/campaigns
-- 
-- CAMPOS ADICIONADOS:
-- - Formato (dropdown)
-- - Perfil do criador
-- - Objetivo detalhado  
-- - Comunicação secundária
-- - Datas e horários para gravação
-- - O que precisa ser falado no vídeo
-- - História
-- - Promoção CTA
-- - Requisitos técnicos
-- =====================================================
