-- Migration: Adicionar relacionamento entre usuários e negócios
-- Data: 2025-07-22
-- Descrição: Adiciona colunas para relacionar usuários aos negócios

-- 1. Adicionar colunas de relacionamento usuário-negócio
ALTER TABLE businesses 
ADD COLUMN IF NOT EXISTS owner_user_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS created_by_user_id UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS assigned_to_user_id UUID REFERENCES users(id);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_businesses_owner_user_id ON businesses(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_created_by_user_id ON businesses(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_businesses_assigned_to_user_id ON businesses(assigned_to_user_id);

-- 3. Atribuir usuário principal aos negócios existentes
-- Buscar o usuário principal (Luiz Vincenzi)
DO $$
DECLARE
    main_user_id UUID;
    user_ids UUID[];
    business_record RECORD;
    user_index INTEGER := 0;
BEGIN
    -- Buscar usuário principal
    SELECT id INTO main_user_id 
    FROM users 
    WHERE email = 'luizvincenzi@gmail.com' 
    AND is_active = true;
    
    -- Se não encontrar, usar o primeiro usuário ativo
    IF main_user_id IS NULL THEN
        SELECT id INTO main_user_id 
        FROM users 
        WHERE is_active = true 
        AND email != 'sistema@crmcriadores.com'
        ORDER BY created_at 
        LIMIT 1;
    END IF;
    
    -- Buscar todos os usuários ativos (exceto sistema)
    SELECT ARRAY(
        SELECT id 
        FROM users 
        WHERE is_active = true 
        AND email != 'sistema@crmcriadores.com'
        ORDER BY created_at
    ) INTO user_ids;
    
    -- Distribuir negócios entre usuários
    FOR business_record IN 
        SELECT id, name 
        FROM businesses 
        WHERE owner_user_id IS NULL
        ORDER BY created_at
    LOOP
        -- Calcular índice do usuário (distribuição circular)
        user_index := (user_index % array_length(user_ids, 1)) + 1;
        
        -- Atualizar negócio
        UPDATE businesses 
        SET 
            owner_user_id = user_ids[user_index],
            created_by_user_id = main_user_id,
            assigned_to_user_id = user_ids[user_index]
        WHERE id = business_record.id;
        
        RAISE NOTICE 'Negócio % atribuído ao usuário %', business_record.name, user_ids[user_index];
    END LOOP;
    
    RAISE NOTICE 'Distribuição concluída. % usuários, % negócios', array_length(user_ids, 1), (SELECT COUNT(*) FROM businesses);
END $$;

-- 4. Adicionar comentários nas colunas
COMMENT ON COLUMN businesses.owner_user_id IS 'Usuário proprietário/responsável pelo negócio';
COMMENT ON COLUMN businesses.created_by_user_id IS 'Usuário que criou o registro do negócio';
COMMENT ON COLUMN businesses.assigned_to_user_id IS 'Usuário atualmente responsável pelo negócio';

-- 5. Criar view para relatórios de usuários
CREATE OR REPLACE VIEW user_business_summary AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.email,
    u.role,
    COUNT(b.id) as total_businesses,
    COUNT(CASE WHEN b.business_stage = 'Fechado' THEN 1 END) as closed_businesses,
    COALESCE(SUM(b.estimated_value), 0) as total_value,
    COALESCE(AVG(b.estimated_value), 0) as avg_value
FROM users u
LEFT JOIN businesses b ON u.id = b.owner_user_id
WHERE u.is_active = true 
AND u.email != 'sistema@crmcriadores.com'
GROUP BY u.id, u.full_name, u.email, u.role
ORDER BY total_businesses DESC, total_value DESC;

-- 6. Criar função para reatribuir negócios
CREATE OR REPLACE FUNCTION reassign_business_to_user(
    business_id UUID,
    new_owner_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se usuário existe e está ativo
    IF NOT EXISTS (
        SELECT 1 FROM users 
        WHERE id = new_owner_id 
        AND is_active = true
    ) THEN
        RAISE EXCEPTION 'Usuário não encontrado ou inativo';
    END IF;
    
    -- Atualizar negócio
    UPDATE businesses 
    SET 
        owner_user_id = new_owner_id,
        assigned_to_user_id = new_owner_id,
        updated_at = NOW()
    WHERE id = business_id;
    
    -- Verificar se foi atualizado
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Negócio não encontrado';
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- 7. Criar trigger para atualizar updated_at quando usuário for alterado
CREATE OR REPLACE FUNCTION update_business_user_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- Só atualizar se campos de usuário mudaram
    IF (OLD.owner_user_id IS DISTINCT FROM NEW.owner_user_id) OR
       (OLD.assigned_to_user_id IS DISTINCT FROM NEW.assigned_to_user_id) THEN
        NEW.updated_at = NOW();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_business_user_updated_at
    BEFORE UPDATE ON businesses
    FOR EACH ROW
    EXECUTE FUNCTION update_business_user_timestamp();

-- 8. Inserir dados de exemplo se necessário
INSERT INTO business_notes (business_id, user_id, content, note_type, created_at)
SELECT 
    b.id,
    b.owner_user_id,
    'Negócio atribuído automaticamente durante configuração do sistema',
    'system',
    NOW()
FROM businesses b
WHERE b.owner_user_id IS NOT NULL
AND NOT EXISTS (
    SELECT 1 FROM business_notes bn 
    WHERE bn.business_id = b.id 
    AND bn.note_type = 'system'
    AND bn.content LIKE '%atribuído automaticamente%'
)
LIMIT 5; -- Limitar para não criar muitas notas

-- 9. Verificar resultado
DO $$
DECLARE
    total_users INTEGER;
    total_businesses INTEGER;
    assigned_businesses INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_users 
    FROM users 
    WHERE is_active = true AND email != 'sistema@crmcriadores.com';
    
    SELECT COUNT(*) INTO total_businesses FROM businesses;
    
    SELECT COUNT(*) INTO assigned_businesses 
    FROM businesses 
    WHERE owner_user_id IS NOT NULL;
    
    RAISE NOTICE '=== RESULTADO DA MIGRATION ===';
    RAISE NOTICE 'Usuários ativos: %', total_users;
    RAISE NOTICE 'Total de negócios: %', total_businesses;
    RAISE NOTICE 'Negócios atribuídos: %', assigned_businesses;
    RAISE NOTICE 'Percentual atribuído: %%%', ROUND((assigned_businesses::DECIMAL / total_businesses * 100), 2);
END $$;
