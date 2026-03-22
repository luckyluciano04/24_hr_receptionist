-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  email TEXT NOT NULL,
  business_name TEXT,
  phone TEXT,
  tier TEXT DEFAULT 'starter' CHECK (tier IN ('starter', 'professional', 'enterprise')),
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  subscription_status TEXT DEFAULT 'inactive',
  twilio_phone_number TEXT,
  google_sheet_id TEXT,
  calls_this_month INTEGER DEFAULT 0,
  onboarding_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Call records
CREATE TABLE IF NOT EXISTS calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id),
  caller_name TEXT,
  caller_phone TEXT,
  call_summary TEXT,
  call_transcript TEXT,
  call_duration_seconds INTEGER,
  twilio_call_sid TEXT UNIQUE,
  status TEXT DEFAULT 'completed',
  delivered_via TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE calls ENABLE ROW LEVEL SECURITY;

-- Profiles policy
CREATE POLICY "Users see own profile"
  ON profiles
  FOR ALL
  USING (auth.uid() = id);

-- Calls policy
CREATE POLICY "Users see own calls"
  ON calls
  FOR ALL
  USING (profile_id = auth.uid());

-- Indexes
CREATE INDEX IF NOT EXISTS calls_profile_id_idx ON calls (profile_id);
CREATE INDEX IF NOT EXISTS calls_created_at_idx ON calls (created_at DESC);
CREATE INDEX IF NOT EXISTS profiles_stripe_customer_id_idx ON profiles (stripe_customer_id);
CREATE INDEX IF NOT EXISTS profiles_twilio_phone_idx ON profiles (twilio_phone_number);
