# 🔧 FIX: Erro de Build no Vercel

## 🐛 PROBLEMA

### Erro no Build:
```
Failed to compile.

./lib/supabase/server.ts
Error: You're importing a component that needs "next/headers". 
That only works in a Server Component which is not supported in the pages/ directory.

Import trace:
./lib/supabase/server.ts
./lib/services/landingPagesService.ts
./app/test-lp-db/page.tsx
```

### O que aconteceu:

1. **Mudamos `landingPagesService` para usar server-side client:**
   ```typescript
   // lib/services/landingPagesService.ts
   import { createClient } from '@/lib/supabase/server'; // ← Server-side
   ```

2. **`lib/supabase/server.ts` usa `next/headers`:**
   ```typescript
   // lib/supabase/server.ts
   import { cookies } from 'next/headers'; // ← Só funciona em Server Components
   ```

3. **Página de teste era Client Component:**
   ```typescript
   // app/test-lp-db/page.tsx
   'use client'; // ← Client Component
   
   import { landingPagesService } from '@/lib/services/landingPagesService';
   // ❌ ERRO: Client Component tentando usar Server-side service
   ```

---

## ✅ SOLUÇÃO

### Removida página de teste:
```bash
rm app/test-lp-db/page.tsx
```

**Por que:**
- Era apenas uma página de teste
- Não é necessária em produção
- Causava erro de build

---

## 📋 REGRA IMPORTANTE

### ✅ CORRETO: Server Component usando landingPagesService

```typescript
// app/empresas/social-media-advogados/page.tsx
// ✅ SEM 'use client' = Server Component

import { landingPagesService } from '@/lib/services/landingPagesService';
import DynamicLPv2 from '../components/DynamicLPv2';

export default async function SocialMediaAdvogadosPage() {
  const lp = await landingPagesService.getLandingPageBySlug('empresas/social-media-advogados');
  
  return <DynamicLPv2 lp={lp} />;
}
```

**Por que funciona:**
- Página é Server Component (sem `'use client'`)
- Pode usar `landingPagesService` que usa server-side client
- Passa dados como props para Client Component (`DynamicLPv2`)

---

### ✅ CORRETO: Client Component recebendo dados via props

```typescript
// app/empresas/components/DynamicLPv2.tsx
'use client'; // ✅ Client Component

import type { LandingPageWithProducts } from '@/lib/services/landingPagesService';

interface DynamicLPv2Props {
  lp: LandingPageWithProducts; // ← Recebe dados via props
}

export default function DynamicLPv2({ lp }: DynamicLPv2Props) {
  // ✅ Apenas renderiza os dados recebidos
  return <div>{lp.variables.hero.title}</div>;
}
```

**Por que funciona:**
- Client Component NÃO importa `landingPagesService`
- Apenas recebe dados via props
- Dados vêm do Server Component pai

---

### ❌ ERRADO: Client Component importando landingPagesService

```typescript
// ❌ NÃO FAÇA ISSO!
'use client';

import { landingPagesService } from '@/lib/services/landingPagesService';

export default function TestPage() {
  const [lp, setLp] = useState(null);
  
  useEffect(() => {
    // ❌ ERRO: Client Component tentando usar server-side service
    landingPagesService.getLandingPageBySlug('test').then(setLp);
  }, []);
  
  return <div>{lp?.name}</div>;
}
```

**Por que NÃO funciona:**
- Client Component (`'use client'`)
- Tenta importar `landingPagesService`
- `landingPagesService` usa `@/lib/supabase/server`
- `server.ts` usa `next/headers` (só funciona em Server Components)
- **ERRO DE BUILD!**

---

## 🔄 FLUXO CORRETO

