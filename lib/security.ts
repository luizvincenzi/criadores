/**
 * Configurações e utilitários de segurança
 */

// Configurações de segurança
export const SECURITY_CONFIG = {
  // Rate limiting
  RATE_LIMIT: {
    LOGIN: {
      MAX_ATTEMPTS: 5,
      WINDOW_MS: 15 * 60 * 1000, // 15 minutos
      BLOCK_DURATION: 15 * 60 * 1000 // 15 minutos
    },
    API: {
      MAX_REQUESTS: 100,
      WINDOW_MS: 60 * 1000 // 1 minuto
    }
  },
  
  // Configurações de senha
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    BCRYPT_ROUNDS: 12
  },
  
  // Configurações de sessão
  SESSION: {
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 horas
    REFRESH_THRESHOLD: 2 * 60 * 60 * 1000, // 2 horas
    INACTIVITY_TIMEOUT: 30 * 60 * 1000 // 30 minutos
  },
  
  // Headers de segurança
  SECURITY_HEADERS: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
  }
};

// Lista de IPs bloqueados (em produção, usar banco de dados)
const BLOCKED_IPS = new Set<string>();

// Lista de user agents suspeitos
const SUSPICIOUS_USER_AGENTS = [
  'sqlmap',
  'nikto',
  'nmap',
  'masscan',
  'nessus',
  'openvas',
  'burp',
  'w3af',
  'acunetix'
];

/**
 * Verifica se um IP está bloqueado
 */
export function isIPBlocked(ip: string): boolean {
  return BLOCKED_IPS.has(ip);
}

/**
 * Bloqueia um IP
 */
export function blockIP(ip: string, reason?: string): void {
  BLOCKED_IPS.add(ip);
  console.warn(`🚫 IP bloqueado: ${ip}${reason ? ` - Motivo: ${reason}` : ''}`);
}

/**
 * Desbloqueia um IP
 */
export function unblockIP(ip: string): void {
  BLOCKED_IPS.delete(ip);
  console.info(`✅ IP desbloqueado: ${ip}`);
}

/**
 * Verifica se o User-Agent é suspeito
 */
export function isSuspiciousUserAgent(userAgent: string): boolean {
  if (!userAgent) return true; // User-Agent vazio é suspeito
  
  const lowerUA = userAgent.toLowerCase();
  return SUSPICIOUS_USER_AGENTS.some(suspicious => lowerUA.includes(suspicious));
}

/**
 * Sanitiza entrada de dados
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove < e >
    .replace(/javascript:/gi, '') // Remove javascript:
    .replace(/on\w+=/gi, '') // Remove event handlers (onclick, onload, etc)
    .replace(/data:/gi, '') // Remove data: URLs
    .replace(/vbscript:/gi, '') // Remove vbscript:
    .substring(0, 1000); // Limita tamanho
}

/**
 * Valida se uma string contém apenas caracteres seguros
 */
export function isValidInput(input: string, allowedChars?: RegExp): boolean {
  if (!input || typeof input !== 'string') return false;
  
  // Padrão padrão: letras, números, espaços e alguns caracteres especiais
  const defaultPattern = /^[a-zA-Z0-9\s\-_@.]+$/;
  const pattern = allowedChars || defaultPattern;
  
  return pattern.test(input) && input.length <= 1000;
}

/**
 * Gera um token seguro
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Verifica se uma requisição é suspeita
 */
export function isRequestSuspicious(request: {
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  headers?: Record<string, string>;
}): { suspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];
  
  // Verificar IP bloqueado
  if (request.ip && isIPBlocked(request.ip)) {
    reasons.push('IP bloqueado');
  }
  
  // Verificar User-Agent suspeito
  if (request.userAgent && isSuspiciousUserAgent(request.userAgent)) {
    reasons.push('User-Agent suspeito');
  }
  
  // Verificar métodos HTTP suspeitos
  const suspiciousMethods = ['TRACE', 'TRACK', 'DEBUG'];
  if (request.method && suspiciousMethods.includes(request.method.toUpperCase())) {
    reasons.push('Método HTTP suspeito');
  }
  
  // Verificar tentativas de path traversal
  if (request.url && (request.url.includes('../') || request.url.includes('..\\') || request.url.includes('%2e%2e'))) {
    reasons.push('Tentativa de path traversal');
  }
  
  // Verificar headers suspeitos
  if (request.headers) {
    const suspiciousHeaders = ['x-forwarded-host', 'x-original-url', 'x-rewrite-url'];
    for (const header of suspiciousHeaders) {
      if (request.headers[header]) {
        reasons.push(`Header suspeito: ${header}`);
      }
    }
  }
  
  return {
    suspicious: reasons.length > 0,
    reasons
  };
}

/**
 * Log de evento de segurança
 */
export function logSecurityEvent(event: {
  type: 'blocked_ip' | 'suspicious_request' | 'failed_login' | 'rate_limit' | 'unauthorized_access';
  ip?: string;
  userAgent?: string;
  details?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    type: event.type,
    severity: event.severity,
    ip: event.ip,
    userAgent: event.userAgent,
    details: event.details
  };
  
  // Em produção, enviar para sistema de monitoramento
  console.warn(`🔒 SECURITY EVENT [${event.severity.toUpperCase()}]:`, logEntry);
  
  // Se for crítico, bloquear IP automaticamente
  if (event.severity === 'critical' && event.ip) {
    blockIP(event.ip, `Evento crítico: ${event.type}`);
  }
}

/**
 * Middleware de segurança para APIs
 */
export function securityMiddleware(request: {
  ip?: string;
  userAgent?: string;
  method?: string;
  url?: string;
  headers?: Record<string, string>;
}): { allowed: boolean; reason?: string } {
  // Verificar se a requisição é suspeita
  const suspiciousCheck = isRequestSuspicious(request);
  
  if (suspiciousCheck.suspicious) {
    logSecurityEvent({
      type: 'suspicious_request',
      ip: request.ip,
      userAgent: request.userAgent,
      details: suspiciousCheck.reasons.join(', '),
      severity: 'high'
    });
    
    return {
      allowed: false,
      reason: 'Requisição suspeita detectada'
    };
  }
  
  return { allowed: true };
}

/**
 * Valida ambiente de produção
 */
export function validateProductionSecurity(): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  
  // Verificar variáveis de ambiente críticas
  if (!process.env.GOOGLE_PRIVATE_KEY) {
    issues.push('GOOGLE_PRIVATE_KEY não configurada');
  }
  
  if (!process.env.GOOGLE_CLIENT_EMAIL) {
    issues.push('GOOGLE_CLIENT_EMAIL não configurada');
  }
  
  if (!process.env.GOOGLE_SPREADSHEET_ID) {
    issues.push('GOOGLE_SPREADSHEET_ID não configurada');
  }
  
  // Verificar se estamos em HTTPS em produção
  if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL?.startsWith('https://')) {
    issues.push('HTTPS não configurado em produção');
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
}
