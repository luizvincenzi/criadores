# 📋 Plano de Melhorias - Sistema de Conteúdo

## 🎯 Objetivo
Implementar um sistema robusto de planejamento de conteúdo multi-tenant, garantindo isolamento de dados entre clientes (empresas), com interface mobile-first e controle de permissões.

## ⚠️ CRÍTICO: Segurança Multi-Tenant
**Este sistema será usado por múltiplos clientes pagantes. É ESSENCIAL garantir:**
- ✅ Isolamento total de dados entre diferentes businesses
- ✅ Row Level Security (RLS) no Supabase
- ✅ Validações de permissão em todas as APIs
- ✅ Testes rigorosos de vazamento de dados

---

## 📊 Análise da Situação Atual

### ✅ O que já existe e funciona:
1. **Componentes Desktop:**
   - `ContentPlanningView` - View principal com semana/mês
   - `ContentWeekView` - Visualização semanal com drag & drop
   - `ContentMonthView` - Visualização mensal tipo calendário
   - `ContentCard` - Card individual de conteúdo
   - `ContentModal` - Modal para criar/editar conteúdo
   - `WeeklyPlanningModal` - Planejamento semanal em lote

2. **Componentes Mobile (EXCELENTES!):**
   - `MobileContentView` - View principal mobile
   - `MobileContentWeek3Days` - Visualização 3 dias (mobile otimizado)
   - `MobileContentWeek7Days` - Visualização 7 dias
   - `MobileContentMonth` - Visualização mensal mobile
   - `MobileContentSheet` - Bottom sheet para criar/editar
   - `MobileWeeklyPlanningSheet` - Planejamento semanal mobile
   - `MobileContentSummary` - Resumo de estatísticas

3. **API Básica:**
   - `GET /api/content-calendar` - Listar conteúdos
   - `POST /api/content-calendar` - Criar conteúdo
   - `PUT /api/content-calendar/[id]` - Atualizar conteúdo
   - `DELETE /api/content-calendar/[id]` - Deletar conteúdo

### ❌ O que está faltando (CRÍTICO):

1. **Banco de Dados:**
   - ❌ Falta `business_id` (FK para businesses)
   - ❌ Falta `organization_id` (FK para organizations)
   - ❌ Falta `created_by` (FK para users - quem criou)
   - ❌ Falta `assigned_to` (FK para users - responsável)
   - ❌ Falta campo `status` com workflow de aprovação
   - ❌ Falta RLS (Row Level Security)

2. **API:**
   - ❌ Não filtra por business_id/organization_id
   - ❌ Não valida permissões do usuário
   - ❌ Qualquer usuário pode ver/editar qualquer conteúdo

3. **Frontend:**
   - ❌ Não usa componentes mobile em telas pequenas
   - ❌ Não mostra seletor de business para admins
   - ❌ Não valida permissões no frontend

---

## 🗂️ Estrutura do Banco de Dados

### Tabela: `social_content_calendar`

```sql
CREATE TABLE IF NOT EXISTS social_content_calendar (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Multi-tenancy (CRÍTICO!)
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  -- Informações do Conteúdo
  title VARCHAR(255) NOT NULL,
  description TEXT,
  briefing TEXT,
  content_type VARCHAR(50) NOT NULL, -- 'post', 'reels', 'story'
  platforms TEXT[] NOT NULL DEFAULT '{}', -- ['instagram', 'tiktok', 'facebook']
  
  -- Agendamento
  scheduled_date DATE NOT NULL,
  scheduled_time TIME,
  
  -- Responsabilidade
  created_by UUID NOT NULL REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  
  -- Status e Workflow
  status VARCHAR(50) DEFAULT 'planned', -- 'planned', 'pending_approval', 'approved', 'executed', 'cancelled'
  executed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadados
  notes TEXT,
  attachments JSONB DEFAULT '[]',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Índices para performance
  CONSTRAINT social_content_calendar_content_type_check 
    CHECK (content_type IN ('post', 'reels', 'story')),
  CONSTRAINT social_content_calendar_status_check 
    CHECK (status IN ('planned', 'pending_approval', 'approved', 'executed', 'cancelled'))
);

-- Índices
CREATE INDEX idx_social_content_calendar_business_id ON social_content_calendar(business_id);
CREATE INDEX idx_social_content_calendar_organization_id ON social_content_calendar(organization_id);
CREATE INDEX idx_social_content_calendar_scheduled_date ON social_content_calendar(scheduled_date);
CREATE INDEX idx_social_content_calendar_assigned_to ON social_content_calendar(assigned_to);
CREATE INDEX idx_social_content_calendar_status ON social_content_calendar(status);

-- RLS (Row Level Security) - CRÍTICO!
ALTER TABLE social_content_calendar ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários veem apenas conteúdos da sua organização
CREATE POLICY "Users can view content from their organization"
  ON social_content_calendar FOR SELECT
  USING (organization_id = auth.jwt() ->> 'organization_id');

-- Policy: Business owners veem apenas conteúdos do seu business
CREATE POLICY "Business owners can view their business content"
  ON social_content_calendar FOR SELECT
  USING (
    business_id IN (
      SELECT id FROM businesses 
      WHERE id = (auth.jwt() ->> 'business_id')
    )
  );

-- Policy: Creators veem conteúdos atribuídos a eles
CREATE POLICY "Creators can view assigned content"
  ON social_content_calendar FOR SELECT
  USING (assigned_to = auth.uid());

-- Policy: Admins e Managers veem tudo da organização
CREATE POLICY "Admins and managers can view all organization content"
  ON social_content_calendar FOR SELECT
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'manager')
    AND organization_id = auth.jwt() ->> 'organization_id'
  );
```

