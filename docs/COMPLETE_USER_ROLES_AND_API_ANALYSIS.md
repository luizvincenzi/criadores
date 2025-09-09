# 🔐 ANÁLISE COMPLETA: USER ROLES & APIs - PLATAFORMA crIAdores

## 📊 **RESUMO EXECUTIVO**

### ✅ **STATUS ATUAL:**
- **7 User Roles** implementados e funcionais
- **25+ APIs** com diferentes níveis de segurança
- **Sistema híbrido** de autenticação (API customizada + Supabase)
- **Filtros por business_id** implementados nas APIs críticas
- **Row Level Security (RLS)** configurado no Supabase

### 🎯 **PROBLEMAS IDENTIFICADOS:**
1. **Inconsistência de segurança** entre APIs
2. **Falta de APIs específicas** para marketing_strategist
3. **Middleware não valida roles** adequadamente
4. **APIs de analytics/leads/tasks** sem filtros por business

---

## 🔑 **SISTEMA DE USER ROLES**

### **1. ROLES IMPLEMENTADOS:**

| Role | Escopo | Business Access | Descrição |
|------|--------|----------------|-----------|
| `admin` | Global | Todas empresas | Administradores crIAdores - Acesso total |
| `manager` | Organization | Todas empresas | Gerentes crIAdores - Acesso amplo |
| `business_owner` | Business | Própria empresa | Donos de empresas clientes |
| `marketing_strategist` | Managed | Empresas gerenciadas | Estrategistas de marketing |
| `creator` | Creator | Campanhas próprias | Influenciadores/Criadores |
| `user` | Limited | Acesso limitado | Usuários padrão |
| `viewer` | Read-only | Apenas leitura | Visualizadores |

### **2. ESTRUTURA DE PERMISSÕES:**

```json
{
  "businesses": {"read": true, "write": false, "delete": false},
  "campaigns": {"read": true, "write": true, "delete": false},
  "creators": {"read": true, "write": false, "delete": false},
  "leads": {"read": true, "write": true, "delete": false},
  "tasks": {"read": true, "write": true, "delete": false},
  "analytics": {"read": true, "write": false, "delete": false},
  "users": {"read": false, "write": false, "delete": false},
  "scope": "business|global|managed|creator",
  "business_id": "uuid",
  "managed_businesses": ["uuid1", "uuid2"]
}
```

---

## 🛡️ **ANÁLISE DE SEGURANÇA DAS APIs**

### **🟢 APIS SEGURAS (Com filtros por business_id):**

#### **1. `/api/campaigns-by-business` ✅**
- **Filtro**: `business_id` obrigatório
- **Validação**: Business existe e está ativo
- **Acesso**: Business owners veem apenas suas campanhas
- **Status**: ✅ SEGURO

#### **2. `/api/client/campaigns` ✅**
- **Filtro**: `business_id` via middleware
- **Validação**: Headers de segurança
- **Acesso**: Isolamento total por empresa
- **Status**: ✅ SEGURO

#### **3. `/api/client/creators` ✅**
- **Filtro**: Apenas criadores das campanhas da empresa
- **Validação**: Dupla validação (campanha + business)
- **Acesso**: Mapeamento seguro de relacionamentos
- **Status**: ✅ SEGURO

#### **4. `/api/client/events` ✅**
- **Filtro**: `business_id` via tags/parent_business_id
- **Validação**: Middleware de segurança
- **Acesso**: Eventos específicos da empresa
- **Status**: ✅ SEGURO

### **🟡 APIS PARCIALMENTE SEGURAS:**

#### **5. `/api/supabase/campaigns` ⚠️**
- **Problema**: Aceita `business_id` opcional
- **Risco**: Sem business_id retorna todas campanhas
- **Solução**: Tornar `business_id` obrigatório para não-admins
- **Status**: ⚠️ PRECISA AJUSTE

#### **6. `/api/supabase/businesses` ⚠️**
- **Problema**: Retorna todas empresas
- **Risco**: Business owners veem outras empresas
- **Solução**: Filtrar por `business_id` para business_owner
- **Status**: ⚠️ PRECISA AJUSTE

### **🔴 APIS INSEGURAS (Sem filtros adequados):**

#### **7. `/api/supabase/creators` ❌**
- **Problema**: Retorna todos criadores
- **Risco**: Business owners veem criadores de outras empresas
- **Solução**: Filtrar por campanhas da empresa
- **Status**: ❌ INSEGURO

#### **8. `/api/reports` ❌**
- **Problema**: Relatórios globais
- **Risco**: Business owners veem dados de outras empresas
- **Solução**: Criar `/api/reports-by-business`
- **Status**: ❌ INSEGURO

