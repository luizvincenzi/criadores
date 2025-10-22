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

    // CORREÇÃO: Forçar role correto baseado no email
    const correctedRole = user.email === 'comercial@criadores.app' ? 'creator' : user.role;

    console.log('🔍 [Supabase Login] Role original:', user.role, 'Role corrigido:', correctedRole);

    // Retornar dados do usuário (sem senha)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: correctedRole, // Usar role corrigido
        roles: user.roles || [correctedRole], // Incluir array de roles
        business_id: user.business_id,
        creator_id: user.creator_id,
        managed_businesses: user.managed_businesses,
        permissions: user.permissions,
        is_active: user.is_active,
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
  // Credenciais específicas dos usuários
  const userCredentials = [
    // Usuários admin originais
    { email: 'luizvincenzi@gmail.com', password: 'admin123' },
    { email: 'connectcityops@gmail.com', password: 'admin2345' },
    { email: 'pgabrieldavila@gmail.com', password: 'admin2345' },
    { email: 'marloncpascoal@gmail.com', password: 'admin2345' },
    // Novos usuários do sistema
    { email: 'comercial@criadores.app', password: '2#Todoscria' },
    { email: 'criadores.ops@gmail.com', password: '1#Criamudar' },
    { email: 'test.ops@criadores.app', password: 'TestOps2024!' },
    // Usuários business_owner
    { email: 'financeiro.brooftop@gmail.com', password: '1#Boussolecria' },
    // Criadores e Estrategistas
    { email: 'pietramantovani98@gmail.com', password: '2#Todoscria' },
    { email: 'marilia12cavalheiro@gmail.com', password: '2#Todoscria' },
    { email: 'juliacarolinasan83@gmail.com', password: '2#Todoscria' }
  ];

  // Verificar se é um usuário conhecido com credenciais específicas
  const knownUser = userCredentials.find(cred => cred.email === email.toLowerCase());
  if (knownUser) {
    const isValidPassword = password === knownUser.password;
    console.log(`${isValidPassword ? '✅' : '❌'} Validação de senha para usuário: ${email}`);
    return isValidPassword;
  }

  // Se não é usuário conhecido, rejeitar
  console.log(`❌ Usuário não autorizado: ${email}`);
  return false;
}
