-- Organizations (multi-tenant top-level entity)
CREATE TABLE IF NOT EXISTS organizations (
  id   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL
);

-- Call sessions (one row per inbound call, links to organizations)
CREATE TABLE IF NOT EXISTS call_sessions (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_sid   TEXT UNIQUE NOT NULL,
  org_id     UUID REFERENCES organizations(id) ON DELETE SET NULL,
  caller     TEXT,
  status     TEXT DEFAULT 'in_progress',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call events (granular transcript + AI response rows, one per turn)
CREATE TABLE IF NOT EXISTS call_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_sid    TEXT NOT NULL,
  transcript  TEXT,
  ai_response TEXT,
  intent      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Leads captured from calls
CREATE TABLE IF NOT EXISTS leads (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_sid     TEXT,
  name         TEXT,
  intent_score INTEGER DEFAULT 0,
  status       TEXT DEFAULT 'new',
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Appointments booked via the AI receptionist
CREATE TABLE IF NOT EXISTS appointments (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_sid   TEXT,
  time       TIMESTAMPTZ,
  status     TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS call_events_call_sid_idx   ON call_events (call_sid);
CREATE INDEX IF NOT EXISTS call_events_created_at_idx ON call_events (created_at DESC);
CREATE INDEX IF NOT EXISTS leads_call_sid_idx          ON leads (call_sid);
CREATE INDEX IF NOT EXISTS leads_status_idx            ON leads (status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx        ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS appointments_call_sid_idx   ON appointments (call_sid);
CREATE INDEX IF NOT EXISTS appointments_time_idx       ON appointments (time);
CREATE INDEX IF NOT EXISTS call_sessions_org_id_idx    ON call_sessions (org_id);
