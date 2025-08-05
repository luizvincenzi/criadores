'use client';

import { useAuthStore } from '@/store/authStore';
import { APP_CONFIG, buildUrl } from '@/lib/config';

export const useAuthenticatedFetch = () => {
  const { user } = useAuthStore();

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    // Garantir que a URL use o domínio correto
    let finalUrl = url;
    if (url.startsWith('/')) {
      // URL relativa - construir URL completa
      finalUrl = buildUrl(url);
    } else if (url.includes('localhost') || url.includes('127.0.0.1')) {
      // Substituir localhost pelo domínio configurado
      finalUrl = url.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, APP_CONFIG.BASE_URL);
    }

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

    console.log('🔐 AuthenticatedFetch: URL final:', finalUrl);
    console.log('🔐 AuthenticatedFetch: Headers finais:', headers);

    return fetch(finalUrl, {
      ...options,
      headers,
    });
  };

  return { authenticatedFetch };
};
