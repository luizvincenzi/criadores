/**
 * Sistema de Permissões - CRM Criadores
 * Controla acesso baseado em roles e permissões específicas
 */

export type Permission = 'read' | 'write' | 'delete';
export type Resource = 'dashboard' | 'businesses' | 'creators' | 'campaigns' | 'deals' | 'jornada' | 'reports';
export type Role = 'admin' | 'manager' | 'user' | 'viewer';

// Definição de permissões por role
export const ROLE_PERMISSIONS: Record<Role, Record<Resource, Permission[]>> = {
  admin: {
    dashboard: ['read', 'write', 'delete'],
    businesses: ['read', 'write', 'delete'],
    creators: ['read', 'write', 'delete'],
    campaigns: ['read', 'write', 'delete'],
    deals: ['read', 'write', 'delete'],
    jornada: ['read', 'write', 'delete'],
    reports: ['read', 'write', 'delete']
  },
  manager: {
    dashboard: ['read', 'write'],
    businesses: ['read', 'write'],
    creators: ['read', 'write'],
    campaigns: ['read', 'write'],
    deals: ['read', 'write'],
    jornada: ['read', 'write'],
    reports: ['read']
  },
  user: {
    dashboard: ['read'],
    businesses: ['read'],
    creators: ['read'],
    campaigns: ['read'],
    deals: ['read'],
    jornada: ['read'],
    reports: []
  },
  viewer: {
    dashboard: ['read'],
    businesses: ['read'],
    creators: ['read'],
    campaigns: ['read'],
    deals: ['read'],
    jornada: ['read'],
    reports: []
  }
};

// Interface para usuário com permissões
export interface UserWithPermissions {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  permissions?: Record<string, Record<string, boolean>>;
  organization?: any;
}

/**
 * Verifica se o usuário tem uma permissão específica
 */
export function hasPermission(
  user: UserWithPermissions | null,
  resource: Resource,
  action: Permission
): boolean {
  if (!user) return false;

  // Admin sempre tem todas as permissões
  if (user.role === 'admin') return true;

  // Verificar permissões específicas do usuário (do banco)
  if (user.permissions && user.permissions[resource]) {
    return user.permissions[resource][action] === true;
  }

  // Fallback para permissões padrão do role
  const rolePermissions = ROLE_PERMISSIONS[user.role];
  if (!rolePermissions || !rolePermissions[resource]) return false;

  return rolePermissions[resource].includes(action);
}

/**
 * Verifica se o usuário pode acessar uma página
 */
export function canAccessPage(user: UserWithPermissions | null, page: string): boolean {
  const pageResourceMap: Record<string, Resource> = {
    '/dashboard': 'dashboard',
    '/': 'dashboard',
    '/businesses': 'businesses',
    '/creators': 'creators',
    '/campaigns': 'campaigns',
    '/deals': 'deals',
    '/jornada': 'jornada'
  };

  const resource = pageResourceMap[page];
  if (!resource) return true; // Páginas não mapeadas são liberadas

  return hasPermission(user, resource, 'read');
}

/**
 * Filtra itens de menu baseado nas permissões do usuário
 */
export function getAccessibleMenuItems(user: UserWithPermissions | null) {
  const allMenuItems = [
    { id: 'dashboard', label: 'Dashboard', href: '/dashboard', resource: 'dashboard' as Resource },
    { id: 'deals', label: 'Negócios', href: '/deals', resource: 'deals' as Resource },
    { id: 'businesses', label: 'Empresas', href: '/businesses', resource: 'businesses' as Resource },
    { id: 'creators', label: 'Criadores', href: '/creators', resource: 'creators' as Resource },
    { id: 'campaigns', label: 'Campanhas', href: '/campaigns', resource: 'campaigns' as Resource },
    { id: 'jornada', label: 'Jornada', href: '/jornada', resource: 'jornada' as Resource }
  ];

  return allMenuItems.filter(item => 
    hasPermission(user, item.resource, 'read')
  );
}

/**
 * Verifica se o usuário pode executar uma ação específica
 */
export function canPerformAction(
  user: UserWithPermissions | null,
  resource: Resource,
  action: Permission
): boolean {
  return hasPermission(user, resource, action);
}

/**
 * Obtém o nível de acesso do usuário para um recurso
 */
export function getAccessLevel(
  user: UserWithPermissions | null,
  resource: Resource
): Permission[] {
  if (!user) return [];

  // Admin tem todas as permissões
  if (user.role === 'admin') return ['read', 'write', 'delete'];

  const permissions: Permission[] = [];

  // Verificar cada permissão
  (['read', 'write', 'delete'] as Permission[]).forEach(action => {
    if (hasPermission(user, resource, action)) {
      permissions.push(action);
    }
  });

  return permissions;
}

/**
 * Verifica se o usuário é admin
 */
export function isAdmin(user: UserWithPermissions | null): boolean {
  return user?.role === 'admin';
}

/**
 * Verifica se o usuário é manager ou superior
 */
export function isManagerOrAbove(user: UserWithPermissions | null): boolean {
  return user?.role === 'admin' || user?.role === 'manager';
}

/**
 * Obtém mensagem de erro para acesso negado
 */
export function getAccessDeniedMessage(resource: Resource, action: Permission): string {
  const resourceNames: Record<Resource, string> = {
    dashboard: 'Dashboard',
    businesses: 'Empresas',
    creators: 'Criadores',
    campaigns: 'Campanhas',
    deals: 'Negócios',
    jornada: 'Jornada',
    reports: 'Relatórios'
  };

  const actionNames: Record<Permission, string> = {
    read: 'visualizar',
    write: 'editar',
    delete: 'excluir'
  };

  return `Você não tem permissão para ${actionNames[action]} ${resourceNames[resource]}.`;
}
