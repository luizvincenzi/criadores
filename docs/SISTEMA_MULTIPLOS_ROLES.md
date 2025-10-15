# 🎭 Sistema de Múltiplos Roles - crIAdores

## 📋 Problema Atual

Atualmente, o sistema usa um campo `role` singular (ENUM), o que permite apenas **UM role por usuário**:

```sql
role user_role DEFAULT 'user'  -- Apenas um valor
```

Isso impede que um usuário tenha múltiplos acessos, como:
- Um criador que também é estrategista de marketing
- Um gerente que também é criador
- Um estrategista que também é business owner

---

## ✅ Solução Proposta

Adicionar um campo `roles` (array) que permite múltiplos roles por usuário:

```sql
-- Campo novo
roles user_role[] DEFAULT ARRAY['user']::user_role[]

-- Campo antigo (mantém compatibilidade)
role user_role DEFAULT 'user'
```

### Estratégia de Migração

1. **Fase 1:** Adicionar coluna `roles` (array)
2. **Fase 2:** Migrar dados do campo `role` para `roles`
3. **Fase 3:** Atualizar lógica de autenticação para usar `roles`
4. **Fase 4:** Manter `role` como "role primário" para compatibilidade

---

## 🎯 Casos de Uso

### Caso 1: Pietra Mantovani
- **Role Primário:** `creator`
- **Roles Adicionais:** `marketing_strategist`
- **Acesso:** Dashboard de criador + permissões de estrategista

### Caso 2: Marilia
- **Role Primário:** `marketing_strategist`
- **Roles Adicionais:** `creator` (opcional)
- **Acesso:** Dashboard de estrategista + permissões de criador

### Caso 3: Gerente que também cria
- **Role Primário:** `manager`
- **Roles Adicionais:** `creator`
- **Acesso:** Dashboard de gerente + permissões de criador

---

## 🔧 Implementação Técnica

### 1. Migration SQL

```sql
-- Adicionar coluna roles (array)
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS roles user_role[] DEFAULT ARRAY['user']::user_role[];

-- Migrar dados existentes
UPDATE users 
SET roles = ARRAY[role]::user_role[] 
WHERE roles IS NULL OR roles = '{}';

-- Criar índice para performance
CREATE INDEX IF NOT EXISTS idx_users_roles ON users USING GIN(roles);
```

### 2. Atualizar Types TypeScript

```typescript
export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;           // Role primário (compatibilidade)
  roles: UserRole[];        // Todos os roles
  status: UserStatus;
  // ... outros campos
}
```

### 3. Lógica de Autenticação

```typescript
// Verificar se usuário tem um role específico
function hasRole(user: User, role: UserRole): boolean {
  return user.roles.includes(role);
}

// Obter permissões combinadas de todos os roles
function getCombinedPermissions(user: User): string[] {
  const allPermissions = new Set<string>();
  
  for (const role of user.roles) {
    const rolePerms = ROLE_PERMISSIONS[role] || [];
    rolePerms.forEach(perm => allPermissions.add(perm));
  }
  
  return Array.from(allPermissions);
}
```

### 4. Dashboard Routing

```typescript
// Redirecionar baseado no role primário
switch (user.role) {
  case 'creator':
  case 'marketing_strategist':
    router.push('/dashboard/criador');
    break;
  // ... outros casos
}

// Mas permitir acesso a múltiplos dashboards
if (user.hasRole('creator')) {
  // Mostrar opção de dashboard de criador
}
if (user.hasRole('marketing_strategist')) {
  // Mostrar opção de dashboard de estrategista
}
```

---

## 📊 Matriz de Permissões Combinadas

| Usuário | Roles | Permissões Combinadas |
|---------|-------|----------------------|
| Pietra | creator + marketing_strategist | Ver campanhas + Criar conteúdo + Planejar calendário |
| Marilia | marketing_strategist + creator | Planejar calendário + Criar conteúdo |
| Gerente | manager + creator | Gerenciar tudo + Criar conteúdo |

---

## 🚀 Próximos Passos

1. ✅ Criar migration SQL
2. ✅ Atualizar database.types.ts
3. ✅ Atualizar auth-types.ts
4. ✅ Atualizar lógica de autenticação
5. ✅ Atualizar dashboard routing
6. ✅ Testar com Pietra e Marilia

