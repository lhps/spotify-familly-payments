-- Create family members table
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES public.family_members(id) ON DELETE CASCADE,
  member_name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  receipt_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'confirmed')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create configuration table for Pix and plan settings
CREATE TABLE IF NOT EXISTS public.spotify_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pix_key TEXT NOT NULL,
  pix_type TEXT NOT NULL CHECK (pix_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
  account_holder TEXT NOT NULL,
  total_monthly_cost DECIMAL(10, 2) NOT NULL DEFAULT 34.90,
  number_of_members INTEGER NOT NULL DEFAULT 6,
  due_day INTEGER NOT NULL DEFAULT 1 CHECK (due_day BETWEEN 1 AND 31),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Added admins table with username/password authentication
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS (but make these tables publicly accessible since no auth is required)
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spotify_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read on family_members" ON public.family_members FOR SELECT USING (true);
CREATE POLICY "Allow public insert on family_members" ON public.family_members FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read on payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Allow public insert on payments" ON public.payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on payments" ON public.payments FOR UPDATE USING (true);
CREATE POLICY "Allow public read on spotify_config" ON public.spotify_config FOR SELECT USING (true);
CREATE POLICY "Allow public update on spotify_config" ON public.spotify_config FOR UPDATE USING (true);
-- Only allow reading admin info (for login verification)
CREATE POLICY "Allow public read on admins" ON public.admins FOR SELECT USING (true);

-- Insert default configuration
INSERT INTO public.spotify_config (pix_key, pix_type, account_holder, total_monthly_cost, number_of_members, due_day)
VALUES ('seu-email@exemplo.com', 'email', 'Seu Nome Completo', 34.90, 6, 1)
ON CONFLICT DO NOTHING;

-- Insert default admin user (username: admin, password: admin123)
-- Password hash for 'admin123' using bcrypt
INSERT INTO public.admins (username, password_hash)
VALUES ('admin', '$2a$10$rVjH3YC9p0xJKGKZ0vP8LOxN1qV3yYZhKYz1qV3yYZhKYz1qV3yYZ')
ON CONFLICT (username) DO NOTHING;
