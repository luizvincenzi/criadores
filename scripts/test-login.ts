import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDI1NiwiZXhwIjoyMDY4MTU2MjU2fQ.uAZ2E-hQAQZJ4W3FIuPJ4PJAbOM9SCN2Ns5-GScrCDs';

// Cliente normal para teste de login
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Cliente admin para redefinir senhas
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const testUsers = [
  {
    email: 'luizvincenzi@gmail.com',
    password: 'criadores2024!',
    name: 'Luiz Vincenzi'
  },
  {
    email: 'pgabrieldavila@gmail.com',
    password: 'criadores2024!',
    name: 'Pedro Gabriel Davila'
  },
  {
    email: 'marloncpascoal@gmail.com',
    password: 'criadores2024!',
    name: 'Marlon Pascoal'
  }
];

async function testAndFixLogins() {
  console.log('🧪 [crIAdores] Testando login dos usuários...\n');

  for (const user of testUsers) {
    console.log(`👤 Testando login: ${user.email}`);

    try {
      // Tentar fazer login
      const { data: authData, error: loginError } = await supabaseClient.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });

      if (loginError) {
        console.log(`  ❌ Login falhou: ${loginError.message}`);
        console.log('  🔧 Tentando redefinir senha...');

        // Obter ID do usuário
        const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
        const authUser = authUsers.users.find(u => u.email === user.email);

        if (authUser) {
          // Redefinir senha
          const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            authUser.id,
            {
              password: user.password,
              email_confirm: true
            }
          );

          if (updateError) {
            console.log(`  ❌ Erro ao redefinir senha: ${updateError.message}`);
          } else {
            console.log('  ✅ Senha redefinida com sucesso');

            // Testar login novamente
            const { data: retryData, error: retryError } = await supabaseClient.auth.signInWithPassword({
              email: user.email,
              password: user.password
            });

            if (retryError) {
              console.log(`  ❌ Login ainda falha: ${retryError.message}`);
            } else {
              console.log('  ✅ Login funcionando após redefinição!');
              // Fazer logout para não interferir nos próximos testes
              await supabaseClient.auth.signOut();
            }
          }
        }
      } else {
        console.log('  ✅ Login funcionando perfeitamente!');
        console.log(`     Usuário ID: ${authData.user?.id}`);
        console.log(`     Email: ${authData.user?.email}`);

        // Fazer logout para não interferir nos próximos testes
        await supabaseClient.auth.signOut();
      }

      console.log('');
    } catch (error) {
      console.error(`  ❌ Erro inesperado para ${user.email}:`, error);
      console.log('');
    }
  }

  console.log('🎉 [crIAdores] Teste de login concluído!\n');

  console.log('📋 CREDENCIAIS PARA TESTE:');
  console.log('==========================');

  for (const user of testUsers) {
    console.log(`👤 ${user.name}`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   🔐 Senha: ${user.password}`);
    console.log('');
  }

  console.log('🌐 TESTE NA APLICAÇÃO:');
  console.log('======================');
  console.log('🔗 URL: http://localhost:3000/login');
  console.log('✅ Use qualquer uma das credenciais acima!');
}

// Executar o script
if (require.main === module) {
  testAndFixLogins()
    .then(() => {
      console.log('🎯 Teste executado com sucesso!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro ao executar teste:', error);
      process.exit(1);
    });
}

export { testAndFixLogins };
