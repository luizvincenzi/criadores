# Sistema de User Roles - Plataforma crIAdores

## 📋 **VISÃO GERAL**

O sistema de user roles foi projetado para suportar diferentes tipos de usuários na plataforma crIAdores, desde funcionários internos até clientes empresariais e criadores de conteúdo.

## 🎭 **TIPOS DE USUÁRIOS**

### **1. 👑 ADMIN (Funcionários crIAdores)**
- **Descrição**: Funcionários da crIAdores com acesso total ao sistema
- **Acesso**: Todas as empresas, criadores, campanhas e dados
- **Uso**: Equipe interna da crIAdores
- **Exemplo**: Luiz Vincenzi, equipe de desenvolvimento

**Permissões:**
```json
{
  "businesses": {"read": true, "write": true, "delete": true},
  "campaigns": {"read": true, "write": true, "delete": true},
  "creators": {"read": true, "write": true, "delete": true},
  "leads": {"read": true, "write": true, "delete": true},
  "tasks": {"read": true, "write": true, "delete": true},
  "analytics": {"read": true, "write": true, "delete": true},
  "users": {"read": true, "write": true, "delete": true},
  "scope": "global"
}
```

### **2. 👔 MANAGER (Gerentes crIAdores)**
- **Descrição**: Gerentes da crIAdores com acesso amplo mas limitado
- **Acesso**: Todas as empresas da organização, sem deletar
- **Uso**: Supervisores, coordenadores
- **Exemplo**: Gerente de operações, gerente comercial

### **3. 🏢 BUSINESS_OWNER (Dono da Empresa)**
- **Descrição**: Proprietário ou responsável pela empresa cliente
- **Acesso**: Apenas sua própria empresa e campanhas relacionadas
- **Uso**: CEOs, donos de negócios que contrataram a crIAdores
- **Exemplo**: "Financeiro Boussolé" (financeiro.brooftop@gmail.com)

**Campos específicos:**
- `business_id`: ID da empresa que possui

**Permissões:**
```json
{
  "businesses": {"read": true, "write": true, "delete": false},
  "campaigns": {"read": true, "write": true, "delete": false},
  "creators": {"read": true, "write": false, "delete": false},
  "analytics": {"read": true, "write": false, "delete": false},
  "scope": "business",
  "business_id": "uuid-da-empresa"
}
```

### **4. 🎨 CREATOR (Criador/Influenciador)**
- **Descrição**: Criadores de conteúdo que participam das campanhas
- **Acesso**: Próprio perfil, campanhas que participa, tarefas atribuídas
- **Uso**: Influenciadores, criadores de conteúdo
- **Exemplo**: @influencer_local

**Campos específicos:**
- `creator_id`: ID do perfil de criador

**Permissões:**
```json
{
  "campaigns": {"read": true, "write": false, "delete": false},
  "creators": {"read": true, "write": true, "delete": false},
  "tasks": {"read": true, "write": true, "delete": false},
  "analytics": {"read": true, "write": false, "delete": false},
  "scope": "creator"
}
```

### **5. 📊 MARKETING_STRATEGIST (Estrategista de Marketing)**
- **Descrição**: Profissional que gerencia campanhas para empresas específicas
- **Acesso**: Empresas atribuídas, campanhas, criadores relacionados
- **Uso**: Freelancers, agências parceiras, consultores
- **Exemplo**: Estrategista que gerencia campanhas da Boussolé

**Campos específicos:**
- `managed_businesses`: Array de IDs das empresas que gerencia

**Permissões:**
```json
{
  "businesses": {"read": true, "write": true, "delete": false},
  "campaigns": {"read": true, "write": true, "delete": false},
  "creators": {"read": true, "write": true, "delete": false},
  "analytics": {"read": true, "write": true, "delete": false},
  "scope": "managed_businesses"
}
```

### **6. 👤 USER (Usuário Padrão)**
- **Descrição**: Funcionários com acesso limitado
- **Acesso**: Visualização geral, edição de tarefas próprias
- **Uso**: Assistentes, estagiários

### **7. 👁️ VIEWER (Visualizador)**
- **Descrição**: Acesso apenas para visualização
- **Acesso**: Somente leitura de dados permitidos
- **Uso**: Stakeholders, investidores, auditores

