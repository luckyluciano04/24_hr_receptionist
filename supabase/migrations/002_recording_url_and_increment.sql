-- Add recording_url column to calls table for storing Twilio recording links
ALTER TABLE calls ADD COLUMN IF NOT EXISTS recording_url TEXT;

-- Function to increment calls_this_month counter
CREATE OR REPLACE FUNCTION increment_calls(profile_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET calls_this_month = calls_this_month + 1
  WHERE id = profile_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
