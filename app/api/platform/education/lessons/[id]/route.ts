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
 * GET /api/platform/education/lessons/[id]?platform_user_id=xxx
 *
 * Retorna:
 * - A aula (com video_id do YouTube)
 * - Contexto (course, section)
 * - Progresso atual do usuário
 * - Aula anterior e próxima (para navegação)
 *
 * Valida acesso: só retorna se a trilha combinar com o role do usuário.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const platformUserId = searchParams.get('platform_user_id');

    if (!platformUserId) {
      return NextResponse.json(
        { success: false, error: 'platform_user_id é obrigatório' },
        { status: 400 }
      );
    }

    // 1. Buscar usuário
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

    // 2. Buscar a aula
    const { data: lesson, error: lessonError } = await supabaseAdmin
      .from('education_lessons')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('id', id)
      .eq('is_published', true)
      .maybeSingle();

    if (lessonError || !lesson) {
      return NextResponse.json(
        { success: false, error: 'Aula não encontrada' },
        { status: 404 }
      );
    }

    // 3. Buscar section + course + track (cadeia) pra validar acesso
    const { data: section } = await supabaseAdmin
      .from('education_sections')
      .select('*')
      .eq('id', lesson.section_id)
      .maybeSingle();

    if (!section) {
      return NextResponse.json(
        { success: false, error: 'Seção não encontrada' },
        { status: 404 }
      );
    }

    const { data: course } = await supabaseAdmin
      .from('education_courses')
      .select('*')
      .eq('id', section.course_id)
      .eq('is_published', true)
      .maybeSingle();

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Curso não disponível' },
        { status: 404 }
      );
    }

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

    // 4. Validar que o role do usuário corresponde à trilha
    if (track.target_audience !== targetAudience) {
      // admin/manager podem ver tudo
      const isInternal = user.role === 'admin' || user.role === 'manager' ||
        (Array.isArray(user.roles) && (user.roles.includes('admin') || user.roles.includes('manager')));
      if (!isInternal) {
        return NextResponse.json(
          { success: false, error: 'Sem acesso a esta trilha' },
          { status: 403 }
        );
      }
    }

    // 5. Buscar progresso do usuário nesta aula
    const { data: progress } = await supabaseAdmin
      .from('education_user_progress')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('platform_user_id', platformUserId)
      .eq('lesson_id', id)
      .maybeSingle();

    // 6. Buscar todas aulas do curso (em ordem) pra calcular prev/next
    const { data: courseSections } = await supabaseAdmin
      .from('education_sections')
      .select('id, display_order')
      .eq('course_id', course.id)
      .order('display_order', { ascending: true });

    const courseSectionIds = (courseSections || []).map(s => s.id);
    const { data: allLessons } = await supabaseAdmin
      .from('education_lessons')
      .select('id, title, section_id, display_order, is_published')
      .in('section_id', courseSectionIds.length ? courseSectionIds : ['00000000-0000-0000-0000-000000000000'])
      .eq('is_published', true);

    // Ordena por (section.display_order, lesson.display_order)
    const sectionOrderMap: Record<string, number> = Object.fromEntries(
      (courseSections || []).map(s => [s.id, s.display_order || 0])
    );
    const orderedLessons = (allLessons || [])
      .slice()
      .sort((a, b) => {
        const sa = sectionOrderMap[a.section_id] || 0;
        const sb = sectionOrderMap[b.section_id] || 0;
        if (sa !== sb) return sa - sb;
        return (a.display_order || 0) - (b.display_order || 0);
      });

    const currentIndex = orderedLessons.findIndex(l => l.id === id);
    const prevLesson = currentIndex > 0 ? orderedLessons[currentIndex - 1] : null;
    const nextLesson = currentIndex >= 0 && currentIndex < orderedLessons.length - 1
      ? orderedLessons[currentIndex + 1]
      : null;

    return NextResponse.json({
      success: true,
      lesson,
      section,
      course,
      track,
      progress: progress || null,
      navigation: {
        prev: prevLesson ? { id: prevLesson.id, title: prevLesson.title } : null,
        next: nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null,
        current_index: currentIndex + 1,
        total_count: orderedLessons.length
      }
    });
  } catch (error: any) {
    console.error('[platform/education/lessons/:id] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno', details: error.message },
      { status: 500 }
    );
  }
}
