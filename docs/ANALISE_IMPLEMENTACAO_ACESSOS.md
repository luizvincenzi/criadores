# 📋 Análise de Implementação de Acessos - crIAdores

## 🎯 Objetivo
Criar acessos para dois novos usuários seguindo o documento `ROLES_E_BANCO_DE_DADOS.md`:
1. **Pietra Mantovani** - Role: `creator`
2. **Marilia** - Role: `marketing_strategist`

---

## ✅ O que JÁ EXISTE no Sistema

### 1. **Banco de Dados**
- ✅ Tabela `users` com campos: `id`, `email`, `full_name`, `role`, `business_id`, `creator_id`, `managed_businesses`, `permissions`, `is_active`
- ✅ ENUM `user_role` com valores: `admin`, `manager`, `user`, `viewer`, `business_owner`, `creator`, `marketing_strategist`
- ✅ Tabela `creators` para armazenar dados de criadores
- ✅ Tabela `businesses` para empresas

### 2. **Autenticação**
- ✅ API de login em `/api/supabase/auth/login` que valida email/senha
- ✅ Sistema de validação de credenciais hardcoded (precisa ser atualizado)
- ✅ AuthStore que gerencia sessão do usuário

### 3. **Dashboards**
- ✅ `/dashboard/criador` - Dashboard para `creator` e `marketing_strategist`
- ✅ `/dashboard/geral` - Dashboard padrão
- ✅ `/dashboard/empresa` - Dashboard para `business_owner`
- ✅ `/dashboard/admin` - Dashboard para `admin`

### 4. **Páginas Disponíveis**
- ✅ `/campaigns` - Campanhas
- ✅ `/conteudo` - Calendário de conteúdo
- ✅ `/reports` - Relatórios
- ✅ `/creators` - Gerenciar criadores

---

## ❌ O que FALTA ou PRECISA SER AJUSTADO

### 1. **Banco de Dados**
- ❌ Não há criadores criados para Pietra Mantovani
- ❌ Não há empresas gerenciadas para Marilia
- ⚠️ Validação de senha está hardcoded na API de login

### 2. **Autenticação**
- ⚠️ Credenciais precisam ser adicionadas ao arquivo `/app/api/supabase/auth/login/route.ts`
- ⚠️ Não há sistema de hash de senha (usa comparação direta)

### 3. **Permissões**
- ✅ Sistema de permissões por role já existe
- ✅ Dashboard `/dashboard/criador` já valida roles `creator` e `marketing_strategist`

---

## 🔧 Plano de Implementação

### **Fase 1: Preparar Banco de Dados**
1. Criar registro de criador para Pietra Mantovani
2. Criar/associar empresas para Marilia gerenciar

### **Fase 2: Criar Usuários**
1. Inserir Pietra Mantovani na tabela `users` com:
   - Email: `pietramantovani98@gmail.com`
   - Role: `creator`
   - Creator_id: (ID do criador criado na Fase 1)
   - is_active: `true`

2. Inserir Marilia na tabela `users` com:
   - Email: `marilia12cavalheiro@gmail.com`
   - Role: `marketing_strategist`
   - Managed_businesses: (IDs das empresas que ela gerencia)
   - is_active: `true`

### **Fase 3: Adicionar Credenciais de Login**
1. Adicionar credenciais ao arquivo `/app/api/supabase/auth/login/route.ts`
2. Testar login com ambos os usuários

### **Fase 4: Validar Acessos**
1. Verificar que Pietra consegue acessar `/dashboard/criador`
2. Verificar que Marilia consegue acessar `/dashboard/criador`
3. Validar permissões de cada uma nas páginas

---

## 📊 Matriz de Permissões Esperadas

### **Pietra Mantovani (creator)**
| Recurso | Ver | Criar | Editar | Deletar | Aprovar |
|---------|-----|-------|--------|---------|---------|
| Campanhas Atribuídas | ✅ | ❌ | ❌ | ❌ | ❌ |
| Conteúdo Atribuído | ✅ | ✅ | ✅ | ✅ | ❌ |
| Calendário | ✅ | ❌ | ❌ | ❌ | ❌ |
| Relatórios | ✅ | ❌ | ❌ | ❌ | ❌ |

### **Marilia (marketing_strategist)**
| Recurso | Ver | Criar | Editar | Deletar | Aprovar |
|---------|-----|-------|--------|---------|---------|
| Campanhas Atribuídas | ✅ | ✅ | ✅ | ❌ | ❌ |
| Conteúdo | ✅ | ✅ | ✅ | ❌ | ❌ |
| Calendário | ✅ | ✅ | ✅ | ❌ | ❌ |
| Briefings | ✅ | ✅ | ✅ | ❌ | ❌ |

---

## 🔐 Credenciais

### Pietra Mantovani
- **Email:** pietramantovani98@gmail.com
- **Senha:** 2#Todoscria
- **Role:** creator

### Marilia
- **Email:** marilia12cavalheiro@gmail.com
- **Senha:** 2#Todoscria
- **Role:** marketing_strategist

---

## 📝 Próximos Passos
1. Executar script para criar criador de Pietra
2. Executar script para criar usuários
3. Atualizar credenciais de login
4. Testar acessos

