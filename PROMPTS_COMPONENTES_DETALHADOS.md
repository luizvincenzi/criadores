# 🎯 PROMPTS DETALHADOS - COMPONENTES CRIADORES.DIGITAL

Este documento contém prompts específicos para criar cada componente do sistema.

---

## 📝 PROMPT 1: Serviço de Landing Pages

```
Crie o arquivo lib/services/landingPagesService.ts

CONTEXTO:
Estou criando um CRM para gerenciar Landing Pages dinâmicas. As LPs são armazenadas no Supabase com a seguinte estrutura:

TABELAS:
- landing_pages (id, slug, name, category, template_id, variables JSONB, config JSONB, seo JSONB, status, is_active)
- lp_templates (id, name, slug, methodology, structure JSONB)
- lp_products (lp_id, product_id, order_index, custom_data JSONB)
- lp_versions (id, lp_id, snapshot JSONB, version_number)

REQUISITOS:
1. Criar classe LandingPagesService com TypeScript
2. Usar Supabase client (@supabase/supabase-js)
3. Implementar as seguintes funções:
   - getAllLandingPages(): Promise<LandingPage[]>
   - getLandingPageById(id: string): Promise<LandingPage>
   - getLandingPageBySlug(slug: string): Promise<LandingPage>
   - createLandingPage(data: LandingPageCreate): Promise<LandingPage>
   - updateLandingPage(id: string, data: LandingPageUpdate): Promise<LandingPage>
   - deleteLandingPage(id: string): Promise<void>
   - publishLandingPage(id: string): Promise<LandingPage>
   - duplicateLandingPage(id: string, newSlug: string): Promise<LandingPage>
   - getLandingPageVersions(id: string): Promise<LPVersion[]>
   - restoreLandingPageVersion(id: string, versionId: string): Promise<LandingPage>

4. Cada função deve:
   - Fazer JOIN com tabelas relacionadas (template, products)
   - Ter error handling completo
   - Retornar tipos TypeScript corretos
   - Validar dados antes de salvar

5. Criar tipos TypeScript em lib/types/landing-page.ts:
   - LandingPage
   - LandingPageCreate
   - LandingPageUpdate
   - LPTemplate
   - LPVersion

EXEMPLO DE USO:
const lp = await landingPagesService.getLandingPageBySlug('empresas');
console.log(lp.variables.hero.title); // "Transforme Sua Empresa..."

TECNOLOGIAS:
- TypeScript
- Supabase client
- Zod para validação (opcional)
```

---

## 📝 PROMPT 2: Editor de Hero Section

```
Crie o componente components/editor/sections/HeroEditor.tsx

CONTEXTO:
Estou criando um editor visual de Landing Pages. Preciso de um editor para a seção Hero que segue as metodologias de Érico Rocha, Ladeira e Jeff Walker.

ESTRUTURA DE DADOS (variables.hero):
{
  "title": "Transforme Sua Empresa Numa Referência Regional",
  "subtitle": "Escolha a solução ideal...",
  "cta_text": "Falar Com Especialista Agora",
  "cta_url": "/chatcriadores-empresas",
  "urgency_badge": "Últimas 3 vagas de 2025",
  "social_proof": {
    "empresas": 40,
    "locais": 20,
    "conteudos": 1000
  },
  "trust_badges": ["Sem taxa de adesão", "Sem fidelidade"]
}

REQUISITOS:
1. Criar formulário com os seguintes campos:
   - title (Input, max 100 chars)
     * Label: "Título Principal"
     * Tooltip: "Use transformação específica (Érico Rocha)"
     * Placeholder: "Transforme Sua Empresa..."
   
   - subtitle (Textarea, max 500 chars)
     * Label: "Subtítulo"
     * Tooltip: "Explique o 'como' (Ladeira)"
   
   - cta_text (Input, max 50 chars)
     * Label: "Texto do Botão"
     * Tooltip: "Ação clara e específica (Ladeira)"
   
   - cta_url (Input, type URL)
     * Label: "Link do Botão"
     * Select com opções: /chatcriadores-empresas, /chatcriadores-mentoria, etc
   
   - urgency_badge (Input, max 100 chars)
     * Label: "Badge de Urgência"
     * Tooltip: "Escassez real (Jeff Walker)"
   
   - social_proof (Group de 3 inputs numéricos)
     * empresas, locais, conteudos
   
   - trust_badges (Array de strings)
     * Adicionar/remover badges
     * Drag & drop para reordenar

2. Validação em tempo real:
   - Título não pode estar vazio
   - CTA não pode estar vazio
   - URL deve ser válida

3. UI/UX:
   - Usar shadcn/ui components (Input, Textarea, Button, Label, Tooltip)
   - Mostrar contador de caracteres
   - Highlight de erros em vermelho
   - Ícones de ajuda com tooltips

4. Props:
   - data: HeroData
   - onChange: (data: HeroData) => void

EXEMPLO DE CÓDIGO:
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tooltip } from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';

interface HeroData {
  title: string;
  subtitle: string;
  cta_text: string;
  cta_url: string;
  urgency_badge: string;
  social_proof: {
    empresas: number;
    locais: number;
    conteudos: number;
  };
  trust_badges: string[];
}

interface HeroEditorProps {
  data: HeroData;
  onChange: (data: HeroData) => void;
}

export function HeroEditor({ data, onChange }: HeroEditorProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
    
    // Validação
    if (field === 'title' && !value) {
      setErrors({ ...errors, title: 'Título é obrigatório' });
    } else {
      const { [field]: _, ...rest } = errors;
      setErrors(rest);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Label htmlFor="title">
          Título Principal
          <Tooltip content="Use transformação específica (Érico Rocha)">
            <InfoIcon />
          </Tooltip>
        </Label>
        <Input
          id="title"
          value={data.title}
          onChange={(e) => handleChange('title', e.target.value)}
          maxLength={100}
          placeholder="Transforme Sua Empresa..."
          error={errors.title}
        />
        <p className="text-sm text-gray-500">{data.title.length}/100</p>
      </div>

      {/* ... outros campos */}
    </div>
  );
}
```

