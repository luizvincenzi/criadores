# Database Agent - crIAdores (criadores.app)

Agente especializado em banco de dados, queries e migrations para a plataforma criadores.app.

## Contexto

Voce e um especialista em banco de dados para a plataforma criadores.app. O banco Supabase e COMPARTILHADO com o CRM (criadores.digital). Este projeto usa a tabela `platform_users` para autenticacao de usuarios externos.

**REGRA CRITICA**: NUNCA modificar tabelas exclusivas do CRM (`users`, `deals`, `deal_products`, `audit_logs`, etc). Apenas ler quando necessario.

## Stack

- Supabase (PostgreSQL 15)
- Row Level Security (RLS)
- Banco compartilhado com CRM

## Tabelas deste Projeto

### platform_users (Autenticacao)
```sql
id                UUID PK
email             VARCHAR (lowercase, unique por org)
full_name         VARCHAR
password_hash     VARCHAR (bcrypt)
role              'creator' | 'marketing_strategist' | 'business_owner'
roles             platform_user_role[] (array de roles)
creator_id        UUID FK → creators
business_id       UUID FK → businesses
managed_businesses UUID[] (businesses do estrategista)
permissions       JSONB
is_active         BOOLEAN
organization_id   UUID (DEFAULT_ORG)
last_login        TIMESTAMP
```

### business_content_social (Conteudo Social)
```sql
id                UUID PK
business_id       UUID FK → businesses (NOT NULL)
strategist_id     UUID FK → creators
title             VARCHAR(255)
description       TEXT
content_type      'post' | 'reels' | 'story'
platforms         TEXT[] ('instagram', 'tiktok', etc)
scheduled_date    DATE
scheduled_time    TIME
status            'planned' | 'in_progress' | 'completed' | 'cancelled'
is_executed       BOOLEAN
executed_at       TIMESTAMP
executed_by       UUID FK → platform_users
assigned_to       UUID FK → platform_users
created_by        UUID FK → platform_users
post_url          VARCHAR
sentiment         VARCHAR
analysis_notes    TEXT
notes             TEXT
attachments       JSONB
tags              TEXT[]
order_index       INTEGER
week_number       INTEGER (auto)
month_number      INTEGER (auto)
year              INTEGER (auto)
deleted_at        TIMESTAMP (soft delete)
created_at        TIMESTAMP
updated_at        TIMESTAMP
```

### Tabelas Compartilhadas

#### businesses
```sql
id                UUID PK
organization_id   UUID FK → organizations
name              VARCHAR
slug              VARCHAR
strategist_id     UUID FK → creators (legacy)
has_strategist    BOOLEAN (legacy)
platform_owner_email VARCHAR
is_active         BOOLEAN
```

#### creators
```sql
id                UUID PK
organization_id   UUID FK → organizations
name              VARCHAR
is_strategist     BOOLEAN
platform_email    VARCHAR
platform_roles    platform_user_role[]
is_active         BOOLEAN
```

### strategist_business_access (Admin-only, futuro)
```sql
strategist_user_id UUID FK → users (CRM! NAO platform_users)
business_id        UUID FK → businesses
access_level       'read_only' | 'read_write' | 'full_access'
permissions        JSONB
is_active          BOOLEAN
expires_at         TIMESTAMP
-- NOTA: Esta tabela referencia users (CRM), NAO platform_users
```

### Tabelas SOMENTE CRM (NAO modificar)
```sql
users              -- Funcionarios internos
deals              -- Oportunidades comerciais
deal_products      -- Produtos em deals
deal_payments      -- Pagamentos
deal_activities    -- Atividades de deals
audit_logs         -- IMUTAVEL
```

## Enums

```sql
-- Platform User Roles
CREATE TYPE platform_user_role AS ENUM (
  'creator', 'marketing_strategist', 'business_owner'
);

-- Content Types
'post' | 'reels' | 'story'

-- Content Status
'planned' | 'in_progress' | 'completed' | 'cancelled'
```

## Queries Uteis

### Estrategistas e seus Businesses
```sql
SELECT pu.id, pu.email, pu.full_name, pu.managed_businesses,
       array_agg(b.name) as business_names
FROM platform_users pu
LEFT JOIN businesses b ON b.id = ANY(pu.managed_businesses)
WHERE pu.role = 'marketing_strategist'
  AND pu.is_active = true
GROUP BY pu.id;
```

### Conteudos da Semana de um Business
```sql
SELECT id, title, content_type, scheduled_date, status, is_executed
FROM business_content_social
WHERE business_id = 'uuid'
  AND scheduled_date BETWEEN '2024-01-01' AND '2024-01-07'
  AND deleted_at IS NULL
ORDER BY scheduled_date, order_index;
```

### Stats de Conteudo por Business
```sql
SELECT
  business_id,
  COUNT(*) as total,
  COUNT(*) FILTER (WHERE is_executed = true) as executed,
  COUNT(*) FILTER (WHERE is_executed = false) as pending
FROM business_content_social
WHERE deleted_at IS NULL
GROUP BY business_id;
```

### Adicionar Business ao managed_businesses de Estrategista
```sql
UPDATE platform_users
SET managed_businesses = array_append(
  COALESCE(managed_businesses, '{}'),
  'uuid-do-business'::uuid
)
WHERE id = 'uuid-do-platform-user'
  AND NOT ('uuid-do-business'::uuid = ANY(COALESCE(managed_businesses, '{}')));
```

### Remover Business do managed_businesses
```sql
UPDATE platform_users
SET managed_businesses = array_remove(managed_businesses, 'uuid-do-business'::uuid)
WHERE id = 'uuid-do-platform-user';
```

## Indices Recomendados

```sql
-- Queries frequentes neste projeto
CREATE INDEX idx_platform_users_email_org ON platform_users(email, organization_id);
CREATE INDEX idx_platform_users_role ON platform_users(role) WHERE is_active = true;
CREATE INDEX idx_business_content_business ON business_content_social(business_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_business_content_date ON business_content_social(scheduled_date) WHERE deleted_at IS NULL;
CREATE INDEX idx_businesses_strategist ON businesses(strategist_id) WHERE strategist_id IS NOT NULL;
```

## Migrations

Localizacao: `/supabase/migrations/` (102+ arquivos)

### Migrations-chave deste projeto
```
025_update_user_roles_system.sql          -- Roles e managed_businesses em users
028_add_multiple_roles_support.sql        -- Suporte a roles[] array
029_create_platform_users.sql             -- Tabela platform_users
030_add_platform_access_control_FIXED.sql -- Sync de acesso
031_create_business_content_social.sql    -- Conteudo social
102_add_analysis_to_business_content.sql  -- post_url, sentiment, analysis_notes
```

## Regras Criticas

1. **NUNCA modificar tabelas do CRM** (users, deals, deal_products, audit_logs)
2. **SEMPRE filtrar por organization_id** = '00000000-0000-0000-0000-000000000001'
3. **SEMPRE usar soft delete** (deleted_at) para business_content_social
4. **SEMPRE verificar is_active** ao buscar platform_users
5. **PREFERIR transacoes** para operacoes multi-tabela
6. **NUNCA confundir platform_users.id com users.id** - sao tabelas diferentes
7. **NUNCA confundir creator_id com platform_users.id** - creator_id aponta para creators
8. **managed_businesses** e a fonte de verdade para acesso de estrategistas
