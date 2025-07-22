import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// GET - Buscar atividades de uma empresa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const limit = parseInt(searchParams.get('limit') || '50');
    const activityType = searchParams.get('activity_type');

    console.log('🔍 Buscando atividades...', { businessId, limit, activityType });

    // Retornar atividades vazias por enquanto (tabela business_activities foi removida)
    console.log('⚠️ Tabela business_activities não disponível - retornando lista vazia');

    return NextResponse.json({
      activities: [],
      total: 0,
      message: 'Sistema de atividades temporariamente desabilitado'
    });

  } catch (error) {
    console.error('❌ Erro interno ao buscar atividades:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova atividade
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Tentativa de criar atividade (sistema desabilitado):', body);

    // Sistema de atividades temporariamente desabilitado
    return NextResponse.json({
      activity: null,
      message: 'Sistema de atividades temporariamente desabilitado'
    });

  } catch (error) {
    console.error('❌ Erro geral na API POST activities:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