## 🔗 **RELACIONAMENTOS**

### **Business Owner → Business (1:1)**
```sql
users.business_id → businesses.id
```
- Um business_owner está vinculado a uma empresa específica
- Acesso exclusivo aos dados dessa empresa

### **Creator → Creator Profile (1:1)**
```sql
users.creator_id → creators.id
```
- Um creator está vinculado a um perfil de criador específico
- Acesso aos próprios dados e campanhas participadas

### **Marketing Strategist → Businesses (1:N)**
```sql
users.managed_businesses → businesses.id[]
```
- Um strategist pode gerenciar múltiplas empresas
- Acesso limitado às empresas atribuídas

## 🛡️ **SISTEMA DE PERMISSÕES**

### **Estrutura de Permissões:**
```json
{
  "resource": {
    "read": boolean,
    "write": boolean, 
    "delete": boolean
  },
  "scope": "global|organization|business|creator|managed_businesses|limited|read_only|none",
  "business_id": "uuid", // Para business_owner
  "managed_businesses": ["uuid1", "uuid2"] // Para marketing_strategist
}
```

### **Recursos Controlados:**
- `businesses`: Empresas clientes
- `campaigns`: Campanhas de marketing
- `creators`: Perfis de criadores
- `leads`: Leads e prospects
- `tasks`: Tarefas e atividades
- `analytics`: Relatórios e métricas
- `users`: Gerenciamento de usuários

## 🔧 **FUNÇÕES UTILITÁRIAS**

### **Criar Usuário com Role:**
```sql
SELECT create_user_with_role(
  'email@empresa.com',
  'Nome Completo',
  'business_owner',
  '00000000-0000-0000-0000-000000000001', -- organization_id
  'business-uuid', -- business_id (para business_owner)
  NULL, -- creator_id
  NULL -- managed_businesses
);
```

### **Obter Permissões Padrão:**
```sql
SELECT get_default_permissions('business_owner', 'business-uuid');
```

## 📊 **CASOS DE USO**

### **1. Empresa Assina Contrato**
1. Criar usuário `business_owner` vinculado à empresa
2. Definir `business_id` para acesso exclusivo
3. Enviar credenciais de acesso

### **2. Adicionar Estrategista**
1. Criar usuário `marketing_strategist`
2. Definir `managed_businesses` com empresas atribuídas
3. Configurar permissões específicas

### **3. Onboarding de Criador**
1. Criar usuário `creator` vinculado ao perfil
2. Definir `creator_id` para acesso aos próprios dados
3. Permitir visualização de campanhas participadas

## 🔒 **SEGURANÇA E VALIDAÇÃO**

### **Validações Automáticas:**
- `business_owner` deve ter `business_id` definido
- `creator` deve ter `creator_id` definido  
- `marketing_strategist` deve ter pelo menos um business em `managed_businesses`

### **Row Level Security (RLS):**
- Usuários só acessam dados do seu escopo
- Business owners só veem sua empresa
- Creators só veem seus dados e campanhas
- Strategists só veem empresas gerenciadas

## 🚀 **IMPLEMENTAÇÃO**

### **1. Executar Migration:**
```bash
# Aplicar no Supabase
psql -f supabase/migrations/025_update_user_roles_system.sql
```

### **2. Atualizar Types:**
```typescript
// Atualizar lib/database.types.ts
type UserRole = 'admin' | 'manager' | 'business_owner' | 'creator' | 'marketing_strategist' | 'user' | 'viewer';
```

### **3. Implementar Frontend:**
- Componentes de autenticação
- Guards de rota baseados em role
- Interface específica por tipo de usuário

## 📈 **BENEFÍCIOS**

### **✅ Segurança:**
- Acesso granular por tipo de usuário
- Isolamento de dados por empresa
- Validações automáticas

### **✅ Escalabilidade:**
- Suporte a múltiplos tipos de cliente
- Fácil adição de novos roles
- Sistema flexível de permissões

### **✅ Usabilidade:**
- Interface personalizada por role
- Acesso direto aos dados relevantes
- Experiência otimizada por tipo de usuário

---

**Status**: ✅ Pronto para implementação  
**Próximos Passos**: Executar migration e implementar frontend
