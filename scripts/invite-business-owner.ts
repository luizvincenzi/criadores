/**
 * Script para enviar convite para business owner
 * 
 * Uso:
 * npm run tsx scripts/invite-business-owner.ts
 */

import { supabaseAdmin } from '../lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function inviteBusinessOwner() {
  // ⚠️ CONFIGURE AQUI OS DADOS DO BUSINESS OWNER
  const ownerEmail = 'owner@example.com';
  const ownerFullName = 'Nome do Business Owner';
  const businessId = 'uuid-do-business'; // UUID do business na tabela businesses
  
  console.log('📧 Enviando convite para business owner...');
  console.log('📋 Email:', ownerEmail);
  console.log('📋 Nome:', ownerFullName);
  console.log('📋 Business ID:', businessId);
  console.log('');

  try {
    // 1. Verificar se o business existe na tabela businesses
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('id, name, email')
      .eq('id', businessId)
      .single();

    if (businessError || !business) {
      console.error('❌ Business não encontrado na tabela businesses');
      console.error('Erro:', businessError);
      return;
    }

    console.log('✅ Business encontrado:', business.name);
    console.log('');

    // 2. Verificar se já existe um usuário com este email
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from('platform_users')
      .select('id, email, role')
      .eq('email', ownerEmail.toLowerCase())
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
      ownerEmail,
      {
        redirectTo: 'https://www.criadores.app/auth/callback',
        data: {
          full_name: ownerFullName,
          business_name: business.name,
          business_id: businessId,
          role: 'business_owner',
          entity_type: 'business',
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
    console.log('📧 O business owner receberá um email com o link de convite');
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
inviteBusinessOwner();

