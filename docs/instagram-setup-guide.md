# 📱 GUIA DE CONFIGURAÇÃO INSTAGRAM BUSINESS API

## 🎯 OBJETIVO
Conectar sua conta Instagram Business para extrair dados reais de posts, métricas e insights.

## 📋 PRÉ-REQUISITOS
- ✅ Conta Instagram Business (não Personal)
- ✅ Página do Facebook conectada ao Instagram
- ✅ Conta Facebook Developers
- ✅ App ID: 1411553980014110
- ✅ App Secret: e73a71b54123c6a7ae9b5d11a9361b51

---

## 🔧 PASSO 1: CONFIGURAR APP NO FACEBOOK DEVELOPERS

### 1.1 Acessar Facebook Developers
1. Acesse: https://developers.facebook.com/
2. Faça login com sua conta Facebook
3. Vá em "Meus Apps" → Selecione seu app "RestauranteAI-IG"

### 1.2 Configurar Produtos do App
1. **Instagram Basic Display**
   - Clique em "Configurar" no produto Instagram Basic Display
   - Adicione URLs de redirecionamento válidas:
     - `http://localhost:3001/api/instagram/callback`
     - `https://seudominio.com/api/instagram/callback` (produção)

2. **Instagram Graph API** (para Business)
   - Adicione o produto "Instagram Graph API"
   - Configure as permissões necessárias

### 1.3 Configurar URLs Autorizadas
```
OAuth Redirect URIs:
- https://criadores.app/api/instagram/callback
- https://localhost:3000/api/instagram/callback (apenas para desenvolvimento)

Deauthorize Callback URL:
- https://criadores.app/api/instagram/deauth

Data Deletion Request URL:
- https://criadores.app/api/instagram/delete
```

---

## 🔑 PASSO 2: CONFIGURAR PERMISSÕES

### 2.1 Permissões Necessárias
```
Instagram Basic Display:
- instagram_graph_user_profile
- instagram_graph_user_media

Instagram Graph API:
- instagram_basic
- instagram_manage_insights
- pages_show_list
- pages_read_engagement
```

### 2.2 Adicionar Usuários de Teste
1. Vá em "Funções" → "Funções"
2. Adicione sua conta Instagram como "Testador do Instagram"
3. Aceite o convite no Instagram

---

## 🚀 PASSO 3: TESTAR CONEXÃO

### 3.1 Verificar Status do App
- App deve estar em modo "Desenvolvimento"
- Todas as URLs devem estar configuradas
- Permissões devem estar ativas

### 3.2 Testar Fluxo OAuth
1. Acesse: http://localhost:3001/dashboard
2. Clique no avatar → Configurações
3. Clique em "Conectar Instagram"
4. Autorize as permissões solicitadas

---

## 🔍 TROUBLESHOOTING

### Erro: "Invalid platform app"
**Causa:** App não configurado corretamente
**Solução:**
1. Verificar se o App ID está correto
2. Confirmar URLs de callback autorizadas
3. Verificar se Instagram Basic Display está ativo

### Erro: "Redirect URI mismatch"
**Causa:** URL de callback não autorizada
**Solução:**
1. Adicionar URL exata no Facebook Developers
2. Verificar protocolo (http vs https)
3. Confirmar porta (3001)

### Erro: "Access token invalid"
**Causa:** Token expirado ou inválido
**Solução:**
1. Renovar token automaticamente
2. Verificar permissões do usuário
3. Re-autorizar se necessário

---

## 📊 DADOS QUE SERÃO EXTRAÍDOS

### Posts Reais do Instagram:
```json
{
  "id": "17841234567890123",
  "media_type": "IMAGE",
  "media_url": "https://scontent.cdninstagram.com/...",
  "permalink": "https://www.instagram.com/p/ABC123/",
  "caption": "Texto real do post",
  "timestamp": "2024-01-15T10:30:00+0000",
  "like_count": 245,
  "comments_count": 32
}
```

### Métricas Reais:
```json
{
  "impressions": 3250,
  "reach": 2890,
  "engagement": 362,
  "saves": 67,
  "profile_visits": 45,
  "website_clicks": 12
}
```

---

## ✅ CHECKLIST FINAL

- [ ] App configurado no Facebook Developers
- [ ] Instagram Basic Display ativo
- [ ] URLs de callback autorizadas
- [ ] Permissões configuradas
- [ ] Usuário de teste adicionado
- [ ] Conta Instagram Business conectada
- [ ] Primeira sincronização realizada
- [ ] Dados reais sendo exibidos

---

## 🆘 SUPORTE

Se encontrar problemas:
1. Verificar logs do console do navegador
2. Conferir configurações no Facebook Developers
3. Testar com conta Instagram Business válida
4. Verificar se a página Facebook está conectada ao Instagram
