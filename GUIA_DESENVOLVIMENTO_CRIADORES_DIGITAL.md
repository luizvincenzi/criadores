# 🚀 GUIA COMPLETO - DESENVOLVIMENTO CRIADORES.DIGITAL

## 📋 VISÃO GERAL DO SISTEMA

### Arquitetura de 2 Domínios

```
┌─────────────────────────────────────────────────────────────┐
│                    CRIADORES.APP                             │
│                  (Landing Pages - Frontend)                  │
│                                                              │
│  Stack:                                                      │
│  • Next.js 15 (App Router)                                  │
│  • React 19                                                 │
│  • TypeScript                                               │
│  • Tailwind CSS                                             │
│                                                              │
│  Responsabilidades:                                         │
│  • Renderizar LPs dinamicamente do banco                    │
│  • SEO otimizado                                            │
│  • Performance máxima                                       │
│  • Analytics e tracking                                     │
│  • APENAS LEITURA do banco                                  │
└─────────────────────────────────────────────────────────────┘
                            ↕
                    (Supabase Database)
                    Tabelas compartilhadas:
                    • lp_templates
                    • landing_pages
                    • lp_products
                    • lp_analytics
                    • lp_versions
                    • products (já existe)
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                  CRIADORES.DIGITAL                           │
│                  (CRM/Editor - Backend + Frontend)           │
│                                                              │
│  Stack:                                                      │
│  • Next.js 15 (App Router)                                  │
│  • React 19                                                 │
│  • TypeScript                                               │
│  • Tailwind CSS + shadcn/ui                                 │
│  • Supabase Auth (autenticação)                             │
│                                                              │
│  Responsabilidades:                                         │
│  • Editor visual de LPs                                     │
│  • Gerenciamento de conteúdo (CRUD)                         │
│  • Dashboard de analytics                                   │
│  • A/B testing                                              │
│  • Gestão de produtos                                       │
│  • Versionamento de LPs                                     │
│  • LEITURA + ESCRITA no banco                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 🗄️ PARTE 1: BANCO DE DADOS

### 1.1 Estrutura Criada

Já criamos a estrutura completa do banco de dados:

**Arquivos:**
- `database/migrations/001_landing_pages_system.sql` - Estrutura completa
- `database/schemas/lp_variables_schema.json` - Schema das variáveis
- `database/seeds/001_initial_templates.sql` - Templates iniciais
- `database/seeds/002_initial_landing_pages.sql` - LP principal (empresas)

**Tabelas:**
1. `lp_templates` - Templates fixos (estrutura das LPs)
2. `landing_pages` - Instâncias de LPs (conteúdo editável)
3. `lp_products` - Relacionamento LP ↔ Produtos
4. `lp_analytics` - Métricas agregadas
5. `lp_versions` - Histórico de mudanças

### 1.2 Como Aplicar no Supabase

```bash
# 1. Acessar Supabase Dashboard
# https://supabase.com/dashboard/project/YOUR_PROJECT_ID

# 2. Ir em SQL Editor

