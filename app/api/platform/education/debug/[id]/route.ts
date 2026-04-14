import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

/**
 * GET /api/platform/education/debug/[id]
 *
 * Endpoint de debug. Retorna o estado cru de uma aula direto do banco
 * pra verificar se youtube_video_id, video_url, etc. estão salvos corretamente.
 *
 * Acessível pela URL: /api/platform/education/debug/{lesson_id}
 * Não precisa de auth — só leitura, só expõe campos não-sensíveis.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const { data: lesson, error } = await supabaseAdmin
      .from('education_lessons')
      .select(
        'id, title, video_provider, youtube_video_id, video_url, video_duration_seconds, video_thumbnail_url, is_published, created_at, updated_at'
      )
      .eq('id', id)
      .eq('organization_id', DEFAULT_ORG_ID)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: 'Aula não encontrada', lesson_id: id },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      lesson,
      diagnostics: {
        has_youtube_id: !!lesson.youtube_video_id,
        has_video_url: !!lesson.video_url,
        has_duration: !!lesson.video_duration_seconds,
        has_thumbnail: !!lesson.video_thumbnail_url,
        is_published: lesson.is_published,
        will_render_player: !!lesson.youtube_video_id
      }
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: 'Erro interno', details: error.message },
      { status: 500 }
    );
  }
}
