'use client';

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { Resource, Permission } from '@/lib/permissions';

interface PermissionGuardProps {
  children: React.ReactNode;
  resource: Resource;
  action: Permission;
  fallback?: React.ReactNode;
  showMessage?: boolean;
}

/**
 * Componente que renderiza conteúdo apenas se o usuário tiver a permissão necessária
 */
export default function PermissionGuard({ 
  children, 
  resource, 
  action, 
  fallback = null,
  showMessage = false 
}: PermissionGuardProps) {
  const { hasPermission, getAccessDeniedMessage } = usePermissions();

  const hasAccess = hasPermission(resource, action);

  if (!hasAccess) {
    if (showMessage) {
      return (
        <div className="flex items-center justify-center min-h-[200px] bg-surface-variant/20 rounded-lg border border-outline-variant">
          <div className="text-center p-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-on-surface mb-2">Acesso Restrito</h3>
            <p className="text-on-surface-variant">
              {getAccessDeniedMessage(resource, action)}
            </p>
            <p className="text-sm text-on-surface-variant mt-2">
              Entre em contato com o administrador para solicitar acesso.
            </p>
          </div>
        </div>
      );
    }
    
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Componente para proteger páginas inteiras
 */
interface PageGuardProps {
  children: React.ReactNode;
  resource: Resource;
  fallback?: React.ReactNode;
}

export function PageGuard({ children, resource, fallback }: PageGuardProps) {
  return (
    <PermissionGuard 
      resource={resource} 
      action="read" 
      showMessage={true}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

/**
 * Componente para proteger ações específicas (botões, links, etc.)
 */
interface ActionGuardProps {
  children: React.ReactNode;
  resource: Resource;
  action: Permission;
  fallback?: React.ReactNode;
}

export function ActionGuard({ children, resource, action, fallback = null }: ActionGuardProps) {
  return (
    <PermissionGuard 
      resource={resource} 
      action={action}
      fallback={fallback}
    >
      {children}
    </PermissionGuard>
  );
}

/**
 * Componente para mostrar conteúdo apenas para admins
 */
interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const { isAdmin } = usePermissions();

  if (!isAdmin()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

/**
 * Componente para mostrar conteúdo apenas para managers ou superior
 */
interface ManagerOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ManagerOnly({ children, fallback = null }: ManagerOnlyProps) {
  const { isManagerOrAbove } = usePermissions();

  if (!isManagerOrAbove()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
