# 🎯 PLANEJAMENTO DASHBOARD EMPRESAS - CRIADORES.APP

## 📋 **VISÃO GERAL**

Criar um dashboard estratégico para empresas na área logada da plataforma criadores.app, baseado no arquivo `dashboard_empresa.jsx` existente, com sistema de histórico trimestral e métricas de performance.

---

## 🏗️ **ARQUITETURA PROPOSTA**

### **1. Estrutura de Arquivos**
```
app/
├── (dashboard)/
│   ├── dashboard/
│   │   ├── empresa/
│   │   │   ├── page.tsx          # Dashboard principal empresas
│   │   │   ├── components/       # Componentes específicos
│   │   │   │   ├── MetricsCards.tsx
│   │   │   │   ├── HistorySelector.tsx
│   │   │   │   ├── DigitalPresence.tsx
│   │   │   │   ├── MarketDiagnosis.tsx
│   │   │   │   ├── FourPs.tsx
│   │   │   │   ├── PorterForces.tsx
│   │   │   │   ├── KPICards.tsx
│   │   │   │   ├── ActionMatrix.tsx
│   │   │   │   └── PromoCalendar.tsx
│   │   │   └── types/
│   │   │       └── dashboard.types.ts
│   │   └── page.tsx              # Dashboard geral (redireciona por role)
│   └── layout.tsx                # Layout existente
```

### **2. Banco de Dados - Estrutura Trimestral**
```sql
-- Tabela principal de snapshots trimestrais
CREATE TABLE business_quarterly_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  quarter VARCHAR(10) NOT NULL, -- '2025-Q1', '2025-Q2', etc.
  year INTEGER NOT NULL,
  quarter_number INTEGER NOT NULL, -- 1, 2, 3, 4
  
  -- Presença Digital
  digital_presence JSONB DEFAULT '{}'::jsonb,
  
  -- KPIs Principais
  kpis JSONB DEFAULT '{}'::jsonb,
  
  -- 4 Ps do Marketing
  four_ps_status JSONB DEFAULT '{}'::jsonb,
  
  -- 5 Forças de Porter
  porter_forces JSONB DEFAULT '{}'::jsonb,
  
  -- Diagnóstico de Mercado
  market_diagnosis JSONB DEFAULT '{}'::jsonb,
  
  -- Notas e observações do período
  notes TEXT,
  
  -- Metadados
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);

-- Índices para performance
CREATE INDEX idx_business_snapshots_business_quarter 
ON business_quarterly_snapshots(business_id, quarter);

CREATE INDEX idx_business_snapshots_year_quarter 
ON business_quarterly_snapshots(year, quarter_number);
```

---

## 📊 **COMPONENTES DO DASHBOARD**

### **1. Header com Seletor de Período**
- **Funcionalidade**: Dropdown para selecionar trimestre
- **Dados**: Lista de trimestres disponíveis
- **Estado**: Trimestre atual selecionado globalmente

### **2. Métricas Principais (Cards)**
- **Presença Digital**: Google Reviews, Instagram, Facebook, TikTok
- **KPIs Críticos**: Ocupação, Ticket Médio, NPS, Margem
- **Comparação**: Delta com trimestre anterior
- **Cores**: Sistema de status (verde/amarelo/vermelho)

### **3. Diagnóstico de Mercado**
- **Gráfico Pizza**: Segmentação de foco estratégico
- **Análise de Sentimento**: Pontos fortes e desafios
- **Portfólio de Produtos**: Oportunidades identificadas

### **4. Análise 4 Ps do Marketing**
- **Cards por P**: Produto, Preço, Praça, Promoção
- **Status Visual**: Cores baseadas no desempenho
- **Evolução**: Indicador de mudança entre trimestres

### **5. 5 Forças de Porter**
- **Análise Competitiva**: Rivalidade, Novos entrantes, etc.
- **Scores**: Notas de 1-10 com status visual
- **Tendências**: Evolução das forças ao longo do tempo

### **6. Posicionamento Estratégico**
- **Statement**: Declaração de posicionamento
- **Vantagens Competitivas**: Tríade de diferenciação
- **Frentes Táticas**: 3 principais focos de crescimento

### **7. Matriz de Ações (90 dias)**
- **Colunas Temporais**: Agora (0-30d), Próximas (30-60d), Explorar (60-90d)
- **Ações Específicas**: Lista de tarefas por período
- **Status**: Acompanhamento de execução

### **8. Calendário Promocional**
- **8 Semanas**: Temas e CTAs semanais
- **Campanhas**: Estratégias promocionais planejadas
- **Execução**: Status de implementação

---

## 🔄 **SISTEMA DE HISTÓRICO TRIMESTRAL**

