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
      return NextResponse.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.'
      });
    }

    // Garantir que existe um auth user no Supabase para esse email
    // (necessário para que resetPasswordForEmail funcione)
    let authUserExists = false;

    try {
      // Buscar auth users (listUsers com perPage 1000 para buscar o email)
      // NOTE: listUsers com page/perPage não filtra por email, então usamos um approach diferente
      const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(
        platformUser.id // Tentar com o ID do platform_user (pode não ser o mesmo)
      );

      if (getUserError || !userData?.user) {
        // Tentar buscar por email via listUsers
        console.log('[Forgot Password] Buscando auth user por email...');

        // Usar a API admin para listar e filtrar
        let page = 1;
        let found = false;

        while (!found && page <= 10) {
          const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
            page,
            perPage: 100
          });

          if (listError || !listData?.users?.length) break;

          const matchingUser = listData.users.find(
            u => u.email?.toLowerCase() === normalizedEmail
          );

          if (matchingUser) {
            found = true;
            authUserExists = true;
            console.log('[Forgot Password] Auth user encontrado:', matchingUser.id);
          }

          if (listData.users.length < 100) break; // Última página
          page++;
        }
      } else {
        authUserExists = true;
      }
    } catch (err) {
      console.warn('[Forgot Password] Erro ao buscar auth user:', err);
    }

    // Se não tiver auth user, criar um para poder enviar o email de recuperação
    if (!authUserExists) {
      console.log('[Forgot Password] Criando auth user para:', normalizedEmail);

      const { error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        email_confirm: true,
        user_metadata: {
          full_name: platformUser.full_name,
          entity_type: 'platform_user'
        }
      });

      if (createError) {
        // "User already registered" é ok - significa que o auth user existe
        if (createError.message?.includes('already been registered') ||
            createError.message?.includes('already exists')) {
          console.log('[Forgot Password] Auth user já existe (ok)');
        } else {
          console.error('[Forgot Password] Erro ao criar auth user:', createError);
        }
      } else {
        console.log('[Forgot Password] Auth user criado com sucesso');
      }
    }

    // CORREÇÃO CRÍTICA: Usar resetPasswordForEmail() que REALMENTE ENVIA o email
    // (generateLink() apenas gera o link mas NÃO envia email)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://criadores.app';
    const redirectUrl = `${appUrl}/auth/callback`;

    console.log('[Forgot Password] Enviando email de recuperação via resetPasswordForEmail...');
    console.log('[Forgot Password] Redirect URL:', redirectUrl);

    const { error: resetError } = await supabaseAdmin.auth.resetPasswordForEmail(
      normalizedEmail,
      {
        redirectTo: redirectUrl
      }
    );

    if (resetError) {
      console.error('[Forgot Password] Erro ao enviar email de recuperação:', resetError);
      console.error('[Forgot Password] Error details:', JSON.stringify(resetError));

      // Tentar novamente sem service_role (usando anon key)
      // Alguns projetos Supabase bloqueiam resetPasswordForEmail via service_role
      try {
        const supabaseAnon = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        console.log('[Forgot Password] Tentando fallback com anon key...');

        const { error: fallbackError } = await supabaseAnon.auth.resetPasswordForEmail(
          normalizedEmail,
          {
            redirectTo: redirectUrl
          }
        );

        if (fallbackError) {
          console.error('[Forgot Password] Fallback também falhou:', fallbackError);
        } else {
          console.log('[Forgot Password] Email enviado com sucesso via fallback (anon key)');
        }
      } catch (fallbackErr) {
        console.error('[Forgot Password] Erro no fallback:', fallbackErr);
      }
    } else {
      console.log('[Forgot Password] Email de recuperação enviado com sucesso para:', normalizedEmail);
    }

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
