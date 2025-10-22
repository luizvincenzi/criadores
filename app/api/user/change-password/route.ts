import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { user_id, user_email, current_password, new_password, confirm_password } = await request.json();

    console.log('🔐 [CHANGE-PASSWORD] Iniciando alteração de senha para:', user_email);

    // Validações básicas
    if (!user_id || !user_email) {
      return NextResponse.json(
        { success: false, error: 'Dados do usuário são obrigatórios' },
        { status: 400 }
      );
    }

    if (!current_password || !new_password || !confirm_password) {
      return NextResponse.json(
        { success: false, error: 'Todos os campos de senha são obrigatórios' },
        { status: 400 }
      );
    }

    if (new_password !== confirm_password) {
      return NextResponse.json(
        { success: false, error: 'A nova senha e a confirmação não coincidem' },
        { status: 400 }
      );
    }

    if (new_password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'A nova senha deve ter pelo menos 6 caracteres' },
        { status: 400 }
      );
    }

    // 🔍 BUSCAR USUÁRIO: Primeiro em platform_users, depois em users
    let user = null;
    let tableName = '';

    // 1️⃣ Tentar em platform_users (creators, strategists, business_owners)
    console.log('🔍 [CHANGE-PASSWORD] Buscando em platform_users...');
    const { data: platformUser, error: platformError } = await supabase
      .from('platform_users')
      .select('id, email, password_hash')
      .eq('id', user_id)
      .eq('email', user_email.toLowerCase())
      .eq('is_active', true)
      .single();

    if (platformUser) {
      user = platformUser;
      tableName = 'platform_users';
      console.log('✅ [CHANGE-PASSWORD] Usuário encontrado em platform_users');
    } else {
      // 2️⃣ Se não encontrar, buscar em users (CRM interno)
      console.log('🔍 [CHANGE-PASSWORD] Buscando em users (CRM)...');
      const { data: internalUser, error: internalError } = await supabase
        .from('users')
        .select('id, email, password_hash')
        .eq('id', user_id)
        .eq('email', user_email.toLowerCase())
        .eq('is_active', true)
        .single();

      if (internalUser) {
        user = internalUser;
        tableName = 'users';
        console.log('✅ [CHANGE-PASSWORD] Usuário encontrado em users');
      }
    }

    if (!user) {
      console.error('❌ [CHANGE-PASSWORD] Usuário não encontrado em nenhuma tabela');
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado' },
        { status: 404 }
      );
    }

    // Verificar senha atual
    console.log('🔐 [CHANGE-PASSWORD] Verificando senha atual...');
    const isValidPassword = await bcrypt.compare(current_password, user.password_hash);
    if (!isValidPassword) {
      console.error('❌ [CHANGE-PASSWORD] Senha atual incorreta');
      return NextResponse.json(
        { success: false, error: 'Senha atual incorreta' },
        { status: 400 }
      );
    }

    // Hash da nova senha
    console.log('🔐 [CHANGE-PASSWORD] Gerando hash da nova senha...');
    const hashedPassword = await bcrypt.hash(new_password, 12);

    // Atualizar senha na tabela correta
    console.log(`💾 [CHANGE-PASSWORD] Atualizando senha na tabela: ${tableName}`);
    const { error: updateError } = await supabase
      .from(tableName)
      .update({
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', user_id);

    if (updateError) {
      console.error('❌ [CHANGE-PASSWORD] Erro ao atualizar senha:', updateError);
      return NextResponse.json(
        { success: false, error: 'Erro ao atualizar senha' },
        { status: 500 }
      );
    }

    console.log('✅ [CHANGE-PASSWORD] Senha alterada com sucesso!');

    return NextResponse.json({
      success: true,
      message: 'Senha alterada com sucesso',
      table: tableName // Para debug
    });

  } catch (error) {
    console.error('❌ [CHANGE-PASSWORD] Erro na API:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}