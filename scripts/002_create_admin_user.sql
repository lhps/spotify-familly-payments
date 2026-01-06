-- Enable the UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Note: You'll need to create the admin user through Supabase Auth
-- This script is for reference - you'll set the password when first accessing the admin page
-- or through the Supabase dashboard

-- Create a simple auth tracking table for admin sessions (optional)
CREATE TABLE IF NOT EXISTS admin_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Add RLS policies for admin sessions
ALTER TABLE admin_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin sessions are viewable by authenticated users"
  ON admin_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admin can create their own sessions"
  ON admin_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
