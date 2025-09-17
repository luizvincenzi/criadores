# 🔔 Sistema de Notificações de Leads

## 📋 **RESUMO**

O sistema de notificações foi implementado para avisar **SEMPRE** que um novo lead chegar através dos chatbots. Você pode receber notificações via:

- 📱 **WhatsApp** (via Zapier)
- 📧 **Email** (via Zapier)
- 💬 **Discord** (webhook direto)
- 💼 **Slack** (webhook direto)

## 🔧 **COMO FUNCIONA**

### 1. **Fluxo Automático**
```
Lead preenche chatbot → API salva no banco → Dispara notificações → Você recebe aviso
```

### 2. **API de Notificações**
- **Endpoint**: `/api/notifications/new-lead`
- **Método**: POST
- **Dados enviados**: Informações completas do lead

### 3. **Webhooks Configuráveis**
O sistema suporta múltiplas plataformas simultaneamente através de variáveis de ambiente.

## ⚙️ **CONFIGURAÇÃO**

### **Variáveis de Ambiente (.env.local)**

```bash
# Discord (webhook direto)
DISCORD_NEW_LEAD_WEBHOOK=https://discord.com/api/webhooks/SEU_WEBHOOK_AQUI

# Slack (webhook direto)
SLACK_NEW_LEAD_WEBHOOK=https://hooks.slack.com/services/SEU_WEBHOOK_AQUI

# Zapier (para WhatsApp e Email)
ZAPIER_NEW_LEAD_WEBHOOK=https://hooks.zapier.com/hooks/catch/SEU_WEBHOOK_AQUI
```

### **Como Obter os Webhooks:**

#### 🔵 **Discord**
1. Vá no seu servidor Discord
2. Configurações do Canal → Integrações → Webhooks
3. Criar Webhook → Copiar URL

#### 🟢 **Slack**
1. Vá em https://api.slack.com/apps
2. Create New App → Incoming Webhooks
3. Ativar e criar webhook → Copiar URL

#### ⚡ **Zapier (WhatsApp/Email)**
1. Criar conta no Zapier
2. Criar Zap: Webhook → WhatsApp/Email
3. Copiar URL do webhook

## 📱 **CONFIGURAÇÃO WHATSAPP (RECOMENDADO)**

### **Opção 1: Zapier + WhatsApp Business API**
```
Webhook → Zapier → WhatsApp Business → Seu número
```

### **Opção 2: Zapier + Email → WhatsApp**
```
Webhook → Zapier → Email → Você vê no email e responde
```

### **Opção 3: Discord/Slack no celular**
```
Webhook → Discord/Slack → App no celular → Notificação push
```

## 🧪 **TESTANDO NOTIFICAÇÕES**

### **Script de Teste**
```bash
npx tsx scripts/test-notifications.ts
```

### **Teste Manual**
```bash
curl -X POST http://localhost:3000/api/notifications/new-lead \
  -H "Content-Type: application/json" \
  -d '{
    "leadId": "CRI123456",
    "name": "Teste",
    "email": "teste@teste.com",
    "source": "criavoz-novo"
  }'
```

## 📊 **MONITORAMENTO**

### **Logs Detalhados**
O sistema registra todos os envios de notificação:

```
✅ [NOTIFICATIONS] Notificação Discord enviada
✅ [NOTIFICATIONS] Notificação Slack enviada  
✅ [NOTIFICATIONS] Notificação Zapier enviada
❌ [NOTIFICATIONS] Erro ao enviar para Discord: [erro]
```

### **Script de Monitoramento**
```bash
npx tsx scripts/monitor-new-leads.ts
```

## 🎯 **FONTES IDENTIFICADAS**

O sistema identifica automaticamente de onde veio o lead:

- **criavoz-chatbot**: Homepage original
- **criavoz-novo**: Veio do Instagram (novo)
- **criavoz-instagram**: Futuras implementações

## 📋 **FORMATO DAS NOTIFICAÇÕES**

### **Discord/Slack**
```
🚨 NOVO LEAD RECEBIDO!

👤 Nome: João Silva
🏢 Empresa: Loja do João  
📧 Email: joao@loja.com
📱 WhatsApp: 11999999999
📸 Instagram: @joaosilva
🎯 Segmento: moda
💰 Objetivo: vendas
🔗 Fonte: criavoz-novo
🎫 Protocolo: CRI123456

⏰ Recebido em: 17/09/2025 às 16:51
```

### **Zapier (WhatsApp/Email)**
```
🚨 NOVO LEAD!
Nome: João Silva
Empresa: Loja do João
Email: joao@loja.com
WhatsApp: 11999999999
Fonte: criavoz-novo
Protocolo: CRI123456
```

## 🔧 **CONFIGURAÇÃO RECOMENDADA**

### **Para Máxima Eficiência:**

1. **Configure Zapier + WhatsApp** (notificação instantânea no celular)
2. **Configure Discord/Slack** (backup e histórico)
3. **Mantenha logs ativos** (monitoramento)

### **Configuração Mínima (Gratuita):**

1. **Discord** (gratuito, notificação no celular via app)
2. **Zapier Free** (100 zaps/mês gratuitos)

## 🚀 **STATUS ATUAL**

✅ **Sistema implementado e funcionando**
✅ **API de notificações criada**
✅ **Suporte a múltiplas plataformas**
✅ **Logs detalhados**
✅ **Scripts de teste**
✅ **Identificação de fontes**

## 📞 **PRÓXIMOS PASSOS**

1. **Escolher plataforma** (WhatsApp recomendado)
2. **Configurar webhooks** (adicionar no .env.local)
3. **Testar notificações** (usar script de teste)
4. **Monitorar funcionamento** (verificar logs)

## 🔗 **LINKS ÚTEIS**

- **Zapier**: https://zapier.com
- **Discord Webhooks**: https://support.discord.com/hc/en-us/articles/228383668
- **Slack Webhooks**: https://api.slack.com/messaging/webhooks
- **WhatsApp Business API**: https://business.whatsapp.com

---

**💡 Dica**: Comece com Discord (mais fácil) e depois adicione WhatsApp via Zapier para máxima eficiência!
