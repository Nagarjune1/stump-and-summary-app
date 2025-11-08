-- Allow tournament creators and admins to delete tournaments
CREATE POLICY "Tournament creators and admins can delete tournaments"
ON public.tournaments
FOR DELETE
USING (
  (created_by = auth.uid()) OR 
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow authenticated users to view all profiles for scorer selection
CREATE POLICY "Authenticated users can view all profiles"
ON public.profiles
FOR SELECT
USING (auth.uid() IS NOT NULL);