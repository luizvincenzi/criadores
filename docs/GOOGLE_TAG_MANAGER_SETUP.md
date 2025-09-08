# Google Tag Manager - Configuração e Implementação

## 📊 Visão Geral

O Google Tag Manager (GTM) foi implementado no projeto crIAdores seguindo as melhores práticas do Google e Next.js. O GTM permite gerenciar todas as tags de marketing e analytics de forma centralizada, sem necessidade de modificar o código.

## 🔧 Configuração

### 1. Container ID
- **Container ID**: `GTM-KRV5FLV4`
- **Tipo**: Web
- **Domínio**: `criadores.app`

### 2. Variáveis de Ambiente

```bash
# Google Tag Manager Container ID
NEXT_PUBLIC_GTM_ID=GTM-KRV5FLV4
```

### 3. Implementação Técnica

#### Estrutura de Arquivos
```
components/
  GoogleTagManager.tsx           # Script principal do GTM
  GoogleTagManagerNoScript.tsx   # Fallback para noscript
lib/
  gtag.ts                       # Utilitários GTM e GA
```

#### GoogleTagManager.tsx
- Carregado no `<head>` da página
- Usa `next/script` com estratégia `afterInteractive`
- Inicializa o dataLayer automaticamente

#### GoogleTagManagerNoScript.tsx
- Iframe de fallback para usuários sem JavaScript
- Posicionado imediatamente após `<body>`
- Invisível (height=0, width=0)

## 🏷️ Tags Configuradas

### Google Analytics 4
- **Tag Type**: Google Analytics: GA4 Configuration
- **Measurement ID**: G-BNW6Q5PZLV
- **Trigger**: All Pages

### Enhanced Ecommerce (Futuro)
- **Tag Type**: Google Analytics: GA4 Event
- **Event Name**: purchase, add_to_cart, etc.
- **Trigger**: Custom Events

## 📈 Eventos Disponíveis

### DataLayer Events
O GTM escuta os seguintes eventos no dataLayer:

```javascript
// Exemplo de evento personalizado
dataLayer.push({
  event: 'blog_view',
  post_title: 'Como usar micro influenciadores',
  post_category: 'Marketing',
  post_author: 'crIAdores'
});
```

### Eventos Implementados
- `page_view`: Visualização de página
- `blog_view`: Visualização de post do blog
- `campaign_view`: Visualização de campanha
- `creator_view`: Visualização de perfil de criador
- `newsletter_signup`: Inscrição na newsletter
- `whatsapp_click`: Clique em botão do WhatsApp
- `social_share`: Compartilhamento social
- `cta_click`: Clique em CTA

## 🛠 Funções Utilitárias

### gtmPush()
```typescript
import { gtmPush } from '@/lib/gtag';

// Enviar dados para o dataLayer
gtmPush({
  event: 'custom_event',
  category: 'User Interaction',
  action: 'Button Click',
  label: 'Header CTA'
});
```

### gtmEvent()
```typescript
import { gtmEvent } from '@/lib/gtag';

// Enviar evento simplificado
gtmEvent('newsletter_signup', {
  source: 'blog_post',
  newsletter_type: 'weekly'
});
```

## 🔍 Debugging e Verificação

### 1. GTM Preview Mode
1. Acesse [Google Tag Manager](https://tagmanager.google.com)
2. Selecione o container `GTM-KRV5FLV4`
3. Clique em "Preview"
4. Digite a URL: `https://criadores.app`
5. Navegue pelo site e veja as tags sendo disparadas

### 2. Browser DevTools
```javascript
// Verificar se GTM está carregado
console.log(window.dataLayer);

// Verificar eventos no dataLayer
window.dataLayer.forEach(event => console.log(event));

// Enviar evento de teste
dataLayer.push({
  event: 'test_event',
  test_parameter: 'test_value'
});
```

### 3. Google Tag Assistant
1. Instale a extensão "Tag Assistant Legacy"
2. Ative a extensão
3. Navegue pelo site
4. Veja as tags sendo detectadas e validadas

## 📊 Configurações Recomendadas

### Variables (Variáveis)
- **Page URL**: {{Page URL}}
- **Page Title**: {{Page Title}}
- **Click URL**: {{Click URL}}
- **Form ID**: {{Form ID}}

### Triggers (Acionadores)
- **All Pages**: Todas as páginas
- **Blog Pages**: URL contains "/blog/"
- **Campaign Pages**: URL contains "/campaign/"
- **Creator Pages**: URL contains "/creators/"

### Tags Sugeridas
1. **Google Analytics 4**: Tracking básico
2. **Facebook Pixel**: Remarketing
3. **LinkedIn Insight Tag**: B2B tracking
4. **Hotjar**: Heatmaps e recordings
5. **Google Ads Conversion**: Tracking de conversões

## 🚀 Próximos Passos

### 1. Configurar Tags Adicionais
- Facebook Pixel para remarketing
- LinkedIn Insight Tag para B2B
- Google Ads Conversion Tracking

### 2. Enhanced Ecommerce
- Configurar eventos de e-commerce
- Tracking de campanhas como produtos
- Funil de conversão completo

### 3. Custom Dimensions
- Tipo de usuário (business/creator)
- Fonte de tráfego
- Categoria de interesse

### 4. Audiences
- Visitantes do blog
- Usuários interessados em campanhas
- Criadores ativos

## 📋 Checklist de Implementação

- [x] ✅ Container GTM criado
- [x] ✅ Scripts implementados no Next.js
- [x] ✅ DataLayer inicializado
- [x] ✅ Google Analytics 4 conectado
- [x] ✅ Eventos personalizados configurados
- [x] ✅ CSP atualizado para GTM
- [x] ✅ Variáveis de ambiente configuradas
- [x] ✅ Documentação criada
- [ ] 🔄 Tags adicionais (Facebook, LinkedIn)
- [ ] 🔄 Enhanced Ecommerce
- [ ] 🔄 Custom Dimensions
- [ ] 🔄 Audiences para remarketing

## 📞 Suporte

- **GTM Help Center**: [support.google.com/tagmanager](https://support.google.com/tagmanager)
- **GTM Developer Guide**: [developers.google.com/tag-manager](https://developers.google.com/tag-manager)
- **GTM Community**: [tagmanager.google.com/community](https://tagmanager.google.com/community)

---

**Implementado em**: Janeiro 2025  
**Container ID**: GTM-KRV5FLV4  
**Status**: ✅ Ativo e funcionando
