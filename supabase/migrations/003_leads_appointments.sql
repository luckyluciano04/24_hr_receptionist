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

-- Enable RLS on new tables
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Indexes for efficient lookups
CREATE INDEX IF NOT EXISTS leads_call_sid_idx          ON leads (call_sid);
CREATE INDEX IF NOT EXISTS leads_status_idx            ON leads (status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx        ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS appointments_call_sid_idx   ON appointments (call_sid);
CREATE INDEX IF NOT EXISTS appointments_time_idx       ON appointments (time);
