'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface PortalUser {
  id: string;
  email: string;
  full_name: string;
  user_type: 'empresa' | 'criador';
  entity_id: string;
  avatar_url?: string;
  is_active: boolean;
}

interface PortalAuthState {
  user: PortalUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export function usePortalAuth() {
  const [state, setState] = useState<PortalAuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });
  
  const router = useRouter();
  const pathname = usePathname();

  // Verificar se o usuário está autenticado ao carregar
  useEffect(() => {
    checkAuth();
  }, []);

  // Redirecionar usuários não autenticados
  useEffect(() => {
    if (!state.isLoading && !state.isAuthenticated) {
      // Permitir acesso às páginas públicas
      const publicPaths = ['/portal', '/portal/login'];
      if (!publicPaths.includes(pathname)) {
        router.push('/portal/login');
      }
    }
  }, [state.isLoading, state.isAuthenticated, pathname, router]);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('portal_token');
      if (!token) {
        setState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const response = await fetch('/api/portal/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setState({
          user: userData.user,
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        // Token inválido, remover
        localStorage.removeItem('portal_token');
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/portal/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Salvar token
        localStorage.setItem('portal_token', data.token);
        
        // Atualizar estado
        setState({
          user: data.user,
          isLoading: false,
          isAuthenticated: true,
        });

        return true;
      } else {
        console.error('Erro no login:', data.error);
        return false;
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('portal_token');
      if (token) {
        // Invalidar token no servidor
        await fetch('/api/portal/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Limpar dados locais
      localStorage.removeItem('portal_token');
      setState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
      });
      
      // Redirecionar para login
      router.push('/portal/login');
    }
  };

  return {
    user: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    login,
    logout,
    checkAuth,
  };
}
