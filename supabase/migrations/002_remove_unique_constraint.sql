-- Remove a constraint única que impede múltiplas associações do mesmo criador à mesma campanha
ALTER TABLE campaign_creators DROP CONSTRAINT IF EXISTS campaign_creators_campaign_id_creator_id_key;

-- Comentário: Agora o mesmo criador pode ser associado múltiplas vezes à mesma campanha
-- Isso permite flexibilidade para casos onde um criador participa de múltiplas atividades
-- dentro da mesma campanha ou tem múltiplos papéis.
