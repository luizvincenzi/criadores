import { NextRequest, NextResponse } from 'next/server';

// Simulação de rate limiting (em produção, usar Redis/Upstash)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

// Configurações de rate limiting
const RATE_LIMIT_CONFIG = {
  login: {
    maxRequests: process.env.NODE_ENV === 'development' ? 50 : 5,
    windowMs: process.env.NODE_ENV === 'development' ? 60 * 1000 : 15 * 60 * 1000
  }, // Dev: 50/min, Prod: 5/15min
  api: {
    maxRequests: process.env.NODE_ENV === 'development' ? 1000 : 100,
    windowMs: 60 * 1000
  }, // Dev: 1000/min, Prod: 100/min
};

function getRateLimitKey(ip: string, path: string): string {
  return `${ip}:${path}`;
}

function checkRateLimit(key: string, config: { maxRequests: number; windowMs: number }): boolean {
  // Em desenvolvimento, ser mais permissivo
  if (process.env.NODE_ENV === 'development') {
    // Limpar registros antigos periodicamente
    const now = Date.now();
    for (const [k, record] of rateLimitMap.entries()) {
      if (now > record.resetTime) {
        rateLimitMap.delete(k);
      }
    }
  }

  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    // Primeira requisição ou janela expirou
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + config.windowMs
    });
    return true;
  }

  if (record.count >= config.maxRequests) {
    return false; // Rate limit excedido
  }

  // Incrementa contador
  record.count++;
  rateLimitMap.set(key, record);
  return true;
}

function getClientIP(request: NextRequest): string {
  // Tenta obter IP real considerando proxies
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIP) {
    return realIP;
  }
  
  return request.ip || '127.0.0.1';
}

function addSecurityHeaders(response: NextResponse): NextResponse {
  // Headers de segurança
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // CSP básico (ajustar conforme necessário)
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline'", // Next.js precisa de unsafe-eval
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Permitir Google Fonts
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com", // Permitir fontes do Google
    "connect-src 'self' https://ecbhcalmulaiszslwhqz.supabase.co https://sheets.googleapis.com https://www.googleapis.com",
    "frame-ancestors 'none'"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  return response;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);

  // Rate limiting para login
  if (pathname === '/api/auth/login') {
    const key = getRateLimitKey(ip, 'login');
    
    if (!checkRateLimit(key, RATE_LIMIT_CONFIG.login)) {
      return NextResponse.json(
        { 
          error: 'Muitas tentativas de login. Tente novamente em 15 minutos.',
          retryAfter: 15 * 60 // segundos
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '900', // 15 minutos em segundos
            'X-RateLimit-Limit': RATE_LIMIT_CONFIG.login.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil((Date.now() + RATE_LIMIT_CONFIG.login.windowMs) / 1000).toString()
          }
        }
      );
    }
  }

  // Rate limiting geral para APIs
  if (pathname.startsWith('/api/') && pathname !== '/api/auth/login') {
    const key = getRateLimitKey(ip, 'api');
    
    if (!checkRateLimit(key, RATE_LIMIT_CONFIG.api)) {
      return NextResponse.json(
        { 
          error: 'Muitas requisições. Tente novamente em 1 minuto.',
          retryAfter: 60
        },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': RATE_LIMIT_CONFIG.api.maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': Math.ceil((Date.now() + RATE_LIMIT_CONFIG.api.windowMs) / 1000).toString()
          }
        }
      );
    }
  }

  // Forçar HTTPS em produção
  if (process.env.NODE_ENV === 'production' && 
      request.nextUrl.protocol === 'http:' && 
      !request.nextUrl.hostname.includes('localhost')) {
    return NextResponse.redirect(
      `https://${request.nextUrl.host}${request.nextUrl.pathname}${request.nextUrl.search}`
    );
  }

  // Bloquear acesso direto a arquivos sensíveis
  const blockedPaths = ['.env', '.env.local', '.env.production', 'package.json', 'package-lock.json'];
  if (blockedPaths.some(path => pathname.includes(path))) {
    return NextResponse.json(
      { error: 'Acesso negado' },
      { status: 403 }
    );
  }

  // Continuar com a requisição e adicionar headers de segurança
  const response = NextResponse.next();
  return addSecurityHeaders(response);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};

// Função para limpar rate limit cache periodicamente (executar em background)
export function cleanupRateLimit() {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Executar limpeza a cada 5 minutos
if (typeof window === 'undefined') {
  setInterval(cleanupRateLimit, 5 * 60 * 1000);
}
