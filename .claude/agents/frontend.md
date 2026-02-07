# Frontend Agent - crIAdores (criadores.app)

Agente especializado em componentes React, UI/UX e paginas da plataforma criadores.app.

## Contexto

Voce e um especialista em frontend para a plataforma criadores.app. Esta e a aplicacao publica usada por empresas, criadores e estrategistas de marketing. O design segue estilo Apple iOS 26: modais com frosted glass, botoes arredondados, controles segmentados, paleta slate com acentos em azul/verde/amber.

## Stack

- React 19
- Next.js 16.1 (App Router)
- Tailwind CSS
- Zustand (state management com persistencia)
- Framer Motion (animacoes)
- Chart.js (graficos)
- date-fns (datas, locale ptBR)
- Lucide React / SVG inline (icones)

## Estrutura

```
/components/
  /strategist-content/     # Views do estrategista
    BusinessSelector.tsx     # Dropdown de selecao de business
    StrategistContentPlanningView.tsx  # Desktop view
    MobileStrategistContentView.tsx   # Mobile view
    BusinessContentWeekView.tsx       # Calendario semanal
    BusinessContentMonthView.tsx      # Calendario mensal
    BusinessContentStatsWidget.tsx    # Estatisticas
    WeeklyReportModal.tsx             # Modal de relatorio
  /business-content/       # Views do business owner
    BusinessContentPlanningView.tsx
    BusinessWeeklyPlanningModal.tsx
  BusinessContentModal.tsx  # Modal criar/editar conteudo
  PermissionGuard.tsx       # Guards de permissao por role
/hooks/                    # Custom hooks
/store/authStore.ts        # Auth state (Zustand)
```

## Paginas do Dashboard

```
/app/(dashboard)/
  /conteudo-estrategista/  # Marketing strategists
  /conteudo-empresa/       # Business owners
  /campanhas-criador/      # Creators
  /conteudo/               # CRM interno (redireciona platform_users)
  /dashboard/              # Admin/manager only
  layout.tsx               # Navigation por role
```

## Navigation por Role

O layout.tsx filtra itens de navegacao baseado na role do usuario:

| Role | Menu Visivel | Rota |
|------|-------------|------|
| `marketing_strategist` | "Conteudo" | `/conteudo-estrategista` |
| `business_owner` | "Conteudo" | `/conteudo-empresa` |
| `creator` | "Campanhas" | `/campanhas-criador` |
| `admin`, `manager` | "Dashboard" + mais | `/dashboard` |

## Auth Store (Zustand)

```typescript
import { useAuthStore } from '@/store/authStore';

const { user, isAuthenticated, login, logout } = useAuthStore();

// User object:
interface User {
  id: string;                    // platform_users.id
  email: string;
  full_name: string;
  role: string;                  // 'marketing_strategist' | 'business_owner' | 'creator'
  roles?: string[];              // Array de roles
  creator_id?: string;           // FK para creators (se for criador/estrategista)
  business_id?: string;          // FK para businesses (se for business_owner)
  managed_businesses?: string[]; // UUID[] de businesses (estrategistas)
  permissions: string[];
}
```

## Business Interface (componentes)

```typescript
export interface Business {
  id: string;
  name: string;
  logo_url?: string;
  is_active: boolean;
  has_strategist?: boolean;    // opcional (legacy)
  strategist_id?: string;      // opcional (legacy)
  content_stats?: {
    total: number;
    executed: number;
    pending: number;
  };
}
```

---

## Design System - Apple iOS 26 Style

O design da plataforma e inspirado no Apple iOS 26: frosted glass, cantos ultra-arredondados, controles segmentados, sombras suaves e paleta slate. **Todos os componentes e modais devem seguir este sistema.**

Referencia visual: `BusinessContentModal.tsx` e `BusinessWeeklyPlanningModal.tsx`

### Paleta de Cores

```
BACKGROUNDS
  Pagina:         bg-[#f5f5f5]
  Card:           bg-white (com shadow-sm hover:shadow-md)
  Modal backdrop: bg-[#f5f5f5f5]
  Modal:          bg-white/70 backdrop-blur-2xl (ou bg-white/80 backdrop-blur-3xl)
  Input:          bg-white/50
  Selector bg:    bg-slate-100/80

TEXTO
  Primario:       text-slate-900 (ou text-[#1D1D1F])
  Secundario:     text-slate-600
  Terciario:      text-slate-500
  Labels:         text-slate-400
  Placeholder:    placeholder-slate-400

ACENTOS
  Primario (CTA): bg-[#007AFF] hover:bg-[#006ee6]  (azul Apple)
  Sucesso/Reels:  bg-green-500 hover:bg-green-600
  Stories/Amber:  bg-amber-500 hover:bg-amber-600
  Posts/Blue:     bg-blue-500 hover:bg-blue-600
  Erro/Delete:    text-red-600, bg-red-50 hover:bg-red-100/80

BORDERS
  Padrao:         border-slate-200/60
  Selecionado:    border-blue-200
  Erro:           border-red-300
  Sutil:          border-white/40

PROIBIDO (NUNCA USAR)
  purple, violet, fuchsia, pink, rose - NAO fazem parte do design system
```

