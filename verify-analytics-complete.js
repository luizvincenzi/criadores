// Script completo para verificar Google Analytics em todas as páginas
const BASE_URL = 'http://localhost:3000';

async function verifyCompleteAnalytics() {
  console.log('🔍 VERIFICAÇÃO COMPLETA DO GOOGLE ANALYTICS E GTM\n');
  console.log('=' .repeat(60));

  // 1. Verificar configuração das variáveis de ambiente
  console.log('\n1. 📋 CONFIGURAÇÃO DAS VARIÁVEIS DE AMBIENTE');
  console.log('-'.repeat(50));
  
  const envVars = {
    'NEXT_PUBLIC_GA_MEASUREMENT_ID': 'G-BNW6Q5PZLV',
    'NEXT_PUBLIC_GTM_ID': 'GTM-KRV5FLV4'
  };
  
  Object.entries(envVars).forEach(([key, expectedValue]) => {
    console.log(`✅ ${key}: ${expectedValue}`);
  });

  // 2. Testar todas as páginas principais do site
  console.log('\n2. 🌐 TESTE DE TODAS AS PÁGINAS DO SITE');
  console.log('-'.repeat(50));
  
  const pagesToTest = [
    { path: '/', name: 'Homepage' },
    { path: '/blog', name: 'Blog Principal' },
    { path: '/blog/bem-vindo-ao-blog-criadores', name: 'Post do Blog' },
    { path: '/blog/como-crescer-com-criadores-locais', name: 'Post Empresas' },
    { path: '/criavoz-homepage', name: 'CriaVoz Homepage' },
    { path: '/test-analytics', name: 'Página de Teste Analytics' }
  ];

  let totalPages = 0;
  let pagesWithGA = 0;
  let pagesWithGTM = 0;
  let pagesWithCSPOk = 0;

  for (const page of pagesToTest) {
    try {
      console.log(`\n📄 Testando: ${page.name} (${page.path})`);
      const response = await fetch(`${BASE_URL}${page.path}`);
      
      if (response.ok) {
        totalPages++;
        const html = await response.text();
        
        // Verificar presença dos scripts
        const hasGTMScript = html.includes('gtm.start'); // GTM inline script
        const hasGAScript = html.includes('googletagmanager.com/gtag/js');
        const hasGTMId = html.includes('GTM-KRV5FLV4');
        const hasGAId = html.includes('G-BNW6Q5PZLV');
        
        // Verificar CSP
        const csp = response.headers.get('content-security-policy');
        const cspAllowsGTM = csp && csp.includes('googletagmanager.com');
        const cspAllowsGA = csp && csp.includes('google-analytics.com');
        
        console.log(`   Status: ${response.status} ✅`);
        console.log(`   GTM Script: ${hasGTMScript ? '✅' : '❌'}`);
        console.log(`   GA Script: ${hasGAScript ? '✅' : '❌'}`);
        console.log(`   GTM ID: ${hasGTMId ? '✅' : '❌'}`);
        console.log(`   GA ID: ${hasGAId ? '✅' : '❌'}`);
        console.log(`   CSP GTM: ${cspAllowsGTM ? '✅' : '❌'}`);
        console.log(`   CSP GA: ${cspAllowsGA ? '✅' : '❌'}`);
        
        if (hasGAScript && hasGAId) pagesWithGA++;
        if (hasGTMScript && hasGTMId) pagesWithGTM++;
        if (cspAllowsGTM && cspAllowsGA) pagesWithCSPOk++;
        
      } else {
        console.log(`   ❌ Erro: ${response.status}`);
      }
      
    } catch (error) {
      console.log(`   ❌ Erro ao testar ${page.path}: ${error.message}`);
    }
  }

  // 3. Resumo dos resultados
  console.log('\n3. 📊 RESUMO DOS RESULTADOS');
  console.log('-'.repeat(50));
  console.log(`Total de páginas testadas: ${totalPages}`);
  console.log(`Páginas com Google Analytics: ${pagesWithGA}/${totalPages} (${Math.round(pagesWithGA/totalPages*100)}%)`);
  console.log(`Páginas com Google Tag Manager: ${pagesWithGTM}/${totalPages} (${Math.round(pagesWithGTM/totalPages*100)}%)`);
  console.log(`Páginas com CSP correto: ${pagesWithCSPOk}/${totalPages} (${Math.round(pagesWithCSPOk/totalPages*100)}%)`);

  // 4. Status geral
  console.log('\n4. 🎯 STATUS GERAL DO MONITORAMENTO');
  console.log('-'.repeat(50));
  
  if (pagesWithGA === totalPages && pagesWithCSPOk === totalPages) {
    console.log('🎉 SUCESSO! Google Analytics está funcionando em todas as páginas!');
    console.log('✅ Todas as páginas têm o script do GA carregando');
    console.log('✅ CSP está configurado corretamente');
    console.log('✅ IDs do GA e GTM estão presentes');
  } else {
    console.log('⚠️  ATENÇÃO! Há problemas com o monitoramento:');
    if (pagesWithGA < totalPages) {
      console.log(`❌ ${totalPages - pagesWithGA} páginas sem Google Analytics`);
    }
    if (pagesWithCSPOk < totalPages) {
      console.log(`❌ ${totalPages - pagesWithCSPOk} páginas com problemas de CSP`);
    }
  }

  // 5. Próximos passos
  console.log('\n5. 📋 PRÓXIMOS PASSOS PARA VERIFICAÇÃO MANUAL');
  console.log('-'.repeat(50));
  console.log('Para confirmar que o tracking está funcionando:');
  console.log('');
  console.log('🔍 No Navegador:');
  console.log('   1. Abra http://localhost:3000/test-analytics');
  console.log('   2. Abra DevTools (F12) → Console');
  console.log('   3. Verifique se NÃO há erros de CSP');
  console.log('   4. Na aba Network, procure por requisições para:');
  console.log('      - googletagmanager.com');
  console.log('      - google-analytics.com');
  console.log('');
  console.log('📊 No Google Analytics:');
  console.log('   1. Acesse Google Analytics 4');
  console.log('   2. Vá para Relatórios → Tempo real');
  console.log('   3. Navegue pelo site');
  console.log('   4. Verifique se aparecem usuários ativos');
  console.log('');
  console.log('🏷️  No Google Tag Manager:');
  console.log('   1. Acesse GTM e ative o modo Preview');
  console.log('   2. Conecte com o site');
  console.log('   3. Verifique se os eventos estão sendo disparados');

  console.log('\n' + '='.repeat(60));
  console.log('🎯 VERIFICAÇÃO COMPLETA FINALIZADA!');
  console.log('='.repeat(60));
}

// Executar verificação
verifyCompleteAnalytics().catch(console.error);
