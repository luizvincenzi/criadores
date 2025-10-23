import { supabase } from '@/lib/supabase';
import { verifyPassword } from '@/lib/auth';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function testLoginAlanna() {
  console.log('🧪 Testando login do usuário Alanna...\n');

  try {
    // 1. Buscar usuário no banco
    console.log('1️⃣ Buscando usuário alannaalicia17@gmail.com...');
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'alannaalicia17@gmail.com')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      console.error('❌ Usuário não encontrado:', error);
      return;
    }

    console.log('✅ Usuário encontrado:', {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      role: user.role,
      roles: user.roles,
      is_active: user.is_active,
      has_password_hash: !!user.password_hash
    });

    // 2. Verificar password_hash
    console.log('\n2️⃣ Verificando password_hash...');
    if (!user.password_hash) {
      console.error('❌ Usuário não tem password_hash definido!');
      return;
    }
    console.log('✅ Password hash encontrado:', user.password_hash.substring(0, 20) + '...');

    // 3. Testar validação de senha
    console.log('\n3️⃣ Testando validação de senha...');
    
    // Você precisa fornecer a senha correta aqui
    const testPassword = 'SenhaAlanna123!'; // Substitua pela senha correta
    
    try {
      const isValid = await verifyPassword(testPassword, user.password_hash);
      console.log(`${isValid ? '✅' : '❌'} Validação de senha: ${isValid ? 'SUCESSO' : 'FALHA'}`);
      
      if (!isValid) {
        console.log('⚠️ A senha testada não corresponde ao hash. Verifique a senha correta.');
      }
    } catch (verifyError) {
      console.error('❌ Erro ao verificar senha:', verifyError);
    }

    console.log('\n✅ Teste concluído!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error);
  }
}

testLoginAlanna();

