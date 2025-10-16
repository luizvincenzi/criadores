# 📱 Estrutura da Página do Estrategista

## 🗂️ Localização dos Arquivos

### **Página Principal**
```
app/(dashboard)/conteudo-estrategista/page.tsx
```
- Carrega businesses via API `/api/strategist/businesses`
- Renderiza `BusinessContentPlanningView`

### **Componente Principal**
```
components/business-content/BusinessContentPlanningView.tsx
```
- **484 linhas**
- Gerencia toda a lógica da página
- Renderiza sidebar + calendário

---

## 🎨 Estrutura Visual

### **Desktop (md:)**

```
┌─────────────────────────────────────────────────────────────┐
│                                                               │
│  ┌──────────────┐  ┌────────────────────────────────────┐   │
│  │              │  │  Header (bg-white)                 │   │
│  │   SIDEBAR    │  │  ┌──────────────────────────────┐  │   │
│  │   (w-56)     │  │  │ < Hoje >  [Semana ▼]  Label │  │   │
│  │   bg-f5f5f5  │  │  └──────────────────────────────┘  │   │
│  │              │  ├────────────────────────────────────┤   │
│  │ Programação  │  │                                    │   │
│  │ de conteúdo  │  │  Calendário (bg-f5f5f5)           │   │
│  │              │  │                                    │   │
│  │ [Boussolé ▼] │  │  ┌────┬────┬────┬────┬────┐      │   │
│  │              │  │  │SEG │TER │QUA │QUI │SEX │      │   │
│  │ [Planejado   │  │  │    │    │    │    │    │      │   │
│  │  semanal]    │  │  │    │    │ 📄 │    │    │      │   │
│  │              │  │  └────┴────┴────┴────┴────┘      │   │
│  │ Reels (0)    │  │                                    │   │
│  │ Story (0)    │  │                                    │   │
│  │ Post (1)     │  │                                    │   │
│  │              │  │                                    │   │
│  │ Estatísticas │  │                                    │   │
│  │ Total: 1     │  │                                    │   │
│  │ Executados:0 │  │                                    │   │
│  │ Pendentes: 1 │  │                                    │   │
│  └──────────────┘  └────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### **Mobile (< md:)**

```
┌─────────────────────┐
│                     │
│  SIDEBAR (w-full)   │
│  bg-f5f5f5          │
│                     │
│  Programação de     │
│  conteúdo           │
│                     │
│  [Boussolé ▼]       │
│                     │
│  [Planejado semanal]│
│                     │
│  Reels (0)          │
│  Story (0)          │
│  Post (1)           │
│                     │
│  Estatísticas       │
│  Total: 1           │
│  Executados: 0      │
│  Pendentes: 1       │
│                     │
├─────────────────────┤
│                     │
│  Header             │
│  < Hoje > [Semana]  │
│                     │
├─────────────────────┤
│                     │
│  Calendário         │
│  bg-f5f5f5          │
│                     │
│  ┌───┬───┬───┐      │
│  │SEG│TER│QUA│      │
│  │   │   │ 📄│      │
│  └───┴───┴───┘      │
│                     │
└─────────────────────┘
```

---

## 📦 Componentes Utilizados

### **1. BusinessContentPlanningView** (Principal)
- **Arquivo:** `components/business-content/BusinessContentPlanningView.tsx`
- **Função:** Container principal que gerencia estado e layout
- **Renderiza:**
  - Sidebar (desktop e mobile)
  - BusinessSelector
  - BusinessContentWeekView OU BusinessContentMonthView
  - Modais

### **2. BusinessSelector**
- **Arquivo:** `components/business-content/BusinessSelector.tsx`
- **Função:** Dropdown para selecionar business
- **Features:**
  - Busca em tempo real
  - Avatares com gradiente
  - Estatísticas de conteúdo
  - Status ativo/inativo

### **3. BusinessContentWeekView** (Desktop)
- **Arquivo:** `components/business-content/BusinessContentWeekView.tsx`
- **Função:** Visualização semanal do calendário
- **Renderiza:** 7 colunas (Segunda a Domingo)
- **Features:**
  - Drag & drop de conteúdos
  - BusinessContentCard para cada conteúdo
  - BusinessDroppableDay para cada dia

### **4. BusinessContentMonthView** (Desktop)
- **Arquivo:** `components/business-content/BusinessContentMonthView.tsx`
- **Função:** Visualização mensal do calendário
- **Renderiza:** Grid de dias do mês

### **5. MobileBusinessContentView** (Mobile)
- **Arquivo:** `components/business-content/MobileBusinessContentView.tsx`
- **Função:** Versão mobile do calendário
- **Renderiza:**
  - MobileBusinessContentWeek7Days (semana completa)
  - MobileBusinessContentWeek3Days (3 dias visíveis)
  - MobileBusinessContentMonth (mês)

### **6. BusinessContentCard**
- **Arquivo:** `components/business-content/BusinessContentCard.tsx`
- **Função:** Card individual de conteúdo
- **Features:**
  - Ícone do tipo (Reels/Story/Post)
  - Plataformas (Instagram/TikTok)
  - Botão de executado
  - Drag & drop

### **7. BusinessDroppableDay**
- **Arquivo:** `components/business-content/BusinessDroppableDay.tsx`
- **Função:** Área droppable para cada dia
- **Features:**
  - Aceita drop de conteúdos
  - Botão "Adicionar"
  - Lista de conteúdos do dia

---

## 🔄 Fluxo de Dados

### **1. Carregamento Inicial**
```
page.tsx
  ↓
  Fetch /api/strategist/businesses?strategist_id=XXX
  ↓
  Recebe lista de businesses com stats
  ↓
  Passa para BusinessContentPlanningView
