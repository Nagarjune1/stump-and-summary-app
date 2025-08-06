
-- Add missing columns to matches table
ALTER TABLE public.matches 
ADD COLUMN IF NOT EXISTS noball_runs INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS wide_runs INTEGER DEFAULT 1;

-- Ensure the columns have proper defaults
UPDATE public.matches 
SET noball_runs = 1 
WHERE noball_runs IS NULL;

UPDATE public.matches 
SET wide_runs = 1 
WHERE wide_runs IS NULL;
