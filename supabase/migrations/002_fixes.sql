-- Add UNIQUE constraint on profiles.email so upserts can target it
ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- RPC: increment the monthly call counter for a profile
CREATE OR REPLACE FUNCTION increment_calls(profile_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
  SET calls_this_month = calls_this_month + 1
  WHERE id = profile_id;
END;
$$;