# 3. Executar migrations na ordem:
# - 001_landing_pages_system.sql (estrutura)
# - 001_initial_templates.sql (templates)
# - 002_initial_landing_pages.sql (LP empresas)
```

---

## 🎨 PARTE 2: CRIADORES.DIGITAL (Editor/CRM)

### 2.1 Estrutura do Projeto

```
criadores-digital/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── layout.tsx
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Layout com sidebar
│   │   │
│   │   ├── page.tsx                # Dashboard principal
│   │   │
│   │   ├── landing-pages/
│   │   │   ├── page.tsx            # Lista de LPs
│   │   │   ├── new/
│   │   │   │   └── page.tsx        # Criar nova LP
│   │   │   └── [id]/
│   │   │       ├── page.tsx        # Visualizar LP
│   │   │       ├── edit/
│   │   │       │   └── page.tsx    # Editor de LP
│   │   │       ├── analytics/
│   │   │       │   └── page.tsx    # Analytics da LP
│   │   │       └── versions/
│   │   │           └── page.tsx    # Histórico de versões
│   │   │
│   │   ├── products/
│   │   │   ├── page.tsx            # Lista de produtos
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Editar produto
│   │   │
│   │   ├── templates/
│   │   │   ├── page.tsx            # Lista de templates
│   │   │   └── [id]/
│   │   │       └── page.tsx        # Visualizar template
│   │   │
│   │   └── analytics/
│   │       └── page.tsx            # Analytics global
│   │
│   ├── api/
│   │   ├── landing-pages/
│   │   │   ├── route.ts            # GET, POST
│   │   │   └── [id]/
│   │   │       ├── route.ts        # GET, PUT, DELETE
│   │   │       ├── publish/
│   │   │       │   └── route.ts    # POST - Publicar LP
│   │   │       └── duplicate/
│   │   │           └── route.ts    # POST - Duplicar LP
│   │   │
│   │   ├── templates/
│   │   │   └── route.ts
│   │   │
│   │   ├── analytics/
│   │   │   └── route.ts
│   │   │
│   │   └── products/
│   │       └── route.ts
│   │
│   └── layout.tsx
│   └── globals.css
│
├── components/
│   ├── dashboard/
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   └── StatsCard.tsx
│   │
│   ├── landing-pages/
│   │   ├── LPList.tsx
│   │   ├── LPCard.tsx
│   │   └── LPStatusBadge.tsx
│   │
│   ├── editor/
│   │   ├── LPEditor.tsx            # Editor principal
│   │   ├── VariablesForm.tsx       # Formulário de variáveis
│   │   ├── SectionEditor.tsx       # Editor de seção
│   │   ├── ColorPicker.tsx
│   │   ├── ImageUploader.tsx
│   │   └── PreviewPanel.tsx        # Preview em tempo real
│   │
│   ├── analytics/
│   │   ├── ConversionChart.tsx
│   │   ├── TrafficChart.tsx
│   │   └── MetricsGrid.tsx
│   │
│   └── ui/                         # shadcn/ui components
│       ├── button.tsx
│       ├── input.tsx
│       ├── textarea.tsx
│       ├── select.tsx
│       ├── dialog.tsx
│       ├── tabs.tsx
│       └── ...
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Cliente Supabase
│   │   └── server.ts               # Server-side Supabase
│   │
│   ├── services/
│   │   ├── landingPagesService.ts  # CRUD de LPs
│   │   ├── templatesService.ts     # CRUD de templates
│   │   ├── analyticsService.ts     # Analytics
│   │   └── productsService.ts      # Produtos
│   │
│   ├── hooks/
│   │   ├── useLandingPages.ts
│   │   ├── useTemplates.ts
│   │   └── useAnalytics.ts
│   │
│   ├── types/
│   │   ├── landing-page.ts
│   │   ├── template.ts
│   │   └── analytics.ts
│   │
│   └── utils/
│       ├── validation.ts           # Validação de variáveis
│       └── formatting.ts
│
├── public/
│   └── assets/
│
├── .env.local
├── next.config.js
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 📝 PARTE 3: PROMPTS DETALHADOS PARA DESENVOLVIMENTO

### 3.1 Setup Inicial do Projeto

```bash
# Prompt para IA:
"""
Crie um novo projeto Next.js 15 com as seguintes especificações:

STACK:
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase (client + auth)

COMANDOS:
npx create-next-app@latest criadores-digital --typescript --tailwind --app
cd criadores-digital
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npx shadcn-ui@latest init

CONFIGURAÇÕES:
1. Configurar Tailwind com Material Design 3 tokens
2. Configurar Supabase client em lib/supabase/client.ts
3. Configurar autenticação com Supabase Auth
4. Criar layout base com sidebar

VARIÁVEIS DE AMBIENTE (.env.local):
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
"""
```

---

### 3.2 Criar Serviço de Landing Pages

