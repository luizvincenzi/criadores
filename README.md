# 🚀 CRM Criadores - Sistema Completo de Gestão

Um sistema CRM moderno e completo para gerenciamento de criadores de conteúdo e campanhas, com **interface kanban drag & drop** e **sistema 100% migrado para Supabase**.

## ✨ Funcionalidades Principais

### 🛤️ **Jornada de Campanhas (Kanban)**
- **4 estágios:** Reunião de Briefing → Agendamentos → Entrega Final → Finalizado
- **Drag & Drop funcional** para mover campanhas entre estágios
- **Atualização automática** no banco PostgreSQL (Supabase)
- **Validação inteligente** antes de finalizar campanhas
- **Feedback visual** com notificações em tempo real

### 👥 **Gestão Completa de Criadores**
- **Sistema de slots dinâmicos** para campanhas
- **Troca atômica** de criadores entre campanhas
- **Edição inline** de todos os campos (datas, status, links)
- **Validação de dados** em tempo real
- **Histórico completo** de alterações (audit log)

### 📊 **Dashboard e Relatórios**
- **Métricas em tempo real** de campanhas e visualizações
- **Ranking de campanhas** por performance
- **Ranking de criadores** por engajamento
- **Relatórios premium** com filtros avançados

### 🔗 **Integração Total**
- **5 páginas integradas:** Dashboard, Negócios, Criadores, Campanhas, Jornada
- **Banco PostgreSQL** via Supabase com RLS (Row Level Security)
- **APIs RESTful** para todas as operações
- **Sistema de autenticação** com controle de acesso

## 🛠️ Tecnologias

- **Next.js 15** com App Router e TypeScript
- **Supabase** (PostgreSQL + Auth + Real-time)
- **TailwindCSS** + Material Design 3
- **@dnd-kit** para drag & drop
- **Zustand** para state management
- **React Hook Form** para formulários
- **Lucide React** para ícones


### Acesse a aplicação
- **Dashboard:** criadores.digital/dashboard
- **Jornada Kanban:** http://criadores.digital/jornada
- **Criadores:** http://criadores.digital/criadores
- **Negócios:** http://criadores.digital/negocios

## 🎯 Funcionalidades Detalhadas

### 🖱️ **Sistema Drag & Drop**
- **Arrastar campanhas** entre estágios do Kanban
- **Feedback visual** durante o arraste com animações
- **Drop zones destacadas** quando hover
- **Atualização automática** no banco PostgreSQL
- **Validação inteligente** antes de mover campanhas

### 👥 **Gestão Avançada de Criadores**
- **Slots dinâmicos** por campanha (1-10 criadores)
- **Troca atômica** de criadores sem perder dados
- **Edição inline** de datas, status e links
- **Validação em tempo real** de campos obrigatórios
- **Sistema de substituição** de criadores

### 📊 **Dashboard Inteligente**
- **Métricas em tempo real** de campanhas ativas
- **Total de visualizações** agregadas
- **Ranking dinâmico** de top 3 campanhas
- **Relatórios premium** com filtros avançados

### 🔔 **Sistema de Notificações**
- **Toast contextual** para cada ação
- **Feedback visual** em tempo real
- **Confirmações** para ações críticas
- **Auto-dismiss** inteligente

### 🔒 **Segurança e Auditoria**
- **Row Level Security (RLS)** no Supabase
- **Audit log completo** de todas as alterações
- **Controle de acesso** por usuário
- **Validação de dados** em múltiplas camadas

## 🧪 Como Testar

### 1. Kanban de Campanhas
1. Acesse `/jornada`
2. Arraste campanhas entre estágios
3. Observe validações automáticas
4. Teste finalização de campanhas

### 2. Gestão de Criadores
1. Abra uma campanha no modal
2. Adicione/remova criadores
3. Edite datas e status inline
4. Teste troca de criadores

### 3. Dashboard e Métricas
1. Acesse `/` (dashboard)
2. Veja métricas em tempo real
3. Teste relatórios premium
4. Observe rankings dinâmicos

## 📈 Status do Projeto

✅ **100% Funcional e Pronto para Produção**
- ✅ Sistema Kanban com drag & drop
- ✅ Migração completa para Supabase
- ✅ Interface Google Material Design 3
- ✅ Sistema de autenticação
- ✅ Gestão completa de criadores
- ✅ Dashboard com métricas
- ✅ Audit log e segurança
- ✅ APIs RESTful completas
- ✅ Validação e integridade de dados
- ✅ Relatórios personalizados no dashboard
- ✅ Relatórios por campanhas 

## 🚀 Deploy

O projeto está configurado para deploy automático no Vercel

---

**Desenvolvido com ❤️ para crIAdores de conteúdo**

🔗 **Repositório:** [https://github.com/luizvincenzi/crmcriadores](https://github.com/luizvincenzi/crmcriadores)
🌐 **Demo Live:** http://criadores.digital
