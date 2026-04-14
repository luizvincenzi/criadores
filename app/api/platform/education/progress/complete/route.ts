import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

/**
 * POST /api/platform/education/progress/complete
 *
 * Marca uma aula como concluída (is_completed=true).
 * Chamado quando:
 * - Player atinge >= 90% do vídeo (via timeupdate)
 * - Player dispara evento ENDED
 *
 * Body: { platform_user_id, lesson_id }
 *
 * Idempotente: pode ser chamado múltiplas vezes sem efeitos colaterais.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform_user_id, lesson_id } = body;

    if (!platform_user_id || !lesson_id) {
      return NextResponse.json(
        { success: false, error: 'platform_user_id e lesson_id são obrigatórios' },
        { status: 400 }
      );
    }

    // 1. Validar usuário
    const { data: user } = await supabaseAdmin
      .from('platform_users')
      .select('id, is_active')
      .eq('id', platform_user_id)
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_active', true)
      .maybeSingle();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não autorizado' },
        { status: 401 }
      );
    }

    // 2. Validar aula
    const { data: lesson } = await supabaseAdmin
      .from('education_lessons')
      .select('id, video_duration_seconds, is_published')
      .eq('id', lesson_id)
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_published', true)
      .maybeSingle();

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: 'Aula não encontrada' },
        { status: 404 }
      );
    }

    const now = new Date().toISOString();
    const duration = lesson.video_duration_seconds || 0;

    // 3. Upsert com is_completed=true
    const { data: existing } = await supabaseAdmin
      .from('education_user_progress')
      .select('*')
      .eq('platform_user_id', platform_user_id)
      .eq('lesson_id', lesson_id)
      .maybeSingle();

    if (existing) {
      if (existing.is_completed) {
        return NextResponse.json({ success: true, already_completed: true });
      }

      const { error } = await supabaseAdmin
        .from('education_user_progress')
        .update({
          is_completed: true,
          completed_at: now,
          completion_percent: 100,
          watched_seconds: Math.max(existing.watched_seconds || 0, duration),
          last_watched_at: now
        })
        .eq('id', existing.id);

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
    } else {
      const { error } = await supabaseAdmin
        .from('education_user_progress')
        .insert({
          organization_id: DEFAULT_ORG_ID,
          platform_user_id,
          lesson_id,
          watched_seconds: duration,
          last_position_seconds: 0,
          completion_percent: 100,
          is_completed: true,
          completed_at: now,
          first_watched_at: now,
          last_watched_at: now,
          watch_count: 1
        });

      if (error) {
        return NextResponse.json(
          { success: false, error: error.message },
          { status: 500 }
        );
      }
    }

    // 4. Log do evento de conclusão
    await supabaseAdmin
      .from('education_watch_events')
      .insert({
        organization_id: DEFAULT_ORG_ID,
        platform_user_id,
        lesson_id,
        event_type: 'completed',
        position_seconds: duration
      });

    return NextResponse.json({ success: true, completed: true });
  } catch (error: any) {
    console.error('[platform/education/progress/complete] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno', details: error.message },
      { status: 500 }
    );
  }
}
