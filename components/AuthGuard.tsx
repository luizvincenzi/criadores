'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { usePageAccess } from '@/hooks/usePermissions';
import LoadingSpinner from './LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { hasAccess, accessDeniedMessage } = usePageAccess(pathname);

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 AuthGuard: Verificando autenticação...', {
        isAuthenticated,
        user: user?.email,
        pathname,
        authChecked
      });

      // Se não estiver autenticado, redireciona para login
      if (!isAuthenticated || !user) {
        console.log('❌ AuthGuard: Usuário não autenticado, redirecionando para login');
        router.push('/login');
        return;
      }

      console.log('✅ AuthGuard: Usuário autenticado, verificando acesso à página');

      // Verificar se tem acesso à página atual
      if (!hasAccess) {
        console.log(`❌ AuthGuard: Usuário ${user.email} não tem acesso à página ${pathname}`);
        router.push('/dashboard');
        return;
      }

      console.log('✅ AuthGuard: Acesso à página verificado, liberando acesso');
      setAuthChecked(true);
      setIsLoading(false);
    };

    // Pequeno delay para garantir que o estado foi hidratado
    const timer = setTimeout(() => {
      if (!authChecked) {
        checkAuth();
      } else {
        setIsLoading(false);
      }
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, user, router, pathname, hasAccess, authChecked]);

  // Tela de carregamento
  if (isLoading) {
    return (
      <LoadingSpinner
        fullScreen
        size="lg"
        message="Verificando autenticação..."
      />
    );
  }

  // Se não estiver autenticado, não renderiza nada (redirecionamento já foi feito)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Se não tiver acesso à página, mostrar mensagem de erro
  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-surface-dim flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-error/10 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-on-surface mb-2">Acesso Negado</h2>
          <p className="text-on-surface-variant mb-4">{accessDeniedMessage}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg hover:bg-primary/90 transition-colors"
          >
            Voltar ao Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Se estiver autenticado e tiver acesso, renderiza o conteúdo
  return <>{children}</>;
}
