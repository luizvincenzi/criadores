# 🧪 Guia de Teste Manual - Google Analytics e GTM

## ✅ Status Atual
- **Google Analytics**: ✅ Funcionando em todas as páginas
- **Google Tag Manager**: ✅ Funcionando em todas as páginas  
- **CSP**: ✅ Configurado corretamente
- **Variáveis de ambiente**: ✅ Configuradas

## 🔍 Como Testar Manualmente

### 1. Teste Básico no Navegador

1. **Abra a página de teste**: http://localhost:3000/test-analytics
2. **Abra DevTools** (F12)
3. **Vá para a aba Console**
4. **Execute os comandos**:

```javascript
// Verificar se gtag está disponível
console.log('gtag disponível:', typeof window.gtag === 'function');

// Verificar se dataLayer está disponível  
console.log('dataLayer disponível:', Array.isArray(window.dataLayer));

// Ver conteúdo do dataLayer
console.log('dataLayer content:', window.dataLayer);

// Testar evento do Google Analytics
if (typeof window.gtag === 'function') {
  window.gtag('event', 'test_manual', {
    event_category: 'manual_test',
    event_label: 'console_test',
    value: 1
  });
  console.log('✅ Evento GA enviado');
}

// Testar evento do GTM
if (Array.isArray(window.dataLayer)) {
  window.dataLayer.push({
    event: 'manual_test_event',
    test_category: 'manual',
    test_action: 'console_test'
  });
  console.log('✅ Evento GTM enviado');
}
```

### 2. Verificar Requisições de Rede

1. **Na aba Network** do DevTools
2. **Filtre por**: `google`
3. **Procure por requisições para**:
   - `googletagmanager.com/gtm.js`
   - `googletagmanager.com/gtag/js`
   - `google-analytics.com/collect`
   - `google-analytics.com/g/collect`

### 3. Teste dos Botões na Página

1. **Na página** http://localhost:3000/test-analytics
2. **Clique nos botões**:
   - "🧪 Testar Google Analytics"
   - "🧪 Testar GTM DataLayer"
3. **Verifique se aparecem alertas** confirmando o envio

### 4. Verificar Erros de CSP

1. **No Console**, procure por erros como:
   - "Refused to load the script"
   - "Content Security Policy"
2. **Se não houver erros** = ✅ CSP funcionando

## 📊 Teste no Google Analytics Real-Time

### Para verificar se os dados estão chegando:

1. **Acesse**: [Google Analytics 4](https://analytics.google.com/)
2. **Vá para**: Relatórios → Tempo real
3. **Navegue pelo site** (http://localhost:3000)
4. **Verifique se aparecem**:
   - Usuários ativos
   - Visualizações de página
   - Eventos personalizados

## 🏷️ Teste no Google Tag Manager

### Para verificar se o GTM está funcionando:

1. **Acesse**: [Google Tag Manager](https://tagmanager.google.com/)
2. **Selecione o container**: GTM-KRV5FLV4
3. **Ative o modo Preview**
4. **Conecte com**: http://localhost:3000
5. **Verifique se**:
   - O GTM conecta com sucesso
   - Os eventos aparecem no painel
   - As tags são disparadas

## 🎯 Resultados Esperados

### ✅ Funcionando Corretamente:
- `window.gtag` é uma função
- `window.dataLayer` é um array com dados
- Requisições para Google domains aparecem na aba Network
- Nenhum erro de CSP no console
- Eventos são enviados quando testados
- Usuários aparecem no GA Real-Time

### ❌ Problemas Possíveis:
- `window.gtag` é undefined
- `window.dataLayer` é undefined ou vazio
- Erros de CSP no console
- Nenhuma requisição para Google domains
- Eventos não são enviados

## 🔧 Troubleshooting

### Se gtag não estiver disponível:
1. Verificar se `NEXT_PUBLIC_GA_MEASUREMENT_ID` está definida
2. Verificar se o componente GoogleAnalytics está sendo renderizado
3. Verificar se não há erros de CSP bloqueando o script

### Se dataLayer não estiver disponível:
1. Verificar se `NEXT_PUBLIC_GTM_ID` está definida  
2. Verificar se o componente GoogleTagManager está sendo renderizado
3. Verificar se o script inline do GTM está no HTML

### Se houver erros de CSP:
1. Verificar se o middleware.ts inclui os domínios do Google
2. Verificar se o next.config.ts está alinhado
3. Reiniciar o servidor de desenvolvimento

## 📋 Checklist Final

- [ ] gtag está disponível no console
- [ ] dataLayer está disponível no console  
- [ ] Botões de teste funcionam
- [ ] Requisições aparecem na aba Network
- [ ] Nenhum erro de CSP no console
- [ ] Usuários aparecem no GA Real-Time (opcional)
- [ ] GTM Preview conecta (opcional)

---

**🎉 Se todos os itens estiverem ✅, o Google Analytics e GTM estão funcionando perfeitamente!**