### **Estrutura de Dados por Trimestre**
```typescript
interface QuarterlySnapshot {
  id: string;
  businessId: string;
  quarter: string; // '2025-Q1'
  year: number;
  quarterNumber: number; // 1-4
  
  digitalPresence: {
    google: { rating: number; reviews: number };
    instagram: number; // seguidores
    facebook: number;
    tiktok: number;
    tripadvisor?: { rating: number; rank: number };
  };
  
  kpis: {
    ocupacao: number; // %
    ticket: number; // R$
    margemPorcoes: number; // %
    nps: number;
    ruido: number; // reclamações/mês
  };
  
  fourPs: {
    produto: 'green' | 'yellow' | 'red';
    preco: 'green' | 'yellow' | 'red';
    praca: 'green' | 'yellow' | 'red';
    promocao: 'green' | 'yellow' | 'red';
  };
  
  porterForces: {
    rivalidade: { score: number; status: string };
    entrantes: { score: number; status: string };
    fornecedores: { score: number; status: string };
    clientes: { score: number; status: string };
    substitutos: { score: number; status: string };
  };
  
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### **Funcionalidades de Comparação**
- **Delta Calculation**: Diferença entre trimestres
- **Trend Analysis**: Identificação de tendências
- **Performance Tracking**: Acompanhamento de evolução
- **Visual Indicators**: Setas e cores para mudanças

---

## 🎨 **DESIGN SYSTEM**

### **Paleta de Cores (Neutra)**
```css
/* Cores principais */
--bg-primary: #f5f5f5;
--card-bg: #ffffff;
--border-color: #e5e7eb;

/* Status colors */
--status-green: #10b981;
--status-yellow: #f59e0b;
--status-red: #ef4444;

/* Gráficos neutros */
--chart-fill-1: #e5e7eb;
--chart-fill-2: #d1d5db;
--chart-fill-3: #9ca3af;
```

### **Componentes Reutilizáveis**
- **Card**: Container base com sombra sutil
- **Section**: Card com header e ícone
- **StatusBadge**: Indicador visual de status
- **DeltaBadge**: Mostra variação entre períodos
- **MetricCard**: Card para métricas com comparação

---

## 🔐 **CONTROLE DE ACESSO**

### **Níveis de Permissão**
1. **business_owner**: Acesso completo ao dashboard
2. **manager**: Visualização de métricas
3. **admin**: Acesso a todos os dashboards

### **Middleware de Autenticação**
```typescript
// Verificar se usuário tem acesso ao dashboard empresa
const hasBusinessAccess = (user: User) => {
  return ['business_owner', 'manager', 'admin'].includes(user.role);
};
```

---

## 📈 **APIS NECESSÁRIAS**

### **1. GET /api/dashboard/empresa/snapshots**
- **Função**: Buscar snapshots trimestrais
- **Parâmetros**: businessId, year?, quarter?
- **Retorno**: Lista de snapshots com dados

### **2. POST /api/dashboard/empresa/snapshots**
- **Função**: Criar novo snapshot trimestral
- **Dados**: Todas as métricas do trimestre
- **Validação**: Verificar se já existe snapshot para o período

### **3. PUT /api/dashboard/empresa/snapshots/:id**
- **Função**: Atualizar snapshot existente
- **Dados**: Métricas atualizadas
- **Permissão**: Apenas business_owner ou admin

### **4. GET /api/dashboard/empresa/current-metrics**
- **Função**: Buscar métricas em tempo real
- **Fonte**: Dados atuais do negócio
- **Cache**: 1 hora para performance

---

## 🚀 **FASES DE IMPLEMENTAÇÃO**

### **Fase 1: Estrutura Base (Semana 1)**
- ✅ Criar estrutura de arquivos
- ✅ Implementar layout do dashboard
- ✅ Criar componentes base (Card, Section)
- ✅ Implementar seletor de período

### **Fase 2: Componentes Principais (Semana 2)**
- ✅ Métricas de presença digital
- ✅ Cards de KPIs com comparação
- ✅ Diagnóstico de mercado com gráficos
- ✅ Sistema de status visual

### **Fase 3: Análises Estratégicas (Semana 3)**
- ✅ 4 Ps do Marketing
- ✅ 5 Forças de Porter
- ✅ Posicionamento e vantagens competitivas
- ✅ Integração com dados históricos

### **Fase 4: Ações e Planejamento (Semana 4)**
- ✅ Matriz de ações 90 dias
- ✅ Calendário promocional
- ✅ Sistema de gestão de risco
- ✅ Testes e refinamentos

### **Fase 5: Integração e Deploy (Semana 5)**
- ✅ APIs de backend
- ✅ Banco de dados trimestral
- ✅ Testes de performance
- ✅ Deploy em produção

---

## 📋 **PRÓXIMOS PASSOS IMEDIATOS**

1. **Criar estrutura de banco de dados** para snapshots trimestrais
2. **Implementar página base** do dashboard empresa
3. **Desenvolver componentes** de métricas principais
4. **Integrar sistema** de seleção de período
5. **Testar funcionalidades** com dados mock

**🎯 Objetivo: Dashboard empresarial completo e funcional em 5 semanas!**
