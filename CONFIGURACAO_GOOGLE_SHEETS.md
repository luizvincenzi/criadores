# 📊 CONFIGURAÇÃO GOOGLE SHEETS - GUIA COMPLETO

## 🎯 **SUA PLANILHA ESTÁ PRONTA!**

**ID da Planilha:** `14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI`

**URL:** https://docs.google.com/spreadsheets/d/14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI/edit

---

## 🔧 **PASSO A PASSO PARA CONFIGURAÇÃO:**

### **1️⃣ CONFIGURAR GOOGLE CLOUD PROJECT**

1. **Acesse:** https://console.cloud.google.com/
2. **Crie um novo projeto** ou selecione um existente
3. **Anote o Project ID** (você vai precisar)

### **2️⃣ HABILITAR APIs NECESSÁRIAS**

1. **Vá para:** "APIs & Services" > "Library"
2. **Habilite as seguintes APIs:**
   - ✅ **Google Sheets API**
   - ✅ **Google Calendar API**

### **3️⃣ CRIAR CONTA DE SERVIÇO**

1. **Vá para:** "APIs & Services" > "Credentials"
2. **Clique:** "Create Credentials" > "Service Account"
3. **Preencha:**
   - Nome: `CRM Criadores Service Account`
   - Descrição: `Conta para integração CRM com Sheets e Calendar`
4. **Clique:** "Create and Continue"
5. **Role:** Selecione "Editor" ou "Owner"
6. **Clique:** "Done"

### **4️⃣ BAIXAR CREDENCIAIS JSON**

1. **Na lista de Service Accounts**, clique na conta criada
2. **Vá para aba:** "Keys"
3. **Clique:** "Add Key" > "Create New Key"
4. **Selecione:** JSON
5. **Clique:** "Create"
6. **Baixe o arquivo JSON** (guarde com segurança!)

### **5️⃣ CONFIGURAR VARIÁVEIS DE AMBIENTE**

1. **Abra o arquivo JSON baixado**
2. **Copie os valores** para o arquivo `.env.local`:

```env
GOOGLE_PROJECT_ID=valor-do-project_id
GOOGLE_PRIVATE_KEY_ID=valor-do-private_key_id
GOOGLE_PRIVATE_KEY="valor-do-private_key-completo"
GOOGLE_CLIENT_EMAIL=valor-do-client_email
GOOGLE_CLIENT_ID=valor-do-client_id
GOOGLE_SPREADSHEET_ID=14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI
```

**⚠️ IMPORTANTE:** Mantenha as aspas duplas no `GOOGLE_PRIVATE_KEY`!

---

## 📋 **ESTRUTURA DA PLANILHA**

### **🗂️ ABAS NECESSÁRIAS:**

Crie as seguintes abas na sua planilha:

#### **📊 ABA "Businesses" (Principal)**
```
Colunas (linha 1):
A: id
B: businessName
C: journeyStage
D: nextAction
E: contactDate
F: value
G: description
H: creators
I: campaigns
```

#### **👥 ABA "Creators" (Opcional)**
```
Colunas (linha 1):
A: id
B: name
C: username
D: followers
E: engagementRate
F: businessName
```

#### **📢 ABA "Campaigns" (Opcional)**
```
Colunas (linha 1):
A: id
B: title
C: status
D: startDate
E: endDate
F: businessName
```

### **📝 EXEMPLO DE DADOS:**

#### **Businesses (Linha 2):**
```
1 | Loja de Roupas Fashion | Agendamentos | Agendar sessões de fotos | 2024-01-15 | 15000 | Campanha de verão focada em roupas casuais | [{"name":"Ana Silva","username":"anasilva","followers":125000,"engagementRate":4.2}] | [{"title":"Campanha Verão 2024","status":"Ativa","startDate":"2024-01-15","endDate":"2024-03-15"}]
```

---

## 🔐 **COMPARTILHAR PLANILHA**

