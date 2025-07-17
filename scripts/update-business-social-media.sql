-- Script para atualizar Instagram e Website dos businesses
-- Execute no SQL Editor do Supabase

-- 1. Auto Posto Bela Suíça
UPDATE businesses 
SET contact_info = jsonb_set(
  jsonb_set(contact_info, '{instagram}', '"@autopostobelasuica"'), 
  '{website}', '""'
) 
WHERE name = 'Auto Posto Bela Suíça';

-- 2. Govinda (Restaurante Vegetariano)
UPDATE businesses 
SET contact_info = jsonb_set(
  jsonb_set(contact_info, '{instagram}', '"@govindarestaurante"'), 
  '{website}', '""'
) 
WHERE name = 'Govinda';

-- 3. Porks (Porco e Chope)
UPDATE businesses 
SET contact_info = jsonb_set(
  jsonb_set(contact_info, '{instagram}', '"@porkslondrina"'), 
  '{website}', '"https://www.porksfranquia.com"'
) 
WHERE name = 'Porks';

-- 4. Cartagena (Drinks y Tapas)
UPDATE businesses 
SET contact_info = jsonb_set(
  jsonb_set(contact_info, '{instagram}', '"@cartagenabar.londrina"'), 
  '{website}', '""'
) 
WHERE name = 'Cartagena';

-- 5. Boussolé (Rooftop)
UPDATE businesses 
SET contact_info = jsonb_set(
  jsonb_set(contact_info, '{instagram}', '"@boussolerooftop"'), 
  '{website}', '""'
) 
WHERE name = 'Boussolé';

-- 6. Rezendog (precisa pesquisar)
UPDATE businesses 
SET contact_info = jsonb_set(
  jsonb_set(contact_info, '{instagram}', '""'), 
  '{website}', '""'
) 
WHERE name = 'Rezendog';

-- 7. Macc (precisa pesquisar)
UPDATE businesses 
SET contact_info = jsonb_set(
  jsonb_set(contact_info, '{instagram}', '""'), 
  '{website}', '""'
) 
WHERE name = 'Macc';

-- 8. Pizzaria Roma (precisa pesquisar)
UPDATE businesses 
SET contact_info = jsonb_set(
  jsonb_set(contact_info, '{instagram}', '""'), 
  '{website}', '""'
) 
WHERE name = 'Pizzaria Roma';

-- 9. Purão Vegano (precisa pesquisar)
UPDATE businesses 
SET contact_info = jsonb_set(
  jsonb_set(contact_info, '{instagram}', '""'), 
  '{website}', '""'
) 
WHERE name = 'Purão Vegano';

-- 10. Sonkey (precisa pesquisar)
UPDATE businesses 
SET contact_info = jsonb_set(
  jsonb_set(contact_info, '{instagram}', '""'), 
  '{website}', '""'
) 
WHERE name = 'Sonkey';

-- 11. Clinica Odontológica Natalia (precisa pesquisar)
UPDATE businesses 
SET contact_info = jsonb_set(
  jsonb_set(contact_info, '{instagram}', '""'), 
  '{website}', '""'
) 
WHERE name = 'Clinica Odontológica Natalia';

-- Verificar os resultados
SELECT 
  name,
  contact_info->>'instagram' as instagram,
  contact_info->>'website' as website
FROM businesses 
WHERE is_active = true
ORDER BY name;
