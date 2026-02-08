-- ============================================================
-- CHATBOT FUNNEL TRACKING SYSTEM
-- Tabela chatbot_events + Views de análise + Índices
-- ============================================================

-- 1. TABELA PRINCIPAL: chatbot_events
CREATE TABLE IF NOT EXISTS chatbot_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id VARCHAR(64) NOT NULL,
  source VARCHAR(100) NOT NULL DEFAULT 'unknown',
  event_type VARCHAR(30) NOT NULL CHECK (event_type IN (
    'session_start', 'step_completed', 'step_abandoned', 'form_submitted', 'whatsapp_click'
  )),
  step_id VARCHAR(100),
  step_number INTEGER,
  step_value TEXT,
  user_type VARCHAR(20),
  time_on_step_ms INTEGER,
  session_duration_ms INTEGER,
  -- UTM parameters
  utm_source VARCHAR(200),
  utm_medium VARCHAR(200),
  utm_campaign VARCHAR(200),
  utm_content VARCHAR(200),
  -- Device info
  screen_width INTEGER,
  screen_height INTEGER,
  user_agent TEXT,
  referrer TEXT,
  -- Flexible metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ÍNDICES
CREATE INDEX IF NOT EXISTS idx_chatbot_events_session ON chatbot_events(session_id);
CREATE INDEX IF NOT EXISTS idx_chatbot_events_source ON chatbot_events(source);
CREATE INDEX IF NOT EXISTS idx_chatbot_events_source_date ON chatbot_events(source, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chatbot_events_type ON chatbot_events(event_type);
CREATE INDEX IF NOT EXISTS idx_chatbot_events_created ON chatbot_events(created_at DESC);

-- Partial index para funnel analysis (só step_completed)
CREATE INDEX IF NOT EXISTS idx_chatbot_events_funnel
  ON chatbot_events(session_id, step_number)
  WHERE event_type = 'step_completed';

-- 3. RLS - Habilitar mas permitir service role
ALTER TABLE chatbot_events ENABLE ROW LEVEL SECURITY;

-- Policy: service role tem acesso total (API usa service_role_key)
CREATE POLICY "chatbot_events_service_role_all" ON chatbot_events
  FOR ALL USING (true) WITH CHECK (true);

-- 4. VIEW: chatbot_sessions (agregação por sessão)
CREATE OR REPLACE VIEW chatbot_sessions AS
SELECT
  session_id,
  source,
  MIN(created_at) AS session_start,
  MAX(created_at) AS session_end,
  MAX(session_duration_ms) AS total_duration_ms,
  COUNT(*) FILTER (WHERE event_type = 'step_completed') AS steps_completed,
  MAX(step_number) FILTER (WHERE event_type = 'step_completed') AS max_step_reached,
  -- Último step que o usuário completou
  (SELECT ce2.step_id FROM chatbot_events ce2
   WHERE ce2.session_id = chatbot_events.session_id
   AND ce2.event_type = 'step_completed'
   ORDER BY ce2.step_number DESC LIMIT 1) AS last_step_id,
  -- User type (pegar o primeiro não-nulo)
  MAX(user_type) AS user_type,
  -- UTM data (pegar do primeiro evento)
  MIN(utm_source) AS utm_source,
  MIN(utm_medium) AS utm_medium,
  MIN(utm_campaign) AS utm_campaign,
  MIN(utm_content) AS utm_content,
  -- Device info
  MIN(screen_width) AS screen_width,
  MIN(referrer) AS referrer,
  -- Flags de status
  BOOL_OR(event_type = 'form_submitted') AS is_completed,
  BOOL_OR(event_type = 'step_abandoned') AS was_abandoned,
  BOOL_OR(event_type = 'whatsapp_click') AS clicked_whatsapp,
  -- Date for grouping
  MIN(created_at)::date AS session_date
FROM chatbot_events
GROUP BY session_id, source;

-- 5. VIEW: chatbot_funnel (funil por source e data)
CREATE OR REPLACE VIEW chatbot_funnel AS
WITH session_stats AS (
  SELECT
    source,
    MIN(created_at)::date AS session_date,
    session_id,
    COUNT(*) FILTER (WHERE event_type = 'step_completed') AS steps_completed,
    MAX(step_number) FILTER (WHERE event_type = 'step_completed') AS max_step,
    BOOL_OR(event_type = 'form_submitted') AS completed,
    BOOL_OR(event_type = 'step_abandoned') AS abandoned,
    MAX(user_type) AS user_type
  FROM chatbot_events
  GROUP BY source, session_id
)
SELECT
  source,
  session_date,
  COUNT(DISTINCT session_id) AS total_sessions,
  COUNT(DISTINCT session_id) FILTER (WHERE completed) AS completed_sessions,
  COUNT(DISTINCT session_id) FILTER (WHERE abandoned AND NOT completed) AS abandoned_sessions,
  ROUND(
    (COUNT(DISTINCT session_id) FILTER (WHERE completed))::numeric /
    NULLIF(COUNT(DISTINCT session_id), 0) * 100,
    2
  ) AS completion_rate,
  -- Retention by step (percentual que passou por cada step)
  COUNT(DISTINCT session_id) FILTER (WHERE max_step >= 0) AS reached_step_0,
  COUNT(DISTINCT session_id) FILTER (WHERE max_step >= 1) AS reached_step_1,
  COUNT(DISTINCT session_id) FILTER (WHERE max_step >= 2) AS reached_step_2,
  COUNT(DISTINCT session_id) FILTER (WHERE max_step >= 3) AS reached_step_3,
  COUNT(DISTINCT session_id) FILTER (WHERE max_step >= 4) AS reached_step_4,
  COUNT(DISTINCT session_id) FILTER (WHERE max_step >= 5) AS reached_step_5,
  COUNT(DISTINCT session_id) FILTER (WHERE max_step >= 6) AS reached_step_6,
  COUNT(DISTINCT session_id) FILTER (WHERE max_step >= 7) AS reached_step_7,
  COUNT(DISTINCT session_id) FILTER (WHERE max_step >= 8) AS reached_step_8,
  COUNT(DISTINCT session_id) FILTER (WHERE max_step >= 9) AS reached_step_9,
  COUNT(DISTINCT session_id) FILTER (WHERE max_step >= 10) AS reached_step_10,
  -- User type breakdown
  COUNT(DISTINCT session_id) FILTER (WHERE user_type = 'empresa') AS empresa_sessions,
  COUNT(DISTINCT session_id) FILTER (WHERE user_type = 'criador') AS criador_sessions
FROM session_stats
GROUP BY source, session_date
ORDER BY session_date DESC, source;

-- 6. VIEW: chatbot_step_analytics (análise detalhada por step)
CREATE OR REPLACE VIEW chatbot_step_analytics AS
SELECT
  source,
  step_id,
  step_number,
  COUNT(*) AS total_completions,
  AVG(time_on_step_ms)::integer AS avg_time_ms,
  PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY time_on_step_ms)::integer AS median_time_ms,
  MIN(time_on_step_ms) AS min_time_ms,
  MAX(time_on_step_ms) AS max_time_ms,
  -- Valor mais comum para options steps
  MODE() WITHIN GROUP (ORDER BY step_value) AS most_common_value,
  COUNT(DISTINCT session_id) AS unique_sessions,
  MIN(created_at)::date AS first_seen,
  MAX(created_at)::date AS last_seen
