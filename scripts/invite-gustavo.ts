/**
 * Script para enviar convite para Gustavo Caliani
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

async function inviteGustavo() {
  const ownerEmail = 'gustavucaliani@gmail.com';
  const ownerFullName = 'Gustavo Caliani';
  const businessName = 'Criadores'; // Nome do business

  console.log('\n📧 Enviando convite para Gustavo Caliani...\n');

  try {

    // 2. Verificar se já existe usuário
    const { data: existingUser } = await supabaseAdmin
      .from('platform_users')
      .select('id, email, role, password_hash')
      .eq('email', ownerEmail.toLowerCase())
      .eq('organization_id', DEFAULT_ORG_ID);

    if (existingUser && existingUser.length > 0) {
      console.log('⚠️ Usuário já existe em platform_users');
      console.log('📋 Registros encontrados:', existingUser.length);
      
      for (const user of existingUser) {
        console.log('  - ID:', user.id);
        console.log('    Email:', user.email);
        console.log('    Role:', user.role);
        console.log('    Tem senha:', user.password_hash ? 'Sim' : 'Não');
        console.log('');
      }

      // Se já tem senha, não reenviar
      if (existingUser.some(u => u.password_hash)) {
        console.log('❌ Usuário já completou onboarding. Use reset de senha.');
        return;
      }

      console.log('💡 Reenviando convite para usuário existente...\n');
    } else {
      console.log('✅ Criando novo usuário em platform_users...\n');

      // 3. Criar usuário em platform_users
      const { data: newUser, error: insertError } = await supabaseAdmin
        .from('platform_users')
        .insert([
          {
            organization_id: DEFAULT_ORG_ID,
            email: ownerEmail.toLowerCase(),
            full_name: ownerFullName,
            role: 'business_owner',
            roles: ['business_owner'],
            business_id: businessId,
            is_active: false,
            email_verified: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        ])
        .select()
        .single();

      if (insertError) {
        console.error('❌ Erro ao criar usuário:', insertError);
        return;
      }

      console.log('✅ Usuário criado:', newUser.id);
      console.log('');
    }

    // 4. Enviar convite via Supabase Auth
    console.log('📧 Enviando convite via Supabase Auth...\n');
    
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      ownerEmail,
      {
        redirectTo: 'https://www.criadores.app/auth/callback',
        data: {
          full_name: ownerFullName,
          business_id: businessId,
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

  } catch (error) {
    console.error('❌ Erro inesperado:', error);
  }
}

inviteGustavo();

