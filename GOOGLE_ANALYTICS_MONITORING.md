# 📊 Google Analytics - Monitoramento e Garantia de Cobertura

## 🎯 Objetivo

Garantir que **todas as páginas** do site criadores.digital tenham Google Analytics funcionando corretamente, incluindo novas páginas que forem criadas.

## ✅ Status Atual

**🎉 100% de Cobertura Confirmada!**

- ✅ **43 páginas** verificadas
- ✅ **100% com Google Analytics** funcionando
- ✅ **Tracking automático** em todas as páginas
- ✅ **Sistema de verificação** implementado

## 🔧 Como Funciona

### 1. **Herança Automática do Layout**
A maioria das páginas herda automaticamente o Google Analytics do `app/layout.tsx`:

```tsx
// app/layout.tsx
{process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
  <>
    <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
    <GoogleAnalyticsPageTracker />
  </>
)}
```

### 2. **Tracking Específico para Blog**
Posts do blog têm tracking adicional com eventos específicos:

```tsx
// app/blog/[slug]/page.tsx
import { trackBlogView } from '@/lib/gtag';

// No useEffect após carregar o post
trackBlogView(postData.title, slug);
```

### 3. **Verificação em Tempo Real (Desenvolvimento)**
O componente `GoogleAnalyticsVerifier` monitora automaticamente em desenvolvimento:

- Aparece um alerta vermelho se GA não estiver funcionando
- Logs detalhados no console
- Verificação automática a cada mudança de página

## 🛠️ Ferramentas de Verificação

### 1. **Verificação de Cobertura**
```bash
npm run verify-ga
```
- Analisa todos os arquivos `page.tsx`
- Verifica se têm Google Analytics configurado
- Relatório completo de cobertura

### 2. **Teste Automatizado Completo**
```bash
npm run test-ga
```
- Abre navegador automaticamente
- Testa todas as páginas em tempo real
- Verifica se gtag, dataLayer e GTM estão funcionando

### 3. **Verificação Manual no Navegador**
```javascript
// No console do navegador
console.log('gtag disponível:', typeof window.gtag === 'function');
console.log('dataLayer existe:', Array.isArray(window.dataLayer));
console.log('dataLayer conteúdo:', window.dataLayer);
```

## 📋 Checklist para Novas Páginas

### ✅ Páginas Normais (Recomendado)
**Não precisa fazer nada!** O GA é herdado automaticamente do layout.

### ✅ Páginas com Tracking Específico
Se precisar de eventos específicos:

```tsx
import { trackBlogView, event } from '@/lib/gtag';

// Para posts de blog
trackBlogView(title, slug);

// Para eventos customizados
event({
  action: 'custom_action',
  category: 'Custom',
  label: 'Custom Label'
});
```

### ✅ Layouts Customizados
Se criar um layout customizado, inclua:

```tsx
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleAnalyticsPageTracker from "@/components/GoogleAnalyticsPageTracker";

// No JSX
{process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
  <>
    <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID} />
    <GoogleAnalyticsPageTracker />
  </>
)}
```

## 🚨 Sistema de Alertas

### Em Desenvolvimento
- **Alerta visual** aparece se GA não estiver funcionando
- **Logs no console** com detalhes do problema
- **Verificação automática** a cada navegação

### Em CI/CD (Futuro)
Adicione ao pipeline:
```yaml
- name: Verificar Google Analytics
  run: npm run verify-ga
```

## 📊 Monitoramento Contínuo

### 1. **Google Analytics Real-Time**
- Acesse: [Google Analytics Real-Time](https://analytics.google.com/analytics/web/#/p123456789/realtime/overview)
- Verifique se páginas aparecem em tempo real
- Monitore eventos específicos

### 2. **Google Tag Manager**
- Acesse: [Google Tag Manager](https://tagmanager.google.com/)
- Verifique se tags estão disparando
- Monitore dataLayer events

### 3. **Verificação Semanal**
Execute semanalmente:
```bash
npm run verify-ga && npm run test-ga
```

## 🔍 Troubleshooting

### Problema: GA não aparece em nova página
**Solução:**
1. Verifique se a página herda do layout principal
2. Execute `npm run verify-ga` para diagnóstico
3. Verifique se `.env.local` tem as variáveis corretas

### Problema: Eventos específicos não funcionam
**Solução:**
1. Importe as funções do `@/lib/gtag`
2. Verifique se está chamando no momento correto (useEffect)
3. Teste no console: `window.gtag('event', 'test')`

### Problema: CSP bloqueando scripts
**Solução:**
1. Verifique `middleware.ts` - deve incluir domínios do Google
2. Verifique `next.config.ts` - CSP deve estar sincronizado

## 📈 Métricas de Sucesso

- **100% de cobertura** em todas as páginas
- **0 páginas sem tracking** detectadas
- **Eventos específicos** funcionando (blog, campanhas, etc.)
- **Real-time tracking** ativo no Google Analytics

## 🎯 Próximos Passos

1. **Monitoramento automático** em produção
2. **Alertas por email** se GA parar de funcionar
3. **Dashboard de métricas** de cobertura
4. **Integração com CI/CD** para verificação automática

---

**🎉 Com este sistema, garantimos que o Google Analytics funcione sempre em todas as páginas, incluindo novas páginas que forem criadas!**
