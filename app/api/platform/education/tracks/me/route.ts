import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

/**
 * Mapeia o role do platform_user para target_audience da trilha de educação.
 * - marketing_strategist → trilha 'social-media'
 * - business_owner → trilha 'business-owner'
 *
 * Creators não têm trilha dedicada (por enquanto).
 */
function resolveTargetAudience(role: string | undefined, roles: string[] | undefined): string | null {
  const allRoles = new Set<string>();
  if (role) allRoles.add(role);
  if (Array.isArray(roles)) roles.forEach(r => allRoles.add(r));

  if (allRoles.has('marketing_strategist')) return 'marketing_strategist';
  if (allRoles.has('business_owner')) return 'business_owner';
  // admin/manager podem ver qualquer coisa → default social-media
  if (allRoles.has('admin') || allRoles.has('manager')) return 'marketing_strategist';

  return null;
}

/**
 * GET /api/platform/education/tracks/me?platform_user_id=xxx
 *
 * Retorna a trilha do aluno logado (baseada no role) com:
 * - Courses publicados
 * - Sections + Lessons publicadas
 * - User progress mesclado em cada lesson
 * - Resumo: total_lessons, completed_count, next_lesson
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platformUserId = searchParams.get('platform_user_id');

    if (!platformUserId) {
      return NextResponse.json(
        { success: false, error: 'platform_user_id é obrigatório' },
        { status: 400 }
      );
    }

    // 1. Buscar usuário
    const { data: user, error: userError } = await supabaseAdmin
      .from('platform_users')
      .select('id, role, roles, is_active')
      .eq('id', platformUserId)
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('is_active', true)
      .maybeSingle();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, error: 'Usuário não encontrado ou inativo' },
        { status: 404 }
      );
    }

    // 2. Resolver target_audience
    const targetAudience = resolveTargetAudience(user.role, user.roles);
    if (!targetAudience) {
      return NextResponse.json(
        {
          success: false,
          error: 'Seu perfil não tem uma trilha de educação disponível'
        },
        { status: 403 }
      );
    }

    // 3. Buscar trilha publicada para esse target_audience
    const { data: track } = await supabaseAdmin
      .from('education_tracks')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('target_audience', targetAudience)
      .eq('is_published', true)
      .maybeSingle();

    if (!track) {
      return NextResponse.json({
        success: true,
        track: null,
        courses: [],
        summary: { total_lessons: 0, completed_count: 0, next_lesson: null }
      });
    }

    // 4. Buscar cursos publicados
    const { data: courses } = await supabaseAdmin
      .from('education_courses')
      .select('*')
      .eq('organization_id', DEFAULT_ORG_ID)
      .eq('track_id', track.id)
      .eq('is_published', true)
      .order('display_order', { ascending: true });

    const courseIds = (courses || []).map(c => c.id);

    // 5. Buscar seções
    let sectionsByCourse: Record<string, any[]> = {};
    let sectionIds: string[] = [];
    if (courseIds.length > 0) {
      const { data: sections } = await supabaseAdmin
        .from('education_sections')
        .select('*')
        .eq('organization_id', DEFAULT_ORG_ID)
        .in('course_id', courseIds)
        .order('display_order', { ascending: true });

      for (const s of sections || []) {
        if (!sectionsByCourse[s.course_id]) sectionsByCourse[s.course_id] = [];
        sectionsByCourse[s.course_id].push(s);
        sectionIds.push(s.id);
      }
    }

    // 6. Buscar aulas publicadas
    let lessonsBySection: Record<string, any[]> = {};
    let allLessons: any[] = [];
    if (sectionIds.length > 0) {
      const { data: lessons } = await supabaseAdmin
        .from('education_lessons')
        .select('*')
        .eq('organization_id', DEFAULT_ORG_ID)
        .in('section_id', sectionIds)
        .eq('is_published', true)
        .order('display_order', { ascending: true });

      for (const l of lessons || []) {
        if (!lessonsBySection[l.section_id]) lessonsBySection[l.section_id] = [];
        lessonsBySection[l.section_id].push(l);
        allLessons.push(l);
      }
    }

    // 7. Buscar progresso do usuário nessas aulas
    let progressByLesson: Record<string, any> = {};
    if (allLessons.length > 0) {
      const lessonIds = allLessons.map(l => l.id);
      const { data: progress } = await supabaseAdmin
        .from('education_user_progress')
        .select('*')
        .eq('organization_id', DEFAULT_ORG_ID)
        .eq('platform_user_id', platformUserId)
        .in('lesson_id', lessonIds);

      for (const p of progress || []) {
        progressByLesson[p.lesson_id] = p;
      }
    }

    // 8. Compor estrutura aninhada
    const enrichedCourses = (courses || []).map(course => {
      const courseSections = (sectionsByCourse[course.id] || []).map(section => {
        const lessons = (lessonsBySection[section.id] || []).map(lesson => {
          const prog = progressByLesson[lesson.id];
          return {
            ...lesson,
            is_completed: prog?.is_completed || false,
            last_position_seconds: prog?.last_position_seconds || 0,
            completion_percent: prog?.completion_percent || 0
          };
        });
        return { ...section, lessons };
      });

      const totalLessons = courseSections.reduce((n, s) => n + s.lessons.length, 0);
      const completedLessons = courseSections.reduce(
        (n, s) => n + s.lessons.filter((l: any) => l.is_completed).length,
        0
      );

      return {
        ...course,
        sections: courseSections,
        total_lessons: totalLessons,
        completed_lessons: completedLessons,
        progress_percent: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0
      };
    });

    // 9. Encontrar "next_lesson" — a primeira aula não concluída (em ordem)
    let nextLesson: any = null;
    outer: for (const course of enrichedCourses) {
      for (const section of course.sections) {
        for (const lesson of section.lessons) {
          if (!lesson.is_completed) {
            nextLesson = {
              lesson_id: lesson.id,
              lesson_title: lesson.title,
              course_id: course.id,
              course_title: course.title,
              section_title: section.title,
              video_thumbnail_url: lesson.video_thumbnail_url,
              video_duration_seconds: lesson.video_duration_seconds,
              last_position_seconds: lesson.last_position_seconds,
              completion_percent: lesson.completion_percent
            };
            break outer;
          }
        }
      }
    }

    // 10. Resumo geral
    const totalLessons = enrichedCourses.reduce((n, c) => n + c.total_lessons, 0);
    const completedCount = enrichedCourses.reduce((n, c) => n + c.completed_lessons, 0);
    const isTrackComplete = totalLessons > 0 && completedCount === totalLessons;

    // 11. Certificado: se trilha 100% concluída, busca/emite certificado
    let certificate: any = null;
    if (isTrackComplete) {
      // Busca se já tem certificado
      const { data: existingCert, error: certSelectError } = await supabaseAdmin
        .from('education_certificates')
        .select('*')
        .eq('platform_user_id', platformUserId)
        .eq('track_id', track.id)
        .maybeSingle();

      // Se a tabela não existe (migration 527 não rodou), pula silenciosamente
      if (certSelectError && certSelectError.code === '42P01') {
        console.warn(
          '[platform/education/tracks/me] education_certificates table missing — run migration 527.'
        );
      } else if (existingCert) {
        certificate = existingCert;
      } else {
        // Emite novo certificado
        const { data: userData } = await supabaseAdmin
          .from('platform_users')
          .select('full_name, email')
          .eq('id', platformUserId)
          .maybeSingle();

        if (userData?.full_name) {
          // Gera código único (função SQL)
          const { data: codeData } = await supabaseAdmin.rpc('generate_certificate_code');
          const certificateCode = codeData || `CRIA-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

          const totalDuration = enrichedCourses.reduce((sum, c) => {
            return (
              sum +
              c.sections.reduce((cs: number, s: any) => {
                return cs + s.lessons.reduce((ls: number, l: any) => ls + (l.video_duration_seconds || 0), 0);
              }, 0)
            );
          }, 0);

          const { data: newCert } = await supabaseAdmin
            .from('education_certificates')
            .insert({
              organization_id: DEFAULT_ORG_ID,
              platform_user_id: platformUserId,
              track_id: track.id,
              user_full_name: userData.full_name,
              user_email: userData.email,
              track_title: track.title,
              certificate_code: certificateCode,
              total_lessons: totalLessons,
              total_duration_seconds: totalDuration
            })
            .select('*')
            .single();

          certificate = newCert;
        }
      }
    }

    return NextResponse.json({
      success: true,
      track,
      courses: enrichedCourses,
      summary: {
        total_lessons: totalLessons,
        completed_count: completedCount,
        progress_percent: totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0,
        next_lesson: nextLesson,
        is_complete: isTrackComplete
      },
      certificate
    });
  } catch (error: any) {
    console.error('[platform/education/tracks/me] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Erro interno', details: error.message },
      { status: 500 }
    );
  }
}
