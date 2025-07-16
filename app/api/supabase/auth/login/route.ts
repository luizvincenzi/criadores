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

    console.log('🔐 Tentativa de login para:', email);

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
      console.log('❌ Usuário não encontrado:', email);
      return NextResponse.json(
        { error: 'Email ou senha incorretos' },
        { status: 401 }
      );
    }

    // Para o usuário admin criado na migração, usar senha padrão
    const isValidPassword = await validatePassword(email, password, user);

    if (!isValidPassword) {
      console.log('❌ Senha incorreta para:', email);
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

    console.log('✅ Login realizado com sucesso:', email);

    // Retornar dados do usuário (sem senha)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role,
        permissions: user.permissions,
        organization: user.organization
      }
    });

  } catch (error) {
    console.error('❌ Erro na API de login:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

async function validatePassword(email: string, password: string, user: any): Promise<boolean> {
  // Credenciais específicas dos usuários admin
  const adminCredentials = [
    { email: 'luizvincenzi@gmail.com', password: 'admin123' },
    { email: 'connectcityops@gmail.com', password: 'admin2345' },
    { email: 'pgabrieldavila@gmail.com', password: 'admin2345' },
    { email: 'marloncpascoal@gmail.com', password: 'admin2345' }
  ];

  // Verificar se é um usuário admin com credenciais específicas
  const adminUser = adminCredentials.find(admin => admin.email === email.toLowerCase());
  if (adminUser) {
    const isValidPassword = password === adminUser.password;
    console.log(`${isValidPassword ? '✅' : '❌'} Validação de senha para admin: ${email}`);
    return isValidPassword;
  }

  // Se não é admin conhecido, rejeitar
  console.log(`❌ Usuário não autorizado: ${email}`);
  return false;
}
