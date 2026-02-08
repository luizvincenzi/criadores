import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// ============================================================
// CHATBOT TRACKING API
// POST público (sem auth), rate-limited, PII sanitizado
// ============================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// ============================================================
// RATE LIMITING (in-memory, simples)
// ============================================================

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minuto
const RATE_LIMIT_MAX = 60; // 60 requests por minuto por IP

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// Limpar entradas expiradas periodicamente (a cada 5 min)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap) {
      if (now > value.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }, 5 * 60_000);
}

// ============================================================
// VALIDAÇÃO E SANITIZAÇÃO
// ============================================================

const VALID_EVENT_TYPES = new Set([
  'session_start',
  'step_completed',
  'step_abandoned',
  'form_submitted',
  'whatsapp_click',
]);

const PII_STEP_IDS = new Set([
  'name',
  'email',
  'whatsapp',
  'instagram',
  'businessName',
]);

function sanitizeString(value: unknown, maxLength: number = 200): string | null {
  if (typeof value !== 'string') return null;
  return value.slice(0, maxLength);
}

function sanitizeNumber(value: unknown): number | null {
  if (typeof value !== 'number' || isNaN(value)) return null;
  return Math.max(0, Math.min(value, 999_999_999)); // Cap at reasonable max
}

interface RawEvent {
  session_id?: string;
  source?: string;
  event_type?: string;
  step_id?: string;
  step_number?: number;
  step_value?: string;
  user_type?: string;
  time_on_step_ms?: number;
  session_duration_ms?: number;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  screen_width?: number;
  screen_height?: number;
  user_agent?: string;
  referrer?: string;
  metadata?: Record<string, any>;
}

function validateAndSanitizeEvent(raw: RawEvent): Record<string, any> | null {
  // Campos obrigatórios
  const sessionId = sanitizeString(raw.session_id, 64);
  const source = sanitizeString(raw.source, 100);
  const eventType = sanitizeString(raw.event_type, 30);

  if (!sessionId || !source || !eventType) return null;
  if (!VALID_EVENT_TYPES.has(eventType)) return null;

  const stepId = sanitizeString(raw.step_id, 100);

  // Sanitizar PII no step_value
  let stepValue = sanitizeString(raw.step_value, 500);
  if (stepId && PII_STEP_IDS.has(stepId) && stepValue) {
    stepValue = '[provided]';
  }

  return {
    session_id: sessionId,
    source,
    event_type: eventType,
    step_id: stepId,
    step_number: sanitizeNumber(raw.step_number),
    step_value: stepValue,
    user_type: sanitizeString(raw.user_type, 20),
    time_on_step_ms: sanitizeNumber(raw.time_on_step_ms),
    session_duration_ms: sanitizeNumber(raw.session_duration_ms),
    utm_source: sanitizeString(raw.utm_source, 200),
    utm_medium: sanitizeString(raw.utm_medium, 200),
    utm_campaign: sanitizeString(raw.utm_campaign, 200),
    utm_content: sanitizeString(raw.utm_content, 200),
    screen_width: sanitizeNumber(raw.screen_width),
    screen_height: sanitizeNumber(raw.screen_height),
    user_agent: sanitizeString(raw.user_agent, 500),
    referrer: sanitizeString(raw.referrer, 500),
    metadata: typeof raw.metadata === 'object' && raw.metadata !== null
      ? raw.metadata
      : {},
  };
}

// ============================================================
// ROUTE HANDLER
// ============================================================

export async function POST(request: NextRequest) {
  try {
    // Rate limiting por IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // Parse body
    const body = await request.json();

    // Suportar batch (array) ou evento único
    const rawEvents: RawEvent[] = Array.isArray(body.events)
      ? body.events.slice(0, 20) // Max 20 por request
      : body.event
        ? [body.event]
        : [];

    if (rawEvents.length === 0) {
      return NextResponse.json(
        { error: 'No events provided' },
        { status: 400 }
      );
    }

    // Validar e sanitizar todos os eventos
    const validEvents = rawEvents
      .map(validateAndSanitizeEvent)
      .filter((e): e is Record<string, any> => e !== null);

    if (validEvents.length === 0) {
      return NextResponse.json(
        { error: 'No valid events' },
        { status: 400 }
      );
    }

    // Inserir no Supabase
    const { error } = await supabase
      .from('chatbot_events')
      .insert(validEvents);

    if (error) {
      console.error('[ChatbotTrack] Erro ao inserir eventos:', error.message);
      return NextResponse.json(
        { error: 'Failed to save events' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      saved: validEvents.length,
    });
  } catch (error) {
    console.error('[ChatbotTrack] Erro geral:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Health check / CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
