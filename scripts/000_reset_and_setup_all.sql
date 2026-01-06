-- Complete database setup script
-- Run this to set up all tables and data from scratch

-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS family_members CASCADE;
DROP TABLE IF EXISTS spotify_config CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- Create admins table
CREATE TABLE admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create spotify_config table
CREATE TABLE spotify_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pix_key TEXT NOT NULL,
  pix_holder_name TEXT NOT NULL,
  pix_qr_code TEXT,
  total_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  number_of_members INTEGER NOT NULL DEFAULT 6,
  paying_members INTEGER NOT NULL DEFAULT 5,
  due_date TEXT DEFAULT '5',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create family_members table
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create payments table with payment_month
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_name TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  receipt_url TEXT,
  payment_month TEXT NOT NULL DEFAULT TO_CHAR(CURRENT_DATE, 'YYYY-MM'),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotify_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no authentication required)
CREATE POLICY "Allow public read on spotify_config" ON spotify_config FOR SELECT USING (true);
CREATE POLICY "Allow public insert on spotify_config" ON spotify_config FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on spotify_config" ON spotify_config FOR UPDATE USING (true);

CREATE POLICY "Allow public read on family_members" ON family_members FOR SELECT USING (true);
CREATE POLICY "Allow public insert on family_members" ON family_members FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on payments" ON payments FOR SELECT USING (true);
CREATE POLICY "Allow public insert on payments" ON payments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on payments" ON payments FOR UPDATE USING (true);

CREATE POLICY "Allow public read on admins" ON admins FOR SELECT USING (true);
CREATE POLICY "Allow public insert on admins" ON admins FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on admins" ON admins FOR UPDATE USING (true);

-- Using PostgreSQL's native crypt() function to hash password
-- Insert default admin user (username: admin, password: admin123)
INSERT INTO admins (username, password_hash)
VALUES ('admin', crypt('admin123', gen_salt('bf')))
ON CONFLICT (username) DO UPDATE SET password_hash = crypt('admin123', gen_salt('bf'));

-- Insert default config
INSERT INTO spotify_config (pix_key, pix_holder_name, total_cost, number_of_members, paying_members, due_date)
VALUES ('seuemail@exemplo.com', 'Seu Nome', 34.90, 6, 5, '5')
ON CONFLICT DO NOTHING;
