'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

// ────────────────────────────────────────────────────────────
// Singleton loader da YouTube IFrame API
// Evita race conditions quando múltiplos players montam ao mesmo tempo.
// ────────────────────────────────────────────────────────────
let ytApiPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Sem window (SSR)'));
  }
  if (window.YT && window.YT.Player) {
    return Promise.resolve();
  }
  if (ytApiPromise) return ytApiPromise;

  ytApiPromise = new Promise<void>((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error('Timeout ao carregar YouTube API (10s)'));
    }, 10000);

    // Compose com callback anterior se já existir
    const previousCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      clearTimeout(timeoutId);
      previousCallback?.();
      if (window.YT && window.YT.Player) {
        resolve();
      } else {
        reject(new Error('YT.Player não disponível após load'));
      }
    };

    // Só injeta o script se ainda não existir
    const existing = document.getElementById('youtube-iframe-api-script');
    if (!existing) {
      const tag = document.createElement('script');
      tag.id = 'youtube-iframe-api-script';
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      tag.onerror = () => {
        clearTimeout(timeoutId);
        reject(new Error('Falha ao baixar o script do YouTube'));
      };
      document.body.appendChild(tag);
    }
  });

  return ytApiPromise;
}

// ────────────────────────────────────────────────────────────
// Componente
// ────────────────────────────────────────────────────────────

interface Props {
  videoId: string;
  initialPositionSeconds?: number;
  onTick?: (
    watchedSeconds: number,
    currentTime: number,
    duration: number,
    isPlaying: boolean
  ) => void;
  onComplete?: () => void;
  onDurationDetected?: (durationSeconds: number) => void;
}

export function YouTubeLessonPlayer({
  videoId,
  initialPositionSeconds = 0,
  onTick,
  onComplete,
  onDurationDetected
}: Props) {
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const playerRef = useRef<any>(null);
  const watchedSecondsRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const initialPositionRef = useRef(initialPositionSeconds);

  // ID único que muda quando o videoId muda
  // Isso força React a renderizar um novo <div> e o YT.Player
  // encontra ele via document.getElementById (mais robusto que passar ref).
  const containerId = useMemo(
    () => `yt-player-${videoId}-${Math.random().toString(36).slice(2, 8)}`,
    [videoId]
  );

  // Sempre que o videoId mudar, reseta estado local
  useEffect(() => {
    watchedSecondsRef.current = 0;
    lastTickRef.current = null;
    completedRef.current = false;
    initialPositionRef.current = initialPositionSeconds;
    setReady(false);
    setLoadError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // Inicializa o player quando o container está no DOM
  useEffect(() => {
    let cancelled = false;

    loadYouTubeAPI()
      .then(() => {
        if (cancelled) return;

        // Aguarda o próximo frame pra garantir que o div está montado
        const tryInit = () => {
          if (cancelled) return;
          const el = document.getElementById(containerId);
          if (!el) {
            console.warn('[YouTubeLessonPlayer] container not found yet:', containerId);
            // Tenta de novo no próximo frame
            requestAnimationFrame(tryInit);
            return;
          }

          try {
            playerRef.current = new window.YT.Player(containerId, {
              videoId,
              playerVars: {
                modestbranding: 1,
                rel: 0,
                iv_load_policy: 3,
                cc_load_policy: 0,
                fs: 1,
                controls: 1,
                disablekb: 0,
                playsinline: 1
                // Nota: 'origin' removido de propósito — causa problema quando
                // window.location.origin não bate exatamente com o header Origin.
              },
              events: {
                onReady: (e: any) => {
                  if (cancelled) return;
                  setReady(true);
                  try {
                    const dur = e.target.getDuration?.();
                    if (dur && dur > 0) {
                      onDurationDetected?.(dur);
                    }
                    if (initialPositionRef.current > 2) {
                      e.target.seekTo(initialPositionRef.current, true);
                    }
                  } catch (err) {
                    console.error('[YouTubeLessonPlayer] onReady error:', err);
                  }
                },
                onStateChange: (e: any) => {
                  // 0 = ENDED
                  if (e.data === 0 && !completedRef.current) {
                    completedRef.current = true;
                    onComplete?.();
                  }
                },
                onError: (e: any) => {
                  // https://developers.google.com/youtube/iframe_api_reference#onError
                  const errorMessages: Record<number, string> = {
                    2: 'ID do vídeo inválido',
                    5: 'Erro no player HTML5 — atualize o navegador',
                    100: 'Vídeo não encontrado ou removido',
                    101: 'Embed bloqueado — o dono do vídeo desativou o compartilhamento em outros sites',
                    150: 'Embed bloqueado — o dono do vídeo desativou o compartilhamento em outros sites'
                  };
                  const msg = errorMessages[e.data] || `Erro ${e.data} do player`;
                  console.error('[YouTubeLessonPlayer] player error:', e.data, msg);
                  setLoadError(msg);
                }
              }
            });
          } catch (err: any) {
            console.error('[YouTubeLessonPlayer] init error:', err);
            setLoadError(err.message || 'Erro ao inicializar o player');
          }
        };

        tryInit();
      })
      .catch((err: Error) => {
        console.error('[YouTubeLessonPlayer] API load error:', err);
        if (!cancelled) {
          setLoadError(err.message || 'Não foi possível carregar o YouTube');
        }
      });

    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy?.();
      } catch {}
      playerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, containerId]);

  // Tick loop de 1s (ativado só depois que o player está ready)
  useEffect(() => {
    if (!ready) return;

    const interval = setInterval(() => {
      const p = playerRef.current;
      if (!p) return;

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

      const isPlaying = state === 1;

      if (isPlaying) {
        const now = Date.now();
        if (lastTickRef.current) {
          const delta = (now - lastTickRef.current) / 1000;
          if (delta > 0 && delta < 5) {
            watchedSecondsRef.current += delta;
          }
        }
        lastTickRef.current = now;
      } else {
        lastTickRef.current = null;
      }

      onTick?.(watchedSecondsRef.current, currentTime, duration, isPlaying);

      if (!completedRef.current && duration > 0 && currentTime / duration >= 0.9) {
        completedRef.current = true;
        onComplete?.();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [ready, onTick, onComplete]);

  // ────────────────────────────────────────────────────────
  // Render
  // ────────────────────────────────────────────────────────

  // Estado de erro — mostra mensagem amigável + link pra YouTube
  if (loadError) {
    return (
      <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-900 flex flex-col items-center justify-center text-white p-6 text-center">
        <svg
          width="40"
          height="40"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-gray-400 mb-3"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <div className="text-[14px] font-medium max-w-md">{loadError}</div>
        <div className="text-[11px] text-gray-400 mt-1">Vídeo ID: {videoId}</div>
        <a
          href={`https://www.youtube.com/watch?v=${videoId}`}
          target="_blank"
          rel="noreferrer noopener"
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-medium bg-white/10 hover:bg-white/20 transition-colors"
        >
          Abrir diretamente no YouTube
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </a>
      </div>
    );
  }

  // Estado normal — mostra container + overlay de loading enquanto o player não está pronto
  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-xl">
      <div id={containerId} className="absolute inset-0 w-full h-full" />
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-white/70">
            <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <div className="text-[11px] font-medium">Carregando player...</div>
          </div>
        </div>
      )}
    </div>
  );
}
