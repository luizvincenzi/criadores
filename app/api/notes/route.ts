import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Buscar notas de uma empresa (compatibilidade com DealDetailsModalNew)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dealId = searchParams.get('dealId');
    const businessId = searchParams.get('business_id');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Aceitar tanto dealId quanto business_id para compatibilidade
    const targetBusinessId = businessId || dealId;

    console.log('🔍 [/api/notes] Buscando notas...', { dealId, businessId, targetBusinessId, limit });

    if (!targetBusinessId) {
      return NextResponse.json(
        { error: 'dealId ou business_id é obrigatório' },
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
      .eq('business_id', targetBusinessId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('❌ [/api/notes] Erro ao buscar notas:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar notas', details: error.message },
        { status: 500 }
      );
    }

    console.log(`✅ [/api/notes] ${notes?.length || 0} notas encontradas`);

    // Formatar dados para compatibilidade
    const formattedNotes = notes?.map(note => ({
      id: note.id,
      content: note.content,
      created_at: note.created_at,
      updated_at: note.updated_at,
      user_name: note.user?.full_name || note.user?.email || 'Usuário Desconhecido',
      note_type: note.note_type,
      business_id: note.business_id,
      user_id: note.user_id
    })) || [];

    return NextResponse.json({
      notes: formattedNotes,
      total: formattedNotes.length
    });

  } catch (error) {
    console.error('❌ [/api/notes] Erro interno ao buscar notas:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST - Criar nova nota (redirecionar para /api/crm/notes)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📝 [/api/notes] Redirecionando criação para /api/crm/notes:', body);

    // Redirecionar para a API principal
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/crm/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ [/api/notes] Erro ao criar nota:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT - Atualizar nota (redirecionar para /api/crm/notes)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('✏️ [/api/notes] Redirecionando edição para /api/crm/notes:', body);

    // Redirecionar para a API principal
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/crm/notes`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ [/api/notes] Erro ao atualizar nota:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
