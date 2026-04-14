'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { YouTubeLessonPlayer } from './YouTubeLessonPlayer';
import { useVideoProgress } from '@/hooks/useVideoProgress';
import { formatDuration } from '@/lib/education/youtube';

interface Lesson {
  id: string;
  title: string;
  description: string | null;
  content_html: string | null;
  youtube_video_id: string | null;
  video_url: string | null;
  video_duration_seconds: number | null;
}

interface Attachment {
  id: string;
  type: string;
  title: string;
  download_url: string | null;
  file_size_bytes: number | null;
  mime_type: string | null;
  is_link: boolean;
}

interface Section {
  id: string;
  title: string;
}

interface Course {
  id: string;
  title: string;
}

interface Track {
  id: string;
  title: string;
}

interface Progress {
  watched_seconds: number;
  last_position_seconds: number;
  completion_percent: number;
  is_completed: boolean;
}

interface Navigation {
  prev: { id: string; title: string } | null;
  next: { id: string; title: string } | null;
  current_index: number;
  total_count: number;
}

interface Props {
  lessonId: string;
  courseId: string;
}

export function StudentLessonView({ lessonId, courseId }: Props) {
  const router = useRouter();
  const { user } = useAuthStore();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [section, setSection] = useState<Section | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [track, setTrack] = useState<Track | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [navigation, setNavigation] = useState<Navigation | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [justCompleted, setJustCompleted] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      setError(null);
      setJustCompleted(false);
      const res = await fetch(
        `/api/platform/education/lessons/${lessonId}?platform_user_id=${user.id}`
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || `Erro ${res.status}`);
      }
      setLesson(data.lesson);
      setSection(data.section);
      setCourse(data.course);
      setTrack(data.track);
      setProgress(data.progress);
      setNavigation(data.navigation);
      setAttachments(data.attachments || []);
    } catch (e: any) {
      setError(e.message || 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [user?.id, lessonId]);

  useEffect(() => {
    load();
  }, [load]);

  const { sendHeartbeat, markComplete, reset } = useVideoProgress({
    platformUserId: user?.id || null,
    lessonId,
    onComplete: () => setJustCompleted(true)
  });

  // Reset quando trocar de aula
  useEffect(() => {
    reset();
  }, [lessonId, reset]);

  // Tick vindo do player — faz heartbeat a cada ~10s
  const handleTick = useCallback(
    (watchedSeconds: number, currentTime: number, duration: number, isPlaying: boolean) => {
      // só envia se tiver assistido algo novo E player estiver tocando
      if (!isPlaying) return;
      if (watchedSeconds < 3) return;
      // envia a cada múltiplo de 10s assistidos
      const rounded = Math.floor(watchedSeconds);
      if (rounded % 10 === 0) {
        sendHeartbeat(watchedSeconds, currentTime, duration);
      }
    },
    [sendHeartbeat]
  );

  const handleComplete = useCallback(() => {
    markComplete();
    setJustCompleted(true);
  }, [markComplete]);

  const handleNextLesson = () => {
    if (navigation?.next) {
      router.push(`/aulas/${courseId}/${navigation.next.id}`);
    } else {
      router.push('/aulas');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 pt-[80px] md:pt-8">
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 px-4 py-3 text-[13px] text-gray-600">
          Carregando aula...
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8 pt-[80px] md:pt-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 text-[13px] text-red-700">
          <strong>Erro:</strong> {error || 'Aula não encontrada'}
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

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pt-[80px] md:pt-8">
      {/* Breadcrumb */}
      <nav className="mb-3 flex items-center gap-1.5 text-[12px] text-gray-500">
        <Link href="/aulas" className="hover:text-gray-900 transition-colors">
          {track?.title || 'Aulas'}
        </Link>
        <span className="text-gray-300">/</span>
        <span className="truncate">{course?.title}</span>
        <span className="text-gray-300">/</span>
        <span className="text-gray-900 truncate">{section?.title}</span>
      </nav>

      {/* Player */}
      {lesson.youtube_video_id ? (
        <YouTubeLessonPlayer
          videoId={lesson.youtube_video_id}
          initialPositionSeconds={progress?.last_position_seconds || 0}
          onTick={handleTick}
          onComplete={handleComplete}
        />
      ) : (
        <div className="w-full aspect-video rounded-2xl bg-gray-100 flex flex-col items-center justify-center p-8 text-center">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300 mb-3">
            <path d="m22 8-6 4 6 4V8Z" strokeLinecap="round" strokeLinejoin="round" />
            <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
          </svg>
          <div className="text-[14px] font-medium text-gray-700">
            Vídeo desta aula ainda não disponível
          </div>
          <div className="text-[12px] text-gray-500 mt-1">
            O time Criadores está preparando o conteúdo.
          </div>
        </div>
      )}

      {/* Header da aula */}
      <header className="mt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              {navigation && (
                <span className="text-[11px] font-mono text-gray-400">
                  Aula {navigation.current_index}/{navigation.total_count}
                </span>
              )}
              {(progress?.is_completed || justCompleted) && (
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-[10px] font-medium flex items-center gap-1">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Concluída
                </span>
              )}
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 tracking-tight mt-1">
              {lesson.title}
            </h1>
            {lesson.description && (
              <p className="text-sm text-gray-600 mt-2 max-w-3xl">
                {lesson.description}
              </p>
            )}
            {lesson.video_duration_seconds ? (
              <div className="text-[12px] text-gray-500 mt-2">
                Duração: {formatDuration(lesson.video_duration_seconds)}
              </div>
            ) : null}
          </div>
        </div>
      </header>

      {/* Conteúdo escrito */}
      {lesson.content_html && (
        <section className="mt-8 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 p-6">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Conteúdo da aula
          </h2>
          <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap">
            {lesson.content_html}
          </div>
        </section>
      )}

      {/* Materiais anexos */}
      {attachments.length > 0 && (
        <section className="mt-6 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 p-6">
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
            Materiais da aula
          </h2>
          <ul className="space-y-2">
            {attachments.map(att => (
              <AttachmentItem key={att.id} attachment={att} />
            ))}
          </ul>
        </section>
      )}

      {/* Barra de navegação entre aulas */}
      {navigation && (
        <div className="mt-8 flex items-center justify-between gap-3">
          {navigation.prev ? (
            <Link
              href={`/aulas/${courseId}/${navigation.prev.id}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              Anterior
            </Link>
          ) : (
            <div />
          )}

          {navigation.next ? (
            <button
              onClick={handleNextLesson}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all active:scale-[0.98]"
            >
              {justCompleted || progress?.is_completed ? 'Próxima aula' : 'Pular para a próxima'}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          ) : (
            <Link
              href="/aulas"
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-all"
            >
              Voltar para o início
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// ────────────────────────────────────────────────────────────

function AttachmentItem({ attachment }: { attachment: Attachment }) {
  const typeLabel =
    {
      pdf: 'PDF',
      slide: 'Slides',
      doc: 'Documento',
      image: 'Imagem',
      zip: 'ZIP',
      link: 'Link'
    }[attachment.type] || 'Arquivo';

  const sizeLabel = attachment.file_size_bytes
    ? formatFileSize(attachment.file_size_bytes)
    : null;

  const isLink = attachment.is_link;
  const href = attachment.download_url || '#';

  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        download={!isLink ? attachment.title : undefined}
        className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 hover:border-gray-300 transition-all"
      >
        <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0">
          {isLink ? (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-600"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
          ) : (
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-600"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-gray-900 truncate">
            {attachment.title}
          </div>
          <div className="text-[11px] text-gray-500 flex items-center gap-1.5">
            <span className="uppercase font-mono tracking-wide">{typeLabel}</span>
            {sizeLabel && (
              <>
                <span className="text-gray-300">·</span>
                <span>{sizeLabel}</span>
              </>
            )}
          </div>
        </div>

        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-gray-400 shrink-0"
        >
          {isLink ? (
            <>
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </>
          ) : (
            <>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </>
          )}
        </svg>
      </a>
    </li>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
