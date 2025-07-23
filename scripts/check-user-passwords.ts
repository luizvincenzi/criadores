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

const targetEmails = [
  'comercial@criadores.app',
  'criadores.ops@gmail.com'
];

async function checkUsers() {
  console.log('🔍 VERIFICANDO USUÁRIOS NO SISTEMA');
  console.log('=================================\n');

  for (const email of targetEmails) {
    console.log(`📧 Verificando: ${email}`);
    
    try {
      // Verificar na tabela users
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.log(`   ❌ Erro ao buscar usuário: ${userError.message}`);
        continue;
      }

      if (user) {
        console.log(`   ✅ Usuário encontrado na tabela 'users':`);
        console.log(`      📝 ID: ${user.id}`);
        console.log(`      📝 Nome: ${user.full_name || 'Não informado'}`);
        console.log(`      📝 Role: ${user.role || 'Não informado'}`);
        console.log(`      📝 Ativo: ${user.is_active ? 'Sim' : 'Não'}`);
        console.log(`      📝 Último login: ${user.last_login || 'Nunca'}`);
        
        // Verificar se tem senha
        if (user.password_hash) {
          console.log(`      🔐 Senha: Hash encontrado (senha definida)`);
        } else {
          console.log(`      ⚠️ Senha: Não definida`);
        }
      } else {
        console.log(`   ❌ Usuário não encontrado na tabela 'users'`);
      }

      // Verificar no auth.users do Supabase
      console.log(`   🔍 Verificando no Supabase Auth...`);
      
      // Listar usuários do auth (limitado pelo service role)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.log(`   ❌ Erro ao acessar Supabase Auth: ${authError.message}`);
      } else {
        const authUser = authUsers.users.find(u => u.email === email);
        
        if (authUser) {
          console.log(`   ✅ Usuário encontrado no Supabase Auth:`);
          console.log(`      📝 ID: ${authUser.id}`);
          console.log(`      📝 Email confirmado: ${authUser.email_confirmed_at ? 'Sim' : 'Não'}`);
          console.log(`      📝 Último login: ${authUser.last_sign_in_at || 'Nunca'}`);
          console.log(`      📝 Criado em: ${authUser.created_at}`);
        } else {
          console.log(`   ❌ Usuário não encontrado no Supabase Auth`);
        }
      }

    } catch (error) {
      console.log(`   ❌ Erro geral: ${error}`);
    }
    
    console.log(''); // Linha em branco
  }
}

async function resetPassword(email: string, newPassword: string) {
  console.log(`🔄 REDEFININDO SENHA PARA: ${email}`);
  console.log('=====================================');

  try {
    // Método 1: Tentar resetar via Supabase Auth
    const { data, error } = await supabase.auth.admin.updateUserById(
      email, // Isso não vai funcionar, precisamos do ID
      { password: newPassword }
    );

    if (error) {
      console.log(`❌ Erro no método 1: ${error.message}`);
      
      // Método 2: Buscar ID primeiro e depois resetar
      const { data: authUsers } = await supabase.auth.admin.listUsers();
      const user = authUsers.users.find(u => u.email === email);
      
      if (user) {
        const { error: resetError } = await supabase.auth.admin.updateUserById(
          user.id,
          { password: newPassword }
        );
        
        if (resetError) {
          console.log(`❌ Erro no método 2: ${resetError.message}`);
        } else {
          console.log(`✅ Senha redefinida com sucesso!`);
          console.log(`📝 Nova senha: ${newPassword}`);
        }
      } else {
        console.log(`❌ Usuário não encontrado para reset`);
      }
    } else {
      console.log(`✅ Senha redefinida com sucesso!`);
      console.log(`📝 Nova senha: ${newPassword}`);
    }

  } catch (error) {
    console.log(`❌ Erro ao redefinir senha: ${error}`);
  }
}

async function showPasswordOptions() {
  console.log('\n🔐 OPÇÕES PARA SENHAS');
  console.log('====================');
  console.log('');
  console.log('1️⃣ SENHAS PADRÃO SUGERIDAS:');
  console.log('   comercial@criadores.app → "Criadores2024!"');
  console.log('   criadores.ops@gmail.com → "CriadoresOps2024!"');
  console.log('');
  console.log('2️⃣ REDEFINIR VIA SUPABASE DASHBOARD:');
  console.log('   • Acesse: https://ecbhcalmulaiszslwhqz.supabase.co/project/ecbhcalmulaiszslwhqz/auth/users');
  console.log('   • Encontre o usuário');
  console.log('   • Clique em "Reset Password"');
  console.log('   • Defina nova senha');
  console.log('');
  console.log('3️⃣ CRIAR USUÁRIOS SE NÃO EXISTIREM:');
  console.log('   • Use o script create-users-simple.ts');
  console.log('   • Ou crie manualmente no dashboard');
  console.log('');
  console.log('4️⃣ LOGIN DE EMERGÊNCIA:');
  console.log('   • Se nenhum funcionar, posso criar usuários temporários');
  console.log('   • Com senhas conhecidas para acesso imediato');
}

async function main() {
  console.log('🎯 OBJETIVO: Encontrar/redefinir senhas dos usuários específicos\n');

  // 1. Verificar se os usuários existem
  await checkUsers();

  // 2. Mostrar opções
  await showPasswordOptions();

  console.log('\n✅ VERIFICAÇÃO CONCLUÍDA!');
  console.log('');
  console.log('🔧 PRÓXIMOS PASSOS:');
  console.log('1. Se os usuários existem → Redefinir senha via dashboard');
  console.log('2. Se não existem → Criar usuários com senhas conhecidas');
  console.log('3. Testar login no sistema');
  console.log('');
  console.log('💡 DICA: Posso criar um script para redefinir automaticamente se necessário!');
}

if (require.main === module) {
  main().catch(console.error);
}
