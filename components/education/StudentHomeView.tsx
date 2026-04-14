'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { formatDuration, getYouTubeThumbnailUrl } from '@/lib/education/youtube';

interface Lesson {
  id: string;
  section_id: string;
  title: string;
  description: string | null;
  youtube_video_id: string | null;
  video_thumbnail_url: string | null;
  video_duration_seconds: number | null;
  is_completed: boolean;
  last_position_seconds: number;
  completion_percent: number;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  sections: Section[];
  total_lessons: number;
  completed_lessons: number;
  progress_percent: number;
}

interface NextLesson {
  lesson_id: string;
  lesson_title: string;
  course_id: string;
  course_title: string;
  section_title: string;
  video_thumbnail_url: string | null;
  video_duration_seconds: number | null;
  last_position_seconds: number;
  completion_percent: number;
}

interface Summary {
  total_lessons: number;
  completed_count: number;
  progress_percent: number;
  next_lesson: NextLesson | null;
}

interface Track {
  id: string;
  title: string;
  description: string | null;
}

export function StudentHomeView() {
  const { user } = useAuthStore();
  const [track, setTrack] = useState<Track | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `/api/platform/education/tracks/me?platform_user_id=${user.id}`
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Erro ${res.status}`);
      }
      setTrack(data.track);
      setCourses(data.courses || []);
      setSummary(data.summary || null);
    } catch (e: any) {
      setError(e.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  // Coleta todas as aulas em ordem
  const allLessons: Array<{ lesson: Lesson; course: Course; section: Section }> = [];
  for (const course of courses) {
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        allLessons.push({ lesson, course, section });
      }
    }
  }

  const pendingLessons = allLessons.filter(x => !x.lesson.is_completed);
  const completedLessons = allLessons.filter(x => x.lesson.is_completed);

  // "Próximas" exclui a aula atual do "Continue" pra não repetir
  const continueLessonId = summary?.next_lesson?.lesson_id;
  const upcomingLessons = pendingLessons.filter(x => x.lesson.id !== continueLessonId).slice(0, 6);

  const firstName = (user?.full_name || '').split(' ')[0] || 'por aí';

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 px-4 py-3 text-[13px] text-gray-600">
          Carregando suas aulas...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-[13px] text-red-700">
          <strong>Erro:</strong> {error}
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 p-12 text-center">
          <h3 className="text-[15px] font-semibold text-gray-900">
            Nenhuma trilha disponível para o seu perfil ainda
          </h3>
          <p className="text-[13px] text-gray-500 mt-1 max-w-md mx-auto">
            O time Criadores está preparando o conteúdo. Em breve você verá as aulas aqui.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pt-[80px] md:pt-8">
      {/* Welcome + progress bar */}
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
          Olá, {firstName} 👋
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Bem-vindo(a) à <span className="font-medium text-gray-700">{track.title}</span>
        </p>

        {summary && summary.total_lessons > 0 && (
          <div className="mt-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[13px] font-medium text-gray-900">
                Seu progresso
              </div>
              <div className="text-[12px] text-gray-500">
                <span className="font-semibold text-gray-900">{summary.completed_count}</span>
                {' '}de{' '}
                <span className="font-semibold text-gray-900">{summary.total_lessons}</span>
                {' '}aulas concluídas
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gray-900 rounded-full transition-all duration-500"
                style={{ width: `${summary.progress_percent}%` }}
              />
            </div>
            <div className="mt-1.5 text-[11px] text-gray-500 text-right">
              {summary.progress_percent}% concluído
            </div>
          </div>
        )}
      </header>

      {/* Continue de onde parou */}
      {summary?.next_lesson && (
        <section className="mb-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Continue de onde parou
          </h2>
          <ContinueCard next={summary.next_lesson} />
        </section>
      )}

      {/* Próximas aulas */}
      {upcomingLessons.length > 0 && (
        <section className="mb-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Próximas aulas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingLessons.map(({ lesson, course }) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                courseTitle={course.title}
                courseId={course.id}
                variant="upcoming"
              />
            ))}
          </div>
        </section>
      )}

      {/* Concluídas */}
      {completedLessons.length > 0 && (
        <section>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Concluídas ({completedLessons.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedLessons.map(({ lesson, course }) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                courseTitle={course.title}
                courseId={course.id}
                variant="completed"
              />
            ))}
          </div>
        </section>
      )}

      {/* Se não tem nada ainda */}
      {summary && summary.total_lessons === 0 && (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 p-12 text-center">
          <h3 className="text-[15px] font-semibold text-gray-900">
            Nenhuma aula disponível ainda
          </h3>
          <p className="text-[13px] text-gray-500 mt-1">
            O time Criadores está preparando novos conteúdos para você.
          </p>
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Sub-componentes
// ────────────────────────────────────────────────────────────

function ContinueCard({ next }: { next: NextLesson }) {
  const thumb =
    next.video_thumbnail_url ||
    (next.video_duration_seconds
      ? null
      : null);

  const progressPct = next.completion_percent || 0;

  return (
    <Link
      href={`/aulas/${next.course_id}/${next.lesson_id}`}
      className="group block bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 p-4 hover:bg-white/85 hover:shadow-md transition-all"
    >
      <div className="flex items-start gap-4">
        <div className="relative w-48 aspect-video rounded-xl overflow-hidden bg-gray-100 shrink-0">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
                <path d="m22 8-6 4 6 4V8Z" strokeLinecap="round" strokeLinejoin="round" />
                <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
              </svg>
            </div>
          )}
          {/* Play overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-90 group-hover:scale-100 duration-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-gray-900 ml-0.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
          {/* Progress bar bottom */}
          {progressPct > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
              <div
                className="h-full bg-white"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          )}
          {/* Duration badge */}
          {next.video_duration_seconds ? (
            <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-[10px] font-medium rounded">
              {formatDuration(next.video_duration_seconds)}
            </div>
          ) : null}
        </div>

        <div className="flex-1 min-w-0 py-1">
          <div className="text-[11px] text-gray-500 truncate">
            {next.course_title} · {next.section_title}
          </div>
          <h3 className="text-[16px] font-semibold text-gray-900 mt-0.5 leading-snug">
            {next.lesson_title}
          </h3>
          {progressPct > 0 ? (
            <p className="text-[12px] text-gray-500 mt-2">
              {Math.round(progressPct)}% assistido — toque para continuar
            </p>
          ) : (
            <p className="text-[12px] text-gray-500 mt-2">
              Comece agora — toque para assistir
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

function LessonCard({
  lesson,
  courseTitle,
  courseId,
  variant
}: {
  lesson: Lesson;
  courseTitle: string;
  courseId: string;
  variant: 'upcoming' | 'completed';
}) {
  const thumb =
    lesson.video_thumbnail_url ||
    (lesson.youtube_video_id ? getYouTubeThumbnailUrl(lesson.youtube_video_id, 'hq') : null);

  return (
    <Link
      href={`/aulas/${courseId}/${lesson.id}`}
      className="group block bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 overflow-hidden hover:bg-white/85 hover:shadow-sm transition-all"
    >
      <div className="relative aspect-video bg-gray-100">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300">
              <path d="m22 8-6 4 6 4V8Z" strokeLinecap="round" strokeLinejoin="round" />
              <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
            </svg>
          </div>
        )}

        {/* Completed badge */}
        {variant === 'completed' && (
          <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow-md">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}

        {/* Duration badge */}
        {lesson.video_duration_seconds ? (
          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/70 text-white text-[10px] font-medium rounded">
            {formatDuration(lesson.video_duration_seconds)}
          </div>
        ) : null}

        {/* Partial progress (upcoming only) */}
        {variant === 'upcoming' && lesson.completion_percent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
            <div
              className="h-full bg-white"
              style={{ width: `${lesson.completion_percent}%` }}
            />
          </div>
        )}
      </div>

      <div className="p-3">
        <div className="text-[10px] text-gray-500 truncate uppercase tracking-wide">
          {courseTitle}
        </div>
        <h3 className="text-[13px] font-semibold text-gray-900 mt-0.5 leading-snug line-clamp-2">
          {lesson.title}
        </h3>
      </div>
    </Link>
  );
}
