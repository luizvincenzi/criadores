/**
 * Script para resetar senha de um usuário
 * 
 * Uso:
 * npx ts-node scripts/reset-password.ts
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjU4MDI1NiwiZXhwIjoyMDY4MTU2MjU2fQ.uAZ2E-hQAQZJ4W3FIuPJ4PJAbOM9SCN2Ns5-GScrCDs';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function resetPassword() {
  const email = 'connectcityops@gmail.com';
  const newPassword = '1#Aconchego';

  console.log('🔧 Resetando senha...');
  console.log('📧 Email:', email);
  console.log('🔐 Nova senha:', newPassword);
  console.log('');

  // 1. Buscar usuário em platform_users
  const { data: user, error: fetchError } = await supabaseAdmin
    .from('platform_users')
    .select('id, email, password_hash')
    .eq('email', email.toLowerCase())
    .eq('organization_id', '00000000-0000-0000-0000-000000000001')
    .single();

  if (fetchError || !user) {
    console.error('❌ Erro ao buscar usuário:', fetchError);
    return;
  }

  console.log('✅ Usuário encontrado:');
  console.log('   ID:', user.id);
  console.log('   Email:', user.email);
  console.log('');

  // 2. Gerar novo hash
  console.log('🔐 Gerando novo hash bcrypt...');
  const saltRounds = 12;
  const passwordHash = await bcrypt.hash(newPassword, saltRounds);
  console.log('✅ Hash gerado:', passwordHash.substring(0, 20) + '...');
  console.log('   Hash length:', passwordHash.length);
  console.log('');

  // 3. Testar hash imediatamente
  console.log('🧪 Testando hash...');
  const testVerify = await bcrypt.compare(newPassword, passwordHash);
  console.log(testVerify ? '✅ Hash válido' : '❌ Hash inválido');
  console.log('');

  if (!testVerify) {
    console.error('❌ Hash gerado está inválido! Abortando...');
    return;
  }

  // 4. Atualizar senha no auth.users (Supabase Auth)
  console.log('🔐 Atualizando senha no Supabase Auth...');
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { password: newPassword }
  );

  if (authError) {
    console.error('❌ Erro ao atualizar senha no Supabase Auth:', authError);
    return;
  }

  console.log('✅ Senha atualizada no Supabase Auth');
  console.log('');

  // 5. Atualizar hash em platform_users
  console.log('💾 Salvando hash em platform_users...');
  const { error: updateError } = await supabaseAdmin
    .from('platform_users')
    .update({
      password_hash: passwordHash,
      email_verified: true,
      is_active: true,
      last_password_change: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (updateError) {
    console.error('❌ Erro ao atualizar hash:', updateError);
    return;
  }

  console.log('✅ Hash salvo em platform_users');
  console.log('');

  // 6. Verificar se foi salvo corretamente
  console.log('🔍 Verificando se foi salvo...');
  const { data: verifyUser, error: verifyError } = await supabaseAdmin
    .from('platform_users')
    .select('id, email, password_hash, is_active, email_verified')
    .eq('id', user.id)
    .single();

  if (verifyError || !verifyUser) {
    console.error('❌ Erro ao verificar:', verifyError);
    return;
  }

  console.log('✅ Verificação:');
  console.log('   ID:', verifyUser.id);
  console.log('   Email:', verifyUser.email);
  console.log('   Has Hash:', !!verifyUser.password_hash);
  console.log('   Hash Length:', verifyUser.password_hash?.length);
  console.log('   Is Active:', verifyUser.is_active);
  console.log('   Email Verified:', verifyUser.email_verified);
  console.log('');

  // 7. Testar validação final
  console.log('🧪 Testando validação final...');
  const finalTest = await bcrypt.compare(newPassword, verifyUser.password_hash);
  console.log(finalTest ? '✅ SENHA VÁLIDA!' : '❌ SENHA INVÁLIDA!');
  console.log('');

  if (finalTest) {
    console.log('🎉 Senha resetada com sucesso!');
    console.log('');
    console.log('📋 Credenciais:');
    console.log('   Email:', email);
    console.log('   Senha:', newPassword);
    console.log('');
    console.log('🔗 Teste em: https://criadores.app/login');
  } else {
    console.error('❌ Falha ao resetar senha. Algo deu errado.');
  }
}

resetPassword();

