# Google Analytics 4 - Configuração e Implementação

## 📊 Visão Geral

O Google Analytics 4 (GA4) foi implementado no projeto crIAdores seguindo as melhores práticas para Next.js, com tracking automático de páginas e eventos personalizados para análise detalhada do comportamento dos usuários.

## 🔧 Configuração

### 1. Variáveis de Ambiente

Adicione a seguinte variável no arquivo `.env.local`:

```bash
# Google Analytics 4 Measurement ID
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-BNW6Q5PZLV
```

### 2. Componentes Implementados

#### GoogleAnalytics.tsx
- Carrega o script do Google Analytics de forma otimizada
- Usa `next/script` com estratégia `afterInteractive`
- Configuração automática do Measurement ID

#### GoogleAnalyticsPageTracker.tsx
- Hook personalizado para tracking automático de mudanças de página
- Integrado com Next.js Router para SPA navigation

## 📈 Eventos Trackados

### Eventos Automáticos
- **Page Views**: Todas as navegações entre páginas
- **Session Start**: Início de sessão do usuário
- **First Visit**: Primeira visita do usuário

### Eventos Personalizados

#### Blog
- `view_blog_post`: Visualização de post do blog
- `share`: Compartilhamento social (Twitter, LinkedIn, WhatsApp)
- `newsletter_signup`: Inscrição na newsletter
- `click_cta`: Cliques em CTAs

#### Campanhas
- `view_campaign`: Visualização de página de campanha
- `whatsapp_click`: Cliques em botões do WhatsApp

#### Criadores
- `view_creator`: Visualização de perfil de criador
- `whatsapp_click`: Contato via WhatsApp com criador

#### Formulários
- `form_submit_success`: Envio bem-sucedido de formulário
- `form_submit_error`: Erro no envio de formulário

## 🛠 Implementação Técnica

### Estrutura de Arquivos

```
lib/
  gtag.ts                    # Utilitários de tracking
hooks/
  useGoogleAnalytics.ts      # Hook para page tracking
components/
  GoogleAnalytics.tsx        # Componente principal do GA
  GoogleAnalyticsPageTracker.tsx  # Tracker de páginas
```

### Exemplo de Uso

```typescript
import { trackBlogView, trackCTAClick } from '@/lib/gtag';

// Track blog view
trackBlogView(post.title, post.slug);

// Track CTA click
trackCTAClick('consultation', 'blog_post');
```

## 📊 Métricas Importantes

### Páginas Principais
- **Blog Posts**: Tempo de leitura, compartilhamentos, CTAs
- **Campanhas**: Visualizações, cliques no WhatsApp
- **Criadores**: Visualizações de perfil, contatos

### Conversões
- **Newsletter**: Taxa de inscrição por página
- **WhatsApp**: Cliques por contexto (campanha, criador, blog)
- **CTAs**: Performance por tipo e localização

### Engajamento
- **Social Sharing**: Plataforma mais usada
- **Tempo na Página**: Conteúdo mais engajador
- **Bounce Rate**: Páginas com maior retenção

## 🔍 Debugging

### Verificar Implementação
1. Abra o DevTools (F12)
2. Vá para a aba Network
3. Procure por requests para `google-analytics.com`
4. Verifique se o Measurement ID está correto

### Google Analytics DebugView
1. Instale a extensão "Google Analytics Debugger"
2. Ative a extensão
3. Navegue pelo site
4. Vá para GA4 > Configure > DebugView
5. Veja os eventos em tempo real

### Verificar Eventos Personalizados
```javascript
// No console do navegador
window.gtag('event', 'test_event', {
  event_category: 'Test',
  event_label: 'Manual Test'
});
```

## 📋 Checklist de Implementação

- [x] ✅ Google Analytics 4 configurado
- [x] ✅ Tracking automático de páginas
- [x] ✅ Eventos personalizados implementados
- [x] ✅ Blog tracking (views, shares, CTAs)
- [x] ✅ Campaign tracking (views, WhatsApp)
- [x] ✅ Creator tracking (views, contacts)
- [x] ✅ Newsletter signup tracking
- [x] ✅ Form submission tracking
- [x] ✅ Social sharing tracking
- [x] ✅ WhatsApp click tracking
- [x] ✅ Variáveis de ambiente configuradas
- [x] ✅ Documentação criada

## 🚀 Próximos Passos

### Análises Recomendadas
1. **Funil de Conversão**: Blog → Newsletter → WhatsApp
2. **Conteúdo Popular**: Posts mais lidos e compartilhados
3. **Campanhas Efetivas**: Maior engajamento e conversões
4. **Criadores Populares**: Perfis mais visualizados

### Otimizações Futuras
1. **Enhanced Ecommerce**: Para tracking de campanhas como produtos
2. **Custom Dimensions**: Segmentação por tipo de usuário
3. **Goals**: Definir objetivos específicos de conversão
4. **Audiences**: Criar audiências para remarketing

## 📞 Suporte

Para dúvidas sobre implementação ou análise dos dados:
- Documentação oficial: [GA4 Developer Guide](https://developers.google.com/analytics/devguides/collection/ga4)
- Google Analytics Help: [GA4 Help Center](https://support.google.com/analytics/answer/10089681)

---

**Implementado em**: Janeiro 2025  
**Measurement ID**: G-BNW6Q5PZLV  
**Status**: ✅ Ativo e funcionando
