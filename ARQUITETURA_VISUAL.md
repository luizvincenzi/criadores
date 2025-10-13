# 🏗️ ARQUITETURA VISUAL - SISTEMA DE LPs DINÂMICAS

## 📊 DIAGRAMA GERAL

```
┌─────────────────────────────────────────────────────────────────────┐
│                         USUÁRIOS FINAIS                              │
│                    (Visitantes das Landing Pages)                    │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        CRIADORES.APP                                 │
│                     (Frontend - Público)                             │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  app/[slug]/page.tsx                                         │  │
│  │  • Busca LP do banco por slug                                │  │
│  │  • Renderiza dinamicamente                                   │  │
│  │  • SEO otimizado                                             │  │
│  │  • Analytics tracking                                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  components/DynamicLP.tsx                                    │  │
│  │  • HeroSection                                               │  │
│  │  • ProblemaSection                                           │  │
│  │  • SolucaoSection                                            │  │
│  │  • ComboSection                                              │  │
│  │  • DepoimentosSection                                        │  │
│  │  • FAQSection                                                │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Permissões: APENAS LEITURA (SELECT)                                │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ Supabase Client
                                 │ (Read Only)
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SUPABASE DATABASE                               │
│                   (PostgreSQL + Storage)                             │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  lp_templates                                                │  │
│  │  • id, name, slug, methodology, structure (JSONB)            │  │
│  │  • Templates fixos (Combo, Produto Único, Segmento)          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  landing_pages                                               │  │
│  │  • id, slug, name, template_id                               │  │
│  │  • variables (JSONB) - Todo o conteúdo editável              │  │
│  │  • config (JSONB) - Configurações                            │  │
│  │  • seo (JSONB) - Metadados SEO                               │  │
│  │  • status, is_active                                         │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  lp_products                                                 │  │
│  │  • lp_id, product_id, order_index                            │  │
│  │  • custom_data (JSONB) - Copy customizada                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  lp_analytics                                                │  │
│  │  • lp_id, date                                               │  │
│  │  • metrics (JSONB) - Views, conversões, etc                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  lp_versions                                                 │  │
│  │  • lp_id, version_number                                     │  │
│  │  • snapshot (JSONB) - Estado completo da LP                  │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  products (já existe)                                        │  │
│  │  • id, name, slug, default_price, features                   │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Row Level Security (RLS):                                           │
│  • criadores.app: SELECT apenas LPs ativas                          │
│  • criadores.digital: SELECT + INSERT + UPDATE + DELETE             │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 │ Supabase Client
                                 │ (Read + Write)
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CRIADORES.DIGITAL                               │
│                   (CRM/Editor - Admin)                               │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  app/(dashboard)/page.tsx                                    │  │
│  │  • Dashboard principal                                       │  │
│  │  • Lista de LPs                                              │  │
│  │  • Métricas globais                                          │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  app/(dashboard)/landing-pages/[id]/edit/page.tsx            │  │
│  │  • Editor visual de LP                                       │  │
│  │  • Formulários por seção                                     │  │
│  │  • Preview em tempo real                                     │  │
│  │  • Auto-save                                                 │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  components/editor/LPEditor.tsx                              │  │
│  │  ├─ HeroEditor                                               │  │
│  │  ├─ ProblemaEditor                                           │  │
│  │  ├─ SolucoesEditor                                           │  │
│  │  ├─ ComboEditor                                              │  │
│  │  ├─ DepoimentosEditor                                        │  │
│  │  ├─ FAQEditor                                                │  │
│  │  └─ TemaEditor                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  components/editor/PreviewPanel.tsx                          │  │
│  │  • Preview em tempo real                                     │  │
│  │  • Toggle desktop/mobile/tablet                              │  │
│  │  • Zoom in/out                                               │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  app/(dashboard)/landing-pages/[id]/analytics/page.tsx       │  │
│  │  • Gráficos de conversão                                     │  │
│  │  • Métricas por seção                                        │  │
│  │  • Filtros de período                                        │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  lib/services/landingPagesService.ts                         │  │
│  │  • getAllLandingPages()                                      │  │
│  │  • getLandingPageById()                                      │  │
│  │  • createLandingPage()                                       │  │
│  │  • updateLandingPage()                                       │  │
│  │  • publishLandingPage()                                      │  │
│  │  • duplicateLandingPage()                                    │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  Permissões: LEITURA + ESCRITA (SELECT, INSERT, UPDATE, DELETE)     │
│  Autenticação: Supabase Auth (email/senha)                          │
└────────────────────────────────┬────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ADMINISTRADORES                                 │
│                   (Equipe de Marketing)                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 🔄 FLUXO DE DADOS

### 1. Criação de Nova LP

```
┌──────────────┐
│ Admin acessa │
│ criadores.   │
│ digital      │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│ Clica em "Nova LP"           │
│ /landing-pages/new           │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Preenche formulário:         │
│ • Nome                       │
│ • Slug                       │
│ • Categoria                  │
│ • Template                   │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ landingPagesService          │
│ .createLandingPage()         │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ INSERT INTO landing_pages    │
│ • status = 'draft'           │
│ • variables = {} (vazio)     │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Redireciona para Editor      │
│ /landing-pages/[id]/edit     │
└──────────────────────────────┘
```

---

### 2. Edição de LP

```
┌──────────────┐
│ Admin edita  │
│ seção Hero   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│ HeroEditor.onChange()        │
│ • Atualiza state local       │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ PreviewPanel                 │
│ • Renderiza preview          │
│ • Atualização em tempo real  │
└──────┬───────────────────────┘
       │
       │ (após 30s ou click "Salvar")
       ▼
