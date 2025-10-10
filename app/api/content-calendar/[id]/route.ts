import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('social_content_calendar')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar conteúdo:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ content: data });
  } catch (error) {
    console.error('Erro no PUT /api/content-calendar/[id]:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar conteúdo' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    const { data, error } = await supabase
      .from('social_content_calendar')
      .update(body)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar conteúdo:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ content: data });
  } catch (error) {
    console.error('Erro no PATCH /api/content-calendar/[id]:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar conteúdo' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { error } = await supabase
      .from('social_content_calendar')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar conteúdo:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro no DELETE /api/content-calendar/[id]:', error);
    return NextResponse.json(
      { error: 'Erro ao deletar conteúdo' },
      { status: 500 }
    );
  }
}

