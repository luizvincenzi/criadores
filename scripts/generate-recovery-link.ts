/**
 * Script para gerar link de recovery (reset de senha)
 * 
 * Como o usuário já existe no Supabase Auth, vamos usar recovery link
 * que funciona da mesma forma que o invite link
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Carregar variáveis de ambiente do .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function generateRecoveryLink() {
  const ownerEmail = 'gustavucaliani@gmail.com';
  
  console.log('\n🔗 Gerando link de ativação para Gustavo Caliani...\n');

  try {
    // 1. Buscar o usuário em platform_users
    const { data: platformUser, error: platformError } = await supabaseAdmin
      .from('platform_users')
      .select('id, email, business_id, role, password_hash, full_name')
      .eq('email', ownerEmail)
      .single();

    if (platformError || !platformUser) {
      console.error('❌ Usuário não encontrado em platform_users');
      console.error('Erro:', platformError);
      return;
    }

    console.log('✅ Usuário encontrado em platform_users');
    console.log('📋 Email:', platformUser.email);
    console.log('📋 Nome:', platformUser.full_name);
    console.log('');

    if (platformUser.password_hash) {
      console.error('⚠️ Usuário já completou onboarding (já tem senha)');
      return;
    }

    // 2. Gerar link de recovery (funciona como invite para usuários sem senha)
    console.log('🔗 Gerando link de ativação...\n');
    
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: ownerEmail,
      options: {
        redirectTo: 'https://www.criadores.app/onboarding'
      }
    });

    if (error) {
      console.error('❌ Erro ao gerar link:', error);
      return;
    }

    console.log('✅ Link gerado com sucesso!');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📧 LINK DE ATIVAÇÃO PARA GUSTAVO CALIANI:');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log(data.properties.action_link);
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('💡 INSTRUÇÕES:');
    console.log('   1. Copie o link acima');
    console.log('   2. Envie para o email: gustavucaliani@gmail.com');
    console.log('   3. Peça para o usuário clicar no link');
    console.log('   4. O usuário deve criar uma senha');
    console.log('   5. Após criar a senha, o login será automático');
    console.log('');
    console.log('⚠️ IMPORTANTE:');
    console.log('   - O link expira em 1 hora');
    console.log('   - O link pode ser usado múltiplas vezes até criar a senha');
    console.log('   - Após criar a senha, o link expira');
    console.log('');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

generateRecoveryLink();

