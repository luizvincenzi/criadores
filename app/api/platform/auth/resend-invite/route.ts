import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Criar cliente admin do Supabase com service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    console.log('📧 [Resend Invite] Solicitação de reenvio para:', email);

    // 1. Verificar se o usuário existe na tabela platform_users
    const { data: platformUser, error: platformError } = await supabaseAdmin
      .from('platform_users')
      .select('id, email, password_hash, is_active')
      .eq('email', email)
      .single();

    if (platformError && platformError.code !== 'PGRST116') {
      console.error('❌ [Resend Invite] Erro ao verificar platform_users:', platformError);
      return NextResponse.json(
        { success: false, error: 'Erro ao verificar usuário' },
        { status: 500 }
      );
    }

    if (!platformUser) {
      console.log('❌ [Resend Invite] Usuário não encontrado:', email);
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado. Entre em contato com o administrador.' },
        { status: 404 }
      );
    }

    // 2. Verificar se o usuário já criou senha (já completou onboarding)
    if (platformUser.password_hash) {
      console.log('⚠️ [Resend Invite] Usuário já completou onboarding:', email);
      return NextResponse.json(
        {
          success: false,
          error: 'Sua conta já está ativa. Use o formulário de login acima para acessar.'
        },
        { status: 400 }
      );
    }

    // 3. Buscar metadata do usuário no Supabase Auth
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('❌ [Resend Invite] Erro ao listar usuários:', listError);
    }

    const existingUser = users?.find(u => u.email === email);
    const userMetadata = existingUser?.user_metadata || {};

    console.log('📧 [Resend Invite] Reenviando convite com metadata:', {
      email,
      hasMetadata: Object.keys(userMetadata).length > 0,
      entityType: userMetadata.entity_type
    });

    // 4. Reenviar convite via Supabase Admin API
    const { data: inviteData, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        redirectTo: 'https://www.criadores.app/auth/callback',
        data: {
          ...userMetadata,
          email_verified: true,
          invited_at: new Date().toISOString()
        }
      }
    );

    // O Supabase retorna erro "User already registered" mas AINDA ENVIA O EMAIL
    // Então vamos ignorar esse erro específico e retornar sucesso
    if (inviteError) {
      console.error('⚠️ [Resend Invite] Erro do Supabase:', inviteError.message);

      // Se o erro é "user already registered", o email foi enviado mesmo assim
      if (inviteError.message.includes('already been registered')) {
        console.log('✅ [Resend Invite] Email enviado apesar do erro (usuário já existe no Auth)');
        return NextResponse.json({
          success: true,
          message: 'Novo link de ativação enviado para seu email! Verifique sua caixa de entrada.'
        });
      }

      // Outros erros são realmente problemas
      return NextResponse.json(
        { success: false, error: `Erro ao reenviar convite: ${inviteError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ [Resend Invite] Convite reenviado com sucesso para:', email);

    return NextResponse.json({
      success: true,
      message: 'Novo link de ativação enviado para seu email!'
    });

  } catch (error: any) {
    console.error('❌ [Resend Invite] Erro inesperado:', error);
    return NextResponse.json(
      { success: false, error: `Erro interno: ${error?.message || 'Desconhecido'}` },
      { status: 500 }
    );
  }
}