```typescript
// Prompt para IA:
"""
Crie o arquivo lib/services/landingPagesService.ts com as seguintes funções:

FUNÇÕES NECESSÁRIAS:
1. getAllLandingPages() - Listar todas as LPs
2. getLandingPageBySlug(slug) - Buscar LP por slug
3. getLandingPageById(id) - Buscar LP por ID
4. createLandingPage(data) - Criar nova LP
5. updateLandingPage(id, data) - Atualizar LP
6. deleteLandingPage(id) - Deletar LP
7. publishLandingPage(id) - Publicar LP (mudar status para 'active')
8. duplicateLandingPage(id) - Duplicar LP para A/B test
9. getLandingPageVersions(id) - Buscar histórico de versões
10. restoreLandingPageVersion(id, versionId) - Restaurar versão

TECNOLOGIAS:
- Supabase client
- TypeScript com tipos fortes
- Error handling completo
- Validação de dados

EXEMPLO DE ESTRUTURA:
import { createClient } from '@/lib/supabase/client';
import type { LandingPage, LandingPageCreate, LandingPageUpdate } from '@/lib/types/landing-page';

export class LandingPagesService {
  private supabase = createClient();

  async getAllLandingPages(): Promise<LandingPage[]> {
    const { data, error } = await this.supabase
      .from('landing_pages')
      .select('*, template:lp_templates(*), products:lp_products(product:products(*))')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // ... outras funções
}

export const landingPagesService = new LandingPagesService();
"""
```

---

### 3.3 Criar Editor de Landing Pages

```typescript
// Prompt para IA:
"""
Crie o componente components/editor/LPEditor.tsx - Editor visual de Landing Pages

REQUISITOS:

1. INTERFACE:
   - Tabs para cada seção (Hero, Problema, Soluções, Combo, etc)
   - Formulário dinâmico baseado no schema JSON
   - Preview em tempo real (lado direito)
   - Botões: Salvar, Publicar, Preview, Versões

2. FUNCIONALIDADES:
   - Auto-save a cada 30 segundos
   - Validação em tempo real
   - Undo/Redo
   - Drag & drop para reordenar itens de array
   - Upload de imagens
   - Color picker
   - Rich text editor para textos longos

3. SEÇÕES EDITÁVEIS:
   - Hero (título, subtítulo, CTA, cores, imagem)
   - Problema (título, lista de problemas)
   - Soluções (array de produtos com copy customizada)
   - Combo (preços, descontos, bônus)
   - Depoimentos (array com nome, foto, texto, resultado)
   - FAQ (array de perguntas/respostas)
   - Tema (cores, fontes)

4. COMPONENTES UI (shadcn/ui):
   - Tabs
   - Input
   - Textarea
   - Select
   - Button
   - Dialog
   - Toast (notificações)
   - ColorPicker (custom)
   - ImageUploader (custom)

5. METODOLOGIAS:
   - Tooltips em cada campo explicando a metodologia (Érico Rocha, Ladeira, Jeff Walker)
   - Exemplos de copy persuasivo
   - Validação de boas práticas

EXEMPLO DE ESTRUTURA:
'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { landingPagesService } from '@/lib/services/landingPagesService';
import type { LandingPage } from '@/lib/types/landing-page';

import { HeroEditor } from './sections/HeroEditor';
import { ProblemaEditor } from './sections/ProblemaEditor';
import { SolucoesEditor } from './sections/SolucoesEditor';
// ... outros editores

export function LPEditor({ lpId }: { lpId: string }) {
  const [lp, setLP] = useState<LandingPage | null>(null);
  const [variables, setVariables] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  // Carregar LP
  useEffect(() => {
    loadLP();
  }, [lpId]);

  // Auto-save
  useEffect(() => {
    const timer = setTimeout(() => {
      if (variables) {
        handleSave();
      }
    }, 30000); // 30 segundos

    return () => clearTimeout(timer);
  }, [variables]);

  const loadLP = async () => {
    const data = await landingPagesService.getLandingPageById(lpId);
    setLP(data);
    setVariables(data.variables);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await landingPagesService.updateLandingPage(lpId, { variables });
      toast({ title: 'Salvo com sucesso!' });
    } catch (error) {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    await landingPagesService.publishLandingPage(lpId);
    toast({ title: 'LP publicada!' });
  };

  return (
    <div className="flex h-screen">
      {/* Editor (esquerda) */}
      <div className="w-1/2 overflow-y-auto p-6">
        <div className="flex justify-between mb-6">
          <h1 className="text-2xl font-bold">{lp?.name}</h1>
          <div className="space-x-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button onClick={handlePublish} variant="default">
              Publicar
            </Button>
          </div>
        </div>

        <Tabs defaultValue="hero">
          <TabsList>
            <TabsTrigger value="hero">Hero</TabsTrigger>
            <TabsTrigger value="problema">Problema</TabsTrigger>
            <TabsTrigger value="solucoes">Soluções</TabsTrigger>
            <TabsTrigger value="combo">Combo</TabsTrigger>
            <TabsTrigger value="depoimentos">Depoimentos</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="tema">Tema</TabsTrigger>
          </TabsList>

          <TabsContent value="hero">
            <HeroEditor
              data={variables.hero}
              onChange={(hero) => setVariables({ ...variables, hero })}
            />
          </TabsContent>

          <TabsContent value="problema">
            <ProblemaEditor
              data={variables.problema}
              onChange={(problema) => setVariables({ ...variables, problema })}
            />
          </TabsContent>

          {/* ... outras tabs */}
        </Tabs>
      </div>

      {/* Preview (direita) */}
      <div className="w-1/2 bg-gray-100 overflow-y-auto">
        <PreviewPanel variables={variables} />
      </div>
    </div>
  );
}
"""
```

