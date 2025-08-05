'use client';

import { useAuthStore } from '@/store/authStore';
import { APP_CONFIG, buildUrl } from '@/lib/config';

export const useAuthenticatedFetch = () => {
  const { user } = useAuthStore();

  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    // Em desenvolvimento, usar URLs relativas para evitar problemas de CSP
    let finalUrl = url;

    // Se estamos em desenvolvimento (localhost), usar URLs relativas
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      if (url.startsWith('/')) {
        finalUrl = url; // Manter URL relativa
      } else if (url.includes('criadores.app')) {
        // Converter URL absoluta para relativa em desenvolvimento
        finalUrl = url.replace(/https?:\/\/(www\.)?criadores\.app/, '');
      }
    } else {
      // Em produção, usar URLs completas
      if (url.startsWith('/')) {
        finalUrl = buildUrl(url);
      } else if (url.includes('localhost') || url.includes('127.0.0.1')) {
        finalUrl = url.replace(/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/, APP_CONFIG.BASE_URL);
      }
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
