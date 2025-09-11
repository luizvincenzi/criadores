#!/usr/bin/env node

/**
 * Script para testar endpoints de SEO/GEO/AEO
 * Verifica se robots.txt, sitemap.xml, feed.xml e FAQ estão funcionando
 */

const https = require('https');
const http = require('http');

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000';

// Função para fazer requisições HTTP/HTTPS
function makeRequest(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Testes para cada endpoint
const tests = [
  {
    name: 'Robots.txt',
    url: `${BASE_URL}/robots.txt`,
    expectedStatus: 200,
    expectedContent: ['User-Agent:', 'Sitemap:', 'https://www.criadores.app'],
    expectedContentType: 'text/plain'
  },
  {
    name: 'Sitemap.xml',
    url: `${BASE_URL}/sitemap.xml`,
    expectedStatus: 200,
    expectedContent: ['<?xml', 'urlset', 'https://www.criadores.app'],
    expectedContentType: 'application/xml'
  },
  {
    name: 'RSS Feed',
    url: `${BASE_URL}/feed.xml`,
    expectedStatus: 200,
    expectedContent: ['<?xml', 'rss version="2.0"', 'Blog crIAdores'],
    expectedContentType: 'application/rss+xml'
  },
  {
    name: 'FAQ Page',
    url: `${BASE_URL}/perguntas-frequentes`,
    expectedStatus: 200,
    expectedContent: ['Perguntas Frequentes', 'TL;DR', 'crIAdores'],
    expectedContentType: 'text/html'
  }
];

// Executar testes
async function runTests() {
  console.log('🧪 Testando endpoints de SEO/GEO/AEO...\n');
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      console.log(`📋 Testando ${test.name}...`);
      
      const response = await makeRequest(test.url);
      
      // Verificar status code
      if (response.statusCode !== test.expectedStatus) {
        console.log(`❌ ${test.name}: Status ${response.statusCode}, esperado ${test.expectedStatus}`);
        failed++;
        continue;
      }
      
      // Verificar content type (se especificado)
      if (test.expectedContentType) {
        const contentType = response.headers['content-type'] || '';
        if (!contentType.includes(test.expectedContentType)) {
          console.log(`❌ ${test.name}: Content-Type ${contentType}, esperado ${test.expectedContentType}`);
          failed++;
          continue;
        }
      }
      
      // Verificar conteúdo esperado
      let contentValid = true;
      for (const expectedContent of test.expectedContent) {
        if (!response.data.includes(expectedContent)) {
          console.log(`❌ ${test.name}: Conteúdo não contém "${expectedContent}"`);
          contentValid = false;
          break;
        }
      }
      
      if (!contentValid) {
        failed++;
        continue;
      }
      
      console.log(`✅ ${test.name}: OK`);
      passed++;
      
    } catch (error) {
      console.log(`❌ ${test.name}: Erro - ${error.message}`);
      failed++;
    }
    
    console.log(''); // Linha em branco
  }
  
  // Resumo dos resultados
  console.log('📊 Resumo dos Testes:');
  console.log(`✅ Passou: ${passed}`);
  console.log(`❌ Falhou: ${failed}`);
  console.log(`📈 Total: ${passed + failed}`);
  
  if (failed > 0) {
    console.log('\n⚠️ Alguns testes falharam. Verifique os endpoints.');
    process.exit(1);
  } else {
    console.log('\n🎉 Todos os testes passaram!');
    process.exit(0);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  runTests().catch((error) => {
    console.error('❌ Erro ao executar testes:', error);
    process.exit(1);
  });
}

module.exports = { runTests, makeRequest };
