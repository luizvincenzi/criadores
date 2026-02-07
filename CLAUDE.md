# crIAdores - Plataforma Cliente (criadores.app)

Plataforma pública para empresas, criadores de conteúdo e estrategistas de marketing gerenciarem conteúdo social.

## Arquitetura Dual-Platform

Este projeto faz parte de um ecossistema de DOIS projetos que compartilham o MESMO banco Supabase:

| Projeto | Domínio | Pasta | Público | Tabela de Users |
|---------|---------|-------|---------|-----------------|
| **crIAdores** (este) | `criadores.app` | `/criadores` | Externo (empresas, criadores, estrategistas) | `platform_users` |
| **CRM Criadores** | `criadores.digital` | `/crmcriadores` | Interno (equipe operacional) | `users` |

**REGRA CRITICA**: Este projeto usa APENAS `platform_users`. A tabela `users` é exclusiva do CRM interno. Nunca misturar as duas.

## Stack

- **Runtime**: Next.js 16.1 (App Router) + TypeScript + React 19
- **Database**: Supabase (PostgreSQL) - compartilhado com CRM
- **State**: Zustand com persistência (`criadores-auth-storage`)
- **Deploy**: Vercel
- **Auth**: Custom JWT-like via `platform_users` (bcrypt passwords)

## Comandos

```bash
npm run dev          # Dev com Turbopack
npm run build        # Build produção
npm run lint         # ESLint
```

## Estrutura

```
/app/(dashboard)/              # Rotas protegidas por role
  /conteudo-estrategista/      # Estrategistas: planejamento de conteúdo
  /conteudo-empresa/           # Business owners: conteúdo da empresa
  /campanhas-criador/          # Criadores: campanhas atribuídas
  /conteudo/                   # CRM interno (redireciona platform_users)
/app/api/
  /platform/auth/              # Login/auth de platform_users
  /strategist/businesses/      # Businesses do estrategista (3 fontes)
  /business-content/           # CRUD de conteúdo social
  /strategist-access/          # Admin: gerenciar acesso de estrategistas
/components/
  /strategist-content/         # Views e componentes do estrategista
  /business-content/           # Views do business owner
/store/authStore.ts            # Auth state (Zustand + localStorage)
/lib/
  /auth-types.ts               # Tipos de users CRM (NÃO usar para platform)
  /platform-auth-types.ts      # Tipos de platform_users (USAR ESTE)
  /permissions.ts              # Definições de permissão por role
/supabase/migrations/          # 102+ SQL migrations
```

## Sistema de Usuários (CRITICO)

### Tabela `platform_users` (ESTE PROJETO)

Usuários externos da plataforma criadores.app.

```
id                    UUID PK
email                 VARCHAR (lowercase, unique por org)
full_name             VARCHAR
password_hash         VARCHAR (bcrypt)
role                  ENUM: 'creator' | 'marketing_strategist' | 'business_owner'
roles                 ARRAY de roles (suporta múltiplas)
creator_id            UUID FK → creators (se for criador/estrategista)
business_id           UUID FK → businesses (se for business_owner)
managed_businesses    UUID[] (businesses que o estrategista gerencia)
permissions           JSONB (permissões granulares)
is_active             BOOLEAN
organization_id       UUID (sempre DEFAULT_ORG)
```

### Tabela `users` (CRM INTERNO - NÃO USAR)

Funcionários internos da empresa Criadores. Usada APENAS pelo projeto `crmcriadores`.

Roles: `admin`, `manager`, `ops`, `vendas`, `user`, `viewer`, `licenciado`

### Mapeamento de Roles → Páginas

| Role | Página Principal | Pode Acessar |
|------|-----------------|--------------|
| `marketing_strategist` | `/conteudo-estrategista` | Conteúdo dos businesses que gerencia |
| `business_owner` | `/conteudo-empresa` | Conteúdo do seu business |
| `creator` | `/campanhas-criador` | Campanhas atribuídas |

## Sistema de Acesso dos Estrategistas (Consolidado)

A API `/api/strategist/businesses` usa 3 fontes com deduplicação para encontrar businesses:

```
Fonte 1: managed_businesses[] enviado pelo client (query param)
Fonte 2: platform_users.managed_businesses[] buscado pelo platform_user_id
Fonte 3: businesses.strategist_id = creator_id (legacy fallback)
```

**Parâmetros da API**:
- `platform_user_id` - ID do platform_user (preferencial)
- `managed_businesses` - JSON array de UUIDs (do user.managed_businesses)
- `strategist_id` - creator_id do platform_user (legacy/fallback)

