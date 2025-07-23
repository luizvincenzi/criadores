#!/usr/bin/env tsx

async function testLoginAPI() {
  console.log('🧪 TESTANDO API DE LOGIN');
  console.log('========================\n');

  const testUsers = [
    { email: 'comercial@criadores.app', password: 'Criadores2024!' },
    { email: 'criadores.ops@gmail.com', password: 'CriadoresOps2024!' },
    { email: 'test.ops@criadores.app', password: 'TestOps2024!' }
  ];

  for (const user of testUsers) {
    console.log(`📧 Testando: ${user.email}`);
    
    try {
      const response = await fetch('http://localhost:3002/api/supabase/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: user.email,
          password: user.password
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        console.log('   ✅ Login bem-sucedido!');
        console.log(`   📝 Nome: ${data.user.full_name}`);
        console.log(`   👔 Role: ${data.user.role}`);
        console.log(`   🏢 Organização: ${data.user.organization?.name || 'N/A'}`);
      } else {
        console.log('   ❌ Login falhou:', data.error);
        console.log('   📊 Status:', response.status);
      }

    } catch (error) {
      console.log('   ❌ Erro na requisição:', error);
    }
    
    console.log(''); // Linha em branco
  }
}

async function main() {
  console.log('🎯 OBJETIVO: Verificar se a API de login está funcionando após correção\n');
  
  await testLoginAPI();
  
  console.log('✅ TESTE CONCLUÍDO!');
  console.log('');
  console.log('🔧 SE OS TESTES PASSARAM:');
  console.log('   • A API está funcionando corretamente');
  console.log('   • Você pode fazer login na interface web');
  console.log('   • Acesse: http://localhost:3002/login');
  console.log('');
  console.log('❌ SE ALGUM TESTE FALHOU:');
  console.log('   • Verifique se o servidor está rodando');
  console.log('   • Verifique se os usuários existem no banco');
  console.log('   • Tente recarregar a página de login');
}

if (require.main === module) {
  main().catch(console.error);
}
