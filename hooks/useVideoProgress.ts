'use client';

import { useCallback, useRef } from 'react';

interface Options {
  platformUserId: string | null;
  lessonId: string;
  /** Chamado quando o backend confirma conclusão */
  onComplete?: () => void;
}

/**
 * Hook que encapsula as chamadas ao backend de progresso.
 *
 * - sendHeartbeat(): POST /progress com watched_seconds + position (debounced via ref)
 * - markComplete(): POST /progress/complete (idempotente)
 *
 * O controle do "quando" chamar fica no componente do player
 * (a cada 10s enquanto playing, ao atingir 90%, ou no evento ENDED).
 */
export function useVideoProgress({ platformUserId, lessonId, onComplete }: Options) {
  const inFlightRef = useRef(false);
  const completedRef = useRef(false);
  const lastSentSecondsRef = useRef(0);

  const sendHeartbeat = useCallback(
    async (watchedSeconds: number, positionSeconds: number, durationSeconds: number) => {
      if (!platformUserId) return;
      if (inFlightRef.current) return; // evita sobreposição

      // Evita requests quando não houve mudança relevante (< 3s)
      if (Math.abs(watchedSeconds - lastSentSecondsRef.current) < 3) return;

      inFlightRef.current = true;
      try {
        const res = await fetch('/api/platform/education/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            platform_user_id: platformUserId,
            lesson_id: lessonId,
            watched_seconds: Math.floor(watchedSeconds),
            last_position_seconds: Math.floor(positionSeconds),
            duration_seconds: Math.floor(durationSeconds)
          })
        });

        const data = await res.json();
        if (data.success) {
          lastSentSecondsRef.current = watchedSeconds;
          // Se o backend confirmou que foi concluída, dispara onComplete
          if (data.is_completed && !completedRef.current) {
            completedRef.current = true;
            onComplete?.();
          }
        }
      } catch (err) {
        console.error('[useVideoProgress] heartbeat error:', err);
      } finally {
        inFlightRef.current = false;
      }
    },
    [platformUserId, lessonId, onComplete]
  );

  const markComplete = useCallback(async () => {
    if (!platformUserId) return;
    if (completedRef.current) return;
    completedRef.current = true;

    try {
      const res = await fetch('/api/platform/education/progress/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform_user_id: platformUserId,
          lesson_id: lessonId
        })
      });
      const data = await res.json();
      if (data.success) {
        onComplete?.();
      }
    } catch (err) {
      console.error('[useVideoProgress] complete error:', err);
    }
  }, [platformUserId, lessonId, onComplete]);

  const reset = useCallback(() => {
    completedRef.current = false;
    lastSentSecondsRef.current = 0;
  }, []);

  return { sendHeartbeat, markComplete, reset };
}
