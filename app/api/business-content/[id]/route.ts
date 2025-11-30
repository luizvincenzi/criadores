import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// =====================================================
// GET - Buscar conteúdo por ID
// =====================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    console.log('🔍 [BUSINESS-CONTENT] GET by ID:', id);

    const { data, error } = await supabase
      .from('business_content_social')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single();

    if (error) {
      console.error('❌ [BUSINESS-CONTENT] Erro ao buscar:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 404 }
      );
    }

    console.log('✅ [BUSINESS-CONTENT] Conteúdo encontrado:', data.id);

    return NextResponse.json({
      success: true,
      content: data
    });

  } catch (error) {
    console.error('❌ [BUSINESS-CONTENT] Erro no GET:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar conteúdo' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT - Atualizar conteúdo completo
// =====================================================
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    console.log('📝 [BUSINESS-CONTENT] PUT:', id, body);

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

    // Preparar dados para atualização
    const updateData = {
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

    console.log('💾 [BUSINESS-CONTENT] Atualizando:', updateData);

    const { data, error } = await supabase
      .from('business_content_social')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      console.error('❌ [BUSINESS-CONTENT] Erro ao atualizar:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ [BUSINESS-CONTENT] Conteúdo atualizado:', data.id);

    return NextResponse.json({
      success: true,
      content: data
    });

  } catch (error) {
    console.error('❌ [BUSINESS-CONTENT] Erro no PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar conteúdo' },
      { status: 500 }
    );
  }
}

// =====================================================
// PATCH - Atualizar conteúdo parcial
// =====================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    console.log('📝 [BUSINESS-CONTENT] PATCH:', id, body);

    // PATCH permite atualização parcial - não valida campos obrigatórios
    const updateData: any = {};

    // Apenas adicionar campos que foram enviados
    if (body.business_id !== undefined) updateData.business_id = body.business_id;
    if (body.strategist_id !== undefined) updateData.strategist_id = body.strategist_id;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.briefing !== undefined) updateData.briefing = body.briefing;
    if (body.content_type !== undefined) updateData.content_type = body.content_type;
    if (body.platforms !== undefined) updateData.platforms = body.platforms;
    if (body.scheduled_date !== undefined) updateData.scheduled_date = body.scheduled_date;
    if (body.scheduled_time !== undefined) updateData.scheduled_time = body.scheduled_time;
    if (body.assigned_to !== undefined) updateData.assigned_to = body.assigned_to;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.is_executed !== undefined) updateData.is_executed = body.is_executed;
    if (body.executed_at !== undefined) updateData.executed_at = body.executed_at;
    if (body.executed_by !== undefined) updateData.executed_by = body.executed_by;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.attachments !== undefined) updateData.attachments = body.attachments;
    if (body.tags !== undefined) updateData.tags = body.tags;
    if (body.order_index !== undefined) updateData.order_index = body.order_index;
    // 🆕 Campos de análise qualitativa
    if (body.post_url !== undefined) updateData.post_url = body.post_url;
    if (body.sentiment !== undefined) updateData.sentiment = body.sentiment;
    if (body.analysis_notes !== undefined) updateData.analysis_notes = body.analysis_notes;

    console.log('💾 [BUSINESS-CONTENT] Atualizando parcialmente:', updateData);

    const { data, error } = await supabase
      .from('business_content_social')
      .update(updateData)
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      console.error('❌ [BUSINESS-CONTENT] Erro ao atualizar:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ [BUSINESS-CONTENT] Conteúdo atualizado:', data.id);

    return NextResponse.json({
      success: true,
      content: data
    });

  } catch (error) {
    console.error('❌ [BUSINESS-CONTENT] Erro no PATCH:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao atualizar conteúdo' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Soft delete do conteúdo
// =====================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    console.log('🗑️ [BUSINESS-CONTENT] DELETE:', id);

    // Soft delete - apenas marca deleted_at
    const { data, error } = await supabase
      .from('business_content_social')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      console.error('❌ [BUSINESS-CONTENT] Erro ao deletar:', error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ [BUSINESS-CONTENT] Conteúdo deletado (soft):', data.id);

    return NextResponse.json({
      success: true,
      message: 'Conteúdo deletado com sucesso'
    });

  } catch (error) {
    console.error('❌ [BUSINESS-CONTENT] Erro no DELETE:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao deletar conteúdo' },
      { status: 500 }
    );
  }
}

