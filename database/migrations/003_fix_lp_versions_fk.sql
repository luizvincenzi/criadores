-- ============================================================================
-- MIGRATION: Fix FK Constraint in lp_versions
-- ============================================================================
-- O problema: O constraint FK lp_versions(lp_id) -> landing_pages(id)
-- não permite inserir LP se há trigger tentando criar versão na mesma transação.
--
-- Solução: Usar DEFERRABLE INITIALLY DEFERRED para permitir verificação
-- da FK apenas ao final da transação, não imediatamente.
-- ============================================================================

-- Passo 1: Remover constraint atual
ALTER TABLE lp_versions
DROP CONSTRAINT IF EXISTS lp_versions_lp_id_fkey;

-- Passo 2: Recriar constraint como DEFERRABLE INITIALLY DEFERRED
ALTER TABLE lp_versions
ADD CONSTRAINT lp_versions_lp_id_fkey
  FOREIGN KEY (lp_id)
  REFERENCES landing_pages(id)
  ON DELETE CASCADE
  DEFERRABLE INITIALLY DEFERRED;

-- Passo 3: Pronto! Agora inserts funcionarão normalmente
