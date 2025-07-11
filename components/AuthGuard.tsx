'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

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

      setIsLoading(false);
    };

    checkAuth();
  }, [isAuthenticated, user, router]);

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

  // Se estiver autenticado, renderiza o conteúdo
  return <>{children}</>;
}
