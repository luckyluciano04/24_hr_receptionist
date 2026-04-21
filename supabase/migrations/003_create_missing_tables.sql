-- Create public.calls table
CREATE TABLE IF NOT EXISTS public.calls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  from_number TEXT,
  to_number TEXT,
  status TEXT,
  duration INTEGER,
  twilio_call_sid TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create public.profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  business_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Temporarily disable RLS for both tables
ALTER TABLE public.calls DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- To reload schema cache in Supabase, run: supabase db reset