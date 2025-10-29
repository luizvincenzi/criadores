import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// =====================================================
// GET - Listar conteúdos do business
// =====================================================
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    
    // Parâmetros de filtro
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const businessId = searchParams.get('business_id');
    const strategistId = searchParams.get('strategist_id');
    const status = searchParams.get('status');

    console.log('🔍 [BUSINESS-CONTENT] GET:', {
      start,
      end,
      businessId,
      strategistId,
      status
    });

    // Query base
    let query = supabase
      .from('business_content_social')
      .select('*')
      .is('deleted_at', null)
      .order('scheduled_date', { ascending: true });

    // 🔒 FILTRO OBRIGATÓRIO: business_id
    if (businessId) {
      query = query.eq('business_id', businessId);
    }

    // Filtro opcional: strategist_id
    if (strategistId) {
      query = query.eq('strategist_id', strategistId);
    }

    // Filtro opcional: status
    if (status) {
      query = query.eq('status', status);
    }

    // Filtro de data: start
    if (start) {
      query = query.gte('scheduled_date', start);
    }

    // Filtro de data: end
    if (end) {
      query = query.lte('scheduled_date', end);
    }

    const { data, error } = await query;

    if (error) {
      console.error('❌ [BUSINESS-CONTENT] Erro ao buscar:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [BUSINESS-CONTENT] ${data?.length || 0} conteúdos encontrados`);

    return NextResponse.json({
      success: true,
      contents: data || []
    });

  } catch (error) {
    console.error('❌ [BUSINESS-CONTENT] Erro no GET:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar conteúdos' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Criar novo conteúdo
// =====================================================
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    console.log('📝 [BUSINESS-CONTENT] POST:', body);

    // Validações obrigatórias
    if (!body.business_id) {
      return NextResponse.json(
        { success: false, error: 'business_id é obrigatório' },
        { status: 400 }
      );
    }

    if (!body.title) {
      return NextResponse.json(
        { success: false, error: 'title é obrigatório' },
        { status: 400 }
      );
    }

    if (!body.content_type) {
      return NextResponse.json(
        { success: false, error: 'content_type é obrigatório' },
        { status: 400 }
      );
    }

    if (!body.scheduled_date) {
      return NextResponse.json(
        { success: false, error: 'scheduled_date é obrigatório' },
        { status: 400 }
      );
    }

    // Validar content_type
    if (!['post', 'reels', 'story'].includes(body.content_type)) {
      return NextResponse.json(
        { success: false, error: 'content_type deve ser post, reels ou story' },
        { status: 400 }
      );
    }

    // Validar status
    if (body.status && !['planned', 'in_progress', 'completed', 'cancelled'].includes(body.status)) {
      return NextResponse.json(
        { success: false, error: 'status inválido' },
        { status: 400 }
      );
    }

    // Preparar dados para inserção
    const insertData = {
      organization_id: '00000000-0000-0000-0000-000000000001', // DEFAULT_ORG_ID
      business_id: body.business_id,
      strategist_id: body.strategist_id || null,
      title: body.title,
      description: body.description || null,
      briefing: body.briefing || null,
      content_type: body.content_type,
      platforms: body.platforms || [],
      scheduled_date: body.scheduled_date,
      scheduled_time: body.scheduled_time || null,
      assigned_to: body.assigned_to || null,
      created_by: body.created_by || null,
      status: body.status || 'planned',
      is_executed: body.is_executed || false,
      executed_at: body.executed_at || null,
      executed_by: body.executed_by || null,
      notes: body.notes || null,
      attachments: body.attachments || [],
      tags: body.tags || [],
      order_index: body.order_index || 0,
      // 🆕 Campos de análise qualitativa
      post_url: body.post_url || null,
      sentiment: body.sentiment || null,
      analysis_notes: body.analysis_notes || null
    };

    console.log('💾 [BUSINESS-CONTENT] Inserindo:', insertData);

    const { data, error } = await supabase
      .from('business_content_social')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('❌ [BUSINESS-CONTENT] Erro ao criar:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ [BUSINESS-CONTENT] Conteúdo criado:', data.id);

    return NextResponse.json({
      success: true,
      content: data
    });

  } catch (error) {
    console.error('❌ [BUSINESS-CONTENT] Erro no POST:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar conteúdo' },
      { status: 500 }
    );
  }
}

