
-- Add toss-related columns to the matches table
ALTER TABLE public.matches 
ADD COLUMN toss_winner TEXT,
ADD COLUMN toss_decision TEXT;
