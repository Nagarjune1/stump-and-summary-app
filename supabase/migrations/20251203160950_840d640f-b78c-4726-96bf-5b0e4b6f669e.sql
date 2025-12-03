-- Add profile_id column to players table to link with user profiles
ALTER TABLE public.players 
ADD COLUMN profile_id text REFERENCES public.profiles(profile_id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX idx_players_profile_id ON public.players(profile_id);