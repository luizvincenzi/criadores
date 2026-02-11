import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { verifyPassword } from '@/lib/auth';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Endpoint de login para usuários da tabela `users` (CRM interno).
 *
 * SEGURANCA: Apenas autenticação via bcrypt password_hash.
 * Senhas hardcoded foram REMOVIDAS em Fev/2026 por vulnerabilidade crítica.
 * Todos os usuários devem ter password_hash definido.
 */
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validação básica
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      );
    }

    console.log('🔐 [Users Login] Tentativa de login para:', email);

    // Buscar usuário no Supabase
    const { data: user, error } = await supabase
      .from('users')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('email', email.toLowerCase())
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_active', true)
      .single();

    if (error || !user) {
      console.log('❌ [Users Login] Usuário não encontrado:', email);
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // SEGURANCA: Apenas validação via bcrypt password_hash
    if (!user.password_hash) {
      console.warn('⚠️ [Users Login] Usuário sem password_hash:', email);
      return NextResponse.json(
        { error: 'Conta não configurada. Solicite um novo convite ao administrador.' },
        { status: 401 }
      );
    }

    console.log(`🔐 [Users Login] Validando senha com bcrypt para: ${email}`);
    const isValid = await verifyPassword(password, user.password_hash);

    if (!isValid) {
      console.log('❌ [Users Login] Senha incorreta para:', email);
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // Atualizar último login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    console.log('✅ [Users Login] Login realizado com sucesso:', email);

    // Retornar dados do usuário (sem senha)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        roles: user.roles || [user.role],
        business_id: user.business_id,
        creator_id: user.creator_id,
        managed_businesses: user.managed_businesses,
        permissions: user.permissions,
        is_active: user.is_active,
        organization: user.organization
      }
    });

  } catch (error) {
    console.error('❌ [Users Login] Erro na API de login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