---

### 3.4 Criar Dashboard de Analytics

```typescript
// Prompt para IA:
"""
Crie a página app/(dashboard)/landing-pages/[id]/analytics/page.tsx

REQUISITOS:

1. MÉTRICAS PRINCIPAIS (Cards no topo):
   - Views totais
   - Conversões
   - Taxa de conversão
   - Tempo médio na página

2. GRÁFICOS:
   - Gráfico de linha: Views e Conversões ao longo do tempo (últimos 30 dias)
   - Gráfico de barras: Cliques por seção
   - Gráfico de pizza: Dispositivos (mobile, desktop, tablet)
   - Gráfico de pizza: Fontes de tráfego (orgânico, direto, social, pago)

3. TABELA:
   - Performance por seção (views, scroll depth, cliques)

4. FILTROS:
   - Período (7 dias, 30 dias, 90 dias, custom)
   - Dispositivo
   - Fonte de tráfego

5. TECNOLOGIAS:
   - Recharts para gráficos
   - shadcn/ui para componentes
   - Supabase para dados

EXEMPLO:
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { LineChart, BarChart, PieChart } from 'recharts';
import { analyticsService } from '@/lib/services/analyticsService';

export default function AnalyticsPage({ params }: { params: { id: string } }) {
  const [period, setPeriod] = useState('30');
  const [metrics, setMetrics] = useState<any>(null);

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    const data = await analyticsService.getLPAnalytics(params.id, parseInt(period));
    setMetrics(data);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <Select value={period} onValueChange={setPeriod}>
          <option value="7">Últimos 7 dias</option>
          <option value="30">Últimos 30 dias</option>
          <option value="90">Últimos 90 dias</option>
        </Select>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Views</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics?.views}</p>
          </CardContent>
        </Card>
        {/* ... outros cards */}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Views e Conversões</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart data={metrics?.timeline} />
          </CardContent>
        </Card>
        {/* ... outros gráficos */}
      </div>
    </div>
  );
}
"""
```

---

## 🔐 PARTE 4: AUTENTICAÇÃO

### 4.1 Setup Supabase Auth

```typescript
// Prompt para IA:
"""
Configure autenticação com Supabase Auth no criadores.digital

REQUISITOS:

1. CRIAR MIDDLEWARE (middleware.ts):
   - Proteger rotas do dashboard
   - Redirecionar não autenticados para /login
   - Permitir acesso público a /login

2. CRIAR PÁGINA DE LOGIN (app/(auth)/login/page.tsx):
   - Email + Senha
   - Magic Link (opcional)
   - Integração com Supabase Auth

3. CRIAR HOOKS:
   - useAuth() - Hook para acessar usuário atual
   - useRequireAuth() - Hook para proteger páginas

4. POLÍTICAS RLS NO SUPABASE:
   - Apenas usuários autenticados podem editar LPs
   - Leitura pública para LPs ativas

EXEMPLO DE MIDDLEWARE:
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Proteger rotas do dashboard
  if (req.nextUrl.pathname.startsWith('/landing-pages') && !session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
"""
```

