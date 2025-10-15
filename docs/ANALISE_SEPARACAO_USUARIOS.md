# 🔍 Análise: Separação de Usuários Internos vs Externos

## 📊 Situação Atual

Você tem **2 plataformas** usando o **mesmo banco de dados**:

### 1. **CRM Interno (criadores.digital)**
- Funcionários da Criadores Digital
- Gerenciam clientes, campanhas, criadores
- Roles: `admin`, `manager`, `user`, `viewer`
- **NÃO devem acessar criadores.app**

### 2. **Plataforma Cliente (criadores.app)**
- Usuários externos (criadores, estrategistas, empresas)
- Acessam apenas seus próprios dados
- Roles: `creator`, `marketing_strategist`, `business_owner`
- **NÃO devem acessar o CRM interno**

---

## ⚠️ Problema Identificado

Atualmente, **TODOS os usuários estão na mesma tabela `users`**, o que pode causar:

1. **Confusão de Acesso:** Um funcionário pode tentar acessar criadores.app
2. **Segurança:** Misturar usuários internos com externos na mesma tabela
3. **Manutenção:** Difícil separar lógica de autenticação
4. **Escalabilidade:** Quando tiver milhares de criadores, vai misturar com funcionários

---

## ✅ Solução Recomendada: **SEPARAR TABELAS**

### Opção 1: Duas Tabelas Separadas (RECOMENDADO)

```sql
-- Funcionários internos (CRM)
CREATE TABLE internal_users (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role user_role DEFAULT 'user', -- admin, manager, user, viewer
  permissions JSONB,
  is_active BOOLEAN DEFAULT true,
  platform VARCHAR(50) DEFAULT 'crm', -- Sempre 'crm'
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Usuários externos (criadores.app)
CREATE TABLE platform_users (
  id UUID PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role platform_user_role, -- creator, marketing_strategist, business_owner
  roles platform_user_role[], -- Múltiplos roles
  creator_id UUID REFERENCES creators(id),
  business_id UUID REFERENCES businesses(id),
  managed_businesses UUID[],
  permissions JSONB,
  subscription_plan VARCHAR(50),
  subscription_expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  platform VARCHAR(50) DEFAULT 'client', -- Sempre 'client'
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Vantagens:**
- ✅ **Separação Total:** Impossível confundir funcionários com clientes
- ✅ **Segurança:** Cada plataforma tem sua própria tabela
- ✅ **Escalabilidade:** Milhares de criadores não afetam tabela de funcionários
- ✅ **Manutenção:** Lógica de autenticação separada
- ✅ **Performance:** Queries mais rápidas (menos registros)
- ✅ **Auditoria:** Fácil rastrear ações por plataforma

**Desvantagens:**
- ⚠️ Precisa migrar dados existentes
- ⚠️ Atualizar código de autenticação

---

### Opção 2: Mesma Tabela com Campo `platform` (NÃO RECOMENDADO)

```sql
ALTER TABLE users ADD COLUMN platform VARCHAR(50) DEFAULT 'crm';
-- 'crm' = funcionários internos
-- 'client' = usuários externos
```

**Vantagens:**
- ✅ Mais fácil de implementar
- ✅ Não precisa migrar dados

**Desvantagens:**
- ❌ Mistura funcionários com clientes
- ❌ Risco de confusão
- ❌ Performance pior (mais registros)
- ❌ Difícil manutenção no futuro

---

## 🎯 Recomendação Final

### **SEPARAR EM DUAS TABELAS**

**Estrutura Proposta:**

```
┌─────────────────────────────────────────┐
│         ORGANIZATIONS                    │
│  (Multi-tenancy)                        │
└─────────────────────────────────────────┘
           │
           ├─── internal_users (CRM)
           │    • admin
           │    • manager
           │    • user
           │    • viewer
           │
           └─── platform_users (criadores.app)
                • creator
                • marketing_strategist
                • business_owner
```

---

## 📋 Plano de Implementação

### Fase 1: Criar Nova Tabela `platform_users`
```sql
CREATE TABLE platform_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role platform_user_role DEFAULT 'creator',
  roles platform_user_role[] DEFAULT ARRAY['creator']::platform_user_role[],
  creator_id UUID REFERENCES creators(id),
  business_id UUID REFERENCES businesses(id),
  managed_businesses UUID[] DEFAULT '{}',
  permissions JSONB,
  subscription_plan VARCHAR(50) DEFAULT 'basic',
  subscription_expires_at TIMESTAMP,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Fase 2: Renomear Tabela Atual
```sql
-- Renomear users para internal_users
ALTER TABLE users RENAME TO internal_users;
```

### Fase 3: Atualizar Código
- Atualizar APIs de autenticação
- Criar APIs separadas para cada plataforma
- Atualizar lógica de login

### Fase 4: Migrar Dados (se necessário)
- Mover usuários externos para `platform_users`
- Manter funcionários em `internal_users`

---

## 🔒 Segurança

### Autenticação Separada

```typescript
// CRM (criadores.digital)
async function loginCRM(email: string, password: string) {
  const { data } = await supabase
    .from('internal_users')
    .select('*')
    .eq('email', email)
    .single();
  
  // Validar senha e retornar token
}

// Plataforma Cliente (criadores.app)
async function loginPlatform(email: string, password: string) {
  const { data } = await supabase
    .from('platform_users')
    .select('*')
    .eq('email', email)
    .single();
  
  // Validar senha e retornar token
}
```

---

## 📊 Comparação

| Aspecto | Tabela Única | Tabelas Separadas |
|---------|--------------|-------------------|
| Segurança | ⚠️ Média | ✅ Alta |
| Escalabilidade | ❌ Baixa | ✅ Alta |
| Manutenção | ❌ Difícil | ✅ Fácil |
| Performance | ⚠️ Média | ✅ Alta |
| Implementação | ✅ Fácil | ⚠️ Média |
| Custo | ✅ Baixo | ✅ Baixo |

---

## 🚀 Decisão

**RECOMENDO FORTEMENTE: Separar em duas tabelas**

Motivos:
1. **Segurança:** Impossível confundir funcionários com clientes
2. **Escalabilidade:** Preparado para crescimento
3. **Manutenção:** Código mais limpo e organizado
4. **Profissionalismo:** Arquitetura correta desde o início

---

## 📝 Próximos Passos

Se você concordar com a separação:

1. ✅ Criar migration para `platform_users`
2. ✅ Renomear `users` para `internal_users`
3. ✅ Atualizar código de autenticação
4. ✅ Criar Pietra e Marilia em `platform_users`
5. ✅ Testar ambas as plataformas

**Tempo estimado:** 2-3 horas de trabalho

