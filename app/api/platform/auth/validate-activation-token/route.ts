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
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Token é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🔍 [Validate Token] Validando token:', token);

    // 1. Buscar token no banco
    const { data: activationToken, error: tokenError } = await supabaseAdmin
      .from('activation_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !activationToken) {
      console.error('❌ [Validate Token] Token não encontrado:', tokenError);
      return NextResponse.json(
        { valid: false, error: 'Token inválido ou expirado' },
        { status: 404 }
      );
    }

    // 2. Verificar se o token já foi usado
    if (activationToken.used_at) {
      console.log('⚠️ [Validate Token] Token já foi usado em:', activationToken.used_at);
      return NextResponse.json(
        { valid: false, error: 'Este link já foi usado. Sua conta já está ativa.' },
        { status: 400 }
      );
    }

    // 3. Verificar se o token expirou (se tiver data de expiração)
    if (activationToken.expires_at) {
      const expiresAt = new Date(activationToken.expires_at);
      const now = new Date();

      if (now > expiresAt) {
        console.log('⚠️ [Validate Token] Token expirado em:', activationToken.expires_at);
        return NextResponse.json(
          { valid: false, error: 'Este link expirou. Solicite um novo link.' },
          { status: 400 }
        );
      }
    }

    // 4. Buscar dados do usuário
    const { data: platformUser, error: userError } = await supabaseAdmin
      .from('platform_users')
      .select('id, email, full_name, business_id, creator_id, role, password_hash')
      .eq('id', activationToken.user_id)
      .single();

    if (userError || !platformUser) {
      console.error('❌ [Validate Token] Usuário não encontrado:', userError);
      return NextResponse.json(
        { valid: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // 5. Verificar se o usuário já tem senha
    if (platformUser.password_hash) {
      console.log('⚠️ [Validate Token] Usuário já tem senha');
      
      // Marcar token como usado
      await supabaseAdmin
        .from('activation_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('token', token);

      return NextResponse.json(
        { valid: false, error: 'Sua conta já está ativa. Faça login normalmente.' },
        { status: 400 }
      );
    }

    // 6. Buscar dados do business (se houver)
    let businessData = null;
    if (platformUser.business_id) {
      const { data: business } = await supabaseAdmin
        .from('businesses')
        .select('id, name')
        .eq('id', platformUser.business_id)
        .single();

      businessData = business;
    }

    // 7. Buscar dados do creator (se houver)
    let creatorData = null;
    if (platformUser.creator_id) {
      const { data: creator } = await supabaseAdmin
        .from('creators')
        .select('id, name')
        .eq('id', platformUser.creator_id)
        .single();

      creatorData = creator;
    }

    console.log('✅ [Validate Token] Token válido para:', platformUser.email);

    // 8. Retornar dados do usuário
    return NextResponse.json({
      valid: true,
      user: {
        email: platformUser.email,
        fullName: platformUser.full_name,
        businessName: businessData?.name || '',
        businessId: platformUser.business_id || '',
        creatorId: platformUser.creator_id || '',
        role: platformUser.role,
        entityType: platformUser.creator_id ? 'creator' : 'business'
      }
    });

  } catch (error: any) {
    console.error('❌ [Validate Token] Erro inesperado:', error);
    return NextResponse.json(
      { valid: false, error: `Erro interno: ${error?.message || 'Desconhecido'}` },
      { status: 500 }
    );
  }
}

