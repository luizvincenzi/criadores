# 📱 GUIA COMPLETO: CONFIGURAÇÃO META BUSINESS PARA INSTAGRAM

## 🎯 OBJETIVO
Configurar completamente o app no Meta Business (Facebook Developers) para conectar contas Instagram Business e extrair dados reais de posts e métricas.

## 📋 INFORMAÇÕES DO SEU APP
- **App ID Principal:** 582288514801639
- **App Name:** RestauranteAI-IG
- **Instagram App ID:** 1411553980014110
- **App Secret:** e73a71b54123c6a7ae9b5d11a9361b51
- **Domínio:** criadores.app

---

## 🚀 PASSO 1: ACESSAR FACEBOOK DEVELOPERS

### 1.1 Login e Acesso
1. **Acesse:** https://developers.facebook.com/
2. **Faça login** com sua conta Facebook (a mesma que criou o app)
3. **Clique em "Meus Apps"** no menu superior
4. **Selecione seu app:** "RestauranteAI-IG" (ID: 582288514801639)

### 1.2 Verificar Informações Básicas
1. **Vá em "Configurações" → "Básico"**
2. **Confirme as informações:**
   - Nome do App: RestauranteAI-IG
   - ID do App: 582288514801639
   - Chave Secreta do App: e73a71b54123c6a7ae9b5d11a9361b51

---

## 🔧 PASSO 2: CONFIGURAR DOMÍNIOS DO APP

### 2.1 Adicionar Domínios Autorizados
1. **Em "Configurações" → "Básico"**
2. **Role até "Domínios do App"**
3. **Adicione os domínios:**
   ```
   criadores.app
   localhost
   ```

### 2.2 Configurar URLs da Política de Privacidade
1. **URL da Política de Privacidade:**
   ```
   https://criadores.app/privacy-policy
   ```
2. **URL dos Termos de Serviço:**
   ```
   https://criadores.app/terms-of-service
   ```

---

## 📱 PASSO 3: CONFIGURAR INSTAGRAM BASIC DISPLAY

### 3.1 Adicionar o Produto
1. **No menu lateral, clique em "Produtos"**
2. **Procure por "Instagram Basic Display"**
3. **Clique em "Configurar"** (ou "Set Up" se estiver em inglês)

### 3.2 Configurar Instagram Basic Display
1. **Após adicionar, clique em "Instagram Basic Display" no menu lateral**
2. **Clique em "Basic Display"**
3. **Você verá a tela de configuração**

### 3.3 Criar Instagram App
1. **Clique em "Create New App"**
2. **Preencha os campos:**
   - **Display Name:** Criadores Platform
   - **Valid OAuth Redirect URIs:**
     ```
     https://criadores.app/api/instagram/callback
     ```
   - **Deauthorize Callback URL:**
     ```
     https://criadores.app/api/instagram/deauth
     ```
   - **Data Deletion Request URL:**
     ```
     https://criadores.app/api/instagram/delete
     ```

### 3.4 Salvar Configurações
1. **Clique em "Save Changes"**
2. **Anote o Instagram App ID** que será gerado
3. **Anote o Instagram App Secret**

---

## 👥 PASSO 4: CONFIGURAR USUÁRIOS DE TESTE

### 4.1 Adicionar Testadores do Instagram
1. **Vá em "Funções" → "Funções"** (Roles → Roles)
2. **Role até "Testadores do Instagram"** (Instagram Testers)
3. **Clique em "Adicionar Testadores do Instagram"**
4. **Digite o nome de usuário do Instagram** (sem @)
   - Exemplo: se sua conta é @meuinstagram, digite apenas: meuinstagram
5. **Clique em "Enviar Convite"**

### 4.2 Aceitar Convite no Instagram
1. **Abra o app do Instagram no seu celular**
2. **Vá em Configurações → Privacidade → Apps e Sites**
3. **Você verá um convite pendente**
4. **Aceite o convite** para se tornar testador

### 4.3 Verificar Status
1. **Volte ao Facebook Developers**
2. **Em "Testadores do Instagram"**
3. **Confirme que seu usuário aparece como "Aceito"**

---

## 🔑 PASSO 5: CONFIGURAR PERMISSÕES

### 5.1 Verificar Permissões Básicas
1. **Em "Instagram Basic Display" → "Basic Display"**
2. **Confirme que as seguintes permissões estão ativas:**
   - ✅ instagram_graph_user_profile
   - ✅ instagram_graph_user_media

### 5.2 Adicionar Instagram Graph API (Para Business)
1. **Volte em "Produtos"**
2. **Procure por "Instagram Graph API"**
3. **Clique em "Configurar"**
4. **Adicione as permissões:**
   - ✅ instagram_basic
   - ✅ pages_show_list
   - ✅ pages_read_engagement

