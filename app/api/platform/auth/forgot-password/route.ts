import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Rate limiting simples (em memória)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const key = email.toLowerCase();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + 60 * 60 * 1000 }); // 1 hora
    return true;
  }

  if (entry.count >= 3) {
    return false; // Max 3 por hora
  }

  entry.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Email inválido' },
        { status: 400 }
      );
    }

    // Rate limiting
    if (!checkRateLimit(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Muitas tentativas. Aguarde 1 hora antes de tentar novamente.' },
        { status: 429 }
      );
    }

    console.log('[Forgot Password] Solicitação para:', normalizedEmail);

    // Verificar se o usuário existe em platform_users (ativo)
    const { data: platformUser, error: userError } = await supabaseAdmin
      .from('platform_users')
      .select('id, email, full_name, is_active, password_hash')
      .eq('email', normalizedEmail)
      .eq('organization_id', DEFAULT_ORG_ID)
      .single();

    // SEGURANCA: Sempre retornar sucesso mesmo se email não existe
    // para evitar enumeração de emails
    if (userError || !platformUser) {
      console.log('[Forgot Password] Email não encontrado (retornando sucesso para segurança):', normalizedEmail);
      return NextResponse.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.'
      });
    }

    // Verificar se o usuário está ativo
    if (!platformUser.is_active) {
      console.log('[Forgot Password] Usuário inativo (retornando sucesso para segurança):', normalizedEmail);
      return NextResponse.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.'
      });
    }

    // Verificar se o usuário tem senha definida (já completou onboarding)
    if (!platformUser.password_hash) {
      console.log('[Forgot Password] Usuário sem senha (nunca fez onboarding):', normalizedEmail);
      // Retornar mensagem genérica por segurança
      return NextResponse.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.'
      });
    }

    // Verificar se existe um auth user no Supabase para esse email
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 1
    });

    // Buscar o auth user pelo email
    let authUser = null;
    if (!authError && authUsers?.users) {
      authUser = authUsers.users.find(u => u.email?.toLowerCase() === normalizedEmail);
    }

    // Se não tiver auth user, criar um via invite (para poder usar resetPasswordForEmail)
    if (!authUser) {
      console.log('[Forgot Password] Criando auth user para:', normalizedEmail);

      // Usar signUp para criar o auth user (com senha temporária)
      const { data: signUpData, error: signUpError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        email_confirm: true,
        user_metadata: {
          full_name: platformUser.full_name,
          entity_type: 'platform_user'
        }
      });

      if (signUpError) {
        // Se o usuário já existe no auth, é ok
        if (!signUpError.message?.includes('already been registered')) {
          console.error('[Forgot Password] Erro ao criar auth user:', signUpError);
        }
      }
    }

    // Enviar email de recuperação via Supabase Auth
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.criadores.app';

    const { error: resetError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: normalizedEmail,
      options: {
        redirectTo: `${appUrl}/auth/callback`
      }
    });

    if (resetError) {
      console.error('[Forgot Password] Erro ao gerar link de recuperação:', resetError);

      // Fallback: tentar resetPasswordForEmail
      const { error: fallbackError } = await supabaseAdmin.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo: `${appUrl}/auth/callback`
        }
      );

      if (fallbackError) {
        console.error('[Forgot Password] Erro no fallback:', fallbackError);
        // Ainda assim retornar sucesso por segurança
        return NextResponse.json({
          success: true,
          message: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.'
        });
      }
    }

    console.log('[Forgot Password] Link de recuperação enviado para:', normalizedEmail);

    return NextResponse.json({
      success: true,
      message: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.'
    });

  } catch (error: any) {
    console.error('[Forgot Password] Erro inesperado:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno. Tente novamente mais tarde.' },
      { status: 500 }
    );
  }
}