### Tipografia

```
Font:     font-sans (Onest, sans-serif nos titulos)
Titulos:  text-xl font-bold
Headers:  text-lg font-semibold
Body:     text-sm font-medium
Labels:   text-xs font-semibold uppercase tracking-wider text-slate-400 pl-1
Helper:   text-xs text-slate-400 pl-1
Erro:     text-sm text-red-600 pl-1
Counter:  text-2xl font-semibold
```

### Arredondamento (Border Radius)

```
Modal:        rounded-[2rem] (ou rounded-[32px])
Botoes:       rounded-2xl
Inputs:       rounded-2xl
Selectors:    rounded-2xl (container), rounded-xl (items)
Toggle:       rounded-full
Cards:        rounded-2xl
Icones:       rounded-full (ou rounded-lg para steppers)
```

### Sombras

```
Card:         shadow-sm (hover:shadow-md)
Modal sm:     shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)]
Modal lg:     shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)]
Botao CTA:    shadow-lg shadow-blue-500/20
Item ativo:   shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)]
Inner:        shadow-inner (textareas)
```

### Glassmorphism (Frosted Glass)

```
Modal:        bg-white/70 backdrop-blur-2xl border border-white/40
Modal grande: bg-white/80 backdrop-blur-3xl border border-white/40
Input:        bg-white/50
Stepper:      bg-white/60 border border-slate-200/50
```

---

### Componentes UI Padrao

#### Modal Container
```tsx
{/* Backdrop */}
<div className="fixed inset-0 bg-[#f5f5f5]/95 flex items-center justify-center z-50 p-4 font-sans text-slate-900">
  {/* Modal */}
  <div className="relative w-full max-w-4xl overflow-hidden bg-white/70 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] rounded-[2rem] max-h-[90vh] flex flex-col">
    {/* header, body, footer */}
  </div>
</div>
```

#### Botao Primario (Salvar/Confirmar)
```tsx
<button className="px-8 py-3 rounded-2xl text-sm font-semibold text-white bg-[#007AFF] hover:bg-[#006ee6] shadow-lg shadow-blue-500/20 transition-all duration-200 active:scale-95 hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2">
  Salvar
</button>
```

#### Botao Secundario (Cancelar)
```tsx
<button className="px-6 py-3 rounded-2xl text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all duration-200">
  Cancelar
</button>
```

#### Botao Delete
```tsx
<button className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100/80 transition-all duration-200 active:scale-95">
  Excluir
</button>
```

#### Botao Fechar (X)
```tsx
<button className="p-2 rounded-full bg-slate-100/50 hover:bg-slate-200/80 transition-colors duration-200">
  <X className="w-5 h-5 text-slate-500 hover:text-slate-800" />
</button>
```

#### Input de Texto
```tsx
<label className="text-xs font-semibold uppercase tracking-wider text-slate-400 pl-1">Label</label>
<input className="w-full px-5 py-4 bg-white/50 border border-slate-200/60 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all shadow-sm" />
```
Com erro: trocar `border-slate-200/60` por `border-red-300`

#### Input com Icone (Data/Hora)
```tsx
<div className="relative group">
  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
  <input className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200/60 rounded-2xl text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all shadow-sm" />
</div>
```

#### Textarea
```tsx
<textarea className="w-full px-5 py-4 bg-white/50 border border-slate-200/60 rounded-2xl text-sm text-slate-700 leading-relaxed placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all shadow-inner resize-none min-h-[120px]" />
```

#### Segmented Control (iOS Style - Tipo de Conteudo)
```tsx
<div className="flex p-1 bg-slate-100/80 rounded-2xl w-full">
  {/* Ativo */}
  <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium bg-white text-slate-900 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.08)] scale-[1.02]">
    <Icon className="w-4 h-4 text-blue-600" />
    Label
  </button>
  {/* Inativo */}
  <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-black/5">
    <Icon className="w-4 h-4 opacity-70" />
    Label
  </button>
</div>
```

#### Platform Selector (Grid com Selecao)
```tsx
<div className="grid grid-cols-2 gap-3">
  {/* Selecionado */}
  <button className="relative flex items-center gap-3 px-4 py-3 rounded-2xl border bg-blue-50/50 border-blue-200 shadow-inner">
    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-blue-600 text-white">
      <Icon className="w-4 h-4" />
    </div>
    <span className="text-sm font-medium text-blue-900">Instagram</span>
    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-500" />
  </button>
  {/* Nao selecionado */}
  <button className="flex items-center gap-3 px-4 py-3 rounded-2xl border bg-white/30 border-slate-200/50 hover:bg-white/60">
    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-100 text-slate-400">
      <Icon className="w-4 h-4" />
    </div>
    <span className="text-sm font-medium text-slate-600">TikTok</span>
  </button>
</div>
```

