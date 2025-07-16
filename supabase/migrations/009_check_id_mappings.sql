-- Verificar se conseguimos mapear os IDs para nomes
SELECT 
  'businesses' as tabela,
  id,
  name,
  substring(id, 1, 20) as id_prefix
FROM businesses 
LIMIT 5;

SELECT 
  'creators' as tabela,
  id,
  name,
  substring(id, 1, 20) as id_prefix
FROM creators 
LIMIT 5;

-- Verificar se existe algum padrão nos IDs
SELECT 
  id,
  name
FROM businesses 
WHERE id LIKE 'crt_%'
LIMIT 3;