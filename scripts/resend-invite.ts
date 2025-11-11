/**
 * Script para reenviar convite para usuário que ainda não completou onboarding
 * 
 * USO:
 * npm run resend-invite
 * 
 * Depois digite o email do usuário quando solicitado
 */

import { createClient } from '@supabase/supabase-js';
import * as readline from 'readline';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variáveis de ambiente não configuradas');
  console.error('Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no .env.local');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function resendInvite() {
  console.log('\n🔄 ===== REENVIAR CONVITE =====\n');

  // Solicitar email
  const email = await question('📧 Digite o email do usuário: ');

  if (!email || !email.includes('@')) {
    console.error('❌ Email inválido');
    rl.close();
    return;
  }

  console.log('\n🔍 Verificando usuário...\n');

  // 1. Verificar se o usuário existe em platform_users
  const { data: platformUser, error: platformError } = await supabaseAdmin
    .from('platform_users')
    .select('id, email, password_hash, is_active, role')
    .eq('email', email)
    .single();

  if (platformError && platformError.code !== 'PGRST116') {
    console.error('❌ Erro ao verificar platform_users:', platformError);
    rl.close();
    return;
  }

  if (!platformUser) {
    console.error('❌ Usuário não encontrado em platform_users');
    console.error('💡 Certifique-se de que o usuário foi criado primeiro');
    rl.close();
    return;
  }

  console.log('✅ Usuário encontrado em platform_users');
  console.log('📋 ID:', platformUser.id);
  console.log('📋 Email:', platformUser.email);
  console.log('📋 Role:', platformUser.role);
  console.log('📋 Ativo:', platformUser.is_active);
  console.log('📋 Tem senha:', platformUser.password_hash ? 'Sim' : 'Não');
  console.log('');

  // 2. Verificar se já completou onboarding
  if (platformUser.password_hash) {
    console.error('⚠️ Usuário já completou o onboarding (já tem senha)');
    console.error('💡 Use reset de senha em vez de reenviar convite');
    rl.close();
    return;
  }

  // 3. Buscar metadata do usuário no Supabase Auth
  const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

  if (listError) {
    console.error('❌ Erro ao listar usuários:', listError);
    rl.close();
    return;
  }

  const existingUser = users?.find(u => u.email === email);

  if (!existingUser) {
    console.error('❌ Usuário não encontrado no Supabase Auth');
    console.error('💡 Crie o usuário no Supabase Auth primeiro');
    rl.close();
    return;
  }

  const userMetadata = existingUser.user_metadata || {};

  console.log('📋 Metadata do usuário:');
  console.log(JSON.stringify(userMetadata, null, 2));
  console.log('');

  // 4. Confirmar reenvio
  const confirm = await question('❓ Deseja reenviar o convite? (s/n): ');

  if (confirm.toLowerCase() !== 's') {
    console.log('❌ Operação cancelada');
    rl.close();
    return;
  }

  console.log('\n📧 Reenviando convite...\n');

  // 5. Reenviar convite via Supabase Admin API
  const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
    email,
    {
      redirectTo: 'https://www.criadores.app/auth/callback',
      data: {
        ...userMetadata,
        email_verified: true,
        invited_at: new Date().toISOString()
      }
    }
  );

  if (inviteError) {
    console.error('❌ Erro ao reenviar convite:', inviteError);
    rl.close();
    return;
  }

  console.log('✅ Convite reenviado com sucesso!');
  console.log('📧 Email enviado para:', email);
  console.log('🔗 O usuário receberá um novo link de ativação');
  console.log('');
  console.log('💡 Instruções para o usuário:');
  console.log('   1. Verificar a caixa de entrada (e spam)');
  console.log('   2. Clicar no link do email');
  console.log('   3. Criar uma senha');
  console.log('   4. Fazer login');
  console.log('');

  rl.close();
}

resendInvite().catch((error) => {
  console.error('❌ Erro inesperado:', error);
  rl.close();
  process.exit(1);
});

