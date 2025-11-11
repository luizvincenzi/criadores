import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    const supabase = createClient();

    // 1. Verificar se o usuário existe no Supabase Auth
    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ [Resend Invite] Erro ao listar usuários:', listError);
      return NextResponse.json(
        { success: false, error: 'Erro ao verificar usuário' },
        { status: 500 }
      );
    }

    const existingUser = users?.find(u => u.email === email);

    if (!existingUser) {
      console.log('❌ [Resend Invite] Usuário não encontrado:', email);
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado. Entre em contato com o administrador.' },
        { status: 404 }
      );
    }

    // 2. Verificar se o usuário já criou senha (já completou onboarding)
    const { data: platformUser, error: platformError } = await supabase
      .from('platform_users')
      .select('id, email, password_hash, is_active')
      .eq('email', email)
      .single();

    if (platformError && platformError.code !== 'PGRST116') {
      console.error('❌ [Resend Invite] Erro ao verificar platform_users:', platformError);
    }

    // Se já tem senha, não precisa reenviar convite
    if (platformUser && platformUser.password_hash) {
      console.log('⚠️ [Resend Invite] Usuário já completou onboarding:', email);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Sua conta já está ativa. Use o formulário de login acima para acessar.' 
        },
        { status: 400 }
      );
    }

    // 3. Buscar informações do usuário para reenviar convite com metadata correto
    const userMetadata = existingUser.user_metadata || {};
    
    console.log('📧 [Resend Invite] Reenviando convite com metadata:', userMetadata);

    // 4. Reenviar convite via Supabase Admin API
    const { data: inviteData, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
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

    if (inviteError) {
      console.error('❌ [Resend Invite] Erro ao reenviar convite:', inviteError);
      return NextResponse.json(
        { success: false, error: 'Erro ao reenviar convite. Tente novamente mais tarde.' },
        { status: 500 }
      );
    }

    console.log('✅ [Resend Invite] Convite reenviado com sucesso para:', email);

    return NextResponse.json({
      success: true,
      message: 'Novo link de ativação enviado para seu email!'
    });

  } catch (error) {
    console.error('❌ [Resend Invite] Erro inesperado:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

