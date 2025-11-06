/**
 * Script para enviar convite para creator
 * 
 * Uso:
 * npm run tsx scripts/invite-creator.ts
 */

import { supabaseAdmin } from '../lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function inviteCreator() {
  // ⚠️ CONFIGURE AQUI OS DADOS DO CREATOR
  const creatorEmail = 'luighidecarliaaugustus@gmail.com';
  const creatorFullName = 'Luigi Carli - TESTE';
  const creatorId = '685c132e-aeb0-41be-9c9a-2f21f6b04c47'; // UUID do creator na tabela creators
  
  console.log('📧 Enviando convite para creator...');
  console.log('📋 Email:', creatorEmail);
  console.log('📋 Nome:', creatorFullName);
  console.log('📋 Creator ID:', creatorId);
  console.log('');

  try {
    // 1. Verificar se o creator existe na tabela creators
    const { data: creator, error: creatorError } = await supabaseAdmin
      .from('creators')
      .select('id, name, email')
      .eq('id', creatorId)
      .single();

    if (creatorError || !creator) {
      console.error('❌ Creator não encontrado na tabela creators');
      console.error('Erro:', creatorError);
      return;
    }

    console.log('✅ Creator encontrado:', creator.name);
    console.log('');

    // 2. Verificar se já existe um usuário com este email
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from('platform_users')
      .select('id, email, role')
      .eq('email', creatorEmail.toLowerCase())
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    if (existingUser) {
      console.log('⚠️ Usuário já existe em platform_users');
      console.log('📋 ID:', existingUser.id);
      console.log('📋 Email:', existingUser.email);
      console.log('📋 Role:', existingUser.role);
      console.log('');
      console.log('💡 Se quiser reenviar o convite, delete o usuário primeiro ou use reset de senha');
      return;
    }

    // 3. Enviar convite via Supabase Auth
    console.log('📧 Enviando convite via Supabase Auth...');
    
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      creatorEmail,
      {
        redirectTo: 'https://www.criadores.app/auth/callback',
        data: {
          full_name: creatorFullName,
          creator_id: creatorId,
          role: 'creator',
          entity_type: 'creator',
          email_verified: true,
          invited_at: new Date().toISOString()
        }
      }
    );

    if (inviteError) {
      console.error('❌ Erro ao enviar convite:', inviteError);
      return;
    }

    console.log('✅ Convite enviado com sucesso!');
    console.log('📋 User ID:', inviteData.user.id);
    console.log('📋 Email:', inviteData.user.email);
    console.log('');
    console.log('📧 O creator receberá um email com o link de convite');
    console.log('🔗 O link redirecionará para: https://www.criadores.app/auth/callback');
    console.log('');
    console.log('⚠️ IMPORTANTE: Certifique-se de que a Redirect URL está configurada no Supabase Dashboard:');
    console.log('   Authentication → URL Configuration → Redirect URLs');
    console.log('   Adicione: https://www.criadores.app/auth/callback');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

// Executar
inviteCreator();

