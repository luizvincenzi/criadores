/**
 * Script para testar validação de senha
 * 
 * Uso:
 * npx ts-node scripts/test-password-validation.ts
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = 'https://ecbhcalmulaiszslwhqz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjYmhjYWxtdWxhaXN6c2x3aHF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1ODAyNTYsImV4cCI6MjA2ODE1NjI1Nn0.5GBfnOQjb64Qhw0UF5HtTNROlu4fpJzbWSZmeACcjMA';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testPasswordValidation() {
  const email = 'connectcityops@gmail.com';
  const password = '1#Aconchego';

  console.log('🧪 Testando validação de senha...');
  console.log('📧 Email:', email);
  console.log('🔐 Senha:', password);
  console.log('');

  // Buscar usuário
  const { data: user, error } = await supabase
    .from('platform_users')
    .select('id, email, password_hash, is_active')
    .eq('email', email.toLowerCase())
    .eq('organization_id', '00000000-0000-0000-0000-000000000001')
    .single();

  if (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    return;
  }

  if (!user) {
    console.error('❌ Usuário não encontrado');
    return;
  }

  console.log('✅ Usuário encontrado:');
  console.log('   ID:', user.id);
  console.log('   Email:', user.email);
  console.log('   Is Active:', user.is_active);
  console.log('   Has Password Hash:', !!user.password_hash);
  console.log('   Hash Length:', user.password_hash?.length);
  console.log('');

  if (!user.password_hash) {
    console.error('❌ Usuário não tem password_hash');
    return;
  }

  // Testar validação
  console.log('🔐 Testando validação com bcrypt...');
  console.log('   Hash:', user.password_hash.substring(0, 20) + '...');
  console.log('   Senha:', password);
  console.log('');

  try {
    const isValid = await bcrypt.compare(password, user.password_hash);
    
    if (isValid) {
      console.log('✅ SENHA VÁLIDA! O bcrypt está funcionando corretamente.');
    } else {
      console.log('❌ SENHA INVÁLIDA! O hash não corresponde à senha.');
      console.log('');
      console.log('🔍 Possíveis causas:');
      console.log('   1. Senha digitada está incorreta');
      console.log('   2. Hash foi gerado com senha diferente');
      console.log('   3. Hash está corrompido');
      console.log('');
      console.log('💡 Solução:');
      console.log('   Execute o script de reset de senha:');
      console.log('   npx ts-node scripts/reset-password.ts');
    }
  } catch (err) {
    console.error('❌ Erro ao validar senha:', err);
  }
}

testPasswordValidation();

