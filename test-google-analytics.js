// Script para testar se o Google Analytics está funcionando corretamente
const BASE_URL = 'http://localhost:3000';

async function testGoogleAnalytics() {
  console.log('🧪 Testando Google Analytics e Google Tag Manager...\n');

  try {
    // 1. Verificar se as variáveis de ambiente estão configuradas
    console.log('1. 🔍 Verificando configuração...');
    
    const envVars = {
      'NEXT_PUBLIC_GA_MEASUREMENT_ID': process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      'NEXT_PUBLIC_GTM_ID': process.env.NEXT_PUBLIC_GTM_ID
    };
    
    console.log('📋 Variáveis de ambiente:');
    Object.entries(envVars).forEach(([key, value]) => {
      if (value) {
        console.log(`  ✅ ${key}: ${value}`);
      } else {
        console.log(`  ❌ ${key}: NÃO CONFIGURADA`);
      }
    });

    // 2. Testar carregamento de páginas principais
    console.log('\n2. 🔍 Testando carregamento de páginas...');
    
    const pagesToTest = [
      '/',
      '/blog',
      '/blog/bem-vindo-ao-blog-criadores',
      '/criavoz-homepage'
    ];

    for (const page of pagesToTest) {
      try {
        console.log(`   Testando: ${page}`);
        const response = await fetch(`${BASE_URL}${page}`);
        
        if (response.ok) {
          const html = await response.text();
          
          // Verificar se contém scripts do Google Analytics
          const hasGTM = html.includes('googletagmanager.com/gtm.js');
          const hasGA = html.includes('googletagmanager.com/gtag/js');
          const hasGTMId = html.includes('GTM-KRV5FLV4');
          const hasGAId = html.includes('G-BNW6Q5PZLV');
          
          console.log(`     Status: ${response.status}`);
          console.log(`     GTM Script: ${hasGTM ? '✅' : '❌'}`);
          console.log(`     GA Script: ${hasGA ? '✅' : '❌'}`);
          console.log(`     GTM ID: ${hasGTMId ? '✅' : '❌'}`);
          console.log(`     GA ID: ${hasGAId ? '✅' : '❌'}`);
          
          // Verificar CSP headers
          const csp = response.headers.get('content-security-policy');
          if (csp) {
            const allowsGTM = csp.includes('googletagmanager.com');
            const allowsGA = csp.includes('google-analytics.com');
            console.log(`     CSP permite GTM: ${allowsGTM ? '✅' : '❌'}`);
            console.log(`     CSP permite GA: ${allowsGA ? '✅' : '❌'}`);
          } else {
            console.log(`     CSP: ❌ Não encontrado`);
          }
          
        } else {
          console.log(`     ❌ Erro: ${response.status}`);
        }
        
        console.log('');
      } catch (error) {
        console.log(`     ❌ Erro ao testar ${page}: ${error.message}`);
      }
    }

    // 3. Verificar se há erros de CSP no console
    console.log('3. 📋 Instruções para verificar no navegador:');
    console.log('   1. Abra o DevTools (F12)');
    console.log('   2. Vá para a aba Console');
    console.log('   3. Procure por erros relacionados a "Content Security Policy"');
    console.log('   4. Verifique se há erros do tipo "Refused to load the script"');
    console.log('   5. Na aba Network, verifique se os scripts do Google estão carregando:');
    console.log('      - https://www.googletagmanager.com/gtm.js?id=GTM-KRV5FLV4');
    console.log('      - https://www.googletagmanager.com/gtag/js?id=G-BNW6Q5PZLV');

    console.log('\n4. 🔍 Verificação de tracking:');
    console.log('   Para verificar se o tracking está funcionando:');
    console.log('   1. Abra o Google Analytics Real-Time');
    console.log('   2. Navegue pelo site');
    console.log('   3. Verifique se aparecem usuários ativos');
    console.log('   4. No DevTools, na aba Network, procure por requisições para:');
    console.log('      - google-analytics.com');
    console.log('      - googletagmanager.com');

    console.log('\n🎉 Teste de configuração concluído!');
    console.log('💡 Se ainda houver erros de CSP, verifique o console do navegador.');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  }
}

// Executar teste
testGoogleAnalytics();
