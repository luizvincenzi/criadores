# Guia de Deploy para Produção - Google Analytics & Tag Manager

## 🚨 **PROBLEMA IDENTIFICADO**

As tags do Google Analytics e Google Tag Manager não estão aparecendo no site `criadores.app` porque as **variáveis de ambiente não estão configuradas no servidor de produção**.

## ✅ **SOLUÇÃO PASSO A PASSO**

### **1. Configurar Variáveis de Ambiente no Servidor**

#### **Para Vercel:**
1. Acesse [vercel.com](https://vercel.com)
2. Vá para o projeto `criadores`
3. Clique em **Settings** → **Environment Variables**
4. Adicione as seguintes variáveis:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-BNW6Q5PZLV
NEXT_PUBLIC_GTM_ID=GTM-KRV5FLV4
```

#### **Para Netlify:**
1. Acesse [netlify.com](https://netlify.com)
2. Vá para o projeto `criadores`
3. Clique em **Site settings** → **Environment variables**
4. Adicione as variáveis acima

#### **Para outros provedores:**
- Configure as mesmas variáveis no painel de controle do seu provedor
- Certifique-se de que começam com `NEXT_PUBLIC_` para serem acessíveis no cliente

### **2. Fazer Redeploy**

Após configurar as variáveis:
1. Faça um novo commit (pode ser vazio)
2. Push para o repositório
3. Aguarde o deploy automático
4. OU force um redeploy no painel do provedor

### **3. Verificar se Funcionou**

#### **Método 1: Inspeção Visual**
- Acesse `https://criadores.app`
- Se as variáveis estiverem configuradas corretamente, você **NÃO** verá o box vermelho de debug
- Se ainda houver problemas, o box aparecerá com informações específicas

#### **Método 2: DevTools**
```javascript
// No console do navegador em criadores.app
console.log('GA ID:', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID);
console.log('GTM ID:', process.env.NEXT_PUBLIC_GTM_ID);
console.log('gtag exists:', typeof window.gtag);
console.log('dataLayer:', window.dataLayer);
```

#### **Método 3: View Source**
- Clique com botão direito → "View Page Source"
- Procure por `G-BNW6Q5PZLV` e `GTM-KRV5FLV4`
- Deve aparecer nos scripts do Google Analytics e Tag Manager

#### **Método 4: Network Tab**
- Abra DevTools → Network
- Recarregue a página
- Procure por requests para:
  - `googletagmanager.com/gtm.js?id=GTM-KRV5FLV4`
  - `google-analytics.com/gtag/js?id=G-BNW6Q5PZLV`

### **4. Testar Google Tag Manager**

#### **GTM Preview Mode:**
1. Acesse [tagmanager.google.com](https://tagmanager.google.com)
2. Selecione container `GTM-KRV5FLV4`
3. Clique em **Preview**
4. Digite `https://criadores.app`
5. Deve conectar e mostrar as tags sendo disparadas

#### **Tag Assistant:**
1. Instale a extensão "Tag Assistant Legacy"
2. Acesse `https://criadores.app`
3. Clique na extensão
4. Deve detectar as tags do Google

### **5. Verificar Google Analytics**

#### **Real-Time Reports:**
1. Acesse [analytics.google.com](https://analytics.google.com)
2. Vá para **Reports** → **Realtime**
3. Navegue em `criadores.app`
4. Deve aparecer atividade em tempo real

#### **DebugView:**
1. No GA4, vá para **Configure** → **DebugView**
2. Navegue no site
3. Eventos devem aparecer em tempo real

## 🔧 **TROUBLESHOOTING**

### **Se ainda não funcionar:**

#### **1. Verificar Build Logs**
- Verifique se o build foi bem-sucedido
- Procure por erros relacionados às variáveis de ambiente

#### **2. Verificar CSP (Content Security Policy)**
- O CSP já está configurado para permitir Google Analytics e GTM
- Se houver problemas, verifique o console por erros de CSP

#### **3. Verificar Cache**
- Limpe o cache do navegador
- Teste em modo incógnito
- Use diferentes navegadores

#### **4. Verificar Domínio**
- Certifique-se de que está testando em `criadores.app`
- Não funciona em `localhost` ou outros domínios

### **Se o box de debug aparecer:**
- Leia as informações específicas mostradas
- Configure as variáveis que estão faltando
- Faça redeploy
- Aguarde alguns minutos para propagação

## 📋 **CHECKLIST FINAL**

- [ ] ✅ Variáveis de ambiente configuradas no servidor
- [ ] ✅ Redeploy realizado
- [ ] ✅ Box de debug não aparece em criadores.app
- [ ] ✅ Scripts GA/GTM visíveis no view source
- [ ] ✅ Requests para Google no Network tab
- [ ] ✅ GTM Preview Mode conecta
- [ ] ✅ Tag Assistant detecta tags
- [ ] ✅ Google Analytics Real-Time funciona
- [ ] ✅ DebugView mostra eventos

## 🚀 **APÓS RESOLVER**

1. **Remover componente de debug:**
   - Editar `app/layout.tsx`
   - Remover `<AnalyticsDebugInfo />`
   - Fazer commit e deploy

2. **Configurar tags adicionais no GTM:**
   - Facebook Pixel
   - LinkedIn Insight Tag
   - Outras ferramentas de marketing

3. **Monitorar dados:**
   - Aguardar 24-48h para dados completos
   - Configurar relatórios personalizados
   - Definir objetivos e conversões

## 📞 **SUPORTE**

Se ainda houver problemas após seguir este guia:
1. Verifique se todas as variáveis estão exatamente como mostrado
2. Confirme que o redeploy foi feito após configurar as variáveis
3. Teste em diferentes navegadores e dispositivos
4. Aguarde até 30 minutos para propagação completa

---

**Status Atual**: ❌ Variáveis não configuradas no servidor  
**Próximo Passo**: Configurar variáveis de ambiente e fazer redeploy  
**Tempo Estimado**: 10-15 minutos + tempo de deploy
