-- Add UNIQUE constraint on profiles.email to support upsert on email
ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Atomic increment of calls_this_month to avoid race conditions
CREATE OR REPLACE FUNCTION increment_calls(p_profile_id UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE profiles
  SET calls_this_month = calls_this_month + 1
  WHERE id = p_profile_id;
$$;
