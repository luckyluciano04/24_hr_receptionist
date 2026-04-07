-- Add UNIQUE constraint on profiles.email
-- Required for upsert with onConflict: 'email' in Tally and Stripe webhook handlers
ALTER TABLE profiles ADD CONSTRAINT profiles_email_unique UNIQUE (email);

-- Create increment_calls RPC function
-- Called by lib/call-processing.ts after each completed call to track monthly usage
CREATE OR REPLACE FUNCTION increment_calls(p_profile_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET calls_this_month = calls_this_month + 1
  WHERE id = p_profile_id;
END;
$$;
