-- Add field to track number of paying members (excluding admin)
ALTER TABLE public.spotify_config 
ADD COLUMN IF NOT EXISTS paying_members INTEGER NOT NULL DEFAULT 5;

-- Update existing config to set paying_members
UPDATE public.spotify_config 
SET paying_members = 5 
WHERE paying_members IS NULL OR paying_members = number_of_members;
