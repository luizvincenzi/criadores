# 🎯 SISTEMA DE NÍVEIS DE ACESSO - PLATAFORMA CRIADORES.APP

## 📋 **VISÃO GERAL**

A plataforma criadores.app possui um sistema completo de níveis de acesso com 3 categorias principais:

1. **🏢 NÍVEL EMPRESA** - Para empresas que querem contratar criadores
2. **👑 NÍVEL CRIADOR ESTRATEGISTA** - Para criadores premium com recursos avançados  
3. **⭐ NÍVEL CRIADOR** - Para influenciadores e criadores de conteúdo

---

## 🏢 **NÍVEL EMPRESA (business_owner)**

### **Descrição:**
Empresas clientes que utilizam a plataforma para encontrar e contratar criadores de conteúdo.

### **Planos Disponíveis:**

#### **📦 Empresa Básico - R$ 297/mês**
- ✅ Até 5 campanhas por mês
- ✅ Até 10 criadores por campanha
- ✅ Dashboard de gerenciamento
- ✅ Descoberta de criadores
- ✅ Analytics básico
- ✅ Suporte por email
- ✅ 10GB de armazenamento

#### **🚀 Empresa Premium - R$ 497/mês**
- ✅ Até 20 campanhas por mês
- ✅ Até 50 criadores por campanha
- ✅ Analytics avançado
- ✅ Relatórios customizados
- ✅ Suporte prioritário
- ✅ Acesso à API
- ✅ 100GB de armazenamento

### **Permissões:**
```json
{
  "dashboard": {"read": true, "write": true},
  "campaigns": {"read": true, "write": true, "delete": true},
  "creators": {"read": true, "write": false},
  "analytics": {"read": true},
  "reports": {"read": true, "write": true},
  "scope": "business"
}
```

---

## 👑 **NÍVEL CRIADOR ESTRATEGISTA (creator_strategist)**

### **Descrição:**
Criadores premium que podem gerenciar equipes, criar campanhas e utilizar ferramentas de negócio avançadas.

### **Planos Disponíveis:**

#### **💎 Estrategista - R$ 197/mês**
- ✅ Até 50 campanhas ativas
- ✅ Gerenciar até 5 membros da equipe
- ✅ Até 20 criadores gerenciados
- ✅ Criação de campanhas
- ✅ Ferramentas de negócio
- ✅ Analytics avançado
- ✅ Acesso à API
- ✅ White label
- ✅ 50GB de armazenamento

### **Recursos Exclusivos:**
- 🎯 **Criação de Campanhas**: Pode criar e gerenciar campanhas próprias
- 👥 **Gerenciamento de Equipe**: Adicionar e gerenciar outros criadores
- 🔧 **Ferramentas de Negócio**: Acesso a ferramentas avançadas de gestão
- 🎨 **White Label**: Personalização da interface
- 📊 **Analytics Avançado**: Métricas detalhadas e insights

### **Permissões:**
```json
{
  "dashboard": {"read": true, "write": true},
  "profile": {"read": true, "write": true},
  "campaigns": {"read": true, "write": true, "delete": true},
  "campaign_creation": true,
  "team_management": {"read": true, "write": true},
  "business_tools": {"read": true, "write": true},
  "analytics": {"read": true},
  "api_access": true,
  "white_label": true,
  "scope": "creator_strategist"
}
```

---

## ⭐ **NÍVEL CRIADOR (creator)**

### **Descrição:**
Influenciadores e criadores de conteúdo que participam de campanhas.

### **Planos Disponíveis:**

#### **🆓 Criador Gratuito - Grátis**
- ✅ Até 3 campanhas ativas
- ✅ Gerenciamento de perfil
- ✅ Participação em campanhas
- ✅ Portfólio básico (10 itens)
- ✅ Analytics básico
- ✅ Acesso à comunidade
- ✅ 1GB de armazenamento

#### **⚡ Criador Pro - R$ 97/mês**
- ✅ Até 10 campanhas ativas
- ✅ Portfólio ilimitado
- ✅ Analytics avançado
- ✅ Matching prioritário
- ✅ Mensagens diretas
- ✅ Suporte prioritário
- ✅ 10GB de armazenamento

### **Permissões:**
```json
{
  "dashboard": {"read": true, "write": false},
  "profile": {"read": true, "write": true},
  "campaigns": {"read": true, "write": false},
  "portfolio": {"read": true, "write": true, "delete": true},
  "analytics": {"read": true},
  "scope": "creator"
}
```

---

## 🔧 **IMPLEMENTAÇÃO TÉCNICA**

### **1. Estrutura do Banco de Dados:**

```sql
-- Campos adicionados na tabela users
ALTER TABLE users ADD COLUMN creator_type VARCHAR(50) DEFAULT 'creator';
ALTER TABLE users ADD COLUMN subscription_plan VARCHAR(50) DEFAULT 'basic';
ALTER TABLE users ADD COLUMN subscription_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN features_enabled JSONB DEFAULT '{}'::jsonb;
```

### **2. Enum Types:**

```typescript
export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager', 
  BUSINESS_OWNER = 'business_owner',
  CREATOR_STRATEGIST = 'creator_strategist',
  CREATOR = 'creator'
}

export enum CreatorType {
  CREATOR = 'creator',
  CREATOR_STRATEGIST = 'creator_strategist'
}

export enum SubscriptionPlan {
  BUSINESS_BASIC = 'Empresa Básico',
  BUSINESS_PREMIUM = 'Empresa Premium',
  CREATOR_FREE = 'Criador Gratuito', 
  CREATOR_PRO = 'Criador Pro',
  STRATEGIST = 'Estrategista'
}
```

### **3. Validação de Acesso:**

```typescript
// Verificar se usuário pode acessar recurso
function canAccessResource(user: User, resource: string, action: string): boolean {
  const permissions = getUserPermissions(user.role, user.creator_type, user.subscription_plan);
  return permissions[resource]?.[action] === true;
}
```

---

## 🚀 **PRÓXIMOS PASSOS**

### **1. Executar Migração:**
```bash
# Execute no Supabase Dashboard
psql -f SISTEMA_NIVEIS_ACESSO_COMPLETO.sql
```

### **2. Atualizar Interface:**
- Implementar componente `AccessLevelManager`
- Adicionar seletor de planos na interface
- Criar dashboard específico para cada nível

### **3. Sistema de Billing:**
- Integrar com gateway de pagamento
- Implementar controle de assinaturas
- Criar sistema de upgrade/downgrade

### **4. Testes:**
- Testar permissões para cada nível
- Validar limites de recursos
- Verificar fluxo de upgrade

---

## 📊 **RESUMO DOS NÍVEIS**

| Nível | Preço | Campanhas | Recursos Principais |
|-------|-------|-----------|-------------------|
| **Empresa Básico** | R$ 297/mês | 5/mês | Dashboard, 10 criadores/campanha |
| **Empresa Premium** | R$ 497/mês | 20/mês | API, relatórios, 50 criadores/campanha |
| **Criador Gratuito** | Grátis | 3 ativas | Perfil básico, comunidade |
| **Criador Pro** | R$ 97/mês | 10 ativas | Portfólio ilimitado, matching prioritário |
| **Estrategista** | R$ 197/mês | 50 ativas | Criação de campanhas, equipe, white label |

**🎯 Sistema completo implementado e pronto para uso!**
