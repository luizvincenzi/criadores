-- Adicionar role business_employee ao enum platform_user_role
ALTER TYPE platform_user_role ADD VALUE IF NOT EXISTS 'business_employee';

-- Adicionar colunas de tracking para convites
ALTER TABLE platform_users
  ADD COLUMN IF NOT EXISTS invited_by UUID REFERENCES platform_users(id),
  ADD COLUMN IF NOT EXISTS invitation_status VARCHAR(20) DEFAULT 'pending'
    CHECK (invitation_status IN ('pending', 'accepted', 'expired'));

-- Índices para as novas colunas
CREATE INDEX IF NOT EXISTS idx_platform_users_invited_by ON platform_users(invited_by);
CREATE INDEX IF NOT EXISTS idx_platform_users_invitation_status ON platform_users(invitation_status);

-- Comentários
COMMENT ON COLUMN platform_users.invited_by IS 'UUID do platform_user que convidou este funcionário';
COMMENT ON COLUMN platform_users.invitation_status IS 'Status do convite: pending, accepted, expired';