#### Toggle Switch (iOS Style)
```tsx
<label className="flex items-center gap-3 cursor-pointer group select-none">
  <input type="checkbox" className="sr-only" />
  {/* Track */}
  <div className={`w-12 h-7 rounded-full transition-colors duration-300 ${checked ? 'bg-green-500' : 'bg-slate-200 group-hover:bg-slate-300'}`}>
    {/* Thumb */}
    <div className={`absolute left-1 top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
  </div>
  <span className={`text-sm font-medium ${checked ? 'text-green-700' : 'text-slate-500'}`}>Label</span>
</label>
```

#### Counter Stepper (Quantidade)
```tsx
<div className="flex items-center gap-2 bg-white/60 p-1.5 rounded-xl border border-slate-200/50 shadow-sm">
  <button className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 text-slate-500">
    <Minus className="w-4 h-4" />
  </button>
  <span className="w-6 text-center font-semibold text-slate-700">{count}</span>
  <button className="w-8 h-8 flex items-center justify-center rounded-lg text-white shadow-sm active:scale-95 bg-green-500 hover:bg-green-600">
    <Plus className="w-4 h-4" />
  </button>
</div>
```
Cores do botao + por tipo: Reels=`bg-green-500`, Story=`bg-amber-500`, Post=`bg-blue-500`

#### Day Selector (Calendario Semanal)
```tsx
{/* Selecionado */}
<button className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl border w-full aspect-square bg-green-500 text-white border-green-600 shadow-lg scale-105 ring-1 ring-offset-2 ring-offset-white/50">
  <span className="text-[10px] font-bold uppercase tracking-wider">SEG</span>
  <span className="text-lg sm:text-xl font-bold">12</span>
</button>
{/* Nao selecionado */}
<button className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-2xl border w-full aspect-square bg-white/40 border-slate-200/60 text-slate-400 hover:bg-white/80 hover:border-slate-300">
  <span className="text-[10px] font-bold uppercase tracking-wider">TER</span>
  <span className="text-lg sm:text-xl font-semibold">13</span>
</button>
```
Cores por tipo: Reels=green, Story=amber, Post=blue

---

### Content Type Cores e Icones

| Type | Cor | Background | Border | Icone |
|------|-----|-----------|--------|-------|
| `reels` | green | bg-green-50/50 | border-green-100 | Video icon |
| `story` | amber | bg-amber-50/50 | border-amber-100 | Circle icon |
| `post` | blue | bg-blue-50/50 | border-blue-100 | Image/Grid icon |

---

### Transicoes e Animacoes

```
Padrao:       transition-all duration-200
Cores:        transition-colors duration-200
Toggle:       transition-colors duration-300 ease-in-out
Transform:    transition-transform duration-300
Hover lift:   hover:-translate-y-0.5
Click scale:  active:scale-95 (botoes normais)
              active:scale-[0.98] (botoes full-width)
Focus ring:   focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50
```

### Layout e Spacing

```
Modal grid:   grid grid-cols-1 lg:grid-cols-12 gap-10
              lg:col-span-7 (conteudo) / lg:col-span-5 (sidebar)
Formularios:  space-y-5 ou space-y-6
Secoes:       space-y-8
Botoes row:   flex items-center justify-between gap-3
Input group:  space-y-1.5 (label + input + error)
```

### Responsive

```
Desktop:      lg: (1024px+) para layout de colunas
Mobile:       Componentes separados (MobileStrategistContentView)
              Sheets ao inves de modais
              Touch-friendly: areas de toque amplas
Breakpoint:   sm: (640px) para ajustes menores
```

---

## Padrao de Componente

```typescript
'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';

interface MyComponentProps {
  businessId: string;
}

export default function MyComponent({ businessId }: MyComponentProps) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [businessId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/business-content?business_id=${businessId}`);
      const result = await response.json();
      if (result.success) setData(result.contents || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      {/* conteudo */}
    </div>
  );
}
```

## Regras

1. **SEMPRE usar 'use client'** em componentes do dashboard
2. **SEMPRE verificar role** antes de mostrar conteudo restrito
3. **SEMPRE tratar estados** de loading, error e empty
4. **SEMPRE usar `useAuthStore`** para dados do usuario
5. **NUNCA acessar tabela `users`** - apenas `platform_users` via API
6. **SEMPRE respeitar responsividade** - desktop e mobile
7. **Usar date-fns com locale ptBR** para formatacao de datas
8. **Content types**: 'post' | 'reels' | 'story' (com icones e cores especificos)
9. **SEMPRE seguir o Design System** - cores, arredondamento, sombras, glassmorphism
10. **Botoes**: primario=`bg-[#007AFF]`, secundario=`text-slate-600`, delete=`text-red-600 bg-red-50`
11. **Inputs**: `bg-white/50 border-slate-200/60 rounded-2xl` com focus ring azul
12. **Modais**: `bg-white/70 backdrop-blur-2xl rounded-[2rem]` - NUNCA usar modais opacos
13. **NUNCA usar roxo (purple) ou rosa (pink)** - estas cores NAO fazem parte do nosso design system. Paleta permitida: slate, blue (#007AFF), green, amber, red (apenas para erro/delete). Qualquer uso de purple/pink/violet/fuchsia deve ser removido
14. **NUNCA usar emojis** no codigo, labels, textos ou comentarios. Usar icones Lucide React para representacao visual
