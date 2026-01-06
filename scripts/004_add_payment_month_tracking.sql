-- Add payment_month column to track which month the payment is for
ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS payment_month TEXT;

-- Update existing payments to have current month
UPDATE public.payments 
SET payment_month = TO_CHAR(payment_date, 'YYYY-MM') 
WHERE payment_month IS NULL;

-- Create index for faster queries by month
CREATE INDEX IF NOT EXISTS idx_payments_month ON public.payments(payment_month);

-- Allow public delete on payments (for admin operations)
DROP POLICY IF EXISTS "Allow public delete on payments" ON public.payments;
CREATE POLICY "Allow public delete on payments" ON public.payments FOR DELETE USING (true);
