# 🎯 Implementação: Separação de Usuários (users vs platform_users)

## ✅ Decisão Tomada

**Manter tabela `users` para funcionários internos (CRM)**  
**Criar nova tabela `platform_users` para usuários externos (criadores.app)**

---

## 📊 Arquitetura Final

```
┌─────────────────────────────────────────┐
│         ORGANIZATIONS                    │
│  (Multi-tenancy)                        │
└─────────────────────────────────────────┘
           │
           ├─── users (CRM - criadores.digital)
           │    • admin
           │    • manager
           │    • user
           │    • viewer
           │
           └─── platform_users (criadores.app)
                • creator
                • marketing_strategist
                • business_owner
```

---

## 📁 Arquivos Criados

### 1. Migration SQL
**Arquivo:** `supabase/migrations/029_create_platform_users.sql`

**Conteúdo:**
- ✅ Cria ENUM `platform_user_role`
- ✅ Cria tabela `platform_users`
- ✅ Suporte a múltiplos roles (array)
- ✅ Índices para performance
- ✅ Triggers para updated_at
- ✅ Funções SQL para verificar roles
- ✅ Função para combinar permissões
- ✅ View `v_platform_users_with_details`
- ✅ Constraints de validação

### 2. TypeScript Types
**Arquivo:** `lib/platform-auth-types.ts`

**Exports:**
- `PlatformUserRole` enum
- `SubscriptionPlan` enum
- `PlatformUser` interface
- `PlatformPermissions` interface
- `PlatformUserWithDetails` interface
- Helper functions:
  - `hasRole()`
  - `hasAnyRole()`
  - `hasAllRoles()`
  - `getDashboardRoute()`
  - `canAccessRoute()`
  - `getCombinedPermissions()`
  - `hasPermission()`
  - `hasActiveSubscription()`
  - `formatRoleName()`
  - `getRoleIcon()`

### 3. Script de Criação
**Arquivo:** `scripts/create-platform-users.ts`

**Funcionalidade:**
- Cria Pietra Mantovani (creator + marketing_strategist)
- Cria Marilia (marketing_strategist + creator)
- Busca creator_id automaticamente
- Atualiza se usuário já existe

### 4. Documentação
**Arquivo:** `docs/ANALISE_SEPARACAO_USUARIOS.md`

**Conteúdo:**
- Análise completa da situação
- Comparação de opções
- Recomendação final
- Plano de implementação

---

## 🚀 Próximos Passos

### Passo 1: Executar Migration no Supabase

Acesse o **Supabase SQL Editor** e execute:

```sql
-- Copie todo o conteúdo de:
-- supabase/migrations/029_create_platform_users.sql
```

Ou execute via terminal (se tiver Supabase CLI configurado):

```bash
npx supabase db push
```

### Passo 2: Criar Usuários

Execute o script:

```bash
npx tsx scripts/create-platform-users.ts
```

### Passo 3: Atualizar Sistema de Login

Criar API de login separada para platform_users:

```typescript
// app/api/platform/auth/login/route.ts
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();
  
  // Buscar em platform_users
  const { data: user, error } = await supabase
    .from('platform_users')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('is_active', true)
    .single();
  
  // Validar senha e retornar token
}
```

### Passo 4: Atualizar Middleware

Separar lógica de autenticação por domínio:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // criadores.digital = users (CRM)
  if (hostname === 'criadores.digital') {
    // Validar token de users
  }
  
  // criadores.app = platform_users
  if (hostname === 'criadores.app') {
    // Validar token de platform_users
  }
}
```

---

## 📋 Estrutura da Tabela platform_users

```sql
CREATE TABLE platform_users (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  
  -- Básico
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  
  -- Roles (Múltiplos)
  role platform_user_role DEFAULT 'creator',
  roles platform_user_role[] DEFAULT ARRAY['creator'],
  
  -- Relacionamentos
  creator_id UUID REFERENCES creators(id),
  business_id UUID REFERENCES businesses(id),
  managed_businesses UUID[],
  
  -- Permissões
  permissions JSONB,
  preferences JSONB,
  
  -- Assinatura
  subscription_plan VARCHAR(50) DEFAULT 'basic',
  subscription_expires_at TIMESTAMP,
  features_enabled JSONB,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  platform VARCHAR(50) DEFAULT 'client',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔍 Diferenças entre Tabelas

| Aspecto | users (CRM) | platform_users (criadores.app) |
|---------|-------------|--------------------------------|
| **Domínio** | criadores.digital | criadores.app |
| **Usuários** | Funcionários internos | Criadores, estrategistas, empresas |
| **Roles** | admin, manager, user, viewer | creator, marketing_strategist, business_owner |
| **Múltiplos Roles** | Não | Sim (array) |
| **Assinatura** | Não | Sim |
| **Creator ID** | Não | Sim (para creators) |
| **Business ID** | Sim (opcional) | Sim (para business_owners) |
| **Managed Businesses** | Não | Sim (para strategists) |

---

## ✅ Vantagens da Separação

1. **Segurança:** Impossível funcionário acessar criadores.app
2. **Escalabilidade:** Milhares de criadores não afetam tabela de funcionários
3. **Manutenção:** Código mais limpo e organizado
4. **Performance:** Queries mais rápidas (menos registros)
5. **Flexibilidade:** Cada tabela pode evoluir independentemente
6. **Auditoria:** Fácil rastrear ações por plataforma

---

## 🎯 Usuários a Criar

### Pietra Mantovani
- **Email:** pietramantovani98@gmail.com
- **Senha:** 2#Todoscria
- **Roles:** creator + marketing_strategist
- **Dashboard:** /dashboard/criador
- **Creator ID:** Buscar automaticamente pelo slug 'pietra-mantovani'

### Marilia
- **Email:** marilia12cavalheiro@gmail.com
- **Senha:** 2#Todoscria
- **Roles:** marketing_strategist + creator
- **Dashboard:** /dashboard/criador
- **Managed Businesses:** [] (adicionar depois)

---

## 📝 Checklist de Implementação

- [x] Criar migration SQL
- [x] Criar TypeScript types
- [x] Criar script de criação de usuários
- [x] Documentar arquitetura
- [ ] Executar migration no Supabase
- [ ] Executar script de criação
- [ ] Criar API de login separada
- [ ] Atualizar middleware
- [ ] Testar login com Pietra
- [ ] Testar login com Marilia
- [ ] Verificar acesso aos dashboards
- [ ] Validar permissões

---

## 🔒 Segurança

### Isolamento Total

```typescript
// CRM (criadores.digital)
const { data } = await supabase
  .from('users')  // ← Tabela de funcionários
  .select('*')
  .eq('email', email);

// Plataforma (criadores.app)
const { data } = await supabase
  .from('platform_users')  // ← Tabela de clientes
  .select('*')
  .eq('email', email);
```

### Validação de Domínio

```typescript
// Middleware verifica domínio e usa tabela correta
if (hostname === 'criadores.digital') {
  // Apenas users podem acessar
}

if (hostname === 'criadores.app') {
  // Apenas platform_users podem acessar
}
```

---

## 📊 Próxima Fase

Após implementação:

1. Migrar usuários existentes (se houver)
2. Atualizar documentação de API
3. Criar testes automatizados
4. Implementar auditoria de acessos
5. Configurar alertas de segurança

---

## 🎉 Conclusão

A separação em duas tabelas é a **melhor prática** para:
- ✅ Segurança
- ✅ Escalabilidade
- ✅ Manutenção
- ✅ Performance

**Tempo estimado de implementação:** 2-3 horas