```
┌─────────────────────────────────────────────────────────────┐
│                    SERVER COMPONENT                         │
│                    (page.tsx)                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  import { landingPagesService } from '@/lib/services/...'  │
│                                                             │
│  export default async function Page() {                    │
│    const lp = await landingPagesService.getLandingPageBySlug(); │
│    return <DynamicLPv2 lp={lp} />;  ← Passa dados via props│
│  }                                                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    Passa dados via props
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT COMPONENT                         │
│                    (DynamicLPv2.tsx)                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  'use client';                                             │
│                                                             │
│  export default function DynamicLPv2({ lp }) {             │
│    return <div>{lp.variables.hero.title}</div>;           │
│  }                                                          │
│                                                             │
│  ✅ Apenas renderiza dados recebidos                       │
│  ✅ NÃO importa landingPagesService                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 ARQUIVOS AFETADOS

### ✅ Páginas que FUNCIONAM (Server Components):
- `app/empresas/page.tsx`
- `app/empresas/social-media-advogados/page.tsx`
- `app/empresas/social-media-medicos/page.tsx`
- `app/empresas/mentoria/page.tsx`
- `app/empresas/social-media/page.tsx`
- `app/empresas/criadores/page.tsx`

**Todas são Server Components que:**
- Importam `landingPagesService`
- Buscam dados do banco
- Passam dados via props para Client Components

---

### ✅ Componentes que FUNCIONAM (Client Components):
- `app/empresas/components/DynamicLP.tsx`
- `app/empresas/components/DynamicLPv2.tsx`
- `app/empresas/components/lp-sections/HeroSection.tsx`
- `app/empresas/components/lp-sections/ProblemaSection.tsx`

**Todos são Client Components que:**
- Recebem dados via props
- NÃO importam `landingPagesService`
- Apenas renderizam os dados

---

### ❌ Arquivo REMOVIDO (causava erro):
- `app/test-lp-db/page.tsx`

**Por que foi removido:**
- Era Client Component (`'use client'`)
- Importava `landingPagesService` diretamente
- Causava erro de build
- Era apenas para testes

---

## 🎯 LIÇÕES APRENDIDAS

### 1. Server Components vs Client Components

**Server Components:**
- ✅ Podem usar `landingPagesService`
- ✅ Podem usar `@/lib/supabase/server`
- ✅ Podem usar `next/headers`, `next/cookies`
- ✅ Executam no servidor
- ❌ NÃO podem usar hooks (`useState`, `useEffect`)
- ❌ NÃO podem usar event handlers (`onClick`, `onChange`)

**Client Components:**
- ✅ Podem usar hooks (`useState`, `useEffect`)
- ✅ Podem usar event handlers (`onClick`, `onChange`)
- ✅ Podem receber dados via props
- ❌ NÃO podem usar `landingPagesService` (server-side)
- ❌ NÃO podem usar `@/lib/supabase/server`
- ❌ NÃO podem usar `next/headers`, `next/cookies`

---

### 2. Padrão de Composição

**Sempre use este padrão:**

```typescript
// 1. Server Component busca dados
async function ServerPage() {
  const data = await landingPagesService.getSomething();
  return <ClientComponent data={data} />;
}

// 2. Client Component renderiza dados
'use client';
function ClientComponent({ data }) {
  const [state, setState] = useState(data);
  return <div onClick={() => setState(...)}>...</div>;
}
```

---

### 3. Quando Criar Client Component

**Crie Client Component quando precisar de:**
- ✅ Interatividade (clicks, hovers, inputs)
- ✅ Estado local (`useState`)
- ✅ Efeitos (`useEffect`)
- ✅ Hooks do React
- ✅ Browser APIs (window, document)

**Mantenha Server Component quando:**
- ✅ Apenas renderizar dados
- ✅ Buscar dados do banco
- ✅ Usar variáveis de ambiente secretas
- ✅ Fazer queries pesadas

---

## 🚀 RESULTADO

### ✅ Build Funcionando

Após remover `app/test-lp-db/page.tsx`:
- ✅ Build completa com sucesso
- ✅ Deploy no Vercel funciona
- ✅ Todas as LPs funcionam corretamente
- ✅ Sistema robusto e escalável

---

## 📚 REFERÊNCIAS

- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)
- [Composition Patterns](https://nextjs.org/docs/app/building-your-application/rendering/composition-patterns)

---

**Problema resolvido! Build funcionando! 🎉**

