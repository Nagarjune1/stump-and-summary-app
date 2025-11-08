-- Drop all existing policies on tournament_matches
DROP POLICY IF EXISTS "Tournament organizers can schedule matches" ON public.tournament_matches;
DROP POLICY IF EXISTS "Tournament organizers can update fixtures" ON public.tournament_matches;
DROP POLICY IF EXISTS "Tournament organizers can delete fixtures" ON public.tournament_matches;

-- Recreate all policies with proper RLS checks
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