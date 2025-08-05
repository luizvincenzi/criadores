// Configuração centralizada de URLs e domínios
export const APP_CONFIG = {
  // URLs principais - sempre usar criadores.app em produção
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'https://criadores.app',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'https://criadores.app',
  
  // Instagram API
  INSTAGRAM: {
    APP_ID: process.env.INSTAGRAM_APP_ID || '582288514801639',
    APP_SECRET: process.env.INSTAGRAM_APP_SECRET || '',
    REDIRECT_URI: process.env.INSTAGRAM_REDIRECT_URI || 'https://criadores.app/api/instagram/callback',
  },
  
  // Business ID
  CLIENT_BUSINESS_ID: process.env.NEXT_PUBLIC_CLIENT_BUSINESS_ID || '00000000-0000-0000-0000-000000000002',
  
  // Modo cliente
  CLIENT_MODE: process.env.NEXT_PUBLIC_CLIENT_MODE === 'true',
  
  // Administradores
  ADMIN_EMAILS: ['luizvincenzi@gmail.com'],
  
  // URLs de API
  API: {
    INSTAGRAM_CONNECT: '/api/instagram/connect',
    INSTAGRAM_CALLBACK: '/api/instagram/callback',
    INSTAGRAM_DEAUTH: '/api/instagram/deauth',
    INSTAGRAM_DELETE: '/api/instagram/delete',
    INSTAGRAM_WEBHOOK: '/api/instagram/webhook',
  },
  
  // URLs legais
  LEGAL: {
    PRIVACY_POLICY: '/privacy-policy',
    TERMS_OF_SERVICE: '/terms-of-service',
  },
  
  // Meta Business URLs
  META_BUSINESS: {
    OAUTH_REDIRECT: 'https://criadores.app/api/instagram/callback',
    DEAUTH_CALLBACK: 'https://criadores.app/api/instagram/deauth',
    DATA_DELETION: 'https://criadores.app/api/instagram/delete',
    WEBHOOK: 'https://criadores.app/api/instagram/webhook',
    PRIVACY_POLICY: 'https://criadores.app/privacy-policy',
    TERMS_OF_SERVICE: 'https://criadores.app/terms-of-service',
  }
};

// Helper para construir URLs completas
export const buildUrl = (path: string): string => {
  const baseUrl = APP_CONFIG.BASE_URL.replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// Helper para verificar se é administrador
export const isAdmin = (email: string): boolean => {
  return APP_CONFIG.ADMIN_EMAILS.includes(email);
};

// Helper para obter configuração do Instagram
export const getInstagramConfig = () => {
  return {
    appId: APP_CONFIG.INSTAGRAM.APP_ID,
    redirectUri: APP_CONFIG.INSTAGRAM.REDIRECT_URI,
    scopes: [
      'instagram_graph_user_profile',
      'instagram_graph_user_media',
      'instagram_basic',
      'pages_show_list'
    ].join(',')
  };
};
