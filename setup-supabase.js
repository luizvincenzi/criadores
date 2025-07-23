#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 CONFIGURAÇÃO DO SUPABASE PARA CRM CRIADORES');
console.log('===============================================\n');

console.log('❌ ERRO IDENTIFICADO: "Nenhuma organização encontrada"');
console.log('🔧 SOLUÇÃO: Configurar Supabase e criar organização padrão\n');

console.log('📋 PASSOS PARA RESOLVER:');
console.log('');
console.log('1️⃣ ACESSE SEU PROJETO NO SUPABASE:');
console.log('   • Vá para: https://supabase.com/dashboard');
console.log('   • Selecione seu projeto');
console.log('');
console.log('2️⃣ OBTENHA AS CREDENCIAIS:');
console.log('   • Vá em Settings > API');
console.log('   • Copie a "Project URL"');
console.log('   • Copie a "anon/public" key');
console.log('   • Copie a "service_role" key (⚠️ SECRETA!)');
console.log('');
console.log('3️⃣ CONFIGURE O ARQUIVO .env.local:');
console.log('   • Substitua as variáveis no arquivo .env.local');
console.log('   • NEXT_PUBLIC_SUPABASE_URL=sua-url-aqui');
console.log('   • NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-publica-aqui');
console.log('   • SUPABASE_SERVICE_ROLE_KEY=sua-chave-service-role-aqui');
console.log('');
console.log('4️⃣ EXECUTE O SCRIPT DE CONFIGURAÇÃO:');
console.log('   • npm run tsx scripts/create-default-organization.ts');
console.log('');
console.log('5️⃣ REINICIE O SERVIDOR:');
console.log('   • Ctrl+C para parar o servidor');
console.log('   • npm run dev para reiniciar');
console.log('');

// Verificar se as credenciais estão configuradas
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  
  const hasRealUrl = envContent.includes('supabase.co') && !envContent.includes('your-project.supabase.co');
  const hasRealKeys = !envContent.includes('your-anon-key-here') && !envContent.includes('your-service-role-key-here');
  
  if (hasRealUrl && hasRealKeys) {
    console.log('✅ CREDENCIAIS CONFIGURADAS!');
    console.log('🎯 Execute agora: npm run tsx scripts/create-default-organization.ts');
  } else {
    console.log('⚠️  CREDENCIAIS AINDA NÃO CONFIGURADAS');
    console.log('📝 Edite o arquivo .env.local com suas credenciais reais');
  }
} else {
  console.log('❌ Arquivo .env.local não encontrado');
}

console.log('');
console.log('💡 DICA: Após configurar, o erro "Nenhuma organização encontrada" será resolvido!');
console.log('===============================================');
