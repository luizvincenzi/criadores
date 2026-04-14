'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { formatDuration } from '@/lib/education/youtube';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  video_duration_seconds: number | null;
  video_thumbnail_url: string | null;
  is_completed: boolean;
  completion_percent: number;
  is_locked: boolean;
  global_index: number;
}

interface Section {
  id: string;
  title: string;
  description: string | null;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  is_sequential: boolean;
  track_slug: string;
  track_title: string;
}

interface Totals {
  total_lessons: number;
  completed_lessons: number;
  progress_percent: number;
  total_duration_seconds: number;
}

interface NextLesson {
  id: string;
  title: string;
  completion_percent: number;
}

interface Props {
  courseId: string;
}

export function StudentCourseView({ courseId }: Props) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [course, setCourse] = useState<Course | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [nextLesson, setNextLesson] = useState<NextLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(
        `/api/platform/education/courses/${courseId}?platform_user_id=${user.id}`
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Erro ${res.status}`);
      }
      setCourse(data.course);
      setSections(data.sections || []);
      setTotals(data.totals);
      setNextLesson(data.next_lesson);
    } catch (e: any) {
      setError(e.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [courseId, user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 pt-[80px] md:pt-8">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 px-4 py-3 text-[13px] text-gray-600">
          Carregando curso...
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 pt-[80px] md:pt-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-[13px] text-red-700">
          <strong>Erro:</strong> {error || 'Curso não encontrado'}
        </div>
        <Link
          href="/aulas"
          className="inline-block mt-4 px-4 py-2 rounded-xl text-sm font-medium bg-gray-900 text-white hover:bg-gray-800"
        >
          ← Voltar para minhas aulas
        </Link>
      </div>
    );
  }

  const isComplete = totals && totals.total_lessons > 0 && totals.completed_lessons === totals.total_lessons;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pt-[80px] md:pt-8">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-1.5 text-[12px] text-gray-500">
        <Link href="/aulas" className="hover:text-gray-900 transition-colors">
          {course.track_title}
        </Link>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 truncate">{course.title}</span>
      </nav>

      {/* Course header */}
      <header className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">
                {course.title}
              </h1>
              {isComplete && (
                <span className="shrink-0 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-semibold flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Concluído
                </span>
              )}
            </div>
            {course.description && (
              <p className="text-[13px] text-gray-600 max-w-2xl">{course.description}</p>
            )}
          </div>

          {nextLesson && !isComplete && (
            <button
              onClick={() => router.push(`/aulas/${courseId}/${nextLesson.id}`)}
              className="shrink-0 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800 transition-all active:scale-[0.98] flex items-center gap-2"
            >
              {nextLesson.completion_percent > 0 ? 'Continuar' : 'Começar curso'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          )}
        </div>

        {/* Stats + progress bar */}
        {totals && totals.total_lessons > 0 && (
          <div className="mt-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[12px] text-gray-600">
                <span className="font-semibold text-gray-900">{totals.completed_lessons}</span>
                {' '}de{' '}
                <span className="font-semibold text-gray-900">{totals.total_lessons}</span>
                {' '}aulas concluídas
                {totals.total_duration_seconds > 0 && (
                  <>
                    <span className="text-gray-300 mx-1.5">·</span>
                    <span>{formatDuration(totals.total_duration_seconds)} no total</span>
                  </>
                )}
                {course.is_sequential && (
                  <>
                    <span className="text-gray-300 mx-1.5">·</span>
                    <span className="inline-flex items-center gap-1 text-amber-700">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Aulas em sequência
                    </span>
                  </>
                )}
              </div>
              <div
                className={`text-[13px] font-semibold ${
                  isComplete ? 'text-green-600' : 'text-gray-900'
                }`}
              >
                {totals.progress_percent}%
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isComplete ? 'bg-green-500' : 'bg-gray-900'
                }`}
                style={{ width: `${totals.progress_percent}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Sections + lessons */}
      {sections.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 p-12 text-center">
          <h3 className="text-[15px] font-semibold text-gray-900">
            Nenhuma aula publicada ainda
          </h3>
          <p className="text-[13px] text-gray-500 mt-1">
            O time Criadores está preparando o conteúdo deste curso.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, sIdx) => (
            <div
              key={section.id}
              className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 overflow-hidden"
            >
              {/* Section header */}
              <div className="px-5 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-gray-400">
                    SEÇÃO {String(sIdx + 1).padStart(2, '0')}
                  </span>
                  <h2 className="text-[15px] font-semibold text-gray-900">{section.title}</h2>
                </div>
                {section.description && (
                  <p className="text-[12px] text-gray-500 mt-1">{section.description}</p>
                )}
              </div>

              {/* Lessons */}
              {section.lessons.length === 0 ? (
                <div className="px-5 py-4 text-center text-[12px] text-gray-400">
                  Nenhuma aula nesta seção ainda.
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {section.lessons.map(lesson => (
                    <LessonRow
                      key={lesson.id}
                      lesson={lesson}
                      courseId={courseId}
                      sectionIndex={sIdx + 1}
                    />
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────

function LessonRow({
  lesson,
  courseId,
  sectionIndex
}: {
  lesson: Lesson;
  courseId: string;
  sectionIndex: number;
}) {
  const locked = lesson.is_locked;
  const completed = lesson.is_completed;
  const inProgress = !completed && lesson.completion_percent > 0;

  const statusIcon = completed ? (
    <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shrink-0">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    </div>
  ) : inProgress ? (
    <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600 ml-0.5">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
    </div>
  ) : locked ? (
    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-gray-400">
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    </div>
  ) : (
    <div className="w-7 h-7 rounded-full border-2 border-gray-200 shrink-0" />
  );

  const content = (
    <div className="flex items-center gap-3 px-5 py-3">
      {statusIcon}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-gray-400">
            {String(sectionIndex).padStart(2, '0')}.{String(lesson.global_index).padStart(2, '0')}
          </span>
          <h3
            className={`text-[13px] font-medium truncate ${
              locked ? 'text-gray-400' : 'text-gray-900'
            }`}
          >
            {lesson.title}
          </h3>
        </div>
        {inProgress && (
          <div className="mt-1 flex items-center gap-2">
            <div className="h-1 bg-gray-100 rounded-full overflow-hidden w-32">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${lesson.completion_percent}%` }}
              />
            </div>
            <span className="text-[10px] text-blue-600 font-medium">
              {Math.round(lesson.completion_percent)}%
            </span>
          </div>
        )}
        {locked && (
          <div className="text-[10px] text-gray-400 mt-0.5">
            Conclua a aula anterior para desbloquear
          </div>
        )}
      </div>

      {lesson.video_duration_seconds ? (
        <div className="text-[11px] text-gray-500 shrink-0 font-medium">
          {formatDuration(lesson.video_duration_seconds)}
        </div>
      ) : null}

      {!locked && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-gray-300 shrink-0"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      )}
    </div>
  );

  if (locked) {
    return (
      <li className="opacity-60 cursor-not-allowed select-none">{content}</li>
    );
  }

  return (
    <li>
      <Link
        href={`/aulas/${courseId}/${lesson.id}`}
        className="block hover:bg-white/60 transition-colors"
      >
        {content}
      </Link>
    </li>
  );
}
