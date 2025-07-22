import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Buscar notas de uma empresa
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('business_id');
    const limit = parseInt(searchParams.get('limit') || '20');

    console.log('🔍 Buscando notas...', { businessId, limit });

    if (!businessId) {
      return NextResponse.json(
        { error: 'business_id é obrigatório' },
        { status: 400 }
      );
    }

    const { data: notes, error } = await supabase
      .from('business_notes')
      .select(`
        id,
        business_id,
        user_id,
        content,
        note_type,
        attachments,
        activity_id,
        created_at,
        updated_at,
        user:users(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('business_id', businessId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ Erro ao buscar notas:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar notas', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ ${notes?.length || 0} notas encontradas`);

    return NextResponse.json({
      notes: notes || [],
      total: notes?.length || 0
    });

  } catch (error) {
    console.error('❌ Erro interno ao buscar notas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova nota
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 Criando nota:', body);

    const noteData = {
      business_id: body.business_id,
      user_id: body.user_id || '00000000-0000-0000-0000-000000000001', // User padrão do sistema
      content: body.content,
      note_type: body.note_type || 'general',
      attachments: body.attachments || [],
      activity_id: body.activity_id || null
    };

    const { data: note, error } = await supabase
      .from('business_notes')
      .insert([noteData])
      .select(`
        id,
        business_id,
        user_id,
        content,
        note_type,
        attachments,
        activity_id,
        created_at,
        updated_at,
        user:users(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('❌ Erro ao criar nota:', error);
      return NextResponse.json(
        { error: 'Erro ao criar nota', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Nota criada:', note);

    // Sistema de atividades temporariamente desabilitado
    if (body.create_activity !== false) {
      console.log('⚠️ Sistema de atividades desabilitado - não criando atividade relacionada');
    }

    return NextResponse.json({
      note,
      message: 'Nota criada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro interno ao criar nota:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar nota
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, content, note_type } = body;

    console.log('📝 Atualizando nota:', id);

    const { data: note, error } = await supabase
      .from('business_notes')
      .update({
        content,
        note_type,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        id,
        business_id,
        user_id,
        content,
        note_type,
        attachments,
        created_at,
        updated_at,
        user:users(
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('❌ Erro ao atualizar nota:', error);
      return NextResponse.json(
        { error: 'Erro ao atualizar nota', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Nota atualizada:', note);

    return NextResponse.json({
      note,
      message: 'Nota atualizada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro interno ao atualizar nota:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Deletar nota
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID da nota é obrigatório' },
        { status: 400 }
      );
    }

    console.log('🗑️ Deletando nota:', id);

    const { error } = await supabase
      .from('business_notes')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('❌ Erro ao deletar nota:', error);
      return NextResponse.json(
        { error: 'Erro ao deletar nota', details: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Nota deletada');

    return NextResponse.json({
      message: 'Nota deletada com sucesso'
    });

  } catch (error) {
    console.error('❌ Erro interno ao deletar nota:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
