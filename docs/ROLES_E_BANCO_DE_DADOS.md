# 🎭 Sistema de Roles e Banco de Dados - crIAdores

## 📊 Visão Geral da Arquitetura Multi-Tenant

```
┌─────────────────────────────────────────────────────────────┐
│                      ORGANIZATIONS                           │
│  (Nível mais alto - Multi-tenancy)                          │
│  - Criadores Digital (nossa empresa)                        │
│  - Cada cliente que comprar nossa plataforma                │
└─────────────────────────────────────────────────────────────┘
                            │
                            ├─── USERS (Usuários da org)
                            │
                            └─── BUSINESSES (Empresas/Clientes)
                                      │
                                      ├─── CAMPAIGNS
                                      ├─── CREATORS (relacionamento)
                                      ├─── CONTENT CALENDAR ← FALTA!
                                      └─── BRIEFINGS
```

---

## 👥 Sistema de Roles (Papéis)

### Enum `user_role` no Banco de Dados:

```typescript
type UserRole = 
  | 'admin'                  // Administrador do sistema
  | 'manager'                // Gerente/Coordenador
  | 'business_owner'         // Dono da empresa/cliente
  | 'creator'                // Criador de conteúdo
  | 'marketing_strategist'   // Estrategista de marketing
  | 'user'                   // Usuário genérico
  | 'viewer'                 // Apenas visualização
```

---

## 🎯 Detalhamento de Cada Role

### 1. **ADMIN** (Administrador)
**Quem é:** Equipe interna da Criadores Digital (você e sua equipe)

**Acesso:**
- ✅ Ver TODAS as organizations
- ✅ Ver TODOS os businesses
- ✅ Ver TODAS as campanhas
- ✅ Ver TODO o conteúdo
- ✅ Gerenciar usuários
- ✅ Configurações do sistema
- ✅ Relatórios globais

**Dashboard:** `/dashboard/admin`

**Casos de Uso:**
- Gerenciar clientes (businesses)
- Criar/editar campanhas para qualquer cliente
- Ver métricas globais
- Suporte técnico
- Configurações da plataforma

---

### 2. **MANAGER** (Gerente/Coordenador)
**Quem é:** Gerentes de conta, coordenadores de projetos

**Acesso:**
- ✅ Ver todos os businesses da sua organization
- ✅ Ver todas as campanhas da sua organization
- ✅ Ver todo o conteúdo da sua organization
- ✅ Criar/editar campanhas
- ✅ Atribuir criadores
- ✅ Aprovar conteúdo
- ❌ Configurações do sistema

**Dashboard:** `/dashboard/geral`

**Casos de Uso:**
- Coordenar múltiplos clientes
- Gerenciar equipe de criadores
- Aprovar entregas
- Relatórios por cliente

---

### 3. **BUSINESS_OWNER** (Dono da Empresa/Cliente)
**Quem é:** O cliente final (dono do restaurante, loja, etc.)

**Acesso:**
- ✅ Ver APENAS seu business
- ✅ Ver APENAS suas campanhas
- ✅ Ver APENAS seu conteúdo
- ✅ Aprovar conteúdo criado para ele
- ✅ Ver métricas do seu negócio
- ❌ Ver outros businesses
- ❌ Criar campanhas (apenas solicitar)
- ❌ Gerenciar criadores

**Dashboard:** `/dashboard/empresa`

**Casos de Uso:**
- Acompanhar campanhas do seu negócio
- Aprovar/rejeitar conteúdo
- Ver calendário de publicações
- Ver métricas de performance
- Solicitar mudanças

---

### 4. **CREATOR** (Criador de Conteúdo)
**Quem é:** Criadores de conteúdo (fotógrafos, videomakers, designers)

**Acesso:**
- ✅ Ver campanhas atribuídas a ele
- ✅ Ver conteúdos atribuídos a ele
- ✅ Criar/editar seu próprio conteúdo
- ✅ Ver calendário de entregas
- ✅ Upload de arquivos
- ❌ Ver conteúdo de outros criadores
- ❌ Ver todos os businesses
- ❌ Aprovar conteúdo