---

## 📝 PROMPT 3: Preview Panel

```
Crie o componente components/editor/PreviewPanel.tsx

CONTEXTO:
Preciso de um painel de preview que mostre em tempo real como a Landing Page vai ficar com as variáveis editadas.

REQUISITOS:
1. Receber variables (objeto completo da LP)
2. Renderizar preview de cada seção:
   - Hero
   - Problema
   - Soluções
   - Combo
   - Depoimentos
   - FAQ

3. Aplicar tema (cores, fontes) dinamicamente

4. Responsivo:
   - Toggle entre desktop/mobile/tablet
   - Zoom in/out

5. Scroll sincronizado:
   - Quando editar uma seção, scroll automático para ela no preview

EXEMPLO:
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PreviewPanelProps {
  variables: any;
}

export function PreviewPanel({ variables }: PreviewPanelProps) {
  const [device, setDevice] = useState<'desktop' | 'mobile' | 'tablet'>('desktop');
  const [zoom, setZoom] = useState(100);

  const deviceWidths = {
    desktop: '100%',
    tablet: '768px',
    mobile: '375px',
  };

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex gap-2">
          <Button
            variant={device === 'desktop' ? 'default' : 'outline'}
            onClick={() => setDevice('desktop')}
          >
            Desktop
          </Button>
          <Button
            variant={device === 'tablet' ? 'default' : 'outline'}
            onClick={() => setDevice('tablet')}
          >
            Tablet
          </Button>
          <Button
            variant={device === 'mobile' ? 'default' : 'outline'}
            onClick={() => setDevice('mobile')}
          >
            Mobile
          </Button>
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setZoom(Math.max(50, zoom - 10))}>-</Button>
          <span>{zoom}%</span>
          <Button onClick={() => setZoom(Math.min(150, zoom + 10))}>+</Button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4">
        <div
          style={{
            width: deviceWidths[device],
            margin: '0 auto',
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
          }}
        >
          {/* Renderizar LP */}
          <div style={{ backgroundColor: variables.theme?.primary_color || '#0b3553' }}>
            <HeroPreview data={variables.hero} theme={variables.theme} />
            <ProblemaPreview data={variables.problema} />
            {/* ... outras seções */}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

## 📝 PROMPT 4: Dashboard Principal

```
Crie a página app/(dashboard)/page.tsx - Dashboard principal

CONTEXTO:
Dashboard principal do CRM com visão geral de todas as Landing Pages e métricas.

REQUISITOS:
1. Cards de métricas no topo:
   - Total de LPs ativas
   - Total de views (últimos 30 dias)
   - Total de conversões (últimos 30 dias)
   - Taxa de conversão média

