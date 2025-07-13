/**
 * Testes de segurança para o CRM Criadores
 */

import { hashPassword, verifyPassword, validatePasswordStrength } from '@/lib/auth';
import { validateData, loginSchema, businessSchema } from '@/lib/validation';
import { 
  sanitizeInput, 
  isValidInput, 
  isSuspiciousUserAgent, 
  isRequestSuspicious,
  generateSecureToken 
} from '@/lib/security';

describe('Segurança - Hash de Senhas', () => {
  test('deve gerar hash diferente da senha original', async () => {
    const password = 'minhasenha123';
    const hashed = await hashPassword(password);
    
    expect(hashed).not.toBe(password);
    expect(hashed).toMatch(/^\$2[ab]\$/); // Formato bcrypt
    expect(hashed.length).toBeGreaterThan(50);
  });

  test('deve verificar senha correta', async () => {
    const password = 'senhaSegura123!';
    const hashed = await hashPassword(password);
    
    const isValid = await verifyPassword(password, hashed);
    expect(isValid).toBe(true);
  });

  test('deve rejeitar senha incorreta', async () => {
    const password = 'senhaSegura123!';
    const wrongPassword = 'senhaErrada123!';
    const hashed = await hashPassword(password);
    
    const isValid = await verifyPassword(wrongPassword, hashed);
    expect(isValid).toBe(false);
  });

  test('deve validar força da senha', () => {
    // Senha fraca
    const weakPassword = '123';
    const weakResult = validatePasswordStrength(weakPassword);
    expect(weakResult.isValid).toBe(false);
    expect(weakResult.errors.length).toBeGreaterThan(0);

    // Senha forte
    const strongPassword = 'MinhaSenh@123!';
    const strongResult = validatePasswordStrength(strongPassword);
    expect(strongResult.isValid).toBe(true);
    expect(strongResult.errors.length).toBe(0);
  });
});

describe('Segurança - Validação de Input', () => {
  test('deve validar dados de login corretos', () => {
    const validLogin = {
      email: 'usuario@exemplo.com',
      password: 'senhaSegura123!'
    };

    const result = validateData(loginSchema, validLogin);
    expect(result.success).toBe(true);
    expect(result.data).toEqual({
      email: 'usuario@exemplo.com',
      password: 'senhaSegura123!'
    });
  });

  test('deve rejeitar email inválido', () => {
    const invalidLogin = {
      email: 'email-invalido',
      password: 'senhaSegura123!'
    };

    const result = validateData(loginSchema, invalidLogin);
    expect(result.success).toBe(false);
    expect(result.errors).toContain('email: Email inválido');
  });

  test('deve rejeitar senha muito curta', () => {
    const invalidLogin = {
      email: 'usuario@exemplo.com',
      password: '123'
    };

    const result = validateData(loginSchema, invalidLogin);
    expect(result.success).toBe(false);
    expect(result.errors).toContain('password: Senha deve ter pelo menos 8 caracteres');
  });

  test('deve validar dados de business', () => {
    const validBusiness = {
      nome: 'Empresa Teste',
      categoria: 'Tecnologia',
      cidade: 'São Paulo',
      whatsapp: '+5511999999999'
    };

    const result = validateData(businessSchema, validBusiness);
    expect(result.success).toBe(true);
  });

  test('deve rejeitar WhatsApp inválido', () => {
    const invalidBusiness = {
      nome: 'Empresa Teste',
      categoria: 'Tecnologia',
      cidade: 'São Paulo',
      whatsapp: 'whatsapp-invalido'
    };

    const result = validateData(businessSchema, invalidBusiness);
    expect(result.success).toBe(false);
    expect(result.errors?.some(error => error.includes('WhatsApp inválido'))).toBe(true);
  });
});

describe('Segurança - Sanitização', () => {
  test('deve sanitizar input malicioso', () => {
    const maliciousInput = '<script>alert("xss")</script>';
    const sanitized = sanitizeInput(maliciousInput);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('</script>');
  });

  test('deve remover javascript: URLs', () => {
    const maliciousInput = 'javascript:alert("xss")';
    const sanitized = sanitizeInput(maliciousInput);
    
    expect(sanitized).not.toContain('javascript:');
  });

  test('deve remover event handlers', () => {
    const maliciousInput = 'onclick=alert("xss")';
    const sanitized = sanitizeInput(maliciousInput);
    
    expect(sanitized).not.toContain('onclick=');
  });

  test('deve validar input seguro', () => {
    const safeInput = 'João Silva';
    expect(isValidInput(safeInput)).toBe(true);

    const unsafeInput = '<script>alert("xss")</script>';
    expect(isValidInput(unsafeInput)).toBe(false);
  });
});