**Dashboard:** `/dashboard/criador`

**Casos de Uso:**
- Ver suas tarefas/entregas
- Criar conteúdo para campanhas
- Upload de fotos/vídeos
- Marcar tarefas como concluídas
- Ver prazos

---

### 5. **MARKETING_STRATEGIST** (Estrategista)
**Quem é:** Estrategistas de marketing, planejadores de conteúdo

**Acesso:**
- ✅ Ver campanhas atribuídas a ele
- ✅ Criar/editar conteúdo
- ✅ Planejar calendário de conteúdo
- ✅ Ver métricas das campanhas
- ✅ Criar briefings
- ❌ Aprovar conteúdo final
- ❌ Ver todos os businesses

**Dashboard:** `/dashboard/criador` (mesmo dos criadores)

**Casos de Uso:**
- Planejar calendário de conteúdo
- Criar briefings mensais
- Coordenar criadores
- Analisar métricas

---

### 6. **USER** (Usuário Genérico)
**Quem é:** Usuário padrão sem permissões específicas

**Acesso:**
- ✅ Ver informações básicas
- ❌ Criar/editar conteúdo
- ❌ Ver campanhas

**Dashboard:** `/dashboard/geral`

---

### 7. **VIEWER** (Visualizador)
**Quem é:** Stakeholders, investidores, apenas visualização

**Acesso:**
- ✅ Ver relatórios (somente leitura)
- ❌ Editar qualquer coisa

**Dashboard:** `/dashboard/geral`

---

## 🗄️ Tabelas do Banco de Dados

### ✅ Tabelas que JÁ EXISTEM:

#### 1. **organizations** (Multi-tenancy)
```sql
- id (UUID)
- name (VARCHAR)
- domain (VARCHAR)
- settings (JSONB)
- subscription_plan (VARCHAR)
- is_active (BOOLEAN)
```
**Uso:** Isolar dados entre diferentes clientes da plataforma

---

#### 2. **users**
```sql
- id (UUID)
- organization_id (UUID) ← FK
- email (VARCHAR)
- full_name (VARCHAR)
- role (user_role ENUM) ← IMPORTANTE!
- permissions (JSONB)
- is_active (BOOLEAN)
```
**Uso:** Todos os usuários do sistema

---

#### 3. **businesses**
```sql
- id (UUID)
- organization_id (UUID) ← FK
- name (VARCHAR)
- slug (VARCHAR)
- category_id (UUID)
- status (business_status)
- business_stage (business_stage)
- owner_user_id (UUID) ← FK para business_owner
- responsible_user_id (UUID) ← FK para manager
- contact_info (JSONB)
- metrics (JSONB)
```
**Uso:** Empresas/clientes (restaurantes, lojas, etc.)

---

#### 4. **campaigns**
```sql
- id (UUID)
- organization_id (UUID) ← FK
- business_id (UUID) ← FK
- title (VARCHAR)
- campaign_type (VARCHAR)
- month (VARCHAR)
- status (campaign_status)
- budget (DECIMAL)
- deliverables (JSONB)
- created_by (UUID) ← FK
- responsible_user_id (UUID) ← FK
```
**Uso:** Campanhas de marketing

---

#### 5. **campaign_creators** (Relacionamento)
```sql
- id (UUID)
- campaign_id (UUID) ← FK
- creator_id (UUID) ← FK
- role (VARCHAR)
- status (VARCHAR)
- deliverables (JSONB)
```
**Uso:** Relacionar criadores com campanhas

---

#### 6. **tasks**
```sql
- id (UUID)
- organization_id (UUID) ← FK
- title (VARCHAR)
- assigned_to (UUID) ← FK
- created_by (UUID) ← FK
- status (task_status)
- priority (task_priority)
```
**Uso:** Tarefas gerais do sistema

---

#### 7. **business_notes**
```sql
- id (UUID)
- business_id (UUID) ← FK
- user_id (UUID) ← FK
- content (TEXT)
- note_type (VARCHAR)
```
**Uso:** Notas sobre businesses

---

