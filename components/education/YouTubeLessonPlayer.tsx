'use client';

import React, { useEffect, useRef } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface Props {
  videoId: string;
  initialPositionSeconds?: number;
  /** Chamado a cada tick (~1s) com o estado atual — use para salvar progresso */
  onTick?: (watchedSeconds: number, currentTime: number, duration: number, isPlaying: boolean) => void;
  /** Chamado uma vez quando o vídeo atinge 90% ou dispara ENDED */
  onComplete?: () => void;
  /** Chamado com a duration assim que detectada */
  onDurationDetected?: (durationSeconds: number) => void;
}

/**
 * Player do YouTube via IFrame API.
 *
 * Características:
 * - Heartbeat de 1s que só conta tempo quando player.getPlayerState() === PLAYING
 * - Descarta deltas > 5s (tab hibernou / computador dormiu)
 * - Descarta seeks (tempo decorrido real vs. currentTime são independentes)
 * - Dispara onComplete() uma vez em 90% OU no evento ENDED
 * - modestbranding=1, rel=0, iv_load_policy=3 → minimiza branding e sugestões
 */
export function YouTubeLessonPlayer({
  videoId,
  initialPositionSeconds = 0,
  onTick,
  onComplete,
  onDurationDetected
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);
  const watchedSecondsRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const initializedRef = useRef(false);
  const initialPositionRef = useRef(initialPositionSeconds);

  // Carrega a IFrame API e inicializa o player
  useEffect(() => {
    if (!containerRef.current) return;

    // Reset em cada mudança de videoId (mudou de aula)
    watchedSecondsRef.current = 0;
    lastTickRef.current = null;
    completedRef.current = false;
    initializedRef.current = false;
    initialPositionRef.current = initialPositionSeconds;

    const loadApi = () => {
      return new Promise<void>(resolve => {
        if (window.YT && window.YT.Player) {
          resolve();
          return;
        }

        // Se já existe uma promessa global de carregamento, aguarda ela
        const existing = document.getElementById('youtube-iframe-api');
        if (existing) {
          const prev = window.onYouTubeIframeAPIReady;
          window.onYouTubeIframeAPIReady = () => {
            prev?.();
            resolve();
          };
          return;
        }

        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
        window.onYouTubeIframeAPIReady = () => resolve();
      });
    };

    let cancelled = false;

    loadApi().then(() => {
      if (cancelled || !containerRef.current) return;

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,
        playerVars: {
          modestbranding: 1,
          rel: 0,
          iv_load_policy: 3,
          cc_load_policy: 0,
          fs: 1,
          controls: 1,
          disablekb: 0,
          enablejsapi: 1,
          origin: typeof window !== 'undefined' ? window.location.origin : undefined
        },
        events: {
          onReady: (e: any) => {
            initializedRef.current = true;

            // Detecta duration
            try {
              const dur = e.target.getDuration?.();
              if (dur && dur > 0) {
                onDurationDetected?.(dur);
              }
            } catch {}

            // Retoma de onde parou (se > 2s)
            if (initialPositionRef.current > 2) {
              try {
                e.target.seekTo(initialPositionRef.current, true);
              } catch {}
            }
          },
          onStateChange: (e: any) => {
            // 0 = ENDED
            if (e.data === 0 && !completedRef.current) {
              completedRef.current = true;
              onComplete?.();
            }
          }
        }
      });
    });

    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy?.();
      } catch {}
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // Tick de 1s: mede tempo real assistido (só quando playing)
  useEffect(() => {
    const interval = setInterval(() => {
      const p = playerRef.current;
      if (!p || !initializedRef.current) return;

      let state = -1;
      let currentTime = 0;
      let duration = 0;

      try {
        state = p.getPlayerState?.() ?? -1;
        currentTime = p.getCurrentTime?.() ?? 0;
        duration = p.getDuration?.() ?? 0;
      } catch {
        return;
      }

      // 1 = PLAYING — incrementa watched_seconds com delta real
      const isPlaying = state === 1;

      if (isPlaying) {
        const now = Date.now();
        if (lastTickRef.current) {
          const delta = (now - lastTickRef.current) / 1000;
          // Descarta delta > 5s (tab hibernou, computador dormiu, etc.)
          if (delta > 0 && delta < 5) {
            watchedSecondsRef.current += delta;
          }
        }
        lastTickRef.current = now;
      } else {
        lastTickRef.current = null;
      }

      // Notifica o pai
      onTick?.(watchedSecondsRef.current, currentTime, duration, isPlaying);

      // Conclusão por 90% (além do evento ENDED)
      if (!completedRef.current && duration > 0 && currentTime / duration >= 0.9) {
        completedRef.current = true;
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [onTick, onComplete]);

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-xl">
      <div ref={containerRef} className="absolute inset-0" />
    </div>
  );
}