```

### **2. Seleção de Business**
```
BusinessSelector
  ↓
  onSelectBusiness(businessId)
  ↓
  BusinessContentPlanningView.handleSelectBusiness()
  ↓
  setSelectedBusinessId(businessId)
  ↓
  useEffect detecta mudança
  ↓
  loadContents() - Fetch /api/business-content?business_id=XXX
  ↓
  setContents(data)
  ↓
  Re-render calendário com novos conteúdos
```

### **3. Criação de Conteúdo**
```
BusinessDroppableDay (botão "Adicionar")
  ↓
  onAddContent(date)
  ↓
  BusinessContentPlanningView.handleAddContent()
  ↓
  setSelectedDate(date)
  ↓
  setIsModalOpen(true)
  ↓
  BusinessContentModal abre
  ↓
  Usuário preenche formulário
  ↓
  onSave(content)
  ↓
  POST /api/business-content
  ↓
  loadContents() - Recarrega lista
```

---

## 📱 Responsividade Mobile

### **Como Funciona**

A página usa **Tailwind CSS breakpoints** para adaptar o layout:

#### **Classes Responsivas:**
```tsx
// Sidebar
className="w-full md:w-56"
// Mobile: largura total (w-full)
// Desktop: largura fixa 224px (w-56)

// Layout principal
className="flex flex-col md:flex-row"
// Mobile: coluna (flex-col)
// Desktop: linha (flex-row)
```

#### **Componentes Condicionais:**

**ATUALMENTE NÃO IMPLEMENTADO** - A página usa os mesmos componentes para mobile e desktop.

Para implementar versão mobile dedicada, seria necessário:

```tsx
// Em BusinessContentPlanningView.tsx
const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  const checkMobile = () => {
    setIsMobile(window.innerWidth < 768);
  };
  checkMobile();
  window.addEventListener('resize', checkMobile);
  return () => window.removeEventListener('resize', checkMobile);
}, []);

// No render:
{isMobile ? (
  <MobileBusinessContentView
    contents={contents}
    viewMode={viewMode}
    weekStart={currentWeekStart}
    monthStart={currentMonthStart}
    onAddContent={handleAddContent}
    onEditContent={handleEditContent}
  />
) : (
  viewMode === 'week' ? (
    <BusinessContentWeekView ... />
  ) : (
    <BusinessContentMonthView ... />
  )
)}
```

---

## 🎯 Mudanças Recentes

### ✅ **Implementado:**
1. Sidebar sempre fixo à esquerda (w-56)
2. Background #f5f5f5 na área do calendário
3. Botão "Semana/Mês" ao lado da navegação de data
4. Dropdown abre para a esquerda (left-0 em vez de right-0)

### ⚠️ **Pendente:**
1. Implementar detecção de mobile
2. Usar MobileBusinessContentView em telas pequenas
3. Testar responsividade completa

---

## 🔧 Como Testar

### **Desktop:**
1. Acesse `/conteudo-estrategista`
2. Verifique sidebar à esquerda (fixa)
3. Verifique dropdown de business
4. Teste navegação < Hoje >
5. Teste dropdown Semana/Mês (ao lado da navegação)
6. Verifique background #f5f5f5 no calendário

### **Mobile:**
1. Abra DevTools (F12)
2. Ative modo responsivo (Ctrl+Shift+M)
3. Selecione iPhone ou Android
4. Verifique se sidebar aparece em cima
5. Verifique se calendário aparece embaixo
6. Teste scroll horizontal no calendário

---

## 📊 Estrutura de Pastas

```
components/
└── business-content/
    ├── BusinessContentPlanningView.tsx    (Principal - 484 linhas)
    ├── BusinessSelector.tsx               (Dropdown de business)
    ├── BusinessContentWeekView.tsx        (Calendário semanal)
    ├── BusinessContentMonthView.tsx       (Calendário mensal)
    ├── BusinessContentCard.tsx            (Card de conteúdo)
    ├── BusinessDroppableDay.tsx           (Dia droppable)
    ├── BusinessWeeklyPlanningModal.tsx    (Modal planejamento)
    ├── BusinessContentStatsWidget.tsx     (Widget de stats)
    └── Mobile/
        ├── MobileBusinessContentView.tsx
        ├── MobileBusinessContentWeek7Days.tsx
        ├── MobileBusinessContentWeek3Days.tsx
        ├── MobileBusinessContentMonth.tsx
        ├── MobileBusinessContentSheet.tsx
        ├── MobileBusinessContentSummary.tsx
        └── MobileBusinessWeeklyPlanningSheet.tsx
```

---

**Última atualização:** 2025-10-15