describe('Segurança - Detecção de Ameaças', () => {
  test('deve detectar User-Agent suspeito', () => {
    const suspiciousUA = 'sqlmap/1.0';
    expect(isSuspiciousUserAgent(suspiciousUA)).toBe(true);

    const normalUA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';
    expect(isSuspiciousUserAgent(normalUA)).toBe(false);

    // User-Agent vazio também é suspeito
    expect(isSuspiciousUserAgent('')).toBe(true);
  });

  test('deve detectar tentativa de path traversal', () => {
    const maliciousRequest = {
      url: '/api/data?file=../../../etc/passwd',
      method: 'GET'
    };

    const result = isRequestSuspicious(maliciousRequest);
    expect(result.suspicious).toBe(true);
    expect(result.reasons).toContain('Tentativa de path traversal');
  });

  test('deve detectar método HTTP suspeito', () => {
    const suspiciousRequest = {
      method: 'TRACE',
      url: '/api/test'
    };

    const result = isRequestSuspicious(suspiciousRequest);
    expect(result.suspicious).toBe(true);
    expect(result.reasons).toContain('Método HTTP suspeito');
  });

  test('deve permitir requisição normal', () => {
    const normalRequest = {
      method: 'POST',
      url: '/api/auth/login',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      ip: '192.168.1.1'
    };

    const result = isRequestSuspicious(normalRequest);
    expect(result.suspicious).toBe(false);
    expect(result.reasons.length).toBe(0);
  });
});

describe('Segurança - Utilitários', () => {
  test('deve gerar token seguro', () => {
    const token1 = generateSecureToken();
    const token2 = generateSecureToken();
    
    expect(token1).not.toBe(token2); // Tokens devem ser únicos
    expect(token1.length).toBe(32); // Tamanho padrão
    expect(/^[A-Za-z0-9]+$/.test(token1)).toBe(true); // Apenas alfanumérico
  });

  test('deve gerar token com tamanho customizado', () => {
    const token = generateSecureToken(16);
    expect(token.length).toBe(16);
  });
});

describe('Segurança - Rate Limiting (Simulação)', () => {
  test('deve simular rate limiting', () => {
    // Este teste simula o comportamento do rate limiting
    // Em um ambiente real, testaria com requisições HTTP reais
    
    const rateLimitMap = new Map();
    const maxRequests = 5;
    const windowMs = 15 * 60 * 1000; // 15 minutos
    
    function checkRateLimit(ip: string): boolean {
      const now = Date.now();
      const key = `${ip}:login`;
      const record = rateLimitMap.get(key);
      
      if (!record || now > record.resetTime) {
        rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
        return true;
      }
      
      if (record.count >= maxRequests) {
        return false;
      }
      
      record.count++;
      return true;
    }
    
    const testIP = '192.168.1.100';
    
    // Primeiras 5 tentativas devem passar
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(testIP)).toBe(true);
    }
    
    // 6ª tentativa deve ser bloqueada
    expect(checkRateLimit(testIP)).toBe(false);
  });
});

describe('Segurança - Integração', () => {
  test('deve validar fluxo completo de login seguro', async () => {
    // 1. Validar input
    const loginData = {
      email: 'admin@exemplo.com',
      password: 'MinhaSenh@123!'
    };
    
    const validation = validateData(loginSchema, loginData);
    expect(validation.success).toBe(true);
    
    // 2. Hash da senha
    const hashedPassword = await hashPassword(loginData.password);
    expect(hashedPassword).toMatch(/^\$2[ab]\$/);
    
    // 3. Verificar senha
    const isValidPassword = await verifyPassword(loginData.password, hashedPassword);
    expect(isValidPassword).toBe(true);
    
    // 4. Verificar força da senha
    const passwordStrength = validatePasswordStrength(loginData.password);
    expect(passwordStrength.isValid).toBe(true);
  });
});
