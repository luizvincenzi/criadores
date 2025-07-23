/**
 * Hook para gerenciar permissões de usuário
 */

import { useAuthStore } from '@/store/authStore';
import { 
  hasPermission, 
  canAccessPage, 
  canPerformAction,
  getAccessibleMenuItems,
  getAccessLevel,
  isAdmin,
  isManagerOrAbove,
  getAccessDeniedMessage,
  type Resource,
  type Permission,
  type UserWithPermissions
} from '@/lib/permissions';

export function usePermissions() {
  const { user } = useAuthStore();

  // Converter user do store para UserWithPermissions
  const userWithPermissions: UserWithPermissions | null = user ? {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role as any,
    permissions: user.permissions,
    organization: user.organization
  } : null;

  return {
    // Verificações básicas
    hasPermission: (resource: Resource, action: Permission) => 
      hasPermission(userWithPermissions, resource, action),
    
    canAccessPage: (page: string) => 
      canAccessPage(userWithPermissions, page),
    
    canPerformAction: (resource: Resource, action: Permission) => 
      canPerformAction(userWithPermissions, resource, action),

    // Utilitários
    getAccessibleMenuItems: () => 
      getAccessibleMenuItems(userWithPermissions),
    
    getAccessLevel: (resource: Resource) => 
      getAccessLevel(userWithPermissions, resource),
    
    isAdmin: () => 
      isAdmin(userWithPermissions),
    
    isManagerOrAbove: () => 
      isManagerOrAbove(userWithPermissions),

    // Mensagens
    getAccessDeniedMessage: (resource: Resource, action: Permission) => 
      getAccessDeniedMessage(resource, action),

    // Dados do usuário
    user: userWithPermissions,
    isAuthenticated: !!user
  };
}

// Hook específico para verificar se pode acessar uma página
export function usePageAccess(page: string) {
  const { canAccessPage, getAccessDeniedMessage } = usePermissions();
  
  const hasAccess = canAccessPage(page);
  
  return {
    hasAccess,
    accessDeniedMessage: hasAccess ? null : 'Você não tem permissão para acessar esta página.'
  };
}

// Hook específico para verificar permissões de um recurso
export function useResourcePermissions(resource: Resource) {
  const { hasPermission, getAccessLevel, canPerformAction } = usePermissions();
  
  const accessLevel = getAccessLevel(resource);
  
  return {
    canRead: hasPermission(resource, 'read'),
    canWrite: hasPermission(resource, 'write'),
    canDelete: hasPermission(resource, 'delete'),
    accessLevel,
    canPerformAction: (action: Permission) => canPerformAction(resource, action)
  };
}