#### **9. `/api/jornada-tasks` ❌**
- **Problema**: Filtro apenas por usuário
- **Risco**: Não filtra por business_id
- **Solução**: Adicionar filtro por business
- **Status**: ❌ INSEGURO

### **❓ APIS FALTANTES:**

#### **10. `/api/leads-by-business` ❌**
- **Status**: NÃO EXISTE
- **Necessidade**: Business owners precisam ver leads
- **Prioridade**: ALTA

#### **11. `/api/analytics-by-business` ❌**
- **Status**: NÃO EXISTE
- **Necessidade**: Business owners precisam ver analytics
- **Prioridade**: ALTA

#### **12. `/api/tasks-by-business` ❌**
- **Status**: NÃO EXISTE
- **Necessidade**: Business owners precisam ver tasks
- **Prioridade**: MÉDIA

---

## 🎯 **ACESSO POR ROLE**

### **👑 ADMIN (`luizvincenzi@gmail.com`):**
```typescript
// Acesso total - todas APIs sem restrições
const adminAccess = {
  campaigns: "ALL", // Todas campanhas
  businesses: "ALL", // Todas empresas
  creators: "ALL", // Todos criadores
  reports: "ALL", // Relatórios globais
  users: "ALL", // Todos usuários
  analytics: "ALL" // Analytics globais
}
```

### **🏢 BUSINESS_OWNER (`financeiro.brooftop@gmail.com`):**
```typescript
// Acesso restrito à própria empresa
const businessOwnerAccess = {
  campaigns: "business_id=55310ebd-0e0d-492e-8c34-cd4740000000",
  businesses: "id=55310ebd-0e0d-492e-8c34-cd4740000000", 
  creators: "via_campaigns_of_business",
  reports: "business_filtered",
  analytics: "business_filtered",
  leads: "business_filtered",
  tasks: "business_filtered"
}
```

### **📈 MARKETING_STRATEGIST:**
```typescript
// Acesso às empresas gerenciadas
const strategistAccess = {
  campaigns: "business_id IN managed_businesses",
  businesses: "id IN managed_businesses",
  creators: "via_campaigns_of_managed_businesses",
  reports: "managed_businesses_filtered",
  analytics: "managed_businesses_filtered"
}
```

---

## 🚨 **PROBLEMAS CRÍTICOS IDENTIFICADOS**

### **1. MIDDLEWARE INADEQUADO:**
- Não valida roles específicos
- Não aplica filtros por business_id automaticamente
- Permite bypass para algumas APIs

### **2. APIS SEM FILTROS:**
- `/api/supabase/creators` - Expõe todos criadores
- `/api/reports` - Expõe dados globais
- `/api/supabase/businesses` - Expõe todas empresas

### **3. FALTA DE APIS ESPECÍFICAS:**
- Leads por business
- Analytics por business  
- Tasks por business
- Reports por business

### **4. INCONSISTÊNCIA DE AUTENTICAÇÃO:**
- Algumas APIs usam Supabase Auth
- Outras usam API customizada
- Middleware não unificado

---

## ✅ **PLANO DE CORREÇÃO PRIORITÁRIO**

### **🔥 PRIORIDADE ALTA (Implementar AGORA):**

1. **Corrigir `/api/supabase/businesses`**
   - Filtrar por business_id para business_owner
   - Manter acesso total para admin

2. **Corrigir `/api/supabase/creators`**
   - Filtrar por campanhas da empresa
   - Implementar lógica de relacionamento

3. **Criar `/api/leads-by-business`**
   - API específica para leads da empresa
   - Filtros de segurança

4. **Criar `/api/analytics-by-business`**
   - Analytics específicos da empresa
   - Métricas isoladas

### **⚡ PRIORIDADE MÉDIA:**

5. **Criar `/api/reports-by-business`**
6. **Criar `/api/tasks-by-business`**
7. **Implementar middleware unificado**
8. **Adicionar validação de roles**

### **🔧 PRIORIDADE BAIXA:**

9. **Otimizar performance**
10. **Adicionar cache**
11. **Melhorar logs**
12. **Documentação completa**

---

## 🎯 **PRÓXIMOS PASSOS IMEDIATOS**

1. **Executar script SQL** para configurar usuário Boussolé
2. **Implementar correções de segurança** nas APIs críticas
3. **Criar APIs faltantes** para business_owner
4. **Testar acesso** para todos os roles
5. **Validar isolamento** de dados por empresa

---

*Documento gerado em: 2025-09-09*
*Status: ANÁLISE COMPLETA - PRONTO PARA IMPLEMENTAÇÃO*
