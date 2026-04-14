'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * YouTube Lesson Player — iframe + postMessage (sem script externo).
 *
 * Por que não usamos a YouTube IFrame API oficial (script externo)?
 * O CSP do criadores.app tem script-src restritivo (permite só Google Tag
 * Manager / Analytics). O script https://www.youtube.com/iframe_api é
 * bloqueado pelo browser antes mesmo de tentar executar.
 *
 * Como este player funciona:
 * - Renderiza um <iframe> com enablejsapi=1
 * - Envia {event:"listening",...} por postMessage assim que o iframe carrega
 * - YouTube responde com onReady / onStateChange / infoDelivery continuamente
 * - Lemos currentTime, duration, playerState dos eventos infoDelivery
 * - Como backup, polimos getCurrentTime a cada ~2s (caso infoDelivery atrase)
 *
 * Este é o mesmo protocolo interno que a IFrame API oficial usa — só que
 * sem depender do script externo, então funciona com qualquer CSP que
 * permita frame-src youtube.com (que o nosso já permite).
 */

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [ready, setReady] = useState(false);

  // Refs — state sem re-render
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const playerStateRef = useRef<number>(-1); // -1=unstarted, 0=ended, 1=playing, 2=paused, 3=buffering, 5=cued
  const watchedSecondsRef = useRef(0);
  const lastTickRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const initialSeekDoneRef = useRef(false);
  const initialPositionRef = useRef(initialPositionSeconds);

  // URL de embed (enablejsapi=1 habilita postMessage)
  const embedUrl = useMemo(() => {
    const params = new URLSearchParams({
      enablejsapi: '1',
      modestbranding: '1',
      rel: '0',
      iv_load_policy: '3',
      cc_load_policy: '0',
      playsinline: '1',
      fs: '1',
      controls: '1'
    });
    return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
  }, [videoId]);

  // Helper: postMessage pra iframe
  const postToIframe = useCallback((message: any) => {
    const win = iframeRef.current?.contentWindow;
    if (!win) return;
    try {
      win.postMessage(JSON.stringify(message), '*');
    } catch (err) {
      console.error('[YouTubeLessonPlayer] postMessage error:', err);
    }
  }, []);

  const sendCommand = useCallback(
    (func: string, args: any[] = []) => {
      postToIframe({ event: 'command', func, args });
    },
    [postToIframe]
  );

  // Reseta estado quando o videoId muda
  useEffect(() => {
    watchedSecondsRef.current = 0;
    lastTickRef.current = null;
    completedRef.current = false;
    initialSeekDoneRef.current = false;
    currentTimeRef.current = 0;
    durationRef.current = 0;
    playerStateRef.current = -1;
    initialPositionRef.current = initialPositionSeconds;
    setReady(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId]);

  // Escuta mensagens vindas do iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Só aceita mensagens do nosso iframe específico
      if (!iframeRef.current) return;
      if (event.source !== iframeRef.current.contentWindow) return;

      // YouTube envia strings JSON. Ignora objetos.
      if (typeof event.data !== 'string') return;

      let data: any;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }
      if (!data || typeof data !== 'object') return;

      // onReady: player pronto pra receber comandos
      if (data.event === 'onReady') {
        setReady(true);

        // Seek pra posição inicial (retomar de onde parou)
        if (initialPositionRef.current > 2 && !initialSeekDoneRef.current) {
          initialSeekDoneRef.current = true;
          // Pequeno delay pra garantir que o player processou onReady
          setTimeout(() => {
            sendCommand('seekTo', [initialPositionRef.current, true]);
          }, 250);
        }
      }

      // onStateChange: estado mudou
      if (data.event === 'onStateChange') {
        const state = typeof data.info === 'number' ? data.info : -1;
        playerStateRef.current = state;
        // 0 = ENDED → marca como concluída
        if (state === 0 && !completedRef.current) {
          completedRef.current = true;
          onComplete?.();
        }
      }

      // infoDelivery: updates periódicos com currentTime/duration/playerState
      if (data.event === 'infoDelivery' && data.info) {
        const info = data.info;
        if (typeof info.currentTime === 'number') {
          currentTimeRef.current = info.currentTime;
        }
        if (typeof info.duration === 'number' && info.duration > 0) {
          if (durationRef.current !== info.duration) {
            durationRef.current = info.duration;
            onDurationDetected?.(info.duration);
          }
        }
        if (typeof info.playerState === 'number') {
          playerStateRef.current = info.playerState;
        }
      }

      // apiInfoDelivery / videoProgress: variantes em versões antigas
      if (data.event === 'apiInfoDelivery' && data.info) {
        const info = data.info;
        if (typeof info.currentTime === 'number') {
          currentTimeRef.current = info.currentTime;
        }
        if (typeof info.duration === 'number' && info.duration > 0) {
          if (durationRef.current !== info.duration) {
            durationRef.current = info.duration;
            onDurationDetected?.(info.duration);
          }
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [sendCommand, onComplete, onDurationDetected]);

  // Quando o iframe carrega: envia o comando "listening" pra se inscrever nos eventos
  const handleIframeLoad = useCallback(() => {
    postToIframe({ event: 'listening', id: 1, channel: 'widget' });
  }, [postToIframe]);

  // Tick loop de 1s — usa refs (sem re-render)
  useEffect(() => {
    let tickCount = 0;

    const interval = setInterval(() => {
      tickCount++;

      const state = playerStateRef.current;
      const currentTime = currentTimeRef.current;
      const duration = durationRef.current;
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

      // Callback pro parent salvar progresso
      onTick?.(watchedSecondsRef.current, currentTime, duration, isPlaying);

      // Conclusão em 90%
      if (!completedRef.current && duration > 0 && currentTime / duration >= 0.9) {
        completedRef.current = true;
        onComplete?.();
      }

      // Poll defensivo: a cada 2s pede getCurrentTime pra garantir freshness
      // Caso o infoDelivery automático esteja demorando
      if (ready && tickCount % 2 === 0) {
        sendCommand('getCurrentTime');
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [ready, sendCommand, onTick, onComplete]);

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-xl">
      <iframe
        ref={iframeRef}
        key={videoId}
        src={embedUrl}
        title="Aula"
        className="absolute inset-0 w-full h-full"
        frameBorder={0}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        onLoad={handleIframeLoad}
      />

      {/* Loading overlay enquanto o iframe inicializa */}
      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-col items-center gap-2 text-white/70">
            <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <div className="text-[11px] font-medium">Carregando player...</div>
          </div>
        </div>
      )}
    </div>
  );
}
