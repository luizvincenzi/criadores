import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

/**
 * POST /api/platform/education/progress
 *
 * Heartbeat de progresso. Chamado a cada ~10s enquanto o player está tocando.
 *
 * Body:
 * {
 *   platform_user_id: string,
 *   lesson_id: string,
 *   watched_seconds: number,       // tempo real assistido (acumulado)
 *   last_position_seconds: number, // posição atual do player (para retomar)
 *   duration_seconds?: number      // duration total do vídeo (pra calcular completion_percent)
 * }
 *
 * Regras antifraude:
 * - watched_seconds não pode ser maior que duration × 1.2
 * - Se watched_seconds / duration >= 0.9 → marca is_completed=true
 * - upsert por (platform_user_id, lesson_id)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      platform_user_id,
      lesson_id,
      watched_seconds,
      last_position_seconds,
      duration_seconds
    } = body;

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

    // 2. Buscar duration da aula (fonte de verdade)
    const { data: lesson } = await supabaseAdmin
      .from('education_lessons')
      .select('id, video_duration_seconds, is_published')
      .eq('id', lesson_id)
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_published', true)
      .maybeSingle();

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: 'Aula não encontrada ou não publicada' },
        { status: 404 }
      );
    }

    const duration =
      lesson.video_duration_seconds ||
      (typeof duration_seconds === 'number' ? duration_seconds : 0);

    // 3. Aplicar regras antifraude
    let safeWatchedSeconds = Math.max(0, Math.floor(Number(watched_seconds) || 0));
    const safePosition = Math.max(0, Math.floor(Number(last_position_seconds) || 0));

    // watched não pode exceder duration × 1.2 (margem pra imprecisão de heartbeat)
    if (duration > 0 && safeWatchedSeconds > duration * 1.2) {
      safeWatchedSeconds = Math.floor(duration * 1.2);
    }

    const completionPercent =
      duration > 0 ? Math.min(100, (safeWatchedSeconds / duration) * 100) : 0;
    const isCompleted = duration > 0 && completionPercent >= 90;

    // 4. Buscar progresso existente (pra manter watched_seconds cumulativo)
    const { data: existing } = await supabaseAdmin
      .from('education_user_progress')
      .select('*')
      .eq('platform_user_id', platform_user_id)
      .eq('lesson_id', lesson_id)
      .maybeSingle();

    // watched_seconds só pode aumentar (nunca diminuir entre heartbeats)
    const finalWatchedSeconds = existing
      ? Math.max(existing.watched_seconds || 0, safeWatchedSeconds)
      : safeWatchedSeconds;

    const finalCompletionPercent =
      duration > 0 ? Math.min(100, (finalWatchedSeconds / duration) * 100) : 0;
    const finalIsCompleted =
      (existing?.is_completed === true) || (duration > 0 && finalCompletionPercent >= 90);

    const now = new Date().toISOString();

    if (existing) {
      // UPDATE
      const { error: updateError } = await supabaseAdmin
        .from('education_user_progress')
        .update({
          watched_seconds: finalWatchedSeconds,
          last_position_seconds: safePosition,
          completion_percent: Number(finalCompletionPercent.toFixed(2)),
          is_completed: finalIsCompleted,
          completed_at: finalIsCompleted && !existing.is_completed ? now : existing.completed_at,
          last_watched_at: now,
          watch_count: (existing.watch_count || 1)
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('[progress] Update error:', updateError);
        return NextResponse.json(
          { success: false, error: updateError.message },
          { status: 500 }
        );
      }
    } else {
      // INSERT
      const { error: insertError } = await supabaseAdmin
        .from('education_user_progress')
        .insert({
          organization_id: DEFAULT_ORG_ID,
          platform_user_id,
          lesson_id,
          watched_seconds: finalWatchedSeconds,
          last_position_seconds: safePosition,
          completion_percent: Number(finalCompletionPercent.toFixed(2)),
          is_completed: finalIsCompleted,
          completed_at: finalIsCompleted ? now : null,
          first_watched_at: now,
          last_watched_at: now,
          watch_count: 1
        });

      if (insertError) {
        console.error('[progress] Insert error:', insertError);
        return NextResponse.json(
          { success: false, error: insertError.message },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      watched_seconds: finalWatchedSeconds,
      completion_percent: Number(finalCompletionPercent.toFixed(2)),
      is_completed: finalIsCompleted
    });
  } catch (error: any) {
    console.error('[platform/education/progress] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno', details: error.message },
      { status: 500 }
    );
  }
}
