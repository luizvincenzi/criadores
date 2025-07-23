'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { usePageAccess } from '@/hooks/usePermissions';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const { hasAccess, accessDeniedMessage } = usePageAccess(pathname);

  useEffect(() => {
    // Simula um pequeno delay para verificar autenticação
    const checkAuth = async () => {
      // Se não estiver autenticado, redireciona para login
      if (!isAuthenticated || !user) {
        router.push('/login');
        return;
      }

      // Se estiver autenticado, verifica se o usuário ainda é válido
      try {
        const response = await fetch('/api/auth/me', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: user.email }),
        });

        const data = await response.json();

        if (!data.success) {
          // Se o usuário não for mais válido, faz logout
          useAuthStore.getState().logout();
          router.push('/login');
          return;
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
        // Em caso de erro, mantém o usuário logado se já estava
      }

      // Verificar se tem acesso à página atual
      if (!hasAccess) {
        console.log(`❌ Usuário ${user.email} não tem acesso à página ${pathname}`);
        // Redirecionar para página de acesso negado ou dashboard
        router.push('/dashboard');
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [isAuthenticated, user, router, pathname, hasAccess]);

  // Tela de carregamento
  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-dim flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-on-surface-variant">Verificando autenticação...</p>
        </div>
      </div>
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
