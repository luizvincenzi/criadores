import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

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

// Cliente normal para operações não-admin
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    console.log('🔐 [Activate Account] Iniciando ativação de conta');

    // Validações
    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token e senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'A senha deve ter no mínimo 8 caracteres' },
        { status: 400 }
      );
    }

    // 1. Buscar e validar token
    const { data: activationToken, error: tokenError } = await supabaseAdmin
      .from('activation_tokens')
      .select('*')
      .eq('token', token)
      .single();

    if (tokenError || !activationToken) {
      console.error('❌ [Activate Account] Token não encontrado:', tokenError);
      return NextResponse.json(
        { success: false, error: 'Token inválido ou expirado' },
        { status: 404 }
      );
    }

    // 2. Verificar se o token já foi usado
    if (activationToken.used_at) {
      console.log('⚠️ [Activate Account] Token já foi usado');
      return NextResponse.json(
        { success: false, error: 'Este link já foi usado' },
        { status: 400 }
      );
    }

    // 3. Buscar usuário
    const { data: platformUser, error: userError } = await supabaseAdmin
      .from('platform_users')
      .select('*')
      .eq('id', activationToken.user_id)
      .single();

    if (userError || !platformUser) {
      console.error('❌ [Activate Account] Usuário não encontrado:', userError);
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    const email = platformUser.email;
    console.log('📧 [Activate Account] Email:', email);

    // 4. Verificar se já tem senha
    if (platformUser.password_hash) {
      console.log('⚠️ [Activate Account] Usuário já tem senha');
      
      // Marcar token como usado
      await supabaseAdmin
        .from('activation_tokens')
        .update({ used_at: new Date().toISOString() })
        .eq('token', token);

      return NextResponse.json(
        { success: false, error: 'Sua conta já está ativa. Faça login normalmente.' },
        { status: 400 }
      );
    }

    // 5. Buscar usuário no Supabase Auth
    console.log('🔍 [Activate Account] Buscando usuário no Supabase Auth...');
    
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();

    if (listError) {
      console.error('❌ [Activate Account] Erro ao listar usuários:', listError);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar usuário no sistema de autenticação' },
        { status: 500 }
      );
    }

    const authUser = users?.find(u => u.email === email);

    if (!authUser) {
      console.error('❌ [Activate Account] Usuário não encontrado no Supabase Auth');
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado no sistema de autenticação' },
        { status: 404 }
      );
    }

    const userId = authUser.id;
    console.log('✅ [Activate Account] Usuário encontrado no Supabase Auth:', userId);

    // 6. Atualizar senha no Supabase Auth
    console.log('🔐 [Activate Account] Atualizando senha no Supabase Auth...');

    const { data: authUpdateData, error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: password }
    );

    if (authUpdateError) {
      console.error('❌ [Activate Account] Erro ao atualizar senha no Supabase Auth:', authUpdateError);
      return NextResponse.json(
        {
          success: false,
          error: 'Erro ao atualizar senha no sistema de autenticação',
          details: authUpdateError.message
        },
        { status: 500 }
      );
    }

    console.log('✅ [Activate Account] Senha atualizada no Supabase Auth');

    // 7. Gerar hash bcrypt para platform_users
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log('✅ [Activate Account] Hash gerado com sucesso');

    // 8. Atualizar platform_users
    console.log('💾 [Activate Account] Atualizando platform_users...');

    const { data: updatedUser, error: updateError } = await supabase
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
      console.error('❌ [Activate Account] Erro ao atualizar platform_users:', updateError);
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar dados do usuário' },
        { status: 500 }
      );
    }

    console.log('✅ [Activate Account] platform_users atualizado');

    // 9. Marcar token como usado
    await supabaseAdmin
      .from('activation_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('token', token);

    console.log('✅ [Activate Account] Token marcado como usado');

    // 10. Retornar sucesso
    console.log('🎉 [Activate Account] Conta ativada com sucesso!');

    return NextResponse.json({
      success: true,
      message: 'Conta ativada com sucesso',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        full_name: updatedUser.full_name,
        role: updatedUser.role,
        roles: updatedUser.roles
      }
    });

  } catch (error: any) {
    console.error('❌ [Activate Account] Erro inesperado:', error);
    return NextResponse.json(
      { success: false, error: `Erro interno: ${error?.message || 'Desconhecido'}` },
      { status: 500 }
    );
  }
}

