-- Add recording_url to calls table
ALTER TABLE calls ADD COLUMN IF NOT EXISTS recording_url TEXT;

-- Add usage tracking to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usage_calls INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS usage_minutes INTEGER DEFAULT 0;