---

## 🌐 PASSO 6: CONFIGURAR WEBHOOKS (OPCIONAL)

### 6.1 Configurar Webhook para Atualizações Automáticas
1. **Em "Produtos" → "Webhooks"**
2. **Clique em "Configurar Webhooks"**
3. **Adicione a URL do Webhook:**
   ```
   https://criadores.app/api/instagram/webhook
   ```
4. **Token de Verificação:** (gere um token aleatório)
   ```
   criadores_webhook_token_2024
   ```

---

## ✅ PASSO 7: TESTAR CONFIGURAÇÃO

### 7.1 Verificar Status do App
1. **Vá em "Configurações" → "Básico"**
2. **Confirme que o status é "Em desenvolvimento"**
3. **Todos os campos obrigatórios devem estar preenchidos**

### 7.2 Testar URLs de Redirecionamento
1. **Acesse:** https://criadores.app/instagram-debug
2. **Clique em "Testar Configuração"**
3. **Clique em "Abrir Autorização Instagram"**
4. **Deve abrir a tela de autorização do Instagram**

---

## 🔍 PASSO 8: SOLUÇÃO DE PROBLEMAS COMUNS

### Erro: "Invalid platform app"
**Causa:** App não configurado corretamente
**Solução:**
1. Verificar se Instagram Basic Display está ativo
2. Confirmar URLs de callback corretas
3. Verificar se usuário é testador

### Erro: "Redirect URI mismatch"
**Causa:** URL não autorizada
**Solução:**
1. Adicionar URL exata em "Valid OAuth Redirect URIs"
2. Verificar protocolo (https vs http)
3. Confirmar domínio exato

### Erro: "User not authorized"
**Causa:** Usuário não é testador
**Solução:**
1. Adicionar usuário como testador
2. Aceitar convite no Instagram
3. Verificar status "Aceito"

### Erro: "App not approved"
**Causa:** App em modo desenvolvimento
**Solução:**
1. Para testes, usar apenas contas de testadores
2. Para produção, submeter para revisão

---

## 📊 PASSO 9: CONFIGURAÇÕES AVANÇADAS

### 9.1 Configurar Rate Limiting
1. **Em "Configurações" → "Avançado"**
2. **Configurar limites de taxa apropriados**
3. **Monitorar uso da API**

### 9.2 Configurar Alertas
1. **Configurar notificações por email**
2. **Monitorar erros de API**
3. **Alertas de limite de uso**

---

## 🚀 PASSO 10: SUBMISSÃO PARA PRODUÇÃO (FUTURO)

### 10.1 Preparar para Revisão
1. **Completar todas as informações do app**
2. **Adicionar ícone e screenshots**
3. **Documentar uso das permissões**

### 10.2 Submeter para Revisão
1. **Ir em "Revisão do App"**
2. **Selecionar permissões para revisão**
3. **Fornecer justificativas detalhadas**
4. **Aguardar aprovação (7-14 dias)**

---

## ✅ CHECKLIST FINAL

### Configuração Básica:
- [ ] App criado e configurado
- [ ] Domínios adicionados
- [ ] URLs de política configuradas

### Instagram Basic Display:
- [ ] Produto adicionado
- [ ] URLs de callback configuradas
- [ ] App Instagram criado

### Usuários de Teste:
- [ ] Testador adicionado
- [ ] Convite aceito no Instagram
- [ ] Status "Aceito" confirmado

### Permissões:
- [ ] instagram_graph_user_profile ✅
- [ ] instagram_graph_user_media ✅
- [ ] instagram_basic ✅
- [ ] pages_show_list ✅

### Teste Final:
- [ ] URL de autorização funciona
- [ ] Redirecionamento correto
- [ ] Dados sendo extraídos

---

## 🆘 SUPORTE E CONTATOS

### Se encontrar problemas:
1. **Verificar logs** em criadores.app/instagram-debug
2. **Consultar documentação** do Facebook Developers
3. **Verificar status** do app no painel
4. **Testar com conta de testador** válida

### Links Úteis:
- **Facebook Developers:** https://developers.facebook.com/
- **Documentação Instagram API:** https://developers.facebook.com/docs/instagram-api/
- **Suporte Meta:** https://developers.facebook.com/support/

---

## 🎯 RESULTADO ESPERADO

Após seguir todos os passos:
1. **✅ App configurado** corretamente no Meta Business
2. **✅ Instagram conectado** com sucesso
3. **✅ Dados reais** sendo extraídos
4. **✅ Métricas precisas** nos relatórios
5. **✅ Sistema funcionando** em produção