**Para dar acesso a um estrategista**: Adicionar o UUID do business ao array `managed_businesses` do `platform_users`.

## Tabelas Principais (Supabase Compartilhado)

### `businesses` - Empresas/clientes
```
id, name, slug, organization_id
strategist_id         UUID FK → creators (legacy, usar managed_businesses)
has_strategist        BOOLEAN (legacy)
platform_owner_email  VARCHAR
is_active             BOOLEAN
```

### `business_content_social` - Conteúdo social (posts/reels/stories)
```
id, business_id (FK), strategist_id (FK → creators)
title, description, content_type ('post'|'reels'|'story')
platforms             TEXT[] ('instagram', 'tiktok', etc)
scheduled_date, scheduled_time
status                'planned'|'in_progress'|'completed'|'cancelled'
is_executed           BOOLEAN
assigned_to           UUID FK → platform_users
created_by            UUID FK → platform_users
deleted_at            TIMESTAMP (soft delete)
```

### `creators` - Criadores de conteúdo
```
id, name, organization_id
platform_email, platform_roles
is_strategist         BOOLEAN
```

### `strategist_business_access` - Acesso granular (admin-only, futuro)
```
strategist_user_id    UUID FK → users (CRM! NÃO platform_users)
business_id           UUID FK → businesses
access_level          'read_only'|'read_write'|'full_access'
permissions           JSONB
is_active, expires_at
```
**NOTA**: Esta tabela referencia `users` (CRM), NÃO `platform_users`. Está desacoplada do fluxo principal. O sistema consolidado usa `platform_users.managed_businesses[]` como fonte de verdade.

## Fluxo de Autenticação

1. Login via `/api/platform/auth/login`
2. Busca em `platform_users` por email (lowercase) + org
3. Valida senha (bcrypt ou fallback hardcoded)
4. Retorna: `{ id, email, role, roles[], creator_id, business_id, managed_businesses[] }`
5. `authStore` persiste no localStorage como `criadores-auth-storage`
6. Fallback: tenta `/api/supabase/auth/login` (tabela `users` CRM)

## Padrões Críticos

### APIs - Padrão service role (este projeto)
```typescript
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

### Soft Delete - Sempre usar
```typescript
.is('deleted_at', null)  // Filtrar deletados
```

### Content Stats - Padrão de cálculo
```typescript
const total = contents?.length || 0;
const executed = contents?.filter(c => c.is_executed).length || 0;
const pending = total - executed;
```

### Business Interface (para componentes)
```typescript
interface Business {
  id: string;
  name: string;
  logo_url?: string;
  is_active: boolean;
  has_strategist?: boolean;   // opcional (legacy)
  strategist_id?: string;     // opcional (legacy)
  content_stats?: { total: number; executed: number; pending: number; };
}
```

## Middleware

- Rate limiting: login 5/15min (prod), API 100/min (prod)
- Headers de segurança: CSP, X-Frame-Options, HTTPS
- Protected routes: `/dashboard`, `/eventos`, `/campanhas`, `/criadores`, `/tarefas`
- Admin bypass: `luizvincenzi@gmail.com`

## Nunca Fazer

- Usar tabela `users` para autenticação/acesso de platform_users
- Criar queries sem filtro de `organization_id` ou `business_id`
- Usar `SUPABASE_SERVICE_ROLE_KEY` no frontend/client components
- Deletar registros (usar soft delete com `deleted_at`)
- Confundir `creator_id` (FK para `creators`) com `platform_users.id`
- Assumir que `strategist_business_access.strategist_user_id` = `platform_users.id` (referencia `users`)

## Agentes Disponíveis

Use agentes específicos para tarefas especializadas (`.claude/agents/`):

| Agente | Uso |
|--------|-----|
| `backend` | APIs, rotas, autenticação, middleware, lógica de servidor |
| `frontend` | Componentes React, UI/UX, páginas, responsividade |
| `database` | Queries, migrations, schema, índices, platform_users |
| `supabase-mcp` | Operações diretas no banco via MCP (debug, queries, migrations) |

## Referências Cruzadas com CRM

| Conceito | Este Projeto (criadores.app) | CRM (criadores.digital) |
|----------|------------------------------|------------------------|
| Auth table | `platform_users` | `users` |
| Auth store key | `criadores-auth-storage` | `auth-storage` |
| Login API | `/api/platform/auth/login` | `/api/supabase/auth/login` |
| Roles | creator, marketing_strategist, business_owner | admin, manager, ops, vendas, user, viewer, licenciado |
| Business access | `managed_businesses[]` no platform_user | Via role + `organization_id` |
| Content table | `business_content_social` | `social_content_calendar` |
