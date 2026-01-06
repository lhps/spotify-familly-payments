-- Add payment_month column to payments table
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_month TEXT;

-- Update existing payments to have current month based on payment_date
UPDATE public.payments 
SET payment_month = TO_CHAR(COALESCE(payment_date, created_at, NOW()), 'YYYY-MM') 
WHERE payment_month IS NULL;

-- Create index for faster queries by month
CREATE INDEX IF NOT EXISTS idx_payments_month ON public.payments(payment_month);

-- Add paying_members column to spotify_config table
ALTER TABLE public.spotify_config ADD COLUMN IF NOT EXISTS paying_members INTEGER;

-- Set default paying_members to number_of_members for existing config
UPDATE public.spotify_config 
SET paying_members = number_of_members 
WHERE paying_members IS NULL;

-- Set default value for future inserts
ALTER TABLE public.spotify_config ALTER COLUMN paying_members SET DEFAULT 5;
