#!/usr/bin/env tsx

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente do Supabase não configuradas');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Senhas padrão para os usuários
const userPasswords = {
  'comercial@criadores.app': 'Criadores2024!',
  'criadores.ops@gmail.com': 'CriadoresOps2024!'
};

async function resetUserPassword(email: string, newPassword: string) {
  console.log(`🔄 Redefinindo senha para: ${email}`);
  
  try {
    // 1. Buscar o usuário no Supabase Auth
    const { data: authUsers, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.log(`   ❌ Erro ao listar usuários: ${listError.message}`);
      return false;
    }

    const user = authUsers.users.find(u => u.email === email);
    
    if (!user) {
      console.log(`   ❌ Usuário não encontrado no Supabase Auth`);
      return false;
    }

    // 2. Redefinir a senha
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    );

    if (updateError) {
      console.log(`   ❌ Erro ao redefinir senha: ${updateError.message}`);
      return false;
    }

    console.log(`   ✅ Senha redefinida com sucesso!`);
    console.log(`   📝 Nova senha: ${newPassword}`);
    
    return true;

  } catch (error) {
    console.log(`   ❌ Erro geral: ${error}`);
    return false;
  }
}

async function testLogin(email: string, password: string) {
  console.log(`🧪 Testando login para: ${email}`);
  
  try {
    // Criar um cliente temporário para teste
    const testClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    
    const { data, error } = await testClient.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) {
      console.log(`   ❌ Erro no login: ${error.message}`);
      return false;
    }

    if (data.user) {
      console.log(`   ✅ Login bem-sucedido!`);
      console.log(`   📝 User ID: ${data.user.id}`);
      
      // Fazer logout para limpar a sessão
      await testClient.auth.signOut();
      
      return true;
    }

    return false;

  } catch (error) {
    console.log(`   ❌ Erro no teste: ${error}`);
    return false;
  }
}

async function showLoginInstructions() {
  console.log('\n📋 INSTRUÇÕES DE LOGIN');
  console.log('======================');
  console.log('');
  console.log('🔗 URL do sistema: http://localhost:3002');
  console.log('');
  console.log('👤 USUÁRIO 1:');
  console.log(`   📧 Email: comercial@criadores.app`);
  console.log(`   🔐 Senha: ${userPasswords['comercial@criadores.app']}`);
  console.log(`   👔 Função: Manager (Gerente)`);
  console.log('');
  console.log('👤 USUÁRIO 2:');
  console.log(`   📧 Email: criadores.ops@gmail.com`);
  console.log(`   🔐 Senha: ${userPasswords['criadores.ops@gmail.com']}`);
  console.log(`   👤 Função: User (Usuário)`);
  console.log('');
  console.log('💡 DICAS:');
  console.log('   • As senhas são case-sensitive');
  console.log('   • Copie e cole para evitar erros');
  console.log('   • Se não funcionar, execute este script novamente');
}

async function main() {
  console.log('🔐 REDEFININDO SENHAS DOS USUÁRIOS');
  console.log('==================================\n');

  let allSuccess = true;

  // 1. Redefinir senhas
  for (const [email, password] of Object.entries(userPasswords)) {
    const success = await resetUserPassword(email, password);
    if (!success) {
      allSuccess = false;
    }
    console.log(''); // Linha em branco
  }

  if (!allSuccess) {
    console.log('⚠️ Algumas senhas não foram redefinidas. Verifique os erros acima.');
    return;
  }

  // 2. Testar logins
  console.log('🧪 TESTANDO LOGINS...\n');
  
  for (const [email, password] of Object.entries(userPasswords)) {
    await testLogin(email, password);
    console.log(''); // Linha em branco
  }

  // 3. Mostrar instruções
  await showLoginInstructions();

  console.log('\n✅ PROCESSO CONCLUÍDO!');
  console.log('');
  console.log('🎯 AGORA VOCÊ PODE:');
  console.log('1. Acessar http://localhost:3002');
  console.log('2. Fazer login com qualquer um dos usuários');
  console.log('3. Usar o sistema CRM completo');
  console.log('');
  console.log('🔒 SEGURANÇA:');
  console.log('• Altere as senhas após o primeiro login');
  console.log('• Use senhas mais seguras em produção');
  console.log('• Mantenha as credenciais em local seguro');
}

if (require.main === module) {
  main().catch(console.error);
}
