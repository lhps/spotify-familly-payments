-- Create admins table to store allowed admin users
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Only allow admins to read the admin table
CREATE POLICY "Allow authenticated read on admins" ON public.admins FOR SELECT USING (auth.uid() IS NOT NULL);
