import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPassword } from '@/lib/auth';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validação básica
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('[platform-login] Tentativa de login para:', email);

    // Buscar usuario ativo em platform_users
    const { data: platformUser, error } = await supabase
      .from('platform_users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_active', true)
      .single();

    if (error || !platformUser) {
      console.log('[platform-login] Usuario ativo nao encontrado:', email, error?.code);
      return NextResponse.json(
        { success: false, error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    console.log('[platform-login] Usuario encontrado:', platformUser.email, platformUser.role);

    // Validar senha
    const isValidPassword = await validatePassword(email, password, platformUser);

    if (!isValidPassword) {
      console.log('[platform-login] Senha incorreta para:', email);
      return NextResponse.json(
        { success: false, error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // Atualizar último login
    await supabase
      .from('platform_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', platformUser.id);

    console.log('[platform-login] Login ok:', email, platformUser.role);

    // Retornar dados do usuário (formato compatível com authStore)
    return NextResponse.json({
      success: true,
      user: {
        id: platformUser.id,
        email: platformUser.email,
        full_name: platformUser.full_name,
        role: platformUser.role, // Role principal
        roles: platformUser.roles, // Array de roles
        business_id: platformUser.business_id,
        creator_id: platformUser.creator_id,
        managed_businesses: platformUser.managed_businesses || [],
        permissions: platformUser.permissions || [],
        is_active: platformUser.is_active,
        organization: platformUser.organization,
        platform: platformUser.platform,
        last_login: platformUser.last_login
      }
    });

  } catch (error) {
    console.error('[platform-login] Erro na API de login:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Validacao de senha via bcrypt
 */
async function validatePassword(email: string, password: string, user: any): Promise<boolean> {
  try {
    if (!user.password_hash) {
      console.log(`[platform-login] Usuario sem password_hash: ${email}`);
      return false;
    }

    const isValid = await verifyPassword(password, user.password_hash);
    console.log(`[platform-login] Validacao bcrypt para ${email}: ${isValid ? 'ok' : 'falhou'}`);
    return isValid;
  } catch (error) {
    console.error(`[platform-login] Erro ao validar senha para ${email}:`, error);
    return false;
  }
}

