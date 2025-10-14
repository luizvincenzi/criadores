# 🏗️ Arquitetura de Landing Pages - Dual Domain

## 📋 VISÃO GERAL

Sistema de Landing Pages que funciona em **2 domínios diferentes**:

1. **criadores.digital** = CRM/Admin (EDITAR LPs)
2. **criadores.app** = Site Público (VISUALIZAR LPs)

**Banco de Dados:** Supabase compartilhado entre os dois domínios

---

## 🔄 FLUXO COMPLETO

```
┌─────────────────────────────────────────────────────────────┐
│                    CRIADORES.DIGITAL                        │
│                    (CRM/Admin)                              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Usuário acessa /landing-pages                          │
│  2. Clica em "Editar" na LP de Advogados                   │
│  3. Edita título, subtítulo, etc.                          │
│  4. Clica em "Publicar"                                    │
│  5. Sistema cria nova versão no Supabase                   │
│     ↓                                                       │
│     INSERT INTO lp_versions (version_number = 21)          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    SUPABASE DATABASE
                    (Compartilhado)
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    CRIADORES.APP                            │
│                    (Site Público)                           │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Cliente acessa:                                        │
│     https://criadores.app/empresas/social-media-advogados  │
│                                                             │
│  2. Next.js executa:                                       │
│     - getLandingPageBySlug('empresas/social-media-advogados')│
│     - SELECT * FROM lp_versions                            │
│       WHERE lp_id = X                                      │
│       ORDER BY version_number DESC LIMIT 1                 │
│                                                             │
│  3. Retorna versão 21 (última versão)                      │
│                                                             │
│  4. DynamicLPv2 renderiza a LP com dados da versão 21      │
│                                                             │
│  5. Cliente vê LP atualizada IMEDIATAMENTE! ✅             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📁 ESTRUTURA DE ARQUIVOS

### criadores.digital (CRM/Admin)

```
criadores.digital/
├── app/
│   ├── landing-pages/
│   │   ├── page.tsx                    # Lista de LPs
│   │   └── [id]/
│   │       └── edit/
│   │           └── page.tsx            # Editor de LP
│   └── api/
│       └── landing-pages/
│           └── [id]/
│               └── versions/
│                   └── route.ts        # API para criar versões
├── components/
│   └── lp/
│       ├── DynamicLandingPage.tsx      # Renderizador dinâmico
│       └── sections/
│           ├── HeroSection.tsx
│           ├── ProblemaSection.tsx
│           └── ...
└── lib/
    └── services/
        └── landingPagesService.ts      # Service compartilhado
```

### criadores.app (Site Público)

```
criadores.app/
├── app/
│   ├── empresas/
│   │   ├── page.tsx                           # LP principal
│   │   ├── social-media-advogados/
│   │   │   └── page.tsx                       # LP Advogados
│   │   ├── social-media-medicos/
│   │   │   └── page.tsx                       # LP Médicos
│   │   └── components/
│   │       ├── DynamicLPv2.tsx                # ✨ NOVO! Renderizador dinâmico
│   │       ├── lp-sections/
│   │       │   ├── HeroSection.tsx            # ✨ NOVO! Seção Hero modular
│   │       │   ├── ProblemaSection.tsx        # ✨ NOVO! Seção Problema modular
│   │       │   └── ...
│   │       ├── PMEsHeader.tsx
│   │       ├── PMEsFooter.tsx
│   │       └── FormularioDiagnostico.tsx
│   └── api/
│       └── debug/
│           └── lp-version/
│               └── route.ts                   # Endpoint de debug
└── lib/
    └── services/
        └── landingPagesService.ts             # Service compartilhado