### **6️⃣ DAR ACESSO À CONTA DE SERVIÇO**

1. **Abra sua planilha:** https://docs.google.com/spreadsheets/d/14yzga-y6A-3kae92Lr3knQGDaVVXMZv3tOggUL43dCI/edit
2. **Clique em "Compartilhar"** (botão azul no canto superior direito)
3. **Adicione o email da conta de serviço:**
   - Email: `valor-do-client_email` (do arquivo JSON)
   - Permissão: **Editor**
4. **Desmarque:** "Notificar pessoas"
5. **Clique:** "Compartilhar"

---

## 📅 **CONFIGURAR GOOGLE CALENDAR**

### **7️⃣ CRIAR CALENDÁRIO ESPECÍFICO**

1. **Acesse:** https://calendar.google.com/
2. **Clique:** "+" ao lado de "Outros calendários"
3. **Selecione:** "Criar novo calendário"
4. **Preencha:**
   - Nome: `CRM Criadores - Agendamentos`
   - Descrição: `Calendário para agendamentos automáticos do CRM`
5. **Clique:** "Criar calendário"

### **8️⃣ OBTER ID DO CALENDÁRIO**

1. **Nas configurações do calendário criado**
2. **Role até:** "Integrar calendário"
3. **Copie o "ID do calendário"**
4. **Adicione no `.env.local`:**
```env
GOOGLE_CALENDAR_ID=id-do-calendario-copiado
```

### **9️⃣ COMPARTILHAR CALENDÁRIO COM SERVICE ACCOUNT**

1. **Nas configurações do calendário**
2. **Vá para:** "Compartilhar com pessoas específicas"
3. **Adicione:** o email da conta de serviço
4. **Permissão:** "Fazer alterações nos eventos"
5. **Clique:** "Enviar"

---

## 🚀 **TESTAR A INTEGRAÇÃO**

### **🔄 REINICIAR SERVIDOR**
```bash
# Pare o servidor (Ctrl+C)
# Reinicie
npm run dev
```

### **✅ VERIFICAR FUNCIONAMENTO**

1. **Acesse:** http://localhost:3001/jornada
2. **Arraste um negócio** para "Agendamentos"
3. **Verifique:**
   - ✅ Dados atualizados na planilha
   - ✅ Evento criado no calendário
   - ✅ Notificação de sucesso

### **🐛 TROUBLESHOOTING**

#### **Erro: "GOOGLE_SPREADSHEET_ID não está configurado"**
- ✅ Verifique se o `.env.local` está na raiz do projeto
- ✅ Reinicie o servidor após criar o arquivo

#### **Erro: "Credenciais do Google não configuradas"**
- ✅ Verifique se todos os campos do `.env.local` estão preenchidos
- ✅ Confirme que o `GOOGLE_PRIVATE_KEY` tem as aspas duplas

#### **Erro: "Falha ao ler dados da planilha"**
- ✅ Confirme que a planilha foi compartilhada com a conta de serviço
- ✅ Verifique se as abas e colunas estão nomeadas corretamente

#### **Erro: "Falha ao criar evento no calendário"**
- ✅ Confirme que o calendário foi compartilhado com a conta de serviço
- ✅ Verifique se o `GOOGLE_CALENDAR_ID` está correto

---

## 🎯 **RESULTADO ESPERADO**

### **✅ FUNCIONAMENTO COMPLETO:**
- **Kanban drag & drop** atualiza planilha em tempo real
- **Eventos automáticos** criados no calendário
- **Widget calendário** mostra próximos agendamentos
- **Dados sincronizados** entre todas as páginas

### **📊 DADOS REAIS:**
- **Negócios** carregados da planilha
- **Criadores** extraídos dos negócios
- **Campanhas** consolidadas dos projetos
- **Agendamentos** automáticos funcionando

**🚀 SUA INTEGRAÇÃO ESTARÁ COMPLETA E FUNCIONAL! 🚀**
