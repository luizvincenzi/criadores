import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// GET - Buscar usuários
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const active = searchParams.get('active');
    const limit = parseInt(searchParams.get('limit') || '50');

    console.log('🔍 Buscando usuários...', { role, active, limit });

    let query = supabase
      .from('users')
      .select(`
        id,
        full_name,
        email,
        role,
        avatar_url,
        is_active,
        created_at
      `)
      .eq('organization_id', DEFAULT_ORG_ID);

    // Aplicar filtros
    if (role) {
      query = query.eq('role', role);
    }
    if (active !== null) {
      query = query.eq('is_active', active === 'true');
    }

    const { data: users, error } = await query
      .order('full_name')
      .limit(limit);

    if (error) {
      console.error('❌ Erro ao buscar usuários:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar usuários', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ ${users?.length || 0} usuários encontrados`);

    return NextResponse.json({
      users: users || [],
      total: users?.length || 0
    });

  } catch (error) {
    console.error('❌ Erro interno ao buscar usuários:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
