/**
 * TIPOS DE AUTENTICAÇÃO PARA PLATFORM_USERS
 * Usuários externos da plataforma criadores.app
 */

// ==========================================
// ENUMS
// ==========================================

export enum PlatformUserRole {
  CREATOR = 'creator',
  MARKETING_STRATEGIST = 'marketing_strategist',
  BUSINESS_OWNER = 'business_owner'
}

export enum SubscriptionPlan {
  BASIC = 'basic',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

// ==========================================
// INTERFACES
// ==========================================

export interface PlatformUser {
  id: string;
  organization_id: string;
  
  // Informações Básicas
  email: string;
  full_name: string;
  avatar_url?: string;
  
  // Sistema de Roles
  role: PlatformUserRole; // Role primário
  roles: PlatformUserRole[]; // Múltiplos roles
  
  // Relacionamentos
  creator_id?: string;
  business_id?: string;
  managed_businesses?: string[];
  
  // Permissões
  permissions: PlatformPermissions;
  preferences: UserPreferences;
  
  // Assinatura
  subscription_plan?: SubscriptionPlan;
  subscription_expires_at?: string;
  features_enabled?: Record<string, any>;
  
  // Status
  is_active: boolean;
  last_login?: string;
  platform: 'client';
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface PlatformPermissions {
  campaigns: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
  conteudo: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
  briefings: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
  reports: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
  tasks: {
    read: boolean;
    write: boolean;
    delete: boolean;
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    in_app: boolean;
  };
}

export interface PlatformUserWithDetails extends PlatformUser {
  creator_name?: string;
  creator_slug?: string;
  instagram_handle?: string;
  business_name?: string;
  organization_name?: string;
  combined_permissions?: PlatformPermissions;
}

// ==========================================
// LOGIN/AUTH
// ==========================================

export interface PlatformLoginRequest {
  email: string;
  password: string;
}

export interface PlatformLoginResponse {
  success: boolean;
  user?: PlatformUser;
  token?: string;
  error?: string;
}

export interface PlatformAuthState {
  user: PlatformUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Verifica se o usuário tem um role específico
 */
export function hasRole(user: PlatformUser, role: PlatformUserRole): boolean {
  return user.roles.includes(role);
}

/**
 * Verifica se o usuário tem qualquer um dos roles especificados
 */
export function hasAnyRole(user: PlatformUser, roles: PlatformUserRole[]): boolean {
  return roles.some(role => user.roles.includes(role));
}

/**
 * Verifica se o usuário tem todos os roles especificados
 */
export function hasAllRoles(user: PlatformUser, roles: PlatformUserRole[]): boolean {
  return roles.every(role => user.roles.includes(role));
}

/**
 * Retorna o dashboard apropriado baseado nos roles do usuário
 */
export function getDashboardRoute(user: PlatformUser): string {
  // Business owner vai para conteúdo empresa (dashboard temporariamente desabilitado)
  if (hasRole(user, PlatformUserRole.BUSINESS_OWNER)) {
    return '/conteudo-empresa';
  }

  // Creator ou Marketing Strategist vão para dashboard criador
  if (hasAnyRole(user, [PlatformUserRole.CREATOR, PlatformUserRole.MARKETING_STRATEGIST])) {
    return '/dashboard/criador';
  }

  // Fallback
  return '/dashboard/geral';
}

/**
 * Verifica se o usuário pode acessar uma rota específica
 */
export function canAccessRoute(user: PlatformUser, route: string): boolean {
  // Business owner pode acessar conteúdo e campanhas empresa (dashboard temporariamente desabilitado)
  if (hasRole(user, PlatformUserRole.BUSINESS_OWNER)) {
    return route.startsWith('/conteudo-empresa') || route.startsWith('/campanhas-empresa');
  }

  // Creator e Marketing Strategist podem acessar /dashboard/criador
  if (hasAnyRole(user, [PlatformUserRole.CREATOR, PlatformUserRole.MARKETING_STRATEGIST])) {
    return route.startsWith('/dashboard/criador') || route.startsWith('/dashboard/geral');
  }

  return false;
}

/**
 * Combina permissões de múltiplos roles
 */
export function getCombinedPermissions(user: PlatformUser): PlatformPermissions {
  const permissions: PlatformPermissions = {
    campaigns: { read: false, write: false, delete: false },
    conteudo: { read: false, write: false, delete: false },
    briefings: { read: false, write: false, delete: false },
    reports: { read: false, write: false, delete: false },
    tasks: { read: false, write: false, delete: false }
  };
  
  // Permissões de Creator
  if (hasRole(user, PlatformUserRole.CREATOR)) {
    permissions.campaigns.read = true;
    permissions.conteudo.read = true;
    permissions.conteudo.write = true;
    permissions.conteudo.delete = true;
    permissions.reports.read = true;
    permissions.tasks.read = true;
    permissions.tasks.write = true;
  }
  
  // Permissões de Marketing Strategist
  if (hasRole(user, PlatformUserRole.MARKETING_STRATEGIST)) {
    permissions.campaigns.read = true;
    permissions.campaigns.write = true;
    permissions.conteudo.read = true;
    permissions.conteudo.write = true;
    permissions.briefings.read = true;
    permissions.briefings.write = true;
    permissions.reports.read = true;
    permissions.tasks.read = true;
    permissions.tasks.write = true;
  }
  
  // Permissões de Business Owner
  if (hasRole(user, PlatformUserRole.BUSINESS_OWNER)) {
    permissions.campaigns.read = true;
    permissions.conteudo.read = true;
    permissions.briefings.read = true;
    permissions.reports.read = true;
  }
  
  return permissions;
}

/**
 * Valida se o usuário tem permissão para uma ação específica
 */
export function hasPermission(
  user: PlatformUser,
  resource: keyof PlatformPermissions,
  action: 'read' | 'write' | 'delete'
): boolean {
  const combinedPermissions = getCombinedPermissions(user);
  return combinedPermissions[resource][action];
}

/**
 * Verifica se a assinatura do usuário está ativa
 */
export function hasActiveSubscription(user: PlatformUser): boolean {
  if (!user.subscription_expires_at) return true; // Sem expiração = sempre ativo
  
  const expirationDate = new Date(user.subscription_expires_at);
  const now = new Date();
  
  return expirationDate > now;
}

/**
 * Retorna os dias restantes da assinatura
 */
export function getSubscriptionDaysRemaining(user: PlatformUser): number | null {
  if (!user.subscription_expires_at) return null;
  
  const expirationDate = new Date(user.subscription_expires_at);
  const now = new Date();
  const diffTime = expirationDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays > 0 ? diffDays : 0;
}

/**
 * Formata o nome do role para exibição
 */
export function formatRoleName(role: PlatformUserRole): string {
  const roleNames: Record<PlatformUserRole, string> = {
    [PlatformUserRole.CREATOR]: 'Criador',
    [PlatformUserRole.MARKETING_STRATEGIST]: 'Estrategista de Marketing',
    [PlatformUserRole.BUSINESS_OWNER]: 'Dono da Empresa'
  };
  
  return roleNames[role];
}

/**
 * Retorna ícone do role
 */
export function getRoleIcon(role: PlatformUserRole): string {
  const roleIcons: Record<PlatformUserRole, string> = {
    [PlatformUserRole.CREATOR]: '🎨',
    [PlatformUserRole.MARKETING_STRATEGIST]: '📊',
    [PlatformUserRole.BUSINESS_OWNER]: '🏢'
  };
  
  return roleIcons[role];
}

