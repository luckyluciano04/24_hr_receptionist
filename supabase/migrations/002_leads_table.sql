-- Leads table (simulated incoming call / lead capture)
CREATE TABLE IF NOT EXISTS leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Leads policy
CREATE POLICY "Users see own leads"
  ON leads
  FOR ALL
  USING (user_id = auth.uid());

-- Index
CREATE INDEX IF NOT EXISTS leads_user_id_idx ON leads (user_id);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);