FROM chatbot_events
WHERE event_type = 'step_completed'
  AND step_id IS NOT NULL
GROUP BY source, step_id, step_number
ORDER BY source, step_number;

-- 7. VIEW: chatbot_abandonment_hotspots (onde as pessoas abandonam)
CREATE OR REPLACE VIEW chatbot_abandonment_hotspots AS
WITH last_steps AS (
  SELECT
    session_id,
    source,
    MAX(step_number) FILTER (WHERE event_type = 'step_completed') AS last_completed_step,
    (SELECT ce2.step_id FROM chatbot_events ce2
     WHERE ce2.session_id = chatbot_events.session_id
     AND ce2.event_type = 'step_completed'
     ORDER BY ce2.step_number DESC LIMIT 1) AS last_step_id,
    BOOL_OR(event_type = 'form_submitted') AS completed
  FROM chatbot_events
  GROUP BY session_id, source
)
SELECT
  source,
  last_step_id AS abandoned_at_step,
  last_completed_step AS step_number,
  COUNT(*) AS abandon_count,
  ROUND(
    COUNT(*)::numeric / NULLIF(SUM(COUNT(*)) OVER (PARTITION BY source), 0) * 100,
    2
  ) AS abandon_percentage
FROM last_steps
WHERE NOT completed
  AND last_step_id IS NOT NULL
GROUP BY source, last_step_id, last_completed_step
ORDER BY source, abandon_count DESC;

-- 8. COMMENT na tabela
COMMENT ON TABLE chatbot_events IS 'Tracking granular de eventos do chatbot para análise de funil, abandono e conversão. PII é sanitizado (valores sensíveis salvos como [provided]).';
