// 🔐 TIPOS DE AUTENTICAÇÃO - PLATAFORMA crIAdores
// ================================================

export enum UserRole {
  ADMIN = 'admin',           // Administradores da crIAdores
  BUSINESS = 'business',     // Empresas clientes
  CREATOR = 'creator'        // Influenciadores/Criadores
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended'
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  business_id?: string;      // ID da empresa (obrigatório para BUSINESS e CREATOR)
  creator_id?: string;       // ID do criador (obrigatório para CREATOR)
  permissions: string[];
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  last_login?: string;
}

export interface AuthSession {
  user: User;
  business_id?: string;      // Business ID filtrado para a sessão
  creator_id?: string;       // Creator ID filtrado para a sessão
  permissions: string[];
  expires_at: string;
}

// Permissões específicas por tipo de usuário
export const PERMISSIONS = {
  // Administradores - Acesso total
  ADMIN: [
    'admin:all',
    'business:read',
    'business:write',
    'business:delete',
    'campaign:read',
    'campaign:write',
    'campaign:delete',
    'creator:read',
    'creator:write',
    'creator:delete',
    'task:read',
    'task:write',
    'task:delete',
    'analytics:read'
  ],
  
  // Empresas - Acesso apenas aos próprios dados
  BUSINESS: [
    'business:read_own',
    'campaign:read_own',
    'campaign:write_own',
    'creator:read_assigned',
    'task:read_own',
    'task:write_own',
    'analytics:read_own'
  ],
  
  // Criadores - Acesso apenas às campanhas onde estão envolvidos
  CREATOR: [
    'campaign:read_assigned',
    'task:read_assigned',
    'task:write_assigned',
    'creator:read_own',
    'creator:write_own'
  ]
} as const;

// Função para verificar permissões
export function hasPermission(user: User, permission: string): boolean {
  return user.permissions.includes(permission) || user.permissions.includes(`${user.role}:all`);
}

// Função para obter business_id baseado no tipo de usuário
export function getBusinessIdForUser(user: User): string | null {
  switch (user.role) {
    case UserRole.ADMIN:
      return null; // Admins podem acessar qualquer business
    case UserRole.BUSINESS:
    case UserRole.CREATOR:
      return user.business_id || null;
    default:
      return null;
  }
}

// Função para validar se usuário pode acessar um business específico
export function canAccessBusiness(user: User, businessId: string): boolean {
  switch (user.role) {
    case UserRole.ADMIN:
      return true; // Admins podem acessar qualquer business
    case UserRole.BUSINESS:
    case UserRole.CREATOR:
      return user.business_id === businessId;
    default:
      return false;
  }
}

// Função para validar se usuário pode acessar uma campanha específica
export function canAccessCampaign(user: User, campaignBusinessId: string, creatorIds?: string[]): boolean {
  switch (user.role) {
    case UserRole.ADMIN:
      return true;
    case UserRole.BUSINESS:
      return user.business_id === campaignBusinessId;
    case UserRole.CREATOR:
      return user.business_id === campaignBusinessId && 
             creatorIds?.includes(user.creator_id || '') === true;
    default:
      return false;
  }
}
