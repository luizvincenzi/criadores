# 📋 Infraestrutura Completa de Tarefas - Sistema CRM Criadores

## 🏗️ Visão Geral

O sistema agora possui **4 tipos de tarefas** organizadas hierarquicamente:

1. **`tasks`** - Tarefas gerais do sistema
2. **`business_tasks`** - Tarefas relacionadas a empresas/negócios
3. **`deal_tasks`** - Tarefas específicas de deals/vendas
4. **`jornada_tasks`** - **NOVO** - Tarefas da jornada das campanhas

## 📊 Estrutura da Tabela `jornada_tasks`

### Campos Principais
```sql
CREATE TABLE jornada_tasks (
  id UUID PRIMARY KEY,
  organization_id UUID NOT NULL,
  
  -- Relacionamentos
  campaign_id UUID REFERENCES campaigns(id),
  business_id UUID REFERENCES businesses(id),
  
  -- Identificação da Jornada
  business_name VARCHAR(255) NOT NULL,
  campaign_month VARCHAR(50) NOT NULL,
  journey_stage jornada_stage NOT NULL,
  
  -- Informações da Tarefa
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type jornada_task_type DEFAULT 'custom',
  
  -- Status e Prioridade
  status task_status DEFAULT 'todo',
  priority task_priority DEFAULT 'medium',
  
  -- Atribuição
  assigned_to UUID REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  
  -- Datas
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Automação
  is_auto_generated BOOLEAN DEFAULT false,
  auto_trigger_stage jornada_stage,
  blocks_stage_progression BOOLEAN DEFAULT false,
  
  -- Dependências
  depends_on_task_id UUID REFERENCES jornada_tasks(id),
  
  -- Metadados
  tags TEXT[],
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### ENUMs Específicos

#### `jornada_stage`
```sql
'Reunião de briefing' | 'Agendamentos' | 'Entrega final' | 'Finalizado'
```

#### `jornada_task_type`
```sql
'briefing_preparation'     -- Preparação do briefing
'briefing_meeting'         -- Reunião de briefing
'creator_selection'        -- Seleção de criadores
'creator_contact'          -- Contato com criadores
'scheduling_coordination'  -- Coordenação de agendamentos
'content_approval'         -- Aprovação de conteúdo
'delivery_review'          -- Revisão de entregas
'final_approval'           -- Aprovação final
'campaign_closure'         -- Fechamento da campanha
'follow_up'               -- Follow-up pós-campanha
'custom'                  -- Tarefa personalizada
```

## 🤖 Automação de Tarefas

### Função de Criação Automática
```sql
create_automatic_jornada_tasks(
  p_business_name VARCHAR(255),
  p_campaign_month VARCHAR(50),
  p_journey_stage jornada_stage,
  p_organization_id UUID,
  p_business_id UUID DEFAULT NULL,
  p_campaign_id UUID DEFAULT NULL,
  p_created_by UUID DEFAULT NULL
) RETURNS INTEGER
```

### Tarefas Automáticas por Estágio

#### 🎯 Reunião de briefing
- Preparar briefing da campanha
- Agendar reunião de briefing
- Realizar reunião de briefing

#### 📅 Agendamentos
- Selecionar criadores para campanha (🚫 bloqueia progressão)
- Entrar em contato com criadores (🚫 bloqueia progressão)
- Coordenar agendamentos

#### 📦 Entrega final
- Revisar entregas dos criadores (🚫 bloqueia progressão)
- Aprovar conteúdo final (🚫 bloqueia progressão)
- Acompanhar publicações

#### ✅ Finalizado
- Fechar campanha
- Follow-up com cliente

### Função de Validação de Progressão
```sql
can_progress_to_next_stage(
  p_business_name VARCHAR(255),
  p_campaign_month VARCHAR(50),
  p_current_stage jornada_stage
) RETURNS BOOLEAN
```

## 🔗 APIs Disponíveis

### 1. CRUD Principal: `/api/jornada-tasks`

#### GET - Buscar tarefas
```typescript
GET /api/jornada-tasks?business_name=Sonkey&campaign_month=Janeiro&journey_stage=Agendamentos
```

#### POST - Criar tarefa
```typescript
POST /api/jornada-tasks
{
  "business_name": "Sonkey",
  "campaign_month": "Janeiro",
  "journey_stage": "Agendamentos",
  "title": "Nova tarefa",
  "task_type": "creator_selection",
  "priority": "high",
  "assigned_to": "user-uuid"
}
```

#### PUT - Atualizar tarefa
```typescript
PUT /api/jornada-tasks
{
  "id": "task-uuid",
  "status": "done",
  "actual_hours": 3
}
```

#### DELETE - Deletar tarefa
```typescript
DELETE /api/jornada-tasks?id=task-uuid
```

### 2. Automação: `/api/jornada-tasks/auto-create`

#### POST - Criar tarefas automáticas
```typescript
POST /api/jornada-tasks/auto-create
{
  "business_name": "Sonkey",
  "campaign_month": "Janeiro",
  "journey_stage": "Agendamentos",
  "business_id": "business-uuid",
  "campaign_id": "campaign-uuid"
}
```

#### GET - Verificar se pode avançar
```typescript
GET /api/jornada-tasks/auto-create?business_name=Sonkey&campaign_month=Janeiro&current_stage=Agendamentos
```

## 🔄 Triggers e Automação

### Trigger de Criação Automática
```sql
CREATE TRIGGER auto_create_jornada_tasks
  AFTER UPDATE ON campaigns
  FOR EACH ROW
  WHEN (OLD.status IS DISTINCT FROM NEW.status)
  EXECUTE FUNCTION trigger_create_jornada_tasks();
