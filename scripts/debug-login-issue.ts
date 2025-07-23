#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const email = 'criadores.ops@gmail.com';
const password = 'CriadoresOps2024!';

async function debugLogin() {
  console.log('🔍 DIAGNOSTICANDO PROBLEMA DE LOGIN');
  console.log('===================================\n');

  console.log('📧 Email:', email);
  console.log('🔐 Senha:', password);
  console.log('🔗 URL:', supabaseUrl);
  console.log('');

  // 1. Verificar se o usuário existe no Supabase Auth
  console.log('1️⃣ VERIFICANDO USUÁRIO NO SUPABASE AUTH...');
  
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { data: users, error } = await adminClient.auth.admin.listUsers();
    
    if (error) {
      console.log('❌ Erro ao listar usuários:', error.message);
      return;
    }

    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.log('❌ Usuário não encontrado no Supabase Auth');
      return;
    }

    console.log('✅ Usuário encontrado:');
    console.log(`   📝 ID: ${user.id}`);
    console.log(`   📧 Email: ${user.email}`);
    console.log(`   ✅ Email confirmado: ${user.email_confirmed_at ? 'Sim' : 'Não'}`);
    console.log(`   🔐 Tem senha: ${user.encrypted_password ? 'Sim' : 'Não'}`);
    console.log(`   📅 Último login: ${user.last_sign_in_at || 'Nunca'}`);

  } catch (error) {
    console.log('❌ Erro:', error);
  }

  // 2. Tentar login com cliente público
  console.log('\n2️⃣ TESTANDO LOGIN COM CLIENTE PÚBLICO...');
  
  const publicClient = createClient(supabaseUrl, supabaseAnonKey);
  
  try {
    const { data, error } = await publicClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.log('❌ Erro no login:', error.message);
      console.log('   Código:', error.status);
      
      // Verificar tipos de erro comuns
      if (error.message.includes('Invalid login credentials')) {
        console.log('   💡 Possível causa: Senha incorreta ou usuário não existe');
      } else if (error.message.includes('Email not confirmed')) {
        console.log('   💡 Possível causa: Email não confirmado');
      } else if (error.message.includes('Too many requests')) {
        console.log('   💡 Possível causa: Muitas tentativas de login');
      }
    } else {
      console.log('✅ Login bem-sucedido!');
      console.log(`   📝 User ID: ${data.user?.id}`);
      console.log(`   📧 Email: ${data.user?.email}`);
      
      // Fazer logout
      await publicClient.auth.signOut();
    }

  } catch (error) {
    console.log('❌ Erro no teste:', error);
  }

  // 3. Tentar redefinir senha novamente
  console.log('\n3️⃣ REDEFININDO SENHA NOVAMENTE...');
  
  try {
    const { data: users } = await adminClient.auth.admin.listUsers();
    const user = users.users.find(u => u.email === email);
    
    if (user) {
      const { error } = await adminClient.auth.admin.updateUserById(
        user.id,
        { 
          password: password,
          email_confirm: true // Confirmar email também
        }
      );

      if (error) {
        console.log('❌ Erro ao redefinir senha:', error.message);
      } else {
        console.log('✅ Senha redefinida novamente');
      }
    }

  } catch (error) {
    console.log('❌ Erro:', error);
  }

  // 4. Testar login novamente após redefinir
  console.log('\n4️⃣ TESTANDO LOGIN APÓS REDEFINIR...');
  
  try {
    // Aguardar um pouco para a mudança ser processada
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const { data, error } = await publicClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.log('❌ Ainda com erro:', error.message);
    } else {
      console.log('✅ Login funcionando agora!');
      await publicClient.auth.signOut();
    }

  } catch (error) {
    console.log('❌ Erro:', error);
  }
}

async function createFreshUser() {
  console.log('\n5️⃣ CRIANDO USUÁRIO FRESCO COMO ALTERNATIVA...');
  
  const adminClient = createClient(supabaseUrl, supabaseServiceKey);
  const freshEmail = 'test.ops@criadores.app';
  const freshPassword = 'TestOps2024!';
  
  try {
    // Deletar se existir
    const { data: existingUsers } = await adminClient.auth.admin.listUsers();
    const existingUser = existingUsers.users.find(u => u.email === freshEmail);
    
    if (existingUser) {
      await adminClient.auth.admin.deleteUser(existingUser.id);
      console.log('🗑️ Usuário existente removido');
    }

    // Criar novo usuário
    const { data, error } = await adminClient.auth.admin.createUser({
      email: freshEmail,
      password: freshPassword,
      email_confirm: true
    });

    if (error) {
      console.log('❌ Erro ao criar usuário:', error.message);
      return;
    }

    console.log('✅ Usuário alternativo criado:');
    console.log(`   📧 Email: ${freshEmail}`);
    console.log(`   🔐 Senha: ${freshPassword}`);
    console.log(`   📝 ID: ${data.user.id}`);

    // Testar login do usuário fresco
    const publicClient = createClient(supabaseUrl, supabaseAnonKey);
    
    const { data: loginData, error: loginError } = await publicClient.auth.signInWithPassword({
      email: freshEmail,
      password: freshPassword
    });

    if (loginError) {
      console.log('❌ Login do usuário fresco falhou:', loginError.message);
    } else {
      console.log('✅ Login do usuário fresco funcionou!');
      await publicClient.auth.signOut();
    }

  } catch (error) {
    console.log('❌ Erro:', error);
  }
}

async function main() {
  await debugLogin();
  await createFreshUser();
  
  console.log('\n📋 RESUMO E SOLUÇÕES:');
  console.log('====================');
  console.log('');
  console.log('🔧 OPÇÕES PARA RESOLVER:');
  console.log('');
  console.log('1️⃣ Use o usuário alternativo criado:');
  console.log('   📧 Email: test.ops@criadores.app');
  console.log('   🔐 Senha: TestOps2024!');
  console.log('');
  console.log('2️⃣ Aguarde alguns minutos e tente novamente:');
  console.log('   📧 Email: criadores.ops@gmail.com');
  console.log('   🔐 Senha: CriadoresOps2024!');
  console.log('');
  console.log('3️⃣ Tente o usuário comercial:');
  console.log('   📧 Email: comercial@criadores.app');
  console.log('   🔐 Senha: Criadores2024!');
}

if (require.main === module) {
  main().catch(console.error);
}
