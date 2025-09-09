// 🔐 TIPOS DE AUTENTICAÇÃO - PLATAFORMA crIAdores
// ================================================

export enum UserRole {
  ADMIN = 'admin',                    // Administradores da crIAdores
  MANAGER = 'manager',                // Gerentes da crIAdores
  BUSINESS_OWNER = 'business_owner',  // Donos de empresas clientes
  CREATOR = 'creator',                // Influenciadores/Criadores
  MARKETING_STRATEGIST = 'marketing_strategist', // Estrategistas de marketing
  USER = 'user',                      // Usuários padrão
  VIEWER = 'viewer'                   // Visualizadores
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
  business_id?: string;           // ID da empresa (obrigatório para BUSINESS_OWNER)
  creator_id?: string;            // ID do criador (obrigatório para CREATOR)
  managed_businesses?: string[];  // IDs das empresas gerenciadas (para MARKETING_STRATEGIST)
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
    'analytics:read',
    'users:read',
    'users:write',
    'users:delete'
  ],

  // Gerentes - Acesso amplo mas sem deletar
  MANAGER: [
    'business:read',
    'business:write',
    'campaign:read',
    'campaign:write',
    'creator:read',
    'creator:write',
    'task:read',
    'task:write',
    'analytics:read',
    'users:read'
  ],

  // Donos de empresas - Acesso apenas aos próprios dados
  BUSINESS_OWNER: [
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
    'creator:write_own',
    'analytics:read_own'
  ],

  // Estrategistas de marketing - Acesso às empresas gerenciadas
  MARKETING_STRATEGIST: [
    'business:read_managed',
    'business:write_managed',
    'campaign:read_managed',
    'campaign:write_managed',
    'creator:read_managed',
    'creator:write_managed',
    'task:read_managed',
    'task:write_managed',
    'analytics:read_managed'
  ],

  // Usuários padrão - Acesso limitado
  USER: [
    'business:read',
    'campaign:read',
    'creator:read',
    'task:read',
    'task:write_own',
    'analytics:read'
  ],

  // Visualizadores - Apenas leitura
  VIEWER: [
    'business:read',
    'campaign:read',
    'creator:read',
    'task:read',
    'analytics:read'
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
    case UserRole.MANAGER:
      return null; // Admins e managers podem acessar qualquer business
    case UserRole.BUSINESS_OWNER:
    case UserRole.CREATOR:
      return user.business_id || null;
    case UserRole.MARKETING_STRATEGIST:
      return user.managed_businesses?.[0] || null; // Primeiro business gerenciado
    default:
      return null;
  }
}

// Função para validar se usuário pode acessar um business específico
export function canAccessBusiness(user: User, businessId: string): boolean {
  switch (user.role) {
    case UserRole.ADMIN:
    case UserRole.MANAGER:
      return true; // Admins e managers podem acessar qualquer business
    case UserRole.BUSINESS_OWNER:
    case UserRole.CREATOR:
      return user.business_id === businessId;
    case UserRole.MARKETING_STRATEGIST:
      return user.managed_businesses?.includes(businessId) === true;
    case UserRole.USER:
    case UserRole.VIEWER:
      return true; // Acesso limitado mas podem visualizar
    default:
      return false;
  }
}

// Função para validar se usuário pode acessar uma campanha específica
export function canAccessCampaign(user: User, campaignBusinessId: string, creatorIds?: string[]): boolean {
  switch (user.role) {
    case UserRole.ADMIN:
    case UserRole.MANAGER:
      return true;
    case UserRole.BUSINESS_OWNER:
      return user.business_id === campaignBusinessId;
    case UserRole.CREATOR:
      return user.business_id === campaignBusinessId &&
             creatorIds?.includes(user.creator_id || '') === true;
    case UserRole.MARKETING_STRATEGIST:
      return user.managed_businesses?.includes(campaignBusinessId) === true;
    case UserRole.USER:
    case UserRole.VIEWER:
      return true; // Acesso de leitura
    default:
      return false;
  }
}
