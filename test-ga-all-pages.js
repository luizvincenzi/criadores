const puppeteer = require('puppeteer');

async function testGoogleAnalyticsOnAllPages() {
  console.log('🔍 [GA TEST] Iniciando teste completo do Google Analytics...\n');
  
  const browser = await puppeteer.launch({ 
    headless: false, // Para ver o que está acontecendo
    defaultViewport: null,
    args: ['--start-maximized']
  });
  
  const page = await browser.newPage();
  
  // Interceptar requests para verificar GA
  const gaRequests = [];
  const gtmRequests = [];
  
  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('google-analytics.com') || url.includes('googletagmanager.com/gtag')) {
      gaRequests.push(url);
    }
    if (url.includes('googletagmanager.com/gtm.js')) {
      gtmRequests.push(url);
    }
  });
  
  // Lista de páginas para testar
  const pagesToTest = [
    { name: 'Homepage', url: 'http://localhost:3000/' },
    { name: 'Blog Index', url: 'http://localhost:3000/blog' },
    { name: 'CriaVoz Homepage', url: 'http://localhost:3000/criavoz-homepage' },
  ];
  
  // Buscar posts do blog dinamicamente
  try {
    const response = await fetch('http://localhost:3000/api/blog/posts');
    const data = await response.json();
    
    if (data.posts && data.posts.length > 0) {
      data.posts.forEach(post => {
        pagesToTest.push({
          name: `Blog Post: ${post.title}`,
          url: `http://localhost:3000/blog/${post.slug}`
        });
      });
    }
  } catch (error) {
    console.warn('⚠️ [GA TEST] Não foi possível carregar posts do blog:', error.message);
  }
  
  console.log(`📋 [GA TEST] Testando ${pagesToTest.length} páginas...\n`);
  
  const results = [];
  
  for (const pageTest of pagesToTest) {
    console.log(`🔍 [GA TEST] Testando: ${pageTest.name}`);
    console.log(`🌐 [GA TEST] URL: ${pageTest.url}`);
    
    try {
      // Reset dos arrays para cada página
      gaRequests.length = 0;
      gtmRequests.length = 0;
      
      // Navegar para a página
      await page.goto(pageTest.url, { 
        waitUntil: 'networkidle0',
        timeout: 30000 
      });
      
      // Aguardar um pouco para scripts carregarem
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verificar se gtag está disponível
      const gtagAvailable = await page.evaluate(() => {
        return typeof window.gtag === 'function';
      });
      
      // Verificar se dataLayer existe
      const dataLayerExists = await page.evaluate(() => {
        return Array.isArray(window.dataLayer);
      });
      
      // Verificar se GA_MEASUREMENT_ID está configurado
      const gaConfigured = await page.evaluate(() => {
        return window.dataLayer && window.dataLayer.some(item => 
          item && typeof item === 'object' && 
          (item.event === 'config' || item[0] === 'config')
        );
      });
      
      // Verificar elementos GTM no DOM
      const gtmScriptExists = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script'));
        return scripts.some(script => 
          script.src && script.src.includes('googletagmanager.com/gtm.js')
        );
      });
      
      const result = {
        name: pageTest.name,
        url: pageTest.url,
        gtagAvailable,
        dataLayerExists,
        gaConfigured,
        gtmScriptExists,
        gaRequestsCount: gaRequests.length,
        gtmRequestsCount: gtmRequests.length,
        status: 'success'
      };
      
      results.push(result);
      
      // Log do resultado
      console.log(`✅ gtag disponível: ${gtagAvailable ? '✅' : '❌'}`);
      console.log(`✅ dataLayer existe: ${dataLayerExists ? '✅' : '❌'}`);
      console.log(`✅ GA configurado: ${gaConfigured ? '✅' : '❌'}`);
      console.log(`✅ GTM script: ${gtmScriptExists ? '✅' : '❌'}`);
      console.log(`📊 Requests GA: ${gaRequests.length}`);
      console.log(`📊 Requests GTM: ${gtmRequests.length}`);
      console.log('');
      
    } catch (error) {
      console.error(`❌ [GA TEST] Erro ao testar ${pageTest.name}:`, error.message);
      results.push({
        name: pageTest.name,
        url: pageTest.url,
        status: 'error',
        error: error.message
      });
    }
  }
  
  await browser.close();
  
  // Relatório final
  console.log('\n📊 [GA TEST] RELATÓRIO FINAL\n');
  console.log('='.repeat(60));
  
  const successfulPages = results.filter(r => r.status === 'success');
  const errorPages = results.filter(r => r.status === 'error');
  const fullyWorking = successfulPages.filter(r => 
    r.gtagAvailable && r.dataLayerExists && r.gaConfigured && r.gtmScriptExists
  );
  
  console.log(`📈 Total de páginas testadas: ${results.length}`);
  console.log(`✅ Páginas com sucesso: ${successfulPages.length}`);
  console.log(`❌ Páginas com erro: ${errorPages.length}`);
  console.log(`🎯 Páginas com GA completo: ${fullyWorking.length}`);
  console.log('');
  
  if (fullyWorking.length === successfulPages.length && errorPages.length === 0) {
    console.log('🎉 [GA TEST] SUCESSO! Todas as páginas têm Google Analytics funcionando!');
  } else {
    console.log('⚠️ [GA TEST] ATENÇÃO! Algumas páginas precisam de correção:');
    
    successfulPages.forEach(page => {
      if (!page.gtagAvailable || !page.dataLayerExists || !page.gaConfigured || !page.gtmScriptExists) {
        console.log(`\n❌ ${page.name}:`);
        if (!page.gtagAvailable) console.log('  - gtag não disponível');
        if (!page.dataLayerExists) console.log('  - dataLayer não existe');
        if (!page.gaConfigured) console.log('  - GA não configurado');
        if (!page.gtmScriptExists) console.log('  - GTM script não encontrado');
      }
    });
    
    if (errorPages.length > 0) {
      console.log('\n💥 Páginas com erro:');
      errorPages.forEach(page => {
        console.log(`  - ${page.name}: ${page.error}`);
      });
    }
  }
  
  return results;
}

// Executar o teste
testGoogleAnalyticsOnAllPages()
  .then(results => {
    console.log('\n✅ [GA TEST] Teste concluído!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ [GA TEST] Erro geral:', error);
    process.exit(1);
  });
