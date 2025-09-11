#!/usr/bin/env node

/**
 * Script para verificar se todas as páginas têm Google Analytics configurado
 * Pode ser executado em CI/CD para garantir que novas páginas sempre tenham GA
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 [GA COVERAGE] Verificando cobertura do Google Analytics...\n');

// Função para encontrar todos os arquivos page.tsx
function findPageFiles(dir, pageFiles = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // Pular node_modules e .next
      if (!file.startsWith('.') && file !== 'node_modules') {
        findPageFiles(filePath, pageFiles);
      }
    } else if (file === 'page.tsx' || file === 'page.ts') {
      pageFiles.push(filePath);
    }
  }
  
  return pageFiles;
}

// Função para verificar se um arquivo tem Google Analytics
function hasGoogleAnalytics(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  
  // Verificar se é uma página que herda do layout (a maioria das páginas)
  const inheritsFromLayout = !content.includes('export default function RootLayout');
  
  // Se herda do layout, o GA vem automaticamente
  if (inheritsFromLayout) {
    return {
      hasGA: true,
      method: 'layout_inheritance',
      details: 'Herda Google Analytics do layout principal'
    };
  }
  
  // Verificar se tem importações específicas do GA
  const hasGAImport = content.includes('GoogleAnalytics') || 
                     content.includes('useGoogleAnalytics') ||
                     content.includes('trackBlogView') ||
                     content.includes('gtag');
  
  if (hasGAImport) {
    return {
      hasGA: true,
      method: 'direct_import',
      details: 'Importa componentes do Google Analytics diretamente'
    };
  }
  
  // Verificar se é um layout que configura GA
  const isLayoutWithGA = content.includes('GoogleAnalytics') && 
                         content.includes('GoogleTagManager');
  
  if (isLayoutWithGA) {
    return {
      hasGA: true,
      method: 'layout_configuration',
      details: 'Layout que configura Google Analytics'
    };
  }
  
  return {
    hasGA: false,
    method: 'none',
    details: 'Nenhuma configuração de Google Analytics encontrada'
  };
}

// Função para verificar se o layout principal tem GA configurado
function verifyMainLayout() {
  const layoutPath = path.join(process.cwd(), 'app', 'layout.tsx');
  
  if (!fs.existsSync(layoutPath)) {
    return {
      configured: false,
      error: 'Layout principal não encontrado'
    };
  }
  
  const content = fs.readFileSync(layoutPath, 'utf8');
  
  const hasGAComponent = content.includes('GoogleAnalytics');
  const hasGTMComponent = content.includes('GoogleTagManager');
  const hasPageTracker = content.includes('GoogleAnalyticsPageTracker');
  const hasEnvCheck = content.includes('NEXT_PUBLIC_GA_MEASUREMENT_ID');
  
  return {
    configured: hasGAComponent && hasGTMComponent && hasPageTracker && hasEnvCheck,
    details: {
      googleAnalytics: hasGAComponent,
      googleTagManager: hasGTMComponent,
      pageTracker: hasPageTracker,
      environmentCheck: hasEnvCheck
    }
  };
}

// Verificar layout principal
console.log('📋 [GA COVERAGE] Verificando layout principal...');
const layoutCheck = verifyMainLayout();

if (!layoutCheck.configured) {
  console.error('❌ [GA COVERAGE] Layout principal não tem Google Analytics configurado!');
  console.error('   Detalhes:', layoutCheck.details || layoutCheck.error);
  process.exit(1);
} else {
  console.log('✅ [GA COVERAGE] Layout principal configurado corretamente');
  console.log('   - Google Analytics:', layoutCheck.details.googleAnalytics ? '✅' : '❌');
  console.log('   - Google Tag Manager:', layoutCheck.details.googleTagManager ? '✅' : '❌');
  console.log('   - Page Tracker:', layoutCheck.details.pageTracker ? '✅' : '❌');
  console.log('   - Environment Check:', layoutCheck.details.environmentCheck ? '✅' : '❌');
}

console.log('\n📋 [GA COVERAGE] Verificando páginas individuais...\n');

// Encontrar todas as páginas
const appDir = path.join(process.cwd(), 'app');
const pageFiles = findPageFiles(appDir);

console.log(`📊 [GA COVERAGE] Encontradas ${pageFiles.length} páginas para verificar\n`);

const results = [];
let pagesWithGA = 0;
let pagesWithoutGA = 0;

for (const pageFile of pageFiles) {
  const relativePath = path.relative(process.cwd(), pageFile);
  const gaCheck = hasGoogleAnalytics(pageFile);
  
  results.push({
    path: relativePath,
    ...gaCheck
  });
  
  if (gaCheck.hasGA) {
    pagesWithGA++;
    console.log(`✅ ${relativePath}`);
    console.log(`   Método: ${gaCheck.method}`);
    console.log(`   Detalhes: ${gaCheck.details}\n`);
  } else {
    pagesWithoutGA++;
    console.log(`❌ ${relativePath}`);
    console.log(`   Problema: ${gaCheck.details}\n`);
  }
}

// Relatório final
console.log('📊 [GA COVERAGE] RELATÓRIO FINAL');
console.log('='.repeat(50));
console.log(`📈 Total de páginas: ${pageFiles.length}`);
console.log(`✅ Páginas com GA: ${pagesWithGA}`);
console.log(`❌ Páginas sem GA: ${pagesWithoutGA}`);
console.log(`📊 Cobertura: ${Math.round((pagesWithGA / pageFiles.length) * 100)}%`);

if (pagesWithoutGA > 0) {
  console.log('\n⚠️ [GA COVERAGE] ATENÇÃO! Páginas sem Google Analytics:');
  results.filter(r => !r.hasGA).forEach(page => {
    console.log(`   - ${page.path}: ${page.details}`);
  });
  
  console.log('\n💡 [GA COVERAGE] SOLUÇÕES:');
  console.log('   1. A maioria das páginas herda GA automaticamente do layout');
  console.log('   2. Para páginas especiais, importe GoogleAnalytics ou useGoogleAnalytics');
  console.log('   3. Para tracking específico, use trackBlogView() ou outras funções do gtag.ts');
  
  // Não falhar se for apenas o layout principal (que é esperado não ter GA)
  const onlyLayoutMissing = results.filter(r => !r.hasGA).every(r => 
    r.path.includes('layout.tsx') && !r.path.includes('app/layout.tsx')
  );
  
  if (!onlyLayoutMissing) {
    console.log('\n❌ [GA COVERAGE] FALHA! Algumas páginas não têm Google Analytics configurado.');
    process.exit(1);
  }
}

console.log('\n🎉 [GA COVERAGE] SUCESSO! Todas as páginas têm Google Analytics configurado!');
console.log('\n📋 [GA COVERAGE] Próximos passos:');
console.log('   1. Execute o teste automatizado: node test-ga-all-pages.js');
console.log('   2. Verifique o Google Analytics Real-Time');
console.log('   3. Monitore regularmente a cobertura');

process.exit(0);
