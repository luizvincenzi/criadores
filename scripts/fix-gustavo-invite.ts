/**
 * Script para corrigir o convite do Gustavo
 * 
 * Problema: O Supabase não está enviando email porque o usuário já existe no Auth
 * Solução: Deletar do Auth e recriar
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

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

async function fixGustavoInvite() {
  const ownerEmail = 'gustavucaliani@gmail.com';
  
  console.log('\n🔧 Corrigindo convite para Gustavo Caliani...\n');

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
    console.log('📋 ID:', platformUser.id);
    console.log('📋 Email:', platformUser.email);
    console.log('📋 Nome:', platformUser.full_name);
    console.log('📋 Role:', platformUser.role);
    console.log('📋 Business ID:', platformUser.business_id);
    console.log('📋 Tem senha:', platformUser.password_hash ? 'Sim' : 'Não');
    console.log('');

    if (platformUser.password_hash) {
      console.error('⚠️ Usuário já completou onboarding (já tem senha)');
      console.error('💡 Use reset de senha em vez de reenviar convite');
      return;
    }

    // 2. Buscar o business
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .select('id, name')
      .eq('id', platformUser.business_id)
      .single();

    if (businessError || !business) {
      console.error('❌ Business não encontrado');
      console.error('Erro:', businessError);
      return;
    }

    console.log('✅ Business encontrado:', business.name);
    console.log('');

    // 3. Buscar usuário no Supabase Auth
    console.log('🔍 Buscando usuário no Supabase Auth...\n');
    
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Erro ao listar usuários:', listError);
      return;
    }

    const existingAuthUser = users?.find(u => u.email === ownerEmail);

    if (existingAuthUser) {
      console.log('⚠️ Usuário encontrado no Supabase Auth');
      console.log('📋 Auth ID:', existingAuthUser.id);
      console.log('📋 Email confirmado:', existingAuthUser.email_confirmed_at ? 'Sim' : 'Não');
      console.log('📋 Último login:', existingAuthUser.last_sign_in_at || 'Nunca');
      console.log('');

      // Deletar do Auth para poder reenviar convite
      console.log('🗑️ Deletando usuário do Supabase Auth...\n');
      
      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(existingAuthUser.id);

      if (deleteError) {
        console.error('❌ Erro ao deletar usuário:', deleteError);
        return;
      }

      console.log('✅ Usuário deletado do Supabase Auth');
      console.log('');
    } else {
      console.log('ℹ️ Usuário não encontrado no Supabase Auth (isso é OK)');
      console.log('');
    }

    // 4. Reenviar convite
    console.log('📧 Enviando novo convite...\n');
    
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      ownerEmail,
      {
        redirectTo: 'https://www.criadores.app/auth/callback',
        data: {
          full_name: platformUser.full_name,
          business_id: platformUser.business_id,
          business_name: business.name,
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
    console.log('📧 Email enviado para:', ownerEmail);
    console.log('🔗 O usuário receberá um link de ativação');
    console.log('');
    console.log('💡 Instruções para o usuário:');
    console.log('   1. Verificar a caixa de entrada (e spam)');
    console.log('   2. Clicar no link do email');
    console.log('   3. Criar uma senha');
    console.log('   4. Fazer login');
    console.log('');
    console.log('🎉 Pronto! O convite foi reenviado com sucesso!');
    console.log('');

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

fixGustavoInvite();

