-- Remover coluna campaign_date que é redundante com month
-- A coluna month agora está padronizada no formato "MMM YY" (ex: jul 25, ago 25)

ALTER TABLE campaigns DROP COLUMN IF EXISTS campaign_date;

-- Comentário: A coluna month é suficiente para identificar o período da campanha
-- Formato padrão: "MMM YY" onde MMM é o mês abreviado em português e YY é o ano com 2 dígitos
