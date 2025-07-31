// 🎯 CONFIGURAÇÃO DA PLATAFORMA crIAdores CLIENTE
// ================================================

export const CLIENT_CONFIG = {
  // 🏢 Informações da Plataforma
  PLATFORM: {
    NAME: 'crIAdores',
    DESCRIPTION: 'Plataforma de gestão de campanhas com influenciadores',
    VERSION: '1.0.0',
    MODE: 'client' as const
  },

  // 🔒 Configurações de Segurança
  SECURITY: {
    BUSINESS_ID: process.env.NEXT_PUBLIC_CLIENT_BUSINESS_ID,
    ORG_ID: '00000000-0000-0000-0000-000000000001',
    REQUIRE_BUSINESS_VALIDATION: true,
    ENABLE_AUDIT_LOGS: true,
    SESSION_TIMEOUT_HOURS: 24
  },

  // 🌐 URLs e Domínios
  URLS: {
    BASE: process.env.NEXT_PUBLIC_BASE_URL || 'https://criadores.app',
    API_PREFIX: '/api/client',
    LOGIN_REDIRECT: '/dashboard',
    LOGOUT_REDIRECT: '/'
  },

  // 🎨 Branding
  BRANDING: {
    LOGO_URL: '/logo-criadores.svg',
    PRIMARY_COLOR: '#2563eb', // blue-600
    SECONDARY_COLOR: '#7c3aed', // purple-600
    FAVICON: '/favicon-criadores.ico'
  },

  // 📱 Funcionalidades Habilitadas
  FEATURES: {
    EVENTS_MANAGEMENT: true,
    CAMPAIGNS_MANAGEMENT: true,
    CREATORS_MANAGEMENT: true,
    TASKS_MANAGEMENT: true,
    ANALYTICS: true,
    LANDING_PAGES: true,
    NOTIFICATIONS: false, // Desabilitado na v1
    INTEGRATIONS: false   // Desabilitado na v1
  },

  // 🔐 Tipos de Usuário Permitidos
  ALLOWED_USER_ROLES: ['business', 'creator'] as const,

  // 📊 Limites da Plataforma
  LIMITS: {
    MAX_EVENTS_PER_BUSINESS: 100,
    MAX_CAMPAIGNS_PER_EVENT: 50,
    MAX_CREATORS_PER_CAMPAIGN: 20,
    MAX_TASKS_PER_CAMPAIGN: 100,
    MAX_FILE_SIZE_MB: 10
  },

  // 🗄️ Configurações do Banco
  DATABASE: {
    DEFAULT_ORG_ID: '00000000-0000-0000-0000-000000000001',
    ENABLE_RLS: true,
    AUDIT_TABLE: 'audit_logs'
  }
} as const;

// 🔒 Função para validar configuração
export function validateClientConfig(): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validar Business ID
  if (!CLIENT_CONFIG.SECURITY.BUSINESS_ID) {
    errors.push('NEXT_PUBLIC_CLIENT_BUSINESS_ID não configurado');
  }

  // Validar URL base
  if (!CLIENT_CONFIG.URLS.BASE) {
    errors.push('NEXT_PUBLIC_BASE_URL não configurado');
  }

  // Validar se está em modo cliente
  if (process.env.NEXT_PUBLIC_CLIENT_MODE !== 'true') {
    errors.push('NEXT_PUBLIC_CLIENT_MODE deve ser "true"');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// 🎯 Função para obter configuração específica
export function getClientBusinessId(): string {
  const businessId = CLIENT_CONFIG.SECURITY.BUSINESS_ID;
  if (!businessId) {
    throw new Error('Business ID não configurado para o cliente');
  }
  return businessId;
}

// 🔍 Função para verificar se funcionalidade está habilitada
export function isFeatureEnabled(feature: keyof typeof CLIENT_CONFIG.FEATURES): boolean {
  return CLIENT_CONFIG.FEATURES[feature] === true;
}

// 🎨 Função para obter configurações de branding
export function getBrandingConfig() {
  return CLIENT_CONFIG.BRANDING;
}

// 📊 Função para obter limites da plataforma
export function getPlatformLimits() {
  return CLIENT_CONFIG.LIMITS;
}

// 🌐 Função para construir URLs da API
export function buildApiUrl(endpoint: string): string {
  const baseUrl = CLIENT_CONFIG.URLS.BASE;
  const apiPrefix = CLIENT_CONFIG.URLS.API_PREFIX;
  
  // Remover barra inicial do endpoint se existir
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  
  return `${baseUrl}${apiPrefix}/${cleanEndpoint}`;
}

// 🔒 Função para obter headers de segurança padrão
export function getSecurityHeaders(): Record<string, string> {
  return {
    'x-client-business-id': getClientBusinessId(),
    'x-client-mode': 'true',
    'x-criadores-platform': 'client',
    'x-platform-version': CLIENT_CONFIG.PLATFORM.VERSION
  };
}

// 📝 Função para log de auditoria (se habilitado)
export function logAuditEvent(event: {
  action: string;
  resource: string;
  resourceId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}) {
  if (!CLIENT_CONFIG.SECURITY.ENABLE_AUDIT_LOGS) {
    return;
  }

  console.log('📝 [AUDIT]', {
    timestamp: new Date().toISOString(),
    businessId: CLIENT_CONFIG.SECURITY.BUSINESS_ID,
    platform: 'criadores-client',
    ...event
  });

  // Em produção, enviar para sistema de auditoria
  // TODO: Implementar envio para API de auditoria
}

// 🚀 Função para inicializar configuração
export function initializeClientConfig() {
  const validation = validateClientConfig();
  
  if (!validation.isValid) {
    console.error('❌ [CONFIG] Configuração inválida:', validation.errors);
    throw new Error(`Configuração inválida: ${validation.errors.join(', ')}`);
  }

  console.log('✅ [CONFIG] Plataforma crIAdores Cliente inicializada:', {
    businessId: CLIENT_CONFIG.SECURITY.BUSINESS_ID,
    mode: CLIENT_CONFIG.PLATFORM.MODE,
    features: Object.entries(CLIENT_CONFIG.FEATURES)
      .filter(([_, enabled]) => enabled)
      .map(([feature]) => feature)
  });

  return CLIENT_CONFIG;
}