---

## 🔐 Sistema de Permissões

### Roles e Permissões:

| Role | Ver Conteúdo | Criar | Editar | Deletar | Aprovar |
|------|--------------|-------|--------|---------|---------|
| **admin** | Todos da org | ✅ | ✅ | ✅ | ✅ |
| **manager** | Todos da org | ✅ | ✅ | ✅ | ✅ |
| **business_owner** | Apenas seu business | ✅ | Apenas seu | ❌ | ✅ |
| **creator** | Atribuídos a ele | ✅ | Apenas seus | Apenas seus | ❌ |
| **marketing_strategist** | Atribuídos a ele | ✅ | Atribuídos a ele | ❌ | ❌ |

### Workflow de Status:

```
planned → pending_approval → approved → executed
   ↓            ↓               ↓
cancelled   cancelled      cancelled
```

1. **planned**: Conteúdo criado, aguardando aprovação
2. **pending_approval**: Criador solicitou aprovação
3. **approved**: Business owner aprovou
4. **executed**: Conteúdo foi publicado
5. **cancelled**: Conteúdo cancelado

---

## 📱 Interface Mobile-First

### Breakpoints:
- **Mobile**: < 768px → Usar `MobileContentView`
- **Desktop**: >= 768px → Usar `ContentPlanningView`

### Componentes Mobile a Integrar:

```tsx
// Em ContentPlanningView.tsx
import MobileContentView from './content/MobileContentView';

export default function ContentPlanningView() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  if (isMobile) {
    return (
      <MobileContentView
        contents={contents}
        loading={loading}
        onRefresh={loadContents}
        onSaveContent={handleSaveContent}
        onSaveWeeklyPlanning={handleSaveWeeklyPlanning}
      />
    );
  }
  
  // Desktop view...
}
```

---

## 🎨 Melhorias de UI/UX

### 1. Seletor de Business (Admin/Manager)
```tsx
<select 
  value={selectedBusinessId} 
  onChange={(e) => setSelectedBusinessId(e.target.value)}
  className="..."
>
  <option value="">Todos os clientes</option>
  {businesses.map(b => (
    <option key={b.id} value={b.id}>{b.name}</option>
  ))}
</select>
```

### 2. Filtros Avançados
- Por tipo de conteúdo (post/reels/story)
- Por plataforma (Instagram/TikTok/Facebook)
- Por status (planned/approved/executed)
- Por responsável (assigned_to)

### 3. Estatísticas em Tempo Real
- Total de conteúdos planejados no período
- Taxa de execução (executados / planejados)
- Distribuição por tipo
- Distribuição por plataforma
- Conteúdos pendentes de aprovação

---

## 🚀 Plano de Implementação (9 Fases)

### Fase 1: Análise e Planejamento ✅
- [x] Analisar estrutura atual
- [x] Identificar gaps no banco de dados
- [x] Criar este documento de planejamento

### Fase 2: Schema do Banco de Dados
- [ ] Criar migration SQL
- [ ] Adicionar campos: business_id, organization_id, created_by, assigned_to, status
- [ ] Configurar RLS policies
- [ ] Testar isolamento de dados

### Fase 3: Atualizar API
- [ ] Modificar GET para filtrar por business_id/organization_id
- [ ] Adicionar validações de permissão
- [ ] Atualizar POST/PUT/DELETE com validações
- [ ] Adicionar endpoint de aprovação

### Fase 4: Melhorar Desktop View
- [ ] Adicionar seletor de business
- [ ] Implementar filtros avançados
- [ ] Melhorar ContentStatsWidget
- [ ] Adicionar botões de aprovação

### Fase 5: Integrar Mobile View
- [ ] Detectar breakpoint mobile
- [ ] Renderizar MobileContentView em mobile
- [ ] Testar todos os componentes mobile
- [ ] Ajustar estilos se necessário

### Fase 6: Sistema de Permissões
- [ ] Criar hook useContentPermissions
- [ ] Validar permissões no frontend
- [ ] Esconder/mostrar botões baseado em role
- [ ] Testar todos os cenários de permissão

### Fase 7: Workflow de Aprovação
- [ ] Adicionar botão "Solicitar Aprovação"
- [ ] Adicionar botão "Aprovar/Rejeitar"
- [ ] Notificações de aprovação
- [ ] Histórico de aprovações

### Fase 8: Testes Multi-tenant
- [ ] Criar 2+ businesses de teste
- [ ] Testar isolamento de dados
- [ ] Testar permissões por role
- [ ] Testar mobile responsiveness
- [ ] Validar RLS no Supabase

### Fase 9: Documentação e Deploy
- [ ] Documentar API
- [ ] Documentar componentes
- [ ] Criar guia de uso
- [ ] Deploy em produção

---

## ⚡ Próximos Passos Imediatos

1. **Criar migration do banco de dados** (Fase 2)
2. **Atualizar API com filtros** (Fase 3)
3. **Integrar MobileContentView** (Fase 5)
4. **Testar isolamento multi-tenant** (Fase 8)

---

## 📝 Notas Importantes

- ⚠️ **NUNCA** fazer queries sem filtrar por organization_id
- ⚠️ **SEMPRE** validar permissões no backend (não confiar no frontend)
- ⚠️ **TESTAR** isolamento de dados entre clientes antes de deploy
- ✅ Componentes mobile já estão prontos e são excelentes!
- ✅ Estrutura de pastas está bem organizada
- ✅ API básica funciona, só precisa de segurança

---

**Criado em:** 2025-01-XX  
**Última atualização:** 2025-01-XX  
**Status:** 🟡 Em Planejamento