2. Tabela de LPs:
   - Nome
   - Slug
   - Status (draft, active, archived)
   - Views (últimos 7 dias)
   - Conversões (últimos 7 dias)
   - Taxa de conversão
   - Última atualização
   - Ações (Editar, Analytics, Duplicar, Deletar)

3. Filtros:
   - Status
   - Categoria
   - Busca por nome/slug

4. Ações rápidas:
   - Botão "Nova LP"
   - Botão "Ver Analytics Global"

TECNOLOGIAS:
- shadcn/ui (Card, Table, Button, Badge, Select)
- Supabase para dados
- React hooks (useState, useEffect)

EXEMPLO:
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { landingPagesService } from '@/lib/services/landingPagesService';
import { analyticsService } from '@/lib/services/analyticsService';
import Link from 'next/link';

export default function DashboardPage() {
  const [lps, setLPs] = useState([]);
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [lpsData, metricsData] = await Promise.all([
      landingPagesService.getAllLandingPages(),
      analyticsService.getGlobalMetrics(30),
    ]);
    setLPs(lpsData);
    setMetrics(metricsData);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/landing-pages/new">
          <Button>Nova LP</Button>
        </Link>
      </div>

      {/* Cards de métricas */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>LPs Ativas</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics?.active_lps}</p>
          </CardContent>
        </Card>
        {/* ... outros cards */}
      </div>

      {/* Tabela de LPs */}
      <Card>
        <CardHeader>
          <CardTitle>Landing Pages</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Views (7d)</th>
                <th>Conversões (7d)</th>
                <th>Taxa</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {lps.map((lp) => (
                <tr key={lp.id}>
                  <td>{lp.name}</td>
                  <td>{lp.slug}</td>
                  <td>
                    <Badge variant={lp.status === 'active' ? 'success' : 'default'}>
                      {lp.status}
                    </Badge>
                  </td>
                  <td>{lp.metrics?.views_7d || 0}</td>
                  <td>{lp.metrics?.conversions_7d || 0}</td>
                  <td>{lp.metrics?.conversion_rate_7d || 0}%</td>
                  <td>
                    <Link href={`/landing-pages/${lp.id}/edit`}>
                      <Button size="sm">Editar</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 📝 PROMPT 5: Componente Dinâmico (criadores.app)

```
Crie o componente components/DynamicLP.tsx no criadores.app

CONTEXTO:
Componente que renderiza uma Landing Page dinamicamente baseado nos dados do banco.

REQUISITOS:
1. Receber LP completa (variables, template, products, config, seo)
2. Renderizar seções baseado no template.structure.sections
3. Aplicar variáveis em cada seção
4. Aplicar tema (cores, fontes)
5. Tracking de analytics

SEÇÕES DISPONÍVEIS:
- HeroSection
- ProblemaSection
- DadosMercadoSection
- SolucaoSection (repetível)
- ComboSection
- ProcessoSection
- DepoimentosSection
- UrgenciaSection
- FAQSection
- CTAFinalSection

EXEMPLO:
'use client';

import { useEffect } from 'react';
import { HeroSection } from './sections/HeroSection';
import { ProblemaSection } from './sections/ProblemaSection';
// ... outras seções
import { trackPageView } from '@/lib/analytics';

interface DynamicLPProps {
  lp: LandingPage;
}

export function DynamicLP({ lp }: DynamicLPProps) {
  const { variables, template, config } = lp;

  useEffect(() => {
    // Track page view
    trackPageView(lp.id, config.analytics);
  }, []);

  const renderSection = (section: any) => {
    switch (section.id) {
      case 'hero':
        return <HeroSection key={section.id} data={variables.hero} theme={variables.theme} />;
      case 'problema':
        return <ProblemaSection key={section.id} data={variables.problema} />;
      case 'solucao-1':
        return <SolucaoSection key={section.id} data={variables.solucoes[0]} theme={variables.theme} />;
      // ... outros cases
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: variables.theme.font_family }}>
      <PMEsHeader />
      {template.structure.sections.map(renderSection)}
      <PMEsFooter />
    </div>
  );
}
```

---

## 🎯 ORDEM DE IMPLEMENTAÇÃO RECOMENDADA

1. **Serviço de Landing Pages** (Prompt 1)
2. **Dashboard Principal** (Prompt 4)
3. **Editor de Hero** (Prompt 2)
4. **Preview Panel** (Prompt 3)
5. **Componente Dinâmico** (Prompt 5)
6. Repetir Prompt 2 para outras seções (Problema, Soluções, etc)

---

Quer que eu gere mais prompts para componentes específicos?

