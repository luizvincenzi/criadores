# 🔒 PLANO DE IMPLEMENTAÇÃO DE SEGURANÇA - CRM CRIADORES

## 🎯 OBJETIVO
Implementar correções de segurança críticas mantendo 100% da funcionalidade existente.

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### FASE 1: CORREÇÕES CRÍTICAS (HOJE)

#### ✅ 1. Regenerar Chaves Google Cloud
- [ ] Acessar [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Ir para "IAM & Admin" > "Service Accounts"
- [ ] Encontrar `crm-criadores@crmcriadores.iam.gserviceaccount.com`
- [ ] Deletar chave atual (`a23a43d57506d684472491e9848273f0f295fc5d`)
- [ ] Gerar nova chave JSON
- [ ] Atualizar variáveis no Vercel

#### ✅ 2. Implementar Hash de Senhas
```bash
# Instalar dependências
npm install bcryptjs @types/bcryptjs

# Criar script de migração de senhas
npm run migrate-passwords
```

#### ✅ 3. Limpar Credenciais do Repositório
```bash
# Adicionar ao .gitignore
echo ".env.local" >> .gitignore

# Remover do histórico (CUIDADO!)
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch .env.local' \
--prune-empty --tag-name-filter cat -- --all
```

### FASE 2: MELHORIAS DE SEGURANÇA (SEMANA 1)

#### ✅ 4. Rate Limiting
```bash
npm install express-rate-limit
```

#### ✅ 5. Validação de Input
```bash
npm install zod
```

#### ✅ 6. Headers de Segurança
```bash
npm install helmet
```

### FASE 3: MONITORAMENTO (SEMANA 2)

#### ✅ 7. Auditoria de Segurança
- [ ] Implementar logs de tentativas de login
- [ ] Monitorar acessos suspeitos
- [ ] Alertas de segurança

## 🔧 IMPLEMENTAÇÃO TÉCNICA

### 1. Sistema de Hash de Senhas

```typescript
// lib/auth.ts
import bcrypt from 'bcryptjs';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
```

### 2. Middleware de Rate Limiting

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'),
});

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/api/auth/login')) {
    const ip = request.ip ?? '127.0.0.1';
    const { success } = await ratelimit.limit(ip);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Muitas tentativas. Tente novamente em 15 minutos.' },
        { status: 429 }
      );
    }
  }
  
  return NextResponse.next();
}
```

### 3. Validação de Input

```typescript
// lib/validation.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Email inválido').max(255),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres').max(128)
});

export const businessSchema = z.object({
  nome: z.string().min(1).max(255),
  categoria: z.string().min(1).max(100),
  cidade: z.string().min(1).max(100)
});
```

### 4. Headers de Segurança

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
          }
        ]
      }
    ];
  }
};
```

## 🧪 TESTES DE SEGURANÇA

### 1. Teste de Hash de Senhas
```typescript
// __tests__/auth.test.ts
import { hashPassword, verifyPassword } from '@/lib/auth';

test('deve fazer hash da senha corretamente', async () => {
  const password = 'minhasenha123';
  const hashed = await hashPassword(password);
  
  expect(hashed).not.toBe(password);
  expect(await verifyPassword(password, hashed)).toBe(true);
  expect(await verifyPassword('senhaerrada', hashed)).toBe(false);
});
```

### 2. Teste de Rate Limiting
```typescript
// __tests__/ratelimit.test.ts
test('deve bloquear após 5 tentativas', async () => {
  // Simular 6 tentativas de login
  for (let i = 0; i < 6; i++) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'test@test.com', password: 'wrong' })
    });
    
    if (i < 5) {
      expect(response.status).toBe(401); // Unauthorized
    } else {
      expect(response.status).toBe(429); // Too Many Requests
    }
  }
});
```

## 📊 MONITORAMENTO PÓS-IMPLEMENTAÇÃO

### Métricas a Acompanhar:
1. **Tentativas de login falhadas** (> 10/dia = suspeito)
2. **Acessos de IPs desconhecidos**
3. **Tempo de resposta das APIs** (não deve aumentar > 20%)
4. **Erros de autenticação** (logs detalhados)

### Alertas Automáticos:
- Email para admin em caso de > 20 tentativas de login falhadas/hora
- Slack notification para acessos de novos países
- Dashboard de segurança com métricas em tempo real

## 🚀 CRONOGRAMA DE IMPLEMENTAÇÃO

| Fase | Duração | Responsável | Status |
|------|---------|-------------|--------|
| Regenerar Chaves | 2 horas | DevOps | ⏳ |
| Hash de Senhas | 1 dia | Backend | ⏳ |
| Rate Limiting | 1 dia | Backend | ⏳ |
| Validação Input | 2 dias | Full Stack | ⏳ |
| Headers Segurança | 1 dia | DevOps | ⏳ |
| Testes | 2 dias | QA | ⏳ |
| Monitoramento | 3 dias | DevOps | ⏳ |

**TOTAL: 10 dias úteis**

## ✅ VALIDAÇÃO FINAL

Antes de considerar concluído:
- [ ] Todos os testes de segurança passando
- [ ] Funcionalidade existente 100% preservada
- [ ] Performance não degradada (< 20% impacto)
- [ ] Documentação atualizada
- [ ] Equipe treinada nas novas práticas

## 🆘 CONTATOS DE EMERGÊNCIA

- **Security Lead:** [Seu contato]
- **DevOps:** [Contato DevOps]
- **Google Cloud Support:** [Caso necessário]
