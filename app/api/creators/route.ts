import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// GET - Buscar criadores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');

    console.log('🔍 Buscando criadores...', { status, limit });

    let query = supabase
      .from('creators')
      .select(`
        id,
        name,
        instagram_handle,
        status,
        followers_count,
        email,
        phone,
        created_at
      `)
      .eq('organization_id', DEFAULT_ORG_ID);

    // Aplicar filtros
    if (status) {
      query = query.eq('status', status);
    }

    const { data: creators, error } = await query
      .order('name')
      .limit(limit);

    if (error) {
      console.error('❌ Erro ao buscar criadores:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar criadores', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ ${creators?.length || 0} criadores encontrados`);

    return NextResponse.json({
      creators: creators || [],
      total: creators?.length || 0
    });

  } catch (error) {
    console.error('❌ Erro interno ao buscar criadores:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
