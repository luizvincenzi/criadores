// ============================================================
// CHATBOT TRACKING LIBRARY
// Fire-and-forget tracking com sendBeacon + batching
// ============================================================

'use client';

// Tipos
export interface ChatbotTrackingEvent {
  session_id: string;
  source: string;
  event_type: 'session_start' | 'step_completed' | 'step_abandoned' | 'form_submitted' | 'whatsapp_click';
  step_id?: string;
  step_number?: number;
  step_value?: string;
  user_type?: string;
  time_on_step_ms?: number;
  session_duration_ms?: number;
  metadata?: Record<string, any>;
}

interface DeviceInfo {
  screen_width: number;
  screen_height: number;
  user_agent: string;
  referrer: string;
}

interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
}

// ============================================================
// HELPERS
// ============================================================

/** Gera um ID de sessão único (UUID v4 simples) */
export function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback para ambientes sem crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Coleta informações do device (uma única vez por sessão) */
function getDeviceInfo(): DeviceInfo {
  if (typeof window === 'undefined') {
    return { screen_width: 0, screen_height: 0, user_agent: '', referrer: '' };
  }
  return {
    screen_width: window.screen?.width || window.innerWidth,
    screen_height: window.screen?.height || window.innerHeight,
    user_agent: navigator.userAgent || '',
    referrer: document.referrer || '',
  };
}

/** Coleta UTM params da URL (uma única vez por sessão) */
function getUTMParams(): UTMParams {
  if (typeof window === 'undefined') return {};

  try {
    const params = new URLSearchParams(window.location.search);
    const utm: UTMParams = {};

    const utmSource = params.get('utm_source');
    const utmMedium = params.get('utm_medium');
    const utmCampaign = params.get('utm_campaign');
    const utmContent = params.get('utm_content');

    if (utmSource) utm.utm_source = utmSource.slice(0, 200);
    if (utmMedium) utm.utm_medium = utmMedium.slice(0, 200);
    if (utmCampaign) utm.utm_campaign = utmCampaign.slice(0, 200);
    if (utmContent) utm.utm_content = utmContent.slice(0, 200);

    return utm;
  } catch {
    return {};
  }
}

// ============================================================
// CAMPOS PII - Para sanitização no cliente (redundância com API)
// ============================================================

const PII_FIELDS = new Set(['name', 'email', 'whatsapp', 'instagram', 'businessName']);

/** Sanitiza valores PII antes de enviar */
function sanitizeStepValue(stepId: string | undefined, value: string | undefined): string | undefined {
  if (!value || !stepId) return value;
  if (PII_FIELDS.has(stepId)) return '[provided]';
  return value.slice(0, 500); // Truncate para segurança
}

// ============================================================
// TRACKING QUEUE + BATCHING
// ============================================================

let eventQueue: Array<ChatbotTrackingEvent & DeviceInfo & UTMParams> = [];
let flushTimeout: ReturnType<typeof setTimeout> | null = null;
let cachedDeviceInfo: DeviceInfo | null = null;
let cachedUTMParams: UTMParams | null = null;

const BATCH_DELAY_MS = 2000; // Acumula eventos por 2s
const IMMEDIATE_EVENTS = new Set(['step_abandoned', 'form_submitted', 'whatsapp_click']);
const API_ENDPOINT = '/api/chatbot/track';
const MAX_BATCH_SIZE = 20;

/** Envia eventos para a API */
function sendEvents(events: Array<ChatbotTrackingEvent & DeviceInfo & UTMParams>): void {
  if (events.length === 0) return;

  const payload = JSON.stringify({ events });

  try {
    // Preferir sendBeacon para não bloquear e sobreviver a page unload
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      const sent = navigator.sendBeacon(API_ENDPOINT, blob);

      if (!sent) {
        // Fallback para fetch com keepalive
        fetchFallback(payload);
      }
    } else {
      fetchFallback(payload);
    }
  } catch (error) {
    // Fire-and-forget: nunca bloquear o UX
    if (process.env.NODE_ENV === 'development') {
      console.warn('[ChatbotTracking] Erro ao enviar eventos:', error);
    }
  }
}

/** Fallback fetch com keepalive */
function fetchFallback(payload: string): void {
  try {
    fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Silencioso - fire-and-forget
    });
  } catch {
    // Silencioso
  }
}

/** Flush (esvazia) a queue de eventos */
export function flushChatbotEvents(): void {
  if (flushTimeout) {
    clearTimeout(flushTimeout);
    flushTimeout = null;
  }

  if (eventQueue.length === 0) return;

  // Enviar em batches de MAX_BATCH_SIZE
  while (eventQueue.length > 0) {
    const batch = eventQueue.splice(0, MAX_BATCH_SIZE);
    sendEvents(batch);
  }
}

/** Enfileira um evento de tracking */
export function trackChatbotEvent(event: ChatbotTrackingEvent): void {
  if (typeof window === 'undefined') return;

  // Cache device info e UTM params na primeira chamada
  if (!cachedDeviceInfo) cachedDeviceInfo = getDeviceInfo();
  if (!cachedUTMParams) cachedUTMParams = getUTMParams();

  // Sanitizar step_value
  const sanitizedEvent = {
    ...event,
    step_value: sanitizeStepValue(event.step_id, event.step_value),
    ...cachedDeviceInfo,
    ...cachedUTMParams,
  };

  eventQueue.push(sanitizedEvent);

  // Eventos imediatos: flush agora
  if (IMMEDIATE_EVENTS.has(event.event_type)) {
    flushChatbotEvents();
    return;
  }

  // Batching: agendar flush após delay
  if (!flushTimeout) {
    flushTimeout = setTimeout(() => {
      flushChatbotEvents();
    }, BATCH_DELAY_MS);
  }
}

// ============================================================
// SETUP PAGE UNLOAD HANDLER
// ============================================================

/** Configura handlers de saída de página para flush final */
export function setupUnloadHandlers(
  sessionId: string,
  source: string,
  getCurrentStepId: () => string | undefined,
  getCurrentStepNumber: () => number,
  getSessionDurationMs: () => number,
  getUserType: () => string | undefined,
  getIsCompleted?: () => boolean
): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleUnload = () => {
    // Só enviar evento de abandono se NÃO completou o fluxo
    if (getIsCompleted && getIsCompleted()) {
      flushChatbotEvents();
      return;
    }

    trackChatbotEvent({
      session_id: sessionId,
      source,
      event_type: 'step_abandoned',
      step_id: getCurrentStepId(),
      step_number: getCurrentStepNumber(),
      session_duration_ms: getSessionDurationMs(),
      user_type: getUserType(),
    });

    // Flush tudo
    flushChatbotEvents();
  };

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'hidden') {
      // Flush eventos pendentes quando tab fica oculta
      flushChatbotEvents();
    }
  };

  window.addEventListener('beforeunload', handleUnload);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // Retorna cleanup function
  return () => {
    window.removeEventListener('beforeunload', handleUnload);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}