```

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### Tabela: `landing_pages`

```sql
CREATE TABLE landing_pages (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,           -- Ex: "empresas/social-media-advogados"
  name TEXT NOT NULL,                  -- Ex: "LP Social Media para Advogados"
  category TEXT,                       -- Ex: "advogados"
  template_id UUID,
  status TEXT DEFAULT 'active',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Uso:** Apenas metadados básicos. NÃO contém conteúdo da LP.

---

### Tabela: `lp_versions` ⭐ (PRINCIPAL)

```sql
CREATE TABLE lp_versions (
  id UUID PRIMARY KEY,
  lp_id UUID REFERENCES landing_pages(id),
  version_number INTEGER NOT NULL,     -- Ex: 1, 2, 3, ..., 21
  snapshot JSONB NOT NULL,             -- ⭐ TODO O CONTEÚDO DA LP
  change_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);
```

**Uso:** Armazena TODAS as versões da LP. Sistema SEMPRE busca a versão com maior `version_number`.

---

### Estrutura do `snapshot` (JSONB)

```json
{
  "seo": {
    "title": "Social Media para Advogados | crIAdores",
    "description": "...",
    "keywords": ["marketing jurídico", "..."],
    "og_image": "/assets/og-advogados.jpg"
  },
  "config": {
    "segment": "advogados",
    "chatbot_url": "/chatcriadores-advogados",
    "conversion_goal": "chatbot_click"
  },
  "variables": {
    "hero": {
      "title": "Construa Autoridade e Atraia Clientes Qualificados",
      "subtitle": "Social media especializada para advogados...",
      "cta_text": "Falar Com Especialista Agora",
      "cta_url": "/chatcriadores-advogados",
      "urgency_badge": "100% Compliance OAB",
      "social_proof": {
        "compliance": 100,
        "advogados_atendidos": 12
      },
      "trust_badges": ["Compliance OAB", "Conteúdo Jurídico"]
    },
    "problema": {
      "title": "Por Que Advogados Precisam de Marketing Digital?",
      "subtitle": "O cliente moderno pesquisa online...",
      "agitation": "Mas você não tem tempo...",
      "problems": [
        {
          "icon": "🔍",
          "title": "82% Pesquisam Online",
          "description": "Antes de escolher um advogado"
        }
      ]
    },
    "solucoes": [...],
    "combo": {...},
    "processo": {...},
    "depoimentos": [...],
    "urgencia": {...},
    "faq": [...],
    "cta_final": {...}
  }
}
```

---

## 🔧 COMPONENTES PRINCIPAIS

### 1. `landingPagesService.ts` (Compartilhado)

**Localização:** `lib/services/landingPagesService.ts`

**Métodos:**

```typescript
// Buscar LP por slug (SEMPRE busca última versão)
async getLandingPageBySlug(slug: string): Promise<LandingPageWithProducts | null>

// Criar nova versão
async createVersion(lpId: string, snapshot: any, description?: string): Promise<void>

// Buscar histórico de versões
async getVersionHistory(lpId: string): Promise<LPVersion[]>

// Buscar versão específica
async getVersion(lpId: string, versionNumber: number): Promise<LPVersion | null>
```

**Lógica de `getLandingPageBySlug`:**

```typescript
// PASSO 1: Buscar LP básica
const { data: lpBasic } = await supabase
  .from('landing_pages')
  .select('id, slug, name, ...')
  .eq('slug', slug)
  .single();

// PASSO 2: Buscar ÚLTIMA VERSÃO
const { data: latestVersion } = await supabase
  .from('lp_versions')
  .select('snapshot, version_number, created_at')
  .eq('lp_id', lpBasic.id)
  .order('version_number', { ascending: false })  // ⭐ Maior primeiro
  .limit(1)
  .single();

// PASSO 3: Montar LP com dados da última versão
return {
  ...lpBasic,
  ...latestVersion.snapshot,  // ⭐ Spread do snapshot
  version_number: latestVersion.version_number
};
```

---

### 2. `DynamicLPv2.tsx` (criadores.app)

**Localização:** `app/empresas/components/DynamicLPv2.tsx`

**Responsabilidade:** Renderizar LP dinamicamente baseado nos dados do banco.

**Estrutura:**

```typescript
export default function DynamicLPv2({ lp }: DynamicLPv2Props) {
  const { variables } = lp;
  const { hero, problema, solucoes, ... } = variables;

  return (
    <div>
      <PMEsHeader />
      
      {/* Renderizar seções condicionalmente */}
      {hero && <HeroSection hero={hero} />}
      {problema && <ProblemaSection problema={problema} />}
      {solucoes && <SolucoesSection solucoes={solucoes} />}
      {/* ... */}
      
      <PMEsFooter />
    </div>
  );
}
```

---

### 3. Seções Modulares (criadores.app)

**Localização:** `app/empresas/components/lp-sections/`

**Seções Criadas:**
- ✅ `HeroSection.tsx` - Hero com CTA, badges, social proof
- ✅ `ProblemaSection.tsx` - Problema + Agitação
- 🔄 `SolucoesSection.tsx` - (Próximo)
- 🔄 `ComboSection.tsx` - (Próximo)
- 🔄 Outras seções...

**Vantagens:**
- ✅ Modulares e reutilizáveis
- ✅ Fácil de manter
- ✅ Consistência visual
- ✅ Tipagem TypeScript

---

## 🚀 COMO USAR

### No criadores.digital (Editar LP):

1. Acesse `/landing-pages`
2. Clique em "Editar" na LP desejada
3. Edite os campos (título, subtítulo, etc.)
4. Clique em "Publicar"
5. Sistema cria nova versão no Supabase

### No criadores.app (Visualizar LP):

1. Cliente acessa URL única: `https://criadores.app/empresas/social-media-advogados`
2. Next.js busca última versão do Supabase
3. DynamicLPv2 renderiza LP com dados frescos
4. Cliente vê LP atualizada IMEDIATAMENTE!

---

## ✅ VANTAGENS DESTA ARQUITETURA

1. **Separação de Responsabilidades**
   - criadores.digital = Admin/CRM
   - criadores.app = Site Público

2. **Banco de Dados Compartilhado**
   - Edita em um lugar, aparece em outro
   - Sem sincronização manual

3. **Versionamento Completo**
   - Histórico de todas as mudanças
   - Possibilidade de rollback

4. **Sem Cache**
   - `export const dynamic = 'force-dynamic'`
   - `export const revalidate = 0`
   - Mudanças aparecem IMEDIATAMENTE

5. **Componentes Modulares**
   - Fácil de manter
   - Reutilizáveis
   - Consistência visual

---

## 🔍 DEBUG

### Endpoint de Debug:

```
https://criadores.app/api/debug/lp-version?slug=empresas/social-media-advogados
```

**Retorna:**
```json
{
  "success": true,
  "slug": "empresas/social-media-advogados",
  "version_number": 21,
  "hero_title": "Título da versão 21",
  "timestamp": "2025-10-14T13:00:00Z"
}
```

### Logs no Console:

```
🔍 Buscando última versão para LP ID: xxx, slug: empresas/social-media-advogados
✅ Usando versão 21 da LP empresas/social-media-advogados
📝 Hero title: Construa Autoridade e Atraia Clientes...
📄 Página Advogados - LP carregada: { version: 21, hero_title: "..." }
🎨 DynamicLPv2 - Renderizando LP: { version: 21, has_hero: true, ... }
```

---

## 📊 PRÓXIMOS PASSOS

- [ ] Criar seções restantes (Soluções, Combo, etc.)
- [ ] Atualizar outras páginas de LP (médicos, mentoria, etc.)
- [ ] Testar em produção
- [ ] Documentar processo de criação de novas LPs
- [ ] Criar interface de preview no criadores.digital

---

**Agora você tem um sistema completo de Landing Pages que funciona em 2 domínios! 🎉**

