/**
 * Script para gerar link mágico que funciona IMEDIATAMENTE
 * 
 * Cria um link que vai direto para /onboarding com tokens no hash
 * Não depende de deploy ou configurações do Supabase
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

async function generateMagicLink(emailParam?: string) {
  const ownerEmail = emailParam || process.argv[2] || 'gustavucaliani@gmail.com';
  
  console.log(`\n🪄 Gerando link mágico para ${ownerEmail}...\n`);

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

    // 2. Buscar o business
    const { data: business } = await supabaseAdmin
      .from('businesses')
      .select('id, name')
      .eq('id', platformUser.business_id)
      .single();

    // 3. Buscar usuário no Supabase Auth para pegar os tokens
    console.log('🔍 Buscando tokens do usuário no Supabase Auth...\n');
    
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError);
      return;
    }

    const authUser = users?.find(u => u.email === ownerEmail);

    if (!authUser) {
      console.error('❌ Usuário não encontrado no Supabase Auth');
      console.log('💡 Execute o script invite-business-owner.ts primeiro');
      return;
    }

    console.log('✅ Usuário encontrado no Supabase Auth');
    console.log('📋 Auth ID:', authUser.id);
    console.log('');

    // 4. Gerar tokens de acesso usando o Admin API
    console.log('🔑 Gerando tokens de acesso...\n');
    
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: ownerEmail,
      options: {
        redirectTo: 'https://www.criadores.app/onboarding'
      }
    });

    if (linkError) {
      console.error('❌ Erro ao gerar link:', linkError);
      
      // Tentar com recovery como fallback
      console.log('\n🔄 Tentando com recovery link...\n');
      
      const { data: recoveryData, error: recoveryError } = await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: ownerEmail,
        options: {
          redirectTo: 'https://www.criadores.app/auth/callback'
        }
      });

      if (recoveryError) {
        console.error('❌ Erro ao gerar recovery link:', recoveryError);
        return;
      }

      console.log('✅ Recovery link gerado com sucesso!');
      console.log('');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log(`📧 LINK DE ATIVAÇÃO PARA ${ownerEmail.toUpperCase()}:`);
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('');
      console.log(recoveryData.properties.action_link);
      console.log('');
      console.log('═══════════════════════════════════════════════════════════════');
      console.log('');
      console.log('💡 INSTRUÇÕES:');
      console.log('   1. Copie o link acima');
      console.log(`   2. Envie para o email: ${ownerEmail}`);
      console.log('   3. Peça para o usuário clicar no link');
      console.log('   4. O usuário deve criar uma senha');
      console.log('   5. Após criar a senha, o login será automático');
      console.log('');
      console.log('⚠️ IMPORTANTE:');
      console.log('   - O link expira em 1 hora');
      console.log('   - Aguarde o deploy antes de enviar');
      console.log('');
      return;
    }

    console.log('✅ Link mágico gerado com sucesso!');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`📧 LINK MÁGICO PARA ${ownerEmail.toUpperCase()}:`);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log(linkData.properties.action_link);
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('💡 INSTRUÇÕES:');
    console.log('   1. Copie o link acima');
    console.log(`   2. Envie para o email: ${ownerEmail}`);
    console.log('   3. Peça para o usuário clicar no link');
    console.log('   4. O usuário deve criar uma senha');
    console.log('   5. Após criar a senha, o login será automático');
    console.log('');
    console.log('⚠️ IMPORTANTE:');
    console.log('   - O link expira em 1 hora');
    console.log('   - O link funciona IMEDIATAMENTE (não precisa aguardar deploy)');
    console.log('   - O link pode ser usado múltiplas vezes até criar a senha');
    console.log('');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

generateMagicLink();

