import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

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

// Rate limiting simples para resend-invite (max 5 por email por hora)
const resendLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkResendLimit(email: string): boolean {
  const now = Date.now();
  const record = resendLimitMap.get(email);

  if (!record || now > record.resetTime) {
    resendLimitMap.set(email, { count: 1, resetTime: now + 60 * 60 * 1000 }); // 1h
    return true;
  }

  if (record.count >= 5) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Generate a permanent activation token for a platform_user.
 * Invalidates any previous unused tokens for the same email.
 * Returns the token string or null on failure.
 */
async function generatePermanentToken(email: string, userId: string): Promise<string | null> {
  try {
    // Invalidate previous unused tokens
    await supabaseAdmin
      .from('activation_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('email', email)
      .is('used_at', null);

    // Create new permanent token
    const token = randomUUID();
    const { error: insertError } = await supabaseAdmin
      .from('activation_tokens')
      .insert([{
        email,
        token,
        user_id: userId,
        expires_at: null, // NULL = never expires until used
        used_at: null
      }]);

    if (insertError) {
      console.error('❌ [Resend Invite] Erro ao criar activation_token:', insertError);
      return null;
    }

    console.log('✅ [Resend Invite] Token permanente criado para:', email);
    return token;
  } catch (err) {
    console.error('❌ [Resend Invite] Erro ao gerar token permanente:', err);
    return null;
  }
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

    // Rate limiting: máximo 5 reenvios por email por hora
    if (!checkResendLimit(normalizedEmail)) {
      console.warn('⚠️ [Resend Invite] Rate limit excedido para:', normalizedEmail);
      return NextResponse.json(
        { success: false, error: 'Muitas tentativas. Aguarde 1 hora antes de tentar novamente.' },
        { status: 429 }
      );
    }

    console.log('📧 [Resend Invite] Solicitação de reenvio para:', normalizedEmail);

    // 1. Verificar se o usuário existe na tabela platform_users
    const { data: platformUser, error: platformError } = await supabaseAdmin
      .from('platform_users')
      .select('id, email, password_hash, is_active, full_name, role, creator_id, business_id')
      .eq('email', normalizedEmail)
      .single();

    if (platformError && platformError.code !== 'PGRST116') {
      console.error('❌ [Resend Invite] Erro ao verificar platform_users:', platformError);
      return NextResponse.json(
        { success: false, error: 'Erro ao verificar usuário' },
        { status: 500 }
      );
    }

    if (!platformUser) {
      console.log('❌ [Resend Invite] Usuário não encontrado:', normalizedEmail);
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado. Entre em contato com o administrador.' },
        { status: 404 }
      );
    }

    // 2. Verificar se o usuário já criou senha (já completou onboarding)
    if (platformUser.password_hash) {
      console.log('⚠️ [Resend Invite] Usuário já completou onboarding:', normalizedEmail);
      return NextResponse.json(
        {
          success: false,
          error: 'Sua conta já está ativa. Use o formulário de login acima para acessar.'
        },
        { status: 400 }
      );
    }

    // 3. Generate a permanent activation token (always works, no expiration)
    const permanentToken = await generatePermanentToken(normalizedEmail, platformUser.id);
    const activationLink = permanentToken
      ? `https://www.criadores.app/activate/${permanentToken}`
      : null;

    console.log('🔑 [Resend Invite] Link permanente gerado:', !!activationLink);

    // 4. Also try Supabase invite (sends email automatically)
    let supabaseEmailSent = false;
    try {
      const { error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
        normalizedEmail,
        {
          redirectTo: 'https://www.criadores.app/auth/callback',
          data: {
            full_name: platformUser.full_name,
            role: platformUser.role,
            creator_id: platformUser.creator_id,
            business_id: platformUser.business_id,
            entity_type: platformUser.creator_id ? 'creator' : 'business',
            email_verified: true,
            invited_at: new Date().toISOString()
          }
        }
      );

      if (inviteError) {
        // "User already registered" still sends the email
        if (inviteError.message.includes('already been registered')) {
          supabaseEmailSent = true;
          console.log('✅ [Resend Invite] Email Supabase enviado (user already registered)');
        } else {
          console.error('⚠️ [Resend Invite] Erro do Supabase invite:', inviteError.message);
        }
      } else {
        supabaseEmailSent = true;
        console.log('✅ [Resend Invite] Email Supabase enviado com sucesso');
      }
    } catch (err) {
      console.error('⚠️ [Resend Invite] Erro ao enviar Supabase invite:', err);
    }

    // 5. Return success with activation link as fallback
    if (supabaseEmailSent) {
      return NextResponse.json({
        success: true,
        message: 'Novo link de ativação enviado para seu email! Verifique sua caixa de entrada e pasta de spam.',
        activationLink // Include permanent link so admin/support can share it if needed
      });
    }

    // Supabase email failed, but we have the permanent token
    if (activationLink) {
      return NextResponse.json({
        success: true,
        message: 'Link de ativação gerado! Se não receber o email, entre em contato com a equipe.',
        activationLink
      });
    }

    // Both methods failed
    return NextResponse.json(
      { success: false, error: 'Erro ao reenviar convite. Tente novamente ou entre em contato via WhatsApp.' },
      { status: 500 }
    );

  } catch (error: any) {
    console.error('❌ [Resend Invite] Erro inesperado:', error);
    return NextResponse.json(
      { success: false, error: `Erro interno: ${error?.message || 'Desconhecido'}` },
      { status: 500 }
    );
  }
}

