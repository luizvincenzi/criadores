import { createClient } from '@supabase/supabase-js';

// Configuração exata da aplicação
const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDI1NiwiZXhwIjoyMDY4MTU2MjU2fQ.uAZ2E-hQAQZJ4W3FIuPJ4PJAbOM9SCN2Ns5-GScrCDs';

// Cliente igual ao da aplicação
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Cliente admin
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function debugLogin() {
  console.log('🔍 [DEBUG] Investigando problema de login...\n');

  const testEmail = 'luizvincenzi@gmail.com';
  const testPassword = 'criadores2024!';

  try {
    // 1. Verificar se o usuário existe no Auth
    console.log('1. 🔍 Verificando usuário no Supabase Auth...');
    const { data: authUsers, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError);
      return;
    }

    const authUser = authUsers.users.find(user => user.email === testEmail);
    
    if (!authUser) {
      console.log('❌ Usuário não encontrado no Auth');
      return;
    }

    console.log('✅ Usuário encontrado no Auth:');
    console.log(`   ID: ${authUser.id}`);
    console.log(`   Email: ${authUser.email}`);
    console.log(`   Confirmado: ${authUser.email_confirmed_at ? 'Sim' : 'Não'}`);
    console.log(`   Último login: ${authUser.last_sign_in_at || 'Nunca'}`);
    console.log(`   Criado: ${authUser.created_at}`);

    // 2. Tentar redefinir a senha para garantir que está correta
    console.log('\n2. 🔧 Redefinindo senha para garantir...');
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      authUser.id,
      { 
        password: testPassword,
        email_confirm: true
      }
    );

    if (updateError) {
      console.error('❌ Erro ao redefinir senha:', updateError);
      return;
    }

    console.log('✅ Senha redefinida com sucesso');

    // 3. Aguardar um pouco para a atualização ser processada
    console.log('\n3. ⏳ Aguardando processamento...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // 4. Testar login com configuração exata da aplicação
    console.log('\n4. 🧪 Testando login com configuração da aplicação...');
    
    const { data: loginData, error: loginError } = await supabaseClient.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });

    if (loginError) {
      console.error('❌ Login falhou:', loginError);
      console.error('   Código:', loginError.status);
      console.error('   Mensagem:', loginError.message);
      
      // Tentar com senha diferente para debug
      console.log('\n5. 🔧 Tentando criar usuário novamente...');
      
      // Deletar usuário existente
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(authUser.id);
      if (deleteError) {
        console.error('❌ Erro ao deletar usuário:', deleteError);
      } else {
        console.log('✅ Usuário deletado');
      }

      // Criar novamente
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Luiz Vincenzi'
        }
      });

      if (createError) {
        console.error('❌ Erro ao recriar usuário:', createError);
      } else {
        console.log('✅ Usuário recriado com sucesso');
        console.log(`   Novo ID: ${newUser.user?.id}`);
        
        // Aguardar e testar novamente
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const { data: retryData, error: retryError } = await supabaseClient.auth.signInWithPassword({
          email: testEmail,
          password: testPassword
        });

        if (retryError) {
          console.error('❌ Login ainda falha após recriar:', retryError);
        } else {
          console.log('✅ Login funcionando após recriar!');
          console.log(`   User ID: ${retryData.user?.id}`);
          await supabaseClient.auth.signOut();
        }
      }
    } else {
      console.log('✅ Login funcionando perfeitamente!');
      console.log(`   User ID: ${loginData.user?.id}`);
      console.log(`   Email: ${loginData.user?.email}`);
      await supabaseClient.auth.signOut();
    }

    // 6. Verificar configurações do projeto Supabase
    console.log('\n6. ⚙️ Verificando configurações do projeto...');
    
    try {
      const { data: settings } = await supabaseAdmin
        .from('auth.config')
        .select('*')
        .limit(1);
      
      console.log('Configurações Auth:', settings);
    } catch (error) {
      console.log('Não foi possível verificar configurações auth');
    }

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }

  console.log('\n🎯 RESUMO PARA TESTE:');
  console.log('====================');
  console.log(`📧 Email: ${testEmail}`);
  console.log(`🔐 Senha: ${testPassword}`);
  console.log('🔗 URL: http://localhost:3000/login');
  console.log('\n✅ Tente fazer login agora na aplicação!');
}

// Executar o script
if (require.main === module) {
  debugLogin()
    .then(() => {
      console.log('\n🎯 Debug concluído!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Erro no debug:', error);
      process.exit(1);
    });
}

export { debugLogin };
