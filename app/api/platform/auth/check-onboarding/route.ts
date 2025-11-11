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
        { completed: false, error: 'Email é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🔍 [Check Onboarding] Verificando onboarding para:', email);

    // Verificar se o usuário existe e tem senha
    const { data: platformUser, error: platformError } = await supabaseAdmin
      .from('platform_users')
      .select('id, email, password_hash, is_active')
      .eq('email', email)
      .single();

    if (platformError && platformError.code !== 'PGRST116') {
      console.error('❌ [Check Onboarding] Erro ao verificar platform_users:', platformError);
      return NextResponse.json(
        { completed: false, error: 'Erro ao verificar usuário' },
        { status: 500 }
      );
    }

    // Se não encontrou usuário ou não tem senha, onboarding não foi completado
    if (!platformUser || !platformUser.password_hash) {
      console.log('✅ [Check Onboarding] Onboarding não completado');
      return NextResponse.json({
        completed: false,
        message: 'Onboarding pendente'
      });
    }

    // Se tem senha, onboarding foi completado
    console.log('⚠️ [Check Onboarding] Onboarding já completado');
    return NextResponse.json({
      completed: true,
      message: 'Onboarding já completado'
    });

  } catch (error: any) {
    console.error('❌ [Check Onboarding] Erro inesperado:', error);
    return NextResponse.json(
      { completed: false, error: `Erro interno: ${error?.message || 'Desconhecido'}` },
      { status: 500 }
    );
  }
}