┌──────────────────────────────┐
│ landingPagesService          │
│ .updateLandingPage()         │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ UPDATE landing_pages         │
│ SET variables = {...}        │
│ WHERE id = ...               │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ TRIGGER: create_lp_version() │
│ • Cria snapshot em           │
│   lp_versions                │
└──────────────────────────────┘
```

---

### 3. Publicação de LP

```
┌──────────────┐
│ Admin clica  │
│ "Publicar"   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│ landingPagesService          │
│ .publishLandingPage()        │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ UPDATE landing_pages         │
│ SET status = 'active'        │
│     published_at = NOW()     │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ LP fica visível em           │
│ criadores.app/[slug]         │
└──────────────────────────────┘
```

---

### 4. Visualização Pública

```
┌──────────────┐
│ Usuário      │
│ acessa       │
│ criadores.   │
│ app/empresas │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│ app/[slug]/page.tsx          │
│ • generateMetadata()         │
│ • getLandingPageBySlug()     │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ SELECT FROM landing_pages    │
│ WHERE slug = 'empresas'      │
│   AND status = 'active'      │
│   AND is_active = true       │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ DynamicLP.tsx                │
│ • Renderiza seções           │
│ • Aplica variáveis           │
│ • Aplica tema                │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Usuário vê LP                │
│ • Hero com título dinâmico   │
│ • Preços do banco            │
│ • Cores customizadas         │
└──────┬───────────────────────┘
       │
       ▼
┌──────────────────────────────┐
│ Analytics tracking           │
│ • Page view                  │
│ • Scroll depth               │
│ • CTA clicks                 │
└──────────────────────────────┘
```

---

## 🎨 ESTRUTURA DE VARIÁVEIS (JSONB)

```json
{
  "hero": {
    "title": "string",
    "subtitle": "string",
    "cta_text": "string",
    "cta_url": "string",
    "urgency_badge": "string",
    "social_proof": {
      "empresas": "number",
      "locais": "number",
      "conteudos": "number"
    },
    "trust_badges": ["string"]
  },
  "problema": {
    "title": "string",
    "subtitle": "string",
    "problems": [
      {
        "icon": "string",
        "title": "string",
        "description": "string"
      }
    ]
  },
  "solucoes": [
    {
      "order": "number",
      "product_id": "uuid",
      "title": "string",
      "description": "string",
      "benefits": ["string"],
      "urgency": "string",
      "cta_text": "string",
      "cta_url": "string"
    }
  ],
  "combo": {
    "title": "string",
    "description": "string",
    "price_monthly": "number",
    "price_semestral": "number",
    "discount_percentage": "number",
    "urgency": "string",
    "exclusive_benefits": ["string"],
    "bonus": ["string"],
    "guarantee": "string"
  },
  "depoimentos": [
    {
      "name": "string",
      "company": "string",
      "photo": "string",
      "text": "string",
      "result": "string"
    }
  ],
  "faq": [
    {
      "question": "string",
      "answer": "string"
    }
  ],
  "theme": {
    "primary_color": "#hex",
    "secondary_color": "#hex",
    "font_family": "string"
  }
}
```

---

## 🔐 SEGURANÇA (RLS)

### Políticas de Acesso

```sql
-- criadores.app (público)
CREATE POLICY "public_read_active_lps" ON landing_pages
  FOR SELECT
  USING (status = 'active' AND is_active = true);

-- criadores.digital (admin autenticado)
CREATE POLICY "admin_full_access" ON landing_pages
  FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

---

## 📊 EXEMPLO COMPLETO: LP /empresas

```
┌─────────────────────────────────────────────────────────┐
│ BANCO DE DADOS                                          │
├─────────────────────────────────────────────────────────┤
│ landing_pages                                           │
│ ├─ id: "20000000-0000-0000-0000-000000000001"          │
│ ├─ slug: "empresas"                                    │
│ ├─ name: "LP Principal - Combo Empresas"               │
│ ├─ template_id: "10000000-..." (Combo Completo)        │
│ ├─ status: "active"                                    │
│ └─ variables: {                                        │
│      hero: {                                           │
│        title: "Transforme Sua Empresa...",             │
│        cta_url: "/chatcriadores-empresas"              │
│      },                                                │
│      solucoes: [                                       │
│        { product_id: "uuid-mentoria", ... },           │
│        { product_id: "uuid-social-media", ... }        │
│      ]                                                 │
│    }                                                   │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ CRIADORES.APP                                           │
├─────────────────────────────────────────────────────────┤
│ URL: https://criadores.app/empresas                     │
│                                                         │
│ Renderiza:                                              │
│ ┌─────────────────────────────────────────────────────┐│
│ │ Hero                                                ││
│ │ "Transforme Sua Empresa Numa Referência Regional"  ││
│ │ [Falar Com Especialista Agora]                     ││
│ └─────────────────────────────────────────────────────┘│
│ ┌─────────────────────────────────────────────────────┐│
│ │ Problema                                            ││
│ │ "Por Que a crIAdores Nasceu?"                      ││
│ │ • Publicações Improvisadas                         ││
│ └─────────────────────────────────────────────────────┘│
│ ┌─────────────────────────────────────────────────────┐│
│ │ Solução #1: Mentoria                                ││
│ │ [Falar Com Especialista]                           ││
│ └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

---

**Pronto para começar o desenvolvimento! 🚀**

