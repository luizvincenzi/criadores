import { NextRequest, NextResponse } from 'next/server';
import { UserRole } from '@/lib/auth-types';

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

// 🔒 FUNÇÃO PARA EXTRAIR DADOS DO USUÁRIO DO TOKEN
async function getUserFromRequest(request: NextRequest) {
  try {
    // Tentar obter token do cookie ou header
    const token = request.cookies.get('auth-token')?.value ||
                  request.headers.get('authorization')?.replace('Bearer ', '');

    if (!token) return null;

    // Em produção, validar JWT aqui
    // Por enquanto, simular dados do usuário baseado no token
    // TODO: Implementar validação JWT real

    return null; // Retornar dados do usuário após validação
  } catch (error) {
    console.error('🔒 Erro ao extrair usuário:', error);
    return null;
  }
}

// 🔒 FUNÇÃO PARA VALIDAR ACESSO POR BUSINESS_ID
function validateBusinessAccess(userRole: UserRole, userBusinessId: string | null, requestedBusinessId: string | null): boolean {
  // Admins podem acessar qualquer business
  if (userRole === UserRole.ADMIN) {
    return true;
  }

  // Empresas e criadores só podem acessar seu próprio business
  if (userRole === UserRole.BUSINESS || userRole === UserRole.CREATOR) {
    return userBusinessId === requestedBusinessId;
  }

  return false;
}

// 🔒 FUNÇÃO PARA EXTRAIR BUSINESS_ID DA URL OU HEADERS
function extractBusinessIdFromRequest(request: NextRequest): string | null {
  // 1. Tentar obter do header (APIs)
  const headerBusinessId = request.headers.get('x-business-id') ||
                           request.headers.get('x-client-business-id');
  if (headerBusinessId) return headerBusinessId;

  // 2. Tentar obter da URL (rotas com business_id)
  const url = new URL(request.url);
  const businessIdParam = url.searchParams.get('business_id');
  if (businessIdParam) return businessIdParam;

  // 3. Tentar obter do path (rotas como /business/[id])
  const pathSegments = url.pathname.split('/');
  const businessIndex = pathSegments.indexOf('business');
  if (businessIndex !== -1 && pathSegments[businessIndex + 1]) {
    return pathSegments[businessIndex + 1];
  }

  return null;
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const ip = getClientIP(request);

  // 🎯 MODO CLIENTE: Sempre ativo na plataforma crIAdores cliente
  const isClientMode = true;
  const clientBusinessId = process.env.NEXT_PUBLIC_CLIENT_BUSINESS_ID;

  // 👑 USUÁRIOS ADMINISTRADORES: Acesso total ao sistema
  const userEmail = request.headers.get('x-user-email');
  const isAdmin = ['luizvincenzi@gmail.com'].includes(userEmail || '');

  if (isClientMode && clientBusinessId) {
    // 🔒 HEADERS DE SEGURANÇA CRÍTICOS
    request.headers.set('x-client-business-id', clientBusinessId);
    request.headers.set('x-client-mode', 'true');
    request.headers.set('x-criadores-platform', 'client');

    console.log('🔒 [MIDDLEWARE] Headers de segurança aplicados:', {
      businessId: clientBusinessId,
      mode: 'client',
      path: pathname
    });
  }

  // 🔒 ROTAS PROTEGIDAS DA PLATAFORMA crIAdores CLIENTE
  const protectedRoutes = ['/dashboard', '/eventos', '/campanhas', '/criadores', '/tarefas'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  // 🔒 APIs PROTEGIDAS QUE REQUEREM BUSINESS_ID
  const protectedApiRoutes = ['/api/client/'];
  const isProtectedApiRoute = protectedApiRoutes.some(route => pathname.startsWith(route));

  // 🔒 VALIDAÇÃO ADICIONAL PARA APIs CLIENTE
  if (isProtectedApiRoute) {
    const businessIdFromRequest = extractBusinessIdFromRequest(request);

    // 👑 ADMINISTRADORES: Bypass da validação de Business ID
    if (isAdmin) {
      console.log('👑 [ADMIN] Acesso administrativo autorizado:', {
        email: userEmail,
        path: pathname,
        businessId: businessIdFromRequest || 'ALL_ACCESS'
      });
    } else if (!businessIdFromRequest && !clientBusinessId) {
      console.error('❌ [SECURITY] API chamada sem business_id:', pathname);
      return NextResponse.json({
        success: false,
        error: 'Business ID obrigatório para esta operação'
      }, { status: 403 });
    }

    // Validar se business_id da request bate com o configurado (exceto para admins)
    if (!isAdmin && businessIdFromRequest && clientBusinessId && businessIdFromRequest !== clientBusinessId) {
      console.error('❌ [SECURITY] Business ID inválido na API:', {
        requested: businessIdFromRequest,
        expected: clientBusinessId,
        path: pathname,
        userEmail: userEmail
      });
      return NextResponse.json({
        success: false,
        error: 'Acesso não autorizado para esta empresa'
      }, { status: 403 });
    }

    console.log('✅ [SECURITY] API autorizada:', {
      path: pathname,
      businessId: businessIdFromRequest || clientBusinessId
    });
  }

  if (isProtectedRoute) {
    // Temporariamente desabilitar verificação do middleware para debug
    console.log('🔒 Middleware: Rota protegida detectada, mas verificação desabilitada para debug:', pathname);
    // TODO: Reabilitar após corrigir o problema de persistência
    /*
    const authCookie = request.cookies.get('auth-storage');

    if (!authCookie) {
      console.log('🔒 Middleware: Rota protegida sem autenticação, redirecionando para login');
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      const authData = JSON.parse(authCookie.value);
      if (!authData.state?.isAuthenticated || !authData.state?.user) {
        console.log('🔒 Middleware: Dados de autenticação inválidos, redirecionando para login');
        return NextResponse.redirect(new URL('/login', request.url));
      }
    } catch (error) {
      console.log('🔒 Middleware: Erro ao parsear dados de autenticação, redirecionando para login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    */
  }

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

  // 🔒 ADICIONAR BUSINESS ID AOS HEADERS DA RESPONSE PARA O FRONTEND
  if (isClientMode && clientBusinessId) {
    response.headers.set('x-client-business-id', clientBusinessId);
    response.headers.set('x-client-mode', 'true');

    console.log('🔒 [MIDDLEWARE] Headers de segurança aplicados:', {
      businessId: clientBusinessId,
      mode: 'client',
      path: pathname
    });
  }

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
