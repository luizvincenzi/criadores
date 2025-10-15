import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const start = searchParams.get('start');
    const end = searchParams.get('end');
    const businessId = searchParams.get('business_id');

    let query = supabase
      .from('social_content_calendar')
      .select('*')
      .order('scheduled_date', { ascending: true });

    if (start) {
      query = query.gte('scheduled_date', start);
    }

    if (end) {
      query = query.lte('scheduled_date', end);
    }

    // 🔒 FILTRAR POR BUSINESS_ID (para strategists)
    if (businessId) {
      query = query.eq('business_id', businessId);
      console.log('🔒 Filtrando conteúdo por business_id:', businessId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar conteúdos:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, contents: data || [] });
  } catch (error) {
    console.error('Erro no GET /api/content-calendar:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao buscar conteúdos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { data, error } = await supabase
      .from('social_content_calendar')
      .insert([body])
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar conteúdo:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, content: data });
  } catch (error) {
    console.error('Erro no POST /api/content-calendar:', error);
    return NextResponse.json(
      { success: false, error: 'Erro ao criar conteúdo' },
      { status: 500 }
    );
  }
}

