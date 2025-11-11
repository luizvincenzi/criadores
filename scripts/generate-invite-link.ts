/**
 * Script para gerar link de convite manualmente
 * 
 * Usa o método generateLink do Supabase que gera o link sem enviar email
 * Você pode copiar o link e enviar manualmente para o usuário
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

async function generateInviteLink() {
  const ownerEmail = 'gustavucaliani@gmail.com';
  
  console.log('\n🔗 Gerando link de convite para Gustavo Caliani...\n');

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

    // 3. Gerar link de convite (sem enviar email)
    console.log('🔗 Gerando link de convite...\n');
    
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'invite',
      email: ownerEmail,
      options: {
        redirectTo: 'https://www.criadores.app/auth/callback',
        data: {
          full_name: platformUser.full_name,
          business_id: platformUser.business_id,
          business_name: business?.name || 'Criadores',
          role: 'business_owner',
          entity_type: 'business',
          email_verified: true,
          invited_at: new Date().toISOString()
        }
      }
    });

    if (error) {
      console.error('❌ Erro ao gerar link:', error);
      return;
    }

    console.log('✅ Link gerado com sucesso!');
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('📧 LINK DE CONVITE PARA GUSTAVO CALIANI:');
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
    console.log('   - O link expira em 24 horas');
    console.log('   - O link só pode ser usado UMA vez');
    console.log('   - Após usar, o sistema armazenará a sessão');
    console.log('   - O usuário poderá voltar ao /onboarding até criar a senha');
    console.log('');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

generateInviteLink();

