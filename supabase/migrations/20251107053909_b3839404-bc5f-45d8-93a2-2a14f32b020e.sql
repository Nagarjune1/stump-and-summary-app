-- Fix RLS policy for tournament_matches to allow tournament organizers to create fixtures
DROP POLICY IF EXISTS "Tournament organizers can schedule matches" ON public.tournament_matches;

-- Create a more robust policy that checks tournament ownership
CREATE POLICY "Tournament organizers can schedule matches"
ON public.tournament_matches
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.tournaments
    WHERE tournaments.id = tournament_matches.tournament_id
    AND tournaments.created_by = auth.uid()
  )
  OR has_role(auth.uid(), 'admin')
);

-- Also add UPDATE and DELETE policies for managing fixtures
CREATE POLICY "Tournament organizers can update fixtures"
ON public.tournament_matches
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.tournaments
    WHERE tournaments.id = tournament_matches.tournament_id
    AND tournaments.created_by = auth.uid()
  )
  OR has_role(auth.uid(), 'admin')
);

CREATE POLICY "Tournament organizers can delete fixtures"
ON public.tournament_matches
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.tournaments
    WHERE tournaments.id = tournament_matches.tournament_id
    AND tournaments.created_by = auth.uid()
  )
  OR has_role(auth.uid(), 'admin')
);