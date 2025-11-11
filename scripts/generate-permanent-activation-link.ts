/**
 * Script para gerar link de ativação PERMANENTE
 * 
 * - Cria um token que NÃO expira até o usuário criar a senha
 * - NÃO depende de sessão do Supabase
 * - Funciona IMEDIATAMENTE sem aguardar deploy
 * - Pode ser usado múltiplas vezes até criar a senha
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { randomUUID } from 'crypto';

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

async function generatePermanentActivationLink(emailParam?: string) {
  const ownerEmail = emailParam || process.argv[2];
  
  if (!ownerEmail) {
    console.error('❌ Email é obrigatório');
    console.log('💡 Uso: npx tsx scripts/generate-permanent-activation-link.ts <email>');
    return;
  }

  console.log(`\n🔗 Gerando link de ativação PERMANENTE para ${ownerEmail}...\n`);

  try {
    // 1. Buscar o usuário em platform_users
    const { data: platformUser, error: platformError } = await supabaseAdmin
      .from('platform_users')
      .select('id, email, business_id, creator_id, role, password_hash, full_name')
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
    console.log('📋 User ID:', platformUser.id);
    console.log('');

    if (platformUser.password_hash) {
      console.error('⚠️ Usuário já completou onboarding (já tem senha)');
      console.log('💡 Se quiser resetar a senha, use outro script');
      return;
    }

    // 2. Verificar se já existe um token ativo para este usuário
    const { data: existingTokens, error: tokenError } = await supabaseAdmin
      .from('activation_tokens')
      .select('*')
      .eq('email', ownerEmail)
      .is('used_at', null)
      .order('created_at', { ascending: false });

    if (tokenError) {
      console.error('❌ Erro ao verificar tokens existentes:', tokenError);
      // Continuar mesmo assim
    }

    if (existingTokens && existingTokens.length > 0) {
      console.log('⚠️ Já existe um token ativo para este usuário');
      console.log('📋 Token existente:', existingTokens[0].token);
      console.log('📅 Criado em:', existingTokens[0].created_at);
      console.log('');
      console.log('🔄 Vou criar um novo token e invalidar o anterior...');
      console.log('');

      // Marcar tokens antigos como usados
      await supabaseAdmin
        .from('activation_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('email', ownerEmail)
        .is('used_at', null);
    }

    // 3. Gerar novo token permanente
    const token = randomUUID();
    
    console.log('🔑 Gerando novo token permanente...\n');

    const { data: newToken, error: insertError } = await supabaseAdmin
      .from('activation_tokens')
      .insert([{
        email: ownerEmail,
        token: token,
        user_id: platformUser.id,
        expires_at: null, // NULL = nunca expira
        used_at: null
      }])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Erro ao criar token:', insertError);
      return;
    }

    console.log('✅ Token permanente criado com sucesso!');
    console.log('');

    // 4. Gerar URL de ativação
    const activationUrl = `https://www.criadores.app/activate/${token}`;

    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`📧 LINK DE ATIVAÇÃO PERMANENTE PARA ${ownerEmail.toUpperCase()}:`);
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log(activationUrl);
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('');
    console.log('✨ VANTAGENS DESTE LINK:');
    console.log('   ✅ NÃO expira até o usuário criar a senha');
    console.log('   ✅ Pode ser usado MÚLTIPLAS vezes');
    console.log('   ✅ NÃO depende de sessão do Supabase');
    console.log('   ✅ Funciona IMEDIATAMENTE (não precisa aguardar deploy)');
    console.log('   ✅ Mais simples e confiável');
    console.log('');
    console.log('💡 INSTRUÇÕES:');
    console.log('   1. Copie o link acima');
    console.log(`   2. Envie para o email: ${ownerEmail}`);
    console.log('   3. Peça para o usuário clicar no link');
    console.log('   4. O usuário deve criar uma senha');
    console.log('   5. Após criar a senha, o link expira automaticamente');
    console.log('');
    console.log('🔒 SEGURANÇA:');
    console.log('   - Token único e aleatório (UUID)');
    console.log('   - Invalidado automaticamente após uso');
    console.log('   - Vinculado ao email do usuário');
    console.log('');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

generatePermanentActivationLink();

