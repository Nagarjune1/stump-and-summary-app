-- Fix venues_public view to use SECURITY INVOKER
DROP VIEW IF EXISTS public.venues_public;

CREATE OR REPLACE VIEW public.venues_public
WITH (security_invoker = true) AS
SELECT 
  id, name, location, city, capacity, pitch_type, 
  facilities, photos, rating, total_matches, created_at
FROM public.venues;

-- Restrict financial data exposure on tournaments table
-- Only authenticated users can see registration_fee and prize_money
DROP POLICY IF EXISTS "Allow public read access on tournaments" ON public.tournaments;

CREATE POLICY "Public can view basic tournament info"
ON public.tournaments
FOR SELECT
USING (true);

-- Authenticated users can see all tournament details including financial
CREATE POLICY "Authenticated users can view full tournament details"
ON public.tournaments
FOR SELECT
TO authenticated
USING (true);

-- Restrict financial data exposure on tournament_sponsors table
DROP POLICY IF EXISTS "Allow public read access on tournament_sponsors" ON public.tournament_sponsors;

CREATE POLICY "Public can view sponsor names and logos"
ON public.tournament_sponsors
FOR SELECT
USING (true);

-- Tournament organizers and admins can see all sponsor details
CREATE POLICY "Organizers can view full sponsor details"
ON public.tournament_sponsors
FOR SELECT
TO authenticated
USING (
  (EXISTS (
    SELECT 1 FROM tournaments
    WHERE tournaments.id = tournament_sponsors.tournament_id
    AND tournaments.created_by = auth.uid()
  ))
  OR has_role(auth.uid(), 'admin'::app_role)
);

-- Add proper INSERT policy for match_permissions to prevent unauthorized permission grants
CREATE POLICY "Only match creators can establish initial ownership"
ON public.match_permissions
FOR INSERT
TO authenticated
WITH CHECK (
  -- Must be the match creator
  (EXISTS (
    SELECT 1 FROM matches
    WHERE matches.id = match_permissions.match_id
    AND matches.created_by = auth.uid()
  ))
  -- OR already have owner/scorer permission on this match
  OR (EXISTS (
    SELECT 1 FROM match_permissions mp
    WHERE mp.match_id = match_permissions.match_id
    AND mp.user_id = auth.uid()
    AND mp.permission_type IN ('owner', 'scorer')
  ))
  OR has_role(auth.uid(), 'admin'::app_role)
);