-- Allow public update on tournament_teams table
CREATE POLICY "Allow public update on tournament_teams"
ON public.tournament_teams
FOR UPDATE
USING (true);