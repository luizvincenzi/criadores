// 🔐 TIPOS DE AUTENTICAÇÃO - PLATAFORMA crIAdores
// ================================================

export enum UserRole {
  ADMIN = 'admin',                    // Administradores da crIAdores (CRM interno)
  MANAGER = 'manager',                // Gerentes da crIAdores (CRM interno)
  BUSINESS_OWNER = 'business_owner',  // Empresas clientes da plataforma
  CREATOR_STRATEGIST = 'creator_strategist', // Criadores estrategistas (nível premium)
  CREATOR = 'creator',                // Criadores/Influenciadores (nível básico)
  USER = 'user',                      // Usuários padrão
  VIEWER = 'viewer'                   // Visualizadores
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  SUSPENDED = 'suspended'
}

export enum CreatorType {
  CREATOR = 'creator',                // Criador básico
  CREATOR_STRATEGIST = 'creator_strategist' // Criador estrategista (premium)
}

export enum SubscriptionPlan {
  // Planos para Empresas
  BUSINESS_BASIC = 'Empresa Básico',
  BUSINESS_PREMIUM = 'Empresa Premium',

  // Planos para Criadores
  CREATOR_FREE = 'Criador Gratuito',
  CREATOR_PRO = 'Criador Pro',

  // Planos para Estrategistas
  STRATEGIST = 'Estrategista'
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  status: UserStatus;
  business_id?: string;           // ID da empresa (obrigatório para BUSINESS_OWNER)
  creator_id?: string;            // ID do criador (obrigatório para CREATOR)
  creator_type?: CreatorType;     // Tipo de criador (creator ou creator_strategist)
  subscription_plan?: SubscriptionPlan; // Plano de assinatura ativo
  subscription_expires_at?: string; // Data de expiração da assinatura
  features_enabled?: Record<string, any>; // Recursos específicos habilitados
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
  // Administradores - Acesso total (CRM interno)
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
    'users:delete',
    'billing:read',
    'billing:write'
  ],

  // Gerentes - Acesso amplo mas sem deletar (CRM interno)
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

  // Empresas - Clientes da plataforma
  BUSINESS_OWNER: [
    'dashboard:read',
    'business:read_own',
    'business:write_own',
    'campaign:read_own',
    'campaign:write_own',
    'campaign:delete_own',
    'creator:read_assigned',
    'task:read_own',
    'task:write_own',
    'analytics:read_own',
    'reports:read_own'
  ],

  // Criadores Estrategistas - Nível premium com recursos avançados
  CREATOR_STRATEGIST: [
    'dashboard:read',
    'dashboard:write',
    'profile:read_own',
    'profile:write_own',
    'campaign:read_assigned',
    'campaign:write_assigned',
    'campaign:create',
    'team:read_own',
    'team:write_own',
    'business_tools:read',
    'business_tools:write',
    'analytics:read_own',
    'api:access',
    'white_label:access'
  ],

  // Criadores - Nível básico
  CREATOR: [
    'dashboard:read',
    'profile:read_own',
    'profile:write_own',
    'campaign:read_assigned',
    'portfolio:read_own',
    'portfolio:write_own',
    'analytics:read_own'
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
      return user.business_id === businessId; // Empresas só acessam próprio business
    case UserRole.CREATOR_STRATEGIST:
      return true; // Estrategistas têm acesso amplo para descoberta
    case UserRole.CREATOR:
      // Criadores podem ver businesses das campanhas que participam
      return true; // Acesso limitado para descoberta
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
      return true; // Acesso total
    case UserRole.BUSINESS_OWNER:
      return user.business_id === campaignBusinessId; // Só suas próprias campanhas
    case UserRole.CREATOR_STRATEGIST:
      // Estrategistas podem acessar campanhas que criaram ou participam
      return creatorIds?.includes(user.creator_id || '') === true;
    case UserRole.CREATOR:
      // Criadores só acessam campanhas onde estão participando
      return creatorIds?.includes(user.creator_id || '') === true;
    case UserRole.USER:
    case UserRole.VIEWER:
      return true; // Acesso de leitura limitado
    default:
      return false;
  }
}
