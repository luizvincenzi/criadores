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
      console.log('❌ [Platform] Erro do Supabase:', error);
      console.log('❌ [Platform] Dados retornados:', platformUser);
      return NextResponse.json(
        { success: false, error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    console.log('✅ [Platform] Usuário encontrado:', {
      email: platformUser.email,
      has_password_hash: !!platformUser.password_hash,
      hash_length: platformUser.password_hash?.length,
      is_active: platformUser.is_active,
      role: platformUser.role
    });

    // Validar senha
    const isValidPassword = await validatePassword(email, password, platformUser);

    if (!isValidPassword) {
      console.log('❌ [Platform] Senha incorreta para:', email);
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
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

/**
 * Validação de senha com suporte a bcrypt e fallback para hardcoded
 */
async function validatePassword(email: string, password: string, user: any): Promise<boolean> {
  try {
    // Se o usuário tem password_hash, usar bcrypt para validar
    if (user.password_hash) {
      console.log(`🔐 [Platform] Validando senha com bcrypt para: ${email}`);
      console.log(`🔐 [Platform] Hash length: ${user.password_hash.length}`);
      console.log(`🔐 [Platform] Password length: ${password.length}`);

      const isValid = await verifyPassword(password, user.password_hash);
      console.log(`${isValid ? '✅' : '❌'} [Platform] Validação de senha com bcrypt para usuário: ${email}`);

      if (!isValid) {
        console.log(`❌ [Platform] Senha fornecida não corresponde ao hash armazenado`);
      }

      return isValid;
    }

    // Fallback: Credenciais conhecidas (temporário)
    const userCredentials = [
      // Admin
      { email: 'luizvincenzi@gmail.com', password: '2#Todoscria' },

      // Operações
      { email: 'criadores.ops@gmail.com', password: '1#Criamudar' },

      // Criadores e Estrategistas
      { email: 'pietramantovani98@gmail.com', password: '2#Todoscria' },
      { email: 'marilia12cavalheiro@gmail.com', password: '2#Todoscria' },
      { email: 'juliacarolinasan83@gmail.com', password: '2#Todoscria' },
      { email: 'comercial@criadores.app', password: '2#Todoscria' }
    ];

    // Verificar se é um usuário conhecido com credenciais específicas
    const knownUser = userCredentials.find(cred => cred.email === email.toLowerCase());
    if (knownUser) {
      const isValidPassword = password === knownUser.password;
      console.log(`${isValidPassword ? '✅' : '❌'} [Platform] Validação de senha para: ${email}`);
      return isValidPassword;
    }

    // Se não é usuário conhecido e não tem password_hash, rejeitar
    console.log(`❌ [Platform] Usuário não autorizado: ${email}`);
    return false;
  } catch (error) {
    console.error(`❌ [Platform] Erro ao validar senha para ${email}:`, error);
    return false;
  }
}

