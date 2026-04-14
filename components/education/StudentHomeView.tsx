'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { formatDuration, getYouTubeThumbnailUrl } from '@/lib/education/youtube';

interface Lesson {
  id: string;
  section_id: string;
  title: string;
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
  cover_url: string | null;
  estimated_duration_minutes: number | null;
  is_sequential?: boolean;
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
  is_complete: boolean;
}

interface Track {
  id: string;
  title: string;
  description: string | null;
}

interface Certificate {
  id: string;
  certificate_code: string;
  user_full_name: string;
  track_title: string;
  issued_at: string;
}

export function StudentHomeView() {
  const { user } = useAuthStore();
  const [track, setTrack] = useState<Track | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
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
      setCertificate(data.certificate || null);
    } catch (e: any) {
      setError(e.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const firstName = (user?.full_name || '').split(' ')[0] || '';

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 pt-[80px] md:pt-8">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 px-4 py-3 text-[13px] text-gray-600">
          Carregando suas aulas...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 pt-[80px] md:pt-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-[13px] text-red-700">
          <strong>Erro:</strong> {error}
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 pt-[80px] md:pt-8">
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
      {/* Welcome header */}
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
          Olá{firstName ? `, ${firstName}` : ''} 👋
        </h1>
        <p className="text-[14px] text-gray-500 mt-1">
          Bem-vindo(a) à <span className="font-medium text-gray-700">{track.title}</span>
        </p>

        {/* Global progress */}
        {summary && summary.total_lessons > 0 && (
          <div className="mt-5 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 px-5 py-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-[13px] font-medium text-gray-900">Seu progresso</div>
              <div className="text-[12px] text-gray-500">
                <span className="font-semibold text-gray-900">{summary.completed_count}</span>
                {' '}de{' '}
                <span className="font-semibold text-gray-900">{summary.total_lessons}</span>
                {' '}aulas concluídas
              </div>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  summary.is_complete ? 'bg-green-500' : 'bg-gray-900'
                }`}
                style={{ width: `${summary.progress_percent}%` }}
              />
            </div>
            <div className="mt-1.5 text-[11px] text-gray-500 text-right">
              {summary.progress_percent}% concluído
            </div>
          </div>
        )}
      </header>

      {/* Certificate banner quando 100% */}
      {certificate && (
        <CertificateBanner certificate={certificate} />
      )}

      {/* Continue assistindo */}
      {summary?.next_lesson && (
        <section className="mb-10">
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Continue assistindo
          </h2>
          <ContinueCard next={summary.next_lesson} />
        </section>
      )}

      {/* Seus cursos */}
      <section>
        <h2 className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
          Seus cursos
        </h2>
        {courses.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 p-12 text-center">
            <h3 className="text-[15px] font-semibold text-gray-900">
              Nenhum curso disponível ainda
            </h3>
            <p className="text-[13px] text-gray-500 mt-1">
              O time Criadores está preparando novos conteúdos para você.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ────────────────────────────────────────────────────────────

function ContinueCard({ next }: { next: NextLesson }) {
  const thumb =
    next.video_thumbnail_url ||
    (next.video_duration_seconds ? null : null);
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
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                className="text-gray-300"
              >
                <path d="m22 8-6 4 6 4V8Z" strokeLinecap="round" strokeLinejoin="round" />
                <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
              </svg>
            </div>
          )}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity scale-90 group-hover:scale-100 duration-200">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-gray-900 ml-0.5">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
          </div>
          {progressPct > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
              <div className="h-full bg-white" style={{ width: `${progressPct}%` }} />
            </div>
          )}
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
          <p className="text-[12px] text-gray-500 mt-2">
            {progressPct > 0
              ? `${Math.round(progressPct)}% assistido — toque para continuar`
              : 'Toque para começar'}
          </p>
        </div>
      </div>
    </Link>
  );
}

function CourseCard({ course }: { course: Course }) {
  const { id, title, description, cover_url, total_lessons, completed_lessons, progress_percent } = course;

  // Acha thumbnail fallback a partir da primeira aula com vídeo
  const fallbackThumb = (() => {
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        if (lesson.video_thumbnail_url) return lesson.video_thumbnail_url;
        if (lesson.youtube_video_id) return getYouTubeThumbnailUrl(lesson.youtube_video_id, 'hq');
      }
    }
    return null;
  })();

  const thumb = cover_url || fallbackThumb;
  const isCompleted = total_lessons > 0 && completed_lessons === total_lessons;
  const notStarted = completed_lessons === 0;
  const buttonLabel = isCompleted
    ? 'Revisar curso'
    : notStarted
      ? 'Começar curso'
      : 'Continuar curso';

  return (
    <Link
      href={`/aulas/curso/${id}`}
      className="group block bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 overflow-hidden hover:bg-white/85 hover:shadow-md transition-all"
    >
      {/* Cover */}
      <div className="relative aspect-video bg-gray-100">
        {thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumb} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-gray-300"
            >
              <path d="M22 10v6M2 10l10-5 10 5-10 5z" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M6 12v5c0 1.66 3.58 3 6 3s6-1.34 6-3v-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}

        {/* Completed badge */}
        {isCompleted && (
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-green-500 text-white text-[10px] font-semibold flex items-center gap-1 shadow-md">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Concluído
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="text-[15px] font-semibold text-gray-900 leading-snug line-clamp-2">
          {title}
        </h3>
        {description && (
          <p className="text-[12px] text-gray-500 mt-1 line-clamp-2">{description}</p>
        )}

        {/* Progress */}
        {total_lessons > 0 && (
          <>
            <div className="mt-3 flex items-center justify-between text-[11px] mb-1">
              <span className="text-gray-500">
                {completed_lessons} / {total_lessons} aulas
              </span>
              <span className={`font-semibold ${isCompleted ? 'text-green-600' : 'text-gray-900'}`}>
                {progress_percent}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-900'
                }`}
                style={{ width: `${progress_percent}%` }}
              />
            </div>
          </>
        )}

        {/* Button */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <div className="w-full px-3 py-2 rounded-lg text-[12px] font-medium bg-gray-900 text-white text-center group-hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5">
            {buttonLabel}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}

function CertificateBanner({ certificate }: { certificate: Certificate }) {
  return (
    <section className="mb-10">
      <div className="relative overflow-hidden bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center shrink-0 shadow-md">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
          </svg>
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-green-900">
            Parabéns! Você concluiu a trilha 🎉
          </div>
          <div className="text-[11px] text-green-700 mt-0.5">
            Seu certificado foi emitido. Código: <span className="font-mono font-semibold">{certificate.certificate_code}</span>
          </div>
        </div>

        <Link
          href={`/aulas/certificado/${certificate.certificate_code}`}
          target="_blank"
          className="shrink-0 px-4 py-2 rounded-xl text-[12px] font-semibold bg-green-600 text-white hover:bg-green-700 transition-colors"
        >
          Ver certificado →
        </Link>
      </div>
    </section>
  );
}
