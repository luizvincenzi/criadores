-- Script para corrigir a constraint de section_type
-- Isso remove a constraint CHECK antiga e recria a tabela com ENUM correto

-- 1. Primeiro, fazer backup dos dados
CREATE TEMP TABLE strategic_map_sections_backup AS
SELECT * FROM strategic_map_sections;

-- 2. Desabilitar triggers e constraints temporariamente
ALTER TABLE strategic_map_sections DISABLE TRIGGER ALL;

-- 3. Remover a constraint CHECK que está causando o problema
ALTER TABLE strategic_map_sections
DROP CONSTRAINT IF EXISTS strategic_map_sections_section_type_check;

-- 4. Remover a unique constraint para recriá-la depois
ALTER TABLE strategic_map_sections
DROP CONSTRAINT IF EXISTS strategic_map_sections_strategic_map_id_section_type_key;

-- 5. Alterar a coluna section_type para usar o tipo ENUM correto
-- Primeiro convertar para text, depois para o enum
ALTER TABLE strategic_map_sections
ALTER COLUMN section_type TYPE section_type USING section_type::text::section_type;

-- 6. Recriar a unique constraint
ALTER TABLE strategic_map_sections
ADD CONSTRAINT strategic_map_sections_strategic_map_id_section_type_key
UNIQUE (strategic_map_id, section_type);

-- 7. Reabilitar triggers
ALTER TABLE strategic_map_sections ENABLE TRIGGER ALL;

-- 8. Verificar os dados
SELECT
  COUNT(*) as total_sections,
  section_type,
  COUNT(*) as count_by_type
FROM strategic_map_sections
GROUP BY section_type
ORDER BY section_type;

-- Mensagem de sucesso
\echo 'Constraint corrigida com sucesso!'
\echo 'Agora você pode executar o script de população do Boussolé sem erros.'
