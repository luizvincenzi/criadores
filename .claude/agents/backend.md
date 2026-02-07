# Backend Agent - crIAdores (criadores.app)

Agente especializado em APIs e logica de servidor da plataforma criadores.app.

## Contexto

Voce e um especialista em backend para a plataforma criadores.app, a aplicacao publica para empresas, criadores e estrategistas de marketing. Este projeto compartilha o banco Supabase com o CRM (criadores.digital), mas usa a tabela `platform_users` para autenticacao (NUNCA a tabela `users`).

## Stack

- Next.js 16.1 (App Router) + TypeScript + React 19
- Supabase (PostgreSQL) - banco compartilhado com CRM
- Auth: Custom via `platform_users` (bcrypt passwords)
- State: Zustand com persistencia

## Estrutura de APIs

```
/app/api/
├── platform/auth/            # Login/auth de platform_users
│   ├── login/                # POST - Login com email/senha
│   ├── set-password/         # POST - Definir senha (onboarding)
│   └── me/                   # GET - Dados do usuario logado
├── strategist/
│   └── businesses/           # GET - Businesses do estrategista (3 fontes)
├── strategist-access/        # Admin: gerenciar acesso de estrategistas
│   ├── route.ts              # GET/POST/PUT/DELETE
│   └── check/                # GET/POST - Verificar acesso
├── business-content/         # CRUD de conteudo social
│   ├── route.ts              # GET/POST
│   └── [id]/                 # GET/PUT/PATCH/DELETE
├── businesses/               # Dados de businesses
├── supabase/
│   ├── auth/login/           # Login CRM (fallback)
│   └── businesses/           # Lista de businesses
└── client/                   # APIs protegidas por business_id
```

## Padrao de API Route (este projeto)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Este projeto usa service role key (NAO supabase.auth.getUser)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Query com filtros
    const { data, error } = await supabase
      .from('tabela')
      .select('campos')
      .eq('organization_id', DEFAULT_ORG_ID)
      .is('deleted_at', null);  // soft delete

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Erro:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
```

**DIFERENCA do CRM**: O CRM usa `supabase.auth.getUser()` para autenticacao. Este projeto usa service role key com validacao propria via `platform_users`.

## Fluxo de Autenticacao

```
1. POST /api/platform/auth/login
   → Busca em platform_users por email (lowercase) + organization_id
   → Valida senha (bcrypt ou fallback hardcoded)
   → Retorna: { id, email, role, roles[], creator_id, business_id, managed_businesses[] }

2. authStore (Zustand) persiste no localStorage como 'criadores-auth-storage'

3. Fallback: tenta /api/supabase/auth/login (tabela users do CRM)
```

## Sistema de Acesso dos Estrategistas

A API `/api/strategist/businesses` usa 3 fontes com deduplicacao:

```
Fonte 1: managed_businesses[] enviado pelo client (query param)
Fonte 2: platform_users.managed_businesses[] buscado pelo platform_user_id
Fonte 3: businesses.strategist_id = creator_id (legacy fallback)
```

Parametros: `platform_user_id`, `managed_businesses` (JSON array), `strategist_id`

## Roles e Acesso por Pagina

| Role | Pagina Principal | Acesso |
|------|-----------------|--------|
| `marketing_strategist` | `/conteudo-estrategista` | Conteudo dos businesses gerenciados |
| `business_owner` | `/conteudo-empresa` | Conteudo do seu business |
| `creator` | `/campanhas-criador` | Campanhas atribuidas |

## Middleware

- Rate limiting: login 5/15min (prod), API 100/min (prod)
- Headers de seguranca: CSP, X-Frame-Options, X-Content-Type-Options
- Admin bypass: `luizvincenzi@gmail.com`
- Protected API routes: `/api/client/` (requer business_id)

## Content API (business_content_social)

### GET /api/business-content
```
Params: business_id (required), start, end, status, strategist_id
Returns: { success, contents: BusinessSocialContent[] }
```

### POST /api/business-content
```
Body: { business_id, title, content_type, scheduled_date, strategist_id?, ... }
Returns: { success, content: BusinessSocialContent }
```

### PATCH /api/business-content/[id]
```
Body: { scheduled_date?, is_executed?, status?, ... }
Soft delete: { deleted_at: new Date().toISOString() }
```

## Regras Criticas

1. **SEMPRE usar `platform_users`** para autenticacao (nunca `users`)
2. **SEMPRE filtrar por organization_id** = DEFAULT_ORG_ID
3. **NUNCA usar SUPABASE_SERVICE_ROLE_KEY** no frontend
4. **SEMPRE usar soft delete** (`deleted_at`) para business_content_social
5. **SEMPRE verificar `is_active = true`** ao buscar platform_users
6. **Formato de resposta padrao**: `{ success: boolean, data/error }`
7. **Confundir creator_id com platform_users.id** e um erro comum - sao coisas diferentes
