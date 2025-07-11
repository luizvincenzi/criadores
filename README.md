# 🚀 CRM Criadores - Sistema Kanban Completo

Um sistema CRM moderno e completo para gerenciamento de influenciadores e campanhas, com **Kanban drag & drop funcional** e integração total com Google Sheets.

## ✨ Funcionalidades Principais

### 🛤️ **Kanban da Jornada**
- **3 fases específicas:** Reunião Briefing → Agendamentos → Entrega Final
- **Drag & Drop funcional** para mover negócios entre fases
- **Atualização automática** no banco de dados
- **Feedback visual** com notificações de sucesso/erro

### 💬 **Popup de Detalhes Completo**
- **Informações do projeto** (fase, valor, data, descrição)
- **Lista de influenciadores** contratados com métricas
- **Campanhas relacionadas** com status e períodos
- **Interface moderna** com Material Design 3

### 🔗 **Integração Total**
- **4 páginas integradas:** Negócios, Influenciadores, Campanhas, Jornada
- **Banco de dados único** através do Google Sheets
- **Dados compartilhados** entre todas as seções
- **Extração automática** de influenciadores e campanhas

## 🛠️ Tecnologias

- **Next.js 15** com App Router
- **TypeScript** para type safety
- **TailwindCSS** para styling
- **@dnd-kit** para drag & drop
- **Google Sheets API** para persistência
- **Zustand** para state management
- **Material Design 3** para UI/UX

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Instalação
```bash
# Clone o repositório
git clone https://github.com/luizvincenzi/crmcriadores.git
cd crmcriadores

# Instale as dependências
npm install

# Execute o projeto
npm run dev
```

### Acesse a aplicação
- **URL:** http://localhost:3000
- **Jornada Kanban:** http://localhost:3000/jornada

## 🎯 Funcionalidades Detalhadas

### 🖱️ **Sistema Drag & Drop**
- **Arrastar negócios** entre colunas do Kanban
- **Feedback visual** durante o arraste
- **Drop zones destacadas** quando hover
- **Atualização imediata** da interface

### 📊 **Métricas Integradas**
- **Contagem automática** de influenciadores por negócio
- **Valores totais** por fase da jornada
- **Estatísticas dinâmicas** em todas as páginas

### 🔔 **Sistema de Notificações**
- **Toast de sucesso** (verde) quando operação bem-sucedida
- **Toast de erro** (vermelho) quando falha
- **Auto-dismiss** após 3 segundos

## 🗃️ Integração Google Sheets

### Configuração
1. Crie um projeto no Google Cloud Console
2. Ative a Google Sheets API
3. Crie credenciais de service account
4. Configure as variáveis de ambiente:

```env
GOOGLE_SPREADSHEET_ID=your_spreadsheet_id
GOOGLE_SERVICE_ACCOUNT_EMAIL=your_service_account_email
GOOGLE_PRIVATE_KEY=your_private_key
```

## 🧪 Como Testar

### Kanban Drag & Drop
1. Acesse `/jornada`
2. Arraste qualquer card entre as colunas
3. Observe a atualização imediata
4. Veja a notificação de sucesso

### Popup de Detalhes
1. Clique em qualquer card (sem arrastar)
2. Veja informações completas do negócio
3. Observe influenciadores e campanhas
4. Feche o popup

## 📈 Status do Projeto

✅ **Completo e Funcional**
- Sistema Kanban com drag & drop
- Integração com Google Sheets
- Interface moderna e responsiva
- Notificações de feedback
- Popup de detalhes completo
- 4 páginas integradas

---

**Desenvolvido com ❤️ para criadores de conteúdo**

🔗 **Demo:** [https://github.com/luizvincenzi/crmcriadores](https://github.com/luizvincenzi/crmcriadores)
