#!/usr/bin/env tsx

/**
 * Script para limpar rate limit em desenvolvimento
 */

async function clearRateLimit() {
  console.log('🧹 LIMPANDO RATE LIMIT');
  console.log('=====================\n');

  // Verificar se está em desenvolvimento
  if (process.env.NODE_ENV === 'production') {
    console.log('❌ Este script só funciona em desenvolvimento');
    process.exit(1);
  }

  try {
    // Tentar chamar a API de limpeza
    const response = await fetch('http://localhost:3003/api/dev/clear-rate-limit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ Rate limit limpo:', data.message);
    } else {
      console.log('⚠️  API não disponível (servidor pode estar parado)');
    }

  } catch (error) {
    console.log('⚠️  Servidor não está rodando, mas isso é normal');
  }

  console.log('\n🔄 SOLUÇÕES PARA RATE LIMIT:');
  console.log('');
  console.log('1️⃣ REINICIAR SERVIDOR:');
  console.log('   • Pare o servidor (Ctrl+C)');
  console.log('   • Execute: npm run dev');
  console.log('   • Rate limit será resetado');
  console.log('');
  console.log('2️⃣ CONFIGURAÇÕES ATUALIZADAS:');
  console.log('   • Desenvolvimento: 1000 requests/minuto');
  console.log('   • Produção: 100 requests/minuto');
  console.log('   • Login dev: 50 tentativas/minuto');
  console.log('');
  console.log('3️⃣ SE PROBLEMA PERSISTIR:');
  console.log('   • Limpe cache do navegador');
  console.log('   • Use modo incógnito');
  console.log('   • Verifique se não há loops infinitos');
  console.log('');
  console.log('✅ RATE LIMIT OTIMIZADO PARA DESENVOLVIMENTO!');
}

async function showRateLimitInfo() {
  console.log('\n📊 INFORMAÇÕES DO RATE LIMIT');
  console.log('============================');
  console.log('');
  console.log('🔧 CONFIGURAÇÃO ATUAL:');
  console.log('   • Ambiente:', process.env.NODE_ENV || 'development');
  console.log('   • API calls: 1000/minuto (dev) | 100/minuto (prod)');
  console.log('   • Login: 50/minuto (dev) | 5/15min (prod)');
  console.log('');
  console.log('🎯 COMO FUNCIONA:');
  console.log('   • Rate limit por IP');
  console.log('   • Janela deslizante');
  console.log('   • Reset automático');
  console.log('   • Mais permissivo em desenvolvimento');
  console.log('');
  console.log('🚨 SE ATINGIR LIMITE:');
  console.log('   • Aguarde 1 minuto');
  console.log('   • Ou reinicie o servidor');
  console.log('   • Verifique por requisições excessivas');
}

async function main() {
  console.log('🎯 OBJETIVO: Resolver erro de rate limit\n');
  
  await clearRateLimit();
  await showRateLimitInfo();
  
  console.log('\n💡 DICA: Para evitar rate limit no futuro:');
  console.log('• Evite recarregar a página muito rapidamente');
  console.log('• Não faça muitas requisições simultâneas');
  console.log('• Use debounce em campos de busca');
  console.log('• Implemente cache quando possível');
}

if (require.main === module) {
  main().catch(console.error);
}
