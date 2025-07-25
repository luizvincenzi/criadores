'use client';

import { useAuthStore } from '@/store/authStore';

export const useAuthenticatedFetch = () => {
  const { user } = useAuthStore();

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Adicionar email do usuário no header se estiver logado
    if (user?.email) {
      headers['x-user-email'] = user.email;
      console.log('🔐 AuthenticatedFetch: Adicionando header x-user-email:', user.email);
    } else {
      console.log('❌ AuthenticatedFetch: Usuário não encontrado ou sem email');
    }

    console.log('🔐 AuthenticatedFetch: Headers finais:', headers);

    return fetch(url, {
      ...options,
      headers,
    });
  };

  return { authenticatedFetch };
};