```

**Comportamento**: Quando uma campanha muda de estágio, tarefas automáticas são criadas para o novo estágio.

### Triggers de Auditoria
- `update_jornada_tasks_updated_at` - Atualiza timestamp automaticamente
- `audit_jornada_tasks` - Registra mudanças no audit log

## 📈 Índices de Performance

```sql
-- Índices principais
CREATE INDEX idx_jornada_tasks_organization ON jornada_tasks(organization_id);
CREATE INDEX idx_jornada_tasks_journey ON jornada_tasks(business_name, campaign_month, journey_stage);
CREATE INDEX idx_jornada_tasks_assigned_to ON jornada_tasks(assigned_to);
CREATE INDEX idx_jornada_tasks_status ON jornada_tasks(organization_id, status);
CREATE INDEX idx_jornada_tasks_stage ON jornada_tasks(journey_stage, status);
CREATE INDEX idx_jornada_tasks_due_date ON jornada_tasks(due_date) WHERE due_date IS NOT NULL;

-- Índices para automação
CREATE INDEX idx_jornada_tasks_auto_trigger ON jornada_tasks(auto_trigger_stage, is_auto_generated);
CREATE INDEX idx_jornada_tasks_dependencies ON jornada_tasks(depends_on_task_id) WHERE depends_on_task_id IS NOT NULL;
```

## 🧪 Testes

### Script de Teste
```bash
npm run tsx scripts/test-jornada-tasks.ts
```

### Funcionalidades Testadas
1. ✅ Estrutura da tabela
2. ✅ Criação manual de tarefas
3. ✅ Criação automática de tarefas
4. ✅ Busca e filtros
5. ✅ Verificação de progressão
6. ✅ Atualização de tarefas
7. ✅ Limpeza de dados

## 🎯 Casos de Uso

### 1. Campanha Nova (Reunião de briefing)
```typescript
// Automático: Quando campanha é criada ou muda para "Reunião de briefing"
// Cria 3 tarefas: preparar briefing, agendar reunião, realizar reunião
```

### 2. Avançar para Agendamentos
```typescript
// Automático: Quando campanha muda para "Agendamentos"
// Cria 3 tarefas: selecionar criadores, contatar criadores, coordenar agendamentos
// 2 tarefas bloqueiam progressão até serem concluídas
```

### 3. Verificar se Pode Avançar
```typescript
const canProgress = await fetch('/api/jornada-tasks/auto-create?business_name=Sonkey&campaign_month=Janeiro&current_stage=Agendamentos');
// Retorna false se há tarefas bloqueantes não concluídas
```

### 4. Buscar Tarefas de uma Jornada
```typescript
const tasks = await fetch('/api/jornada-tasks?business_name=Sonkey&campaign_month=Janeiro');
// Retorna todas as tarefas da jornada Sonkey - Janeiro
```

## 🔧 Próximos Passos

1. **Interface de Usuário** - Criar componentes React para gerenciar tarefas da jornada
2. **Notificações** - Sistema de alertas para tarefas vencidas ou bloqueantes
3. **Relatórios** - Dashboard de produtividade e gargalos na jornada
4. **Integração** - Conectar com sistema de kanban existente
5. **Templates** - Permitir customização de tarefas automáticas por cliente

## 📝 Resumo da Infraestrutura Completa

| Tipo de Tarefa | Escopo | Automação | APIs | Status |
|----------------|--------|-----------|------|--------|
| `tasks` | Sistema geral | ❌ | ❌ | Estrutura pronta |
| `business_tasks` | Empresas/CRM | ❌ | ❌ | Estrutura pronta |
| `deal_tasks` | Vendas/Deals | ❌ | ❌ | Estrutura pronta |
| `jornada_tasks` | Jornada campanhas | ✅ | ✅ | **Completo** |

**Status Atual**: Sistema de tarefas da jornada **100% funcional** com automação completa e APIs prontas para uso.
