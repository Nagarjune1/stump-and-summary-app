-- Add batting_style and bowling_style columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN batting_style text,
ADD COLUMN bowling_style text;