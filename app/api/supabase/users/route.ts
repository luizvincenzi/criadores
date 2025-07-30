import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// GET - Buscar usuários
export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Buscando usuários...');

    const { data: users, error } = await supabase
      .from('users')
      .select('id, full_name, email, role')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_active', true)
      .order('role', { ascending: true })
      .order('full_name', { ascending: true });

    if (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      return NextResponse.json(
        { success: false, error: 'Erro ao buscar usuários', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ ${users?.length || 0} usuários encontrados`);

    return NextResponse.json({
      success: true,
      users: users || [],
      total: users?.length || 0
    });

  } catch (error) {
    console.error('❌ Erro interno ao buscar usuários:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar usuário (se necessário no futuro)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Criando usuário:', body);

    const { data: user, error } = await supabase
      .from('users')
      .insert([{
        full_name: body.full_name || body.name,
        email: body.email,
        role: body.role || 'user',
        organization_id: body.organization_id,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('❌ Erro ao criar usuário:', error);
      return NextResponse.json(
        { error: 'Erro ao criar usuário', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Usuário criado:', user);

    return NextResponse.json({
      user,
      message: 'Usuário criado com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro interno ao criar usuário:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
