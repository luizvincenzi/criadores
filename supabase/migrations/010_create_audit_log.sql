-- Migration: Create audit_log table
-- Description: Tabela para registrar todas as ações do sistema (audit trail)
-- Date: 2025-01-15

-- Criar tabela audit_log
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Informações da entidade afetada
    entity_type VARCHAR(50) NOT NULL, -- 'business', 'creator', 'campaign', 'user', etc.
    entity_id VARCHAR(255) NOT NULL, -- ID da entidade afetada
    entity_name VARCHAR(255), -- Nome da entidade para facilitar leitura
    
    -- Informações da ação
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', 'status_change', etc.
    field_name VARCHAR(100), -- Campo específico que foi alterado (opcional)
    old_value TEXT, -- Valor anterior (para updates)
    new_value TEXT, -- Novo valor
    
    -- Informações do usuário
    user_email VARCHAR(255), -- Email do usuário que fez a ação
    user_id UUID, -- ID do usuário (se disponível)
    
    -- Metadados
    ip_address INET, -- IP do usuário
    user_agent TEXT, -- User agent do browser
    details JSONB, -- Informações adicionais em JSON
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Índices para performance
    CONSTRAINT audit_log_entity_type_check CHECK (entity_type IN (
        'business', 'creator', 'campaign', 'user', 'organization', 'system'
    )),
    CONSTRAINT audit_log_action_check CHECK (action IN (
        'create', 'update', 'delete', 'login', 'logout', 'status_change', 
        'view', 'export', 'import', 'assign', 'unassign'
    ))
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON audit_log(action);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_email);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_organization ON audit_log(organization_id);

-- Comentários para documentação
COMMENT ON TABLE audit_log IS 'Tabela de auditoria para registrar todas as ações do sistema';
COMMENT ON COLUMN audit_log.entity_type IS 'Tipo da entidade afetada (business, creator, campaign, etc.)';
COMMENT ON COLUMN audit_log.entity_id IS 'ID da entidade afetada';
COMMENT ON COLUMN audit_log.action IS 'Ação realizada (create, update, delete, etc.)';
COMMENT ON COLUMN audit_log.user_email IS 'Email do usuário que realizou a ação';
COMMENT ON COLUMN audit_log.details IS 'Informações adicionais em formato JSON';

-- Habilitar RLS (Row Level Security)
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Política para permitir leitura para usuários da mesma organização
CREATE POLICY "Users can view audit logs from their organization" ON audit_log
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM users WHERE email = auth.jwt() ->> 'email'
        )
    );

-- Política para permitir inserção para usuários autenticados
CREATE POLICY "Users can insert audit logs" ON audit_log
    FOR INSERT WITH CHECK (true);

-- Função para inserir audit log automaticamente
CREATE OR REPLACE FUNCTION insert_audit_log(
    p_organization_id UUID DEFAULT '00000000-0000-0000-0000-000000000001',
    p_entity_type VARCHAR DEFAULT 'system',
    p_entity_id VARCHAR DEFAULT '',
    p_entity_name VARCHAR DEFAULT '',
    p_action VARCHAR DEFAULT 'create',
    p_field_name VARCHAR DEFAULT NULL,
    p_old_value TEXT DEFAULT NULL,
    p_new_value TEXT DEFAULT NULL,
    p_user_email VARCHAR DEFAULT 'system@crmcriadores.com',
    p_user_id UUID DEFAULT NULL,
    p_details JSONB DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    audit_id UUID;
BEGIN
    INSERT INTO audit_log (
        organization_id,
        entity_type,
        entity_id,
        entity_name,
        action,
        field_name,
        old_value,
        new_value,
        user_email,
        user_id,
        details,
        created_at
    ) VALUES (
        p_organization_id,
        p_entity_type,
        p_entity_id,
        p_entity_name,
        p_action,
        p_field_name,
        p_old_value,
        p_new_value,
        p_user_email,
        p_user_id,
        p_details,
        NOW()
    ) RETURNING id INTO audit_id;
    
    RETURN audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comentário na função
COMMENT ON FUNCTION insert_audit_log IS 'Função para inserir registros de auditoria de forma segura';

-- Inserir alguns registros de exemplo para teste
INSERT INTO audit_log (
    organization_id,
    entity_type,
    entity_id,
    entity_name,
    action,
    user_email,
    details
) VALUES 
(
    '00000000-0000-0000-0000-000000000001',
    'system',
    'migration_010',
    'Criação da tabela audit_log',
    'create',
    'system@crmcriadores.com',
    '{"migration": "010_create_audit_log", "description": "Tabela de auditoria criada com sucesso"}'
),
(
    '00000000-0000-0000-0000-000000000001',
    'system',
    'audit_system',
    'Sistema de Auditoria',
    'create',
    'system@crmcriadores.com',
    '{"component": "audit_log", "status": "active", "features": ["create", "read", "search", "export"]}'
);

-- Verificar se a tabela foi criada corretamente
SELECT 
    'audit_log' as tabela_criada,
    COUNT(*) as registros_exemplo,
    MIN(created_at) as primeiro_registro,
    MAX(created_at) as ultimo_registro
FROM audit_log;

-- Mostrar estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'audit_log' 
ORDER BY ordinal_position;
Encontra