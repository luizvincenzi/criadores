import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { Resend } from 'resend';

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

const resend = new Resend(process.env.RESEND_API_KEY);

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
    if (userError || !platformUser) {
      console.log('[Forgot Password] Email não encontrado (retornando sucesso para segurança):', normalizedEmail);
      return NextResponse.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.'
      });
    }

    if (!platformUser.is_active) {
      console.log('[Forgot Password] Usuário inativo:', normalizedEmail);
      return NextResponse.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.'
      });
    }

    if (!platformUser.password_hash) {
      console.log('[Forgot Password] Usuário sem senha (nunca fez onboarding):', normalizedEmail);
      return NextResponse.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.'
      });
    }

    // Garantir que existe um auth user no Supabase para esse email
    let authUserExists = false;

    try {
      let page = 1;
      while (!authUserExists && page <= 10) {
        const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({
          page,
          perPage: 100
        });

        if (listError || !listData?.users?.length) break;

        const matchingUser = listData.users.find(
          u => u.email?.toLowerCase() === normalizedEmail
        );

        if (matchingUser) {
          authUserExists = true;
          console.log('[Forgot Password] Auth user encontrado:', matchingUser.id);
        }

        if (listData.users.length < 100) break;
        page++;
      }
    } catch (err) {
      console.warn('[Forgot Password] Erro ao buscar auth user:', err);
    }

    // Se não tiver auth user, criar um
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
        if (createError.message?.includes('already been registered') ||
            createError.message?.includes('already exists')) {
          console.log('[Forgot Password] Auth user já existe (ok)');
        } else {
          console.error('[Forgot Password] Erro ao criar auth user:', createError);
        }
      }
    }

    // Gerar link de recuperação via generateLink (gera o token mas NÃO envia email)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://criadores.app';
    const redirectUrl = `${appUrl}/auth/callback`;

    console.log('[Forgot Password] Gerando link de recuperação...');

    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email: normalizedEmail,
      options: {
        redirectTo: redirectUrl
      }
    });

    if (linkError || !linkData) {
      console.error('[Forgot Password] Erro ao gerar link:', linkError);
      return NextResponse.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.'
      });
    }

    // Extrair o link de ação
    const recoveryLink = linkData.properties?.action_link;

    if (!recoveryLink) {
      console.error('[Forgot Password] Link de recuperação vazio:', JSON.stringify(linkData));
      return NextResponse.json({
        success: true,
        message: 'Se o email estiver cadastrado, você receberá um link para redefinir sua senha.'
      });
    }

    console.log('[Forgot Password] Link gerado, enviando email via Resend...');

    // Enviar email via Resend (mesmo serviço usado para convites - funciona!)
    const userName = platformUser.full_name || normalizedEmail.split('@')[0];

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: 'crIAdores <noreply@criadores.digital>',
      to: [normalizedEmail],
      subject: 'Redefinição de senha - crIAdores',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
          <div style="max-width: 560px; margin: 0 auto; background: white; border-radius: 16px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">

            <!-- Header -->
            <div style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #f0f0f0;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 300; color: #999; letter-spacing: -0.5px;">
                cr<span style="font-weight: 700; color: #111;">IA</span>dores
              </h1>
            </div>

            <!-- Content -->
            <div style="padding: 32px;">
              <h2 style="color: #111; margin: 0 0 16px; font-size: 20px; font-weight: 600;">
                Ol\u00e1, ${userName}
              </h2>

              <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
                Recebemos uma solicita\u00e7\u00e3o para redefinir a senha da sua conta na plataforma crIAdores.
              </p>

              <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
                Clique no bot\u00e3o abaixo para criar uma nova senha:
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 28px 0;">
                <a href="${recoveryLink}"
                   style="display: inline-block; background-color: #007AFF; color: white; padding: 14px 36px; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 15px; letter-spacing: 0.2px;">
                  Redefinir minha senha
                </a>
              </div>

              <p style="color: #999; font-size: 13px; line-height: 1.5; margin: 24px 0 0;">
                Este link expira em 1 hora. Se voc\u00ea n\u00e3o solicitou a redefini\u00e7\u00e3o de senha, ignore este email \u2014 sua conta permanece segura.
              </p>
            </div>

            <!-- Footer -->
            <div style="background: #fafafa; padding: 20px 32px; text-align: center; border-top: 1px solid #f0f0f0;">
              <p style="color: #bbb; font-size: 12px; margin: 0;">
                \u00a9 ${new Date().getFullYear()} crIAdores \u00b7 Plataforma de Criadores
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    });

    if (emailError) {
      console.error('[Forgot Password] Erro ao enviar email via Resend:', emailError);

      // Fallback: tentar resetPasswordForEmail do Supabase
      console.log('[Forgot Password] Tentando fallback via Supabase mailer...');

      const { error: fallbackError } = await supabaseAdmin.auth.resetPasswordForEmail(
        normalizedEmail,
        { redirectTo: redirectUrl }
      );

      if (fallbackError) {
        console.error('[Forgot Password] Fallback também falhou:', fallbackError);
      } else {
        console.log('[Forgot Password] Email enviado via fallback Supabase');
      }
    } else {
      console.log('[Forgot Password] Email enviado com sucesso via Resend! ID:', emailData?.id);
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
