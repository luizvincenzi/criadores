import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

function resolveTargetAudience(role: string | undefined, roles: string[] | undefined): string | null {
  const allRoles = new Set<string>();
  if (role) allRoles.add(role);
  if (Array.isArray(roles)) roles.forEach(r => allRoles.add(r));

  if (allRoles.has('marketing_strategist')) return 'marketing_strategist';
  if (allRoles.has('business_owner')) return 'business_owner';
  if (allRoles.has('admin') || allRoles.has('manager')) return 'marketing_strategist';
  return null;
}

/**
 * GET /api/platform/education/courses/[id]?platform_user_id=xxx
 *
 * Retorna o curso completo (sections + lessons) com:
 * - Progresso do aluno em cada aula
 * - is_sequential (se true, aulas trancam em ordem)
 * - is_locked por aula (quando is_sequential=true, aulas anteriores devem estar concluídas)
 * - Validação de acesso por role/track
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: courseId } = await params;
    const { searchParams } = new URL(request.url);
    const platformUserId = searchParams.get('platform_user_id');

    if (!platformUserId) {
      return NextResponse.json(
        { success: false, error: 'platform_user_id é obrigatório' },
        { status: 400 }
      );
    }

    // 1. User
    const { data: user } = await supabaseAdmin
      .from('platform_users')
      .select('id, role, roles, is_active')
      .eq('id', platformUserId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_active', true)
      .maybeSingle();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não autorizado' },
        { status: 401 }
      );
    }

    const targetAudience = resolveTargetAudience(user.role, user.roles);
    if (!targetAudience) {
      return NextResponse.json(
        { success: false, error: 'Sem acesso a trilhas de educação' },
        { status: 403 }
      );
    }

    // 2. Course
    const { data: course, error: courseErr } = await supabaseAdmin
      .from('education_courses')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('id', courseId)
      .eq('is_published', true)
      .maybeSingle();

    if (courseErr || !course) {
      return NextResponse.json(
        { success: false, error: 'Curso não disponível' },
        { status: 404 }
      );
    }

    // 3. Track (validar acesso)
    const { data: track } = await supabaseAdmin
      .from('education_tracks')
      .select('*')
      .eq('id', course.track_id)
      .eq('is_published', true)
      .maybeSingle();

    if (!track) {
      return NextResponse.json(
        { success: false, error: 'Trilha não disponível' },
        { status: 404 }
      );
    }

    // Valida role ↔ target_audience (admin/manager podem ver tudo)
    const isInternal =
      user.role === 'admin' ||
      user.role === 'manager' ||
      (Array.isArray(user.roles) &&
        (user.roles.includes('admin') || user.roles.includes('manager')));

    if (!isInternal && track.target_audience !== targetAudience) {
      return NextResponse.json(
        { success: false, error: 'Sem acesso a este curso' },
        { status: 403 }
      );
    }

    // 4. Sections
    const { data: sections } = await supabaseAdmin
      .from('education_sections')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('course_id', courseId)
      .order('display_order', { ascending: true });

    const sectionIds = (sections || []).map(s => s.id);

    // 5. Lessons publicadas
    let lessons: any[] = [];
    if (sectionIds.length > 0) {
      const { data } = await supabaseAdmin
        .from('education_lessons')
        .select('*')
        .eq('organization_id', DEFAULT_ORG_ID)
        .in('section_id', sectionIds)
        .eq('is_published', true)
        .order('display_order', { ascending: true });
      lessons = data || [];
    }

    const lessonIds = lessons.map(l => l.id);

    // 6. Progresso do usuário
    let progressByLesson: Record<string, any> = {};
    if (lessonIds.length > 0) {
      const { data: progress } = await supabaseAdmin
        .from('education_user_progress')
        .select('*')
        .eq('platform_user_id', platformUserId)
        .in('lesson_id', lessonIds);

      for (const p of progress || []) {
        progressByLesson[p.lesson_id] = p;
      }
    }

    // 7. Estrutura aninhada + lock sequencial
    const sortedLessons = lessons.slice(); // já vem ordenada por section+display_order
    // Organiza por (section.display_order, lesson.display_order) global
    const sectionOrderMap: Record<string, number> = Object.fromEntries(
      (sections || []).map(s => [s.id, s.display_order || 0])
    );
    sortedLessons.sort((a, b) => {
      const sa = sectionOrderMap[a.section_id] || 0;
      const sb = sectionOrderMap[b.section_id] || 0;
      if (sa !== sb) return sa - sb;
      return (a.display_order || 0) - (b.display_order || 0);
    });

    // Aplica lock: aula N é locked se is_sequential=true E aula N-1 não está concluída
    const isSequential = course.is_sequential === true;
    let prevCompleted = true; // primeira aula sempre liberada
    const lessonLockMap: Record<string, boolean> = {};
    const lessonGlobalIndexMap: Record<string, number> = {};

    sortedLessons.forEach((lesson, idx) => {
      const prog = progressByLesson[lesson.id];
      const locked = isSequential && !prevCompleted;
      lessonLockMap[lesson.id] = locked;
      lessonGlobalIndexMap[lesson.id] = idx;
      prevCompleted = prog?.is_completed === true;
    });

    // Monta estrutura aninhada
    const lessonsBySection: Record<string, any[]> = {};
    for (const lesson of sortedLessons) {
      const prog = progressByLesson[lesson.id];
      const enriched = {
        ...lesson,
        is_completed: prog?.is_completed || false,
        completion_percent: prog?.completion_percent || 0,
        watched_seconds: prog?.watched_seconds || 0,
        last_position_seconds: prog?.last_position_seconds || 0,
        last_watched_at: prog?.last_watched_at || null,
        is_locked: lessonLockMap[lesson.id],
        global_index: lessonGlobalIndexMap[lesson.id] + 1
      };
      if (!lessonsBySection[lesson.section_id]) lessonsBySection[lesson.section_id] = [];
      lessonsBySection[lesson.section_id].push(enriched);
    }

    const sectionsWithLessons = (sections || []).map(section => ({
      ...section,
      lessons: lessonsBySection[section.id] || []
    }));

    // 8. Totais
    const totalLessons = sortedLessons.length;
    const completedLessons = sortedLessons.filter(
      l => progressByLesson[l.id]?.is_completed
    ).length;
    const totalDurationSeconds = sortedLessons.reduce(
      (sum, l) => sum + (l.video_duration_seconds || 0),
      0
    );

    // 9. Next lesson (primeira não concluída e não locked)
    let nextLesson = null;
    for (const lesson of sortedLessons) {
      const prog = progressByLesson[lesson.id];
      const locked = lessonLockMap[lesson.id];
      if (!prog?.is_completed && !locked) {
        nextLesson = {
          id: lesson.id,
          title: lesson.title,
          completion_percent: prog?.completion_percent || 0
        };
        break;
      }
    }

    return NextResponse.json({
      success: true,
      course: {
        ...course,
        track_slug: track.slug,
        track_title: track.title
      },
      track: {
        id: track.id,
        slug: track.slug,
        title: track.title
      },
      sections: sectionsWithLessons,
      totals: {
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
        progress_percent:
          totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
        total_duration_seconds: totalDurationSeconds
      },
      next_lesson: nextLesson
    });
  } catch (error: any) {
    console.error('[platform/education/courses/:id] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno', details: error.message },
      { status: 500 }
    );
  }
}