#### 8. **business_tasks**
```sql
- id (UUID)
- business_id (UUID) ← FK
- title (VARCHAR)
- assigned_to (UUID) ← FK
- status (VARCHAR)
```
**Uso:** Tarefas específicas de businesses

---

#### 9. **monthly_briefings**
```sql
- id (UUID)
- business_id (UUID) ← FK
- organization_id (UUID) ← FK
- ref_code (VARCHAR)
- reference_month (VARCHAR)
- participants (JSONB)
- executive_summary (JSONB)
```
**Uso:** Briefings mensais

---

### ❌ Tabela que FALTA (CRÍTICO!):

#### 10. **social_content_calendar** ← PRECISA SER CRIADA/ATUALIZADA!

**Estado Atual:** Existe mas SEM campos de multi-tenancy

**O que FALTA:**
```sql
CREATE TABLE social_content_calendar (
  id UUID PRIMARY KEY,
  
  -- ❌ FALTA: Multi-tenancy
  organization_id UUID NOT NULL REFERENCES organizations(id),
  business_id UUID NOT NULL REFERENCES businesses(id),
  
  -- ❌ FALTA: Responsabilidade
  created_by UUID NOT NULL REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  
  -- ❌ FALTA: Workflow
  status VARCHAR(50) DEFAULT 'planned',
  -- 'planned', 'pending_approval', 'approved', 'executed', 'cancelled'
  
  -- ✅ JÁ EXISTE:
  title VARCHAR(255),
  description TEXT,
  content_type VARCHAR(50), -- 'post', 'reels', 'story'
  platforms TEXT[],
  scheduled_date DATE,
  scheduled_time TIME,
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

---

## 🔐 Matriz de Permissões - Content Calendar

| Role | Ver Conteúdo | Criar | Editar | Deletar | Aprovar | Executar |
|------|--------------|-------|--------|---------|---------|----------|
| **admin** | Todos da org | ✅ | ✅ | ✅ | ✅ | ✅ |
| **manager** | Todos da org | ✅ | ✅ | ✅ | ✅ | ✅ |
| **business_owner** | Só seu business | ✅ | Só seu | ❌ | ✅ | ❌ |
| **creator** | Atribuídos | ✅ | Só seus | Só seus | ❌ | ✅ |
| **strategist** | Atribuídos | ✅ | Atribuídos | ❌ | ❌ | ❌ |
| **user** | Nenhum | ❌ | ❌ | ❌ | ❌ | ❌ |
| **viewer** | Só leitura | ❌ | ❌ | ❌ | ❌ | ❌ |

---

## 🔄 Workflow de Conteúdo

```
┌──────────┐
│ PLANNED  │ ← Criador cria o conteúdo
└────┬─────┘
     │
     ▼
┌─────────────────┐
│ PENDING_APPROVAL│ ← Criador solicita aprovação
└────┬────────────┘
     │
     ├─── APROVADO ──┐
     │               ▼
     │         ┌──────────┐
     │         │ APPROVED │ ← Business owner aprova
     │         └────┬─────┘
     │              │
     │              ▼
     │         ┌──────────┐
     │         │ EXECUTED │ ← Criador marca como publicado
     │         └──────────┘
     │
     └─── REJEITADO ──┐
                      ▼
                ┌───────────┐
                │ CANCELLED │
                └───────────┘
```

---

## 📍 Próximos Passos

### Fase 1: Corrigir Banco de Dados ⚠️ URGENTE
- [ ] Criar migration para adicionar campos em `social_content_calendar`
- [ ] Adicionar RLS (Row Level Security)
- [ ] Criar índices para performance

### Fase 2: Atualizar APIs
- [ ] Filtrar por `organization_id` e `business_id`
- [ ] Validar permissões por role
- [ ] Adicionar endpoint de aprovação

### Fase 3: Frontend
- [ ] Implementar filtros por role
- [ ] Adicionar seletor de business (admin/manager)
- [ ] Workflow de aprovação na UI

---

**Criado em:** 2025-01-XX  
**Status:** 🔴 CRÍTICO - Banco precisa ser atualizado antes de produção

