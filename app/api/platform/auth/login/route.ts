import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

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

    console.log('🔐 [Platform] Tentativa de login para:', email);

    // Buscar usuário em platform_users
    const { data: platformUser, error } = await supabase
      .from('platform_users')
      .select(`
        *,
        organization:organizations(*)
      `)
      .eq('email', email.toLowerCase())
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_active', true)
      .single();

    if (error || !platformUser) {
      console.log('❌ [Platform] Usuário não encontrado:', email);
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // Validar senha (temporário - hardcoded)
    const isValidPassword = await validatePassword(email, password);

    if (!isValidPassword) {
      console.log('❌ [Platform] Senha incorreta para:', email);
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // Atualizar último login
    await supabase
      .from('platform_users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', platformUser.id);

    console.log('✅ [Platform] Login realizado com sucesso:', {
      email,
      role: platformUser.role,
      roles: platformUser.roles,
      business_id: platformUser.business_id,
      creator_id: platformUser.creator_id
    });

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
    console.error('❌ [Platform] Erro na API de login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Validação temporária de senha (hardcoded)
 * TODO: Implementar hash de senha no banco
 */
async function validatePassword(email: string, password: string): Promise<boolean> {
  // Credenciais conhecidas (temporário)
  const userCredentials = [
    // Admin
    { email: 'luizvincenzi@gmail.com', password: '2#Todoscria' },
    
    // Criadores e Estrategistas
    { email: 'pietramantovani98@gmail.com', password: '2#Todoscria' },
    { email: 'marilia12cavalheiro@gmail.com', password: '2#Todoscria' }
  ];

  // Verificar se é um usuário conhecido com credenciais específicas
  const knownUser = userCredentials.find(cred => cred.email === email.toLowerCase());
  if (knownUser) {
    const isValidPassword = password === knownUser.password;
    console.log(`${isValidPassword ? '✅' : '❌'} [Platform] Validação de senha para: ${email}`);
    return isValidPassword;
  }

  // Se não é usuário conhecido, rejeitar
  console.log(`❌ [Platform] Usuário não autorizado: ${email}`);
  return false;
}