---

## 📊 PARTE 5: INTEGRAÇÃO COM CRIADORES.APP

### 5.1 API de Leitura para criadores.app

```typescript
// Prompt para IA:
"""
No criadores.app, crie o serviço lib/services/landingPagesService.ts para LEITURA

FUNÇÕES:
1. getLandingPageBySlug(slug) - Buscar LP ativa por slug
2. getActiveLandingPages() - Listar todas as LPs ativas

IMPORTANTE:
- Apenas LEITURA (SELECT)
- Apenas LPs com status='active' e is_active=true
- Cache agressivo (revalidate a cada 60 segundos)

EXEMPLO:
import { createClient } from '@/lib/supabase/client';

export async function getLandingPageBySlug(slug: string) {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('landing_pages')
    .select('*, template:lp_templates(*), products:lp_products(product:products(*))')
    .eq('slug', slug)
    .eq('status', 'active')
    .eq('is_active', true)
    .single();

  if (error) throw error;
  return data;
}
"""
```

### 5.2 Componente Dinâmico no criadores.app

```typescript
// Prompt para IA:
"""
No criadores.app, crie app/[slug]/page.tsx - Página dinâmica para renderizar LPs

REQUISITOS:
1. Buscar LP do banco por slug
2. Renderizar seções baseado no template
3. Aplicar variáveis (variables) em cada seção
4. Aplicar tema (cores, fontes)
5. SEO dinâmico (metadata)
6. Analytics tracking

EXEMPLO:
import { getLandingPageBySlug } from '@/lib/services/landingPagesService';
import { DynamicLP } from '@/components/DynamicLP';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const lp = await getLandingPageBySlug(params.slug);
  
  return {
    title: lp.seo.title,
    description: lp.seo.description,
    openGraph: {
      title: lp.seo.title,
      description: lp.seo.description,
      images: [lp.seo.og_image],
    },
  };
}

export default async function LandingPage({ params }: { params: { slug: string } }) {
  const lp = await getLandingPageBySlug(params.slug);
  
  if (!lp) notFound();
  
  return <DynamicLP lp={lp} />;
}
"""
```

---

## ✅ CHECKLIST DE DESENVOLVIMENTO

### Fase 1: Setup (Semana 1)
- [ ] Criar projeto criadores.digital
- [ ] Configurar Supabase
- [ ] Aplicar migrations no banco
- [ ] Configurar autenticação
- [ ] Criar layout base com sidebar

### Fase 2: CRUD de LPs (Semana 2)
- [ ] Criar serviço landingPagesService
- [ ] Criar página de lista de LPs
- [ ] Criar página de visualização de LP
- [ ] Criar funcionalidade de duplicar LP
- [ ] Criar funcionalidade de deletar LP

### Fase 3: Editor (Semana 3-4)
- [ ] Criar componente LPEditor
- [ ] Criar editores de seção (Hero, Problema, etc)
- [ ] Implementar auto-save
- [ ] Implementar preview em tempo real
- [ ] Implementar upload de imagens
- [ ] Implementar color picker

### Fase 4: Analytics (Semana 5)
- [ ] Criar serviço analyticsService
- [ ] Criar dashboard de analytics
- [ ] Implementar gráficos
- [ ] Implementar filtros

### Fase 5: Integração (Semana 6)
- [ ] Atualizar criadores.app para ler do banco
- [ ] Criar componente DynamicLP
- [ ] Testar todas as 6 LPs existentes
- [ ] Migrar LPs hardcoded para o banco

### Fase 6: Testes e Deploy (Semana 7)
- [ ] Testes end-to-end
- [ ] Deploy criadores.digital
- [ ] Deploy criadores.app atualizado
- [ ] Documentação final

---

## 🎯 PRÓXIMOS PASSOS IMEDIATOS

1. **Aplicar migrations no Supabase**
2. **Criar projeto criadores.digital**
3. **Começar pelo serviço landingPagesService**

Quer que eu gere os prompts detalhados para cada componente específico?

