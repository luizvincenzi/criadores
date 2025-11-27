import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

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
    const { email, password } = await request.json();

    console.log('🔐 [Update Password Hash] Iniciando atualização para:', email);

    // Validações
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'A senha deve ter no mínimo 8 caracteres' },
        { status: 400 }
      );
    }

    // 1. Buscar usuário em platform_users
    const { data: platformUser, error: userError } = await supabaseAdmin
      .from('platform_users')
      .select('id, email, full_name')
      .eq('email', email)
      .single();

    if (userError || !platformUser) {
      console.error('❌ [Update Password Hash] Usuário não encontrado:', userError);
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    console.log('✅ [Update Password Hash] Usuário encontrado:', platformUser.id);

    // 2. Gerar hash bcrypt
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('✅ [Update Password Hash] Hash bcrypt gerado');

    // 3. Atualizar platform_users
    const { data: updatedUser, error: updateError } = await supabaseAdmin
      .from('platform_users')
      .update({
        password_hash: passwordHash,
        is_active: true,
        email_verified: true,
        last_password_change: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', platformUser.id)
      .select()
      .single();

    if (updateError) {
      console.error('❌ [Update Password Hash] Erro ao atualizar:', updateError);
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar senha' },
        { status: 500 }
      );
    }

    console.log('✅ [Update Password Hash] platform_users atualizado com sucesso!');

    // 4. Invalidar tokens de ativação existentes (se houver)
    try {
      await supabaseAdmin
        .from('activation_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('email', email)
        .is('used_at', null);

      console.log('✅ [Update Password Hash] Tokens de ativação invalidados');
    } catch (err) {
      console.warn('⚠️ [Update Password Hash] Erro ao invalidar tokens (não crítico):', err);
    }

    return NextResponse.json({
      success: true,
      message: 'Senha atualizada com sucesso'
    });

  } catch (error: any) {
    console.error('❌ [Update Password Hash] Erro inesperado:', error);
    return NextResponse.json(
      { success: false, error: `Erro interno: ${error?.message || 'Desconhecido'}` },
      { status: 500 }
    );
  }
}

