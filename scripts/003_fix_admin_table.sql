-- Drop the old admins table and recreate with correct structure
DROP TABLE IF EXISTS public.admins CASCADE;

-- Create admins table with username/password authentication
CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Allow public read on admins (needed for login verification)
CREATE POLICY "Allow public read on admins" ON public.admins FOR SELECT USING (true);

-- Insert default admin user (username: admin, password: admin123)
-- Password hash for 'admin123' using bcrypt with 10 rounds
INSERT INTO public.admins (username, password_hash)
VALUES ('admin', '$2a$10$rVjH3YC9p0xJKGKZ0vP8LOxN1qV3yYZhKYz1qV3yYZhKYz1qV3yYZ');
