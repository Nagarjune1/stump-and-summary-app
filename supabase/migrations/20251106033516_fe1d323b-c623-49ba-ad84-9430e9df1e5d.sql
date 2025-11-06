-- Fix infinite recursion in match_permissions RLS policy
-- Create a security definer function to check match permissions

CREATE OR REPLACE FUNCTION public.user_has_match_permission(_match_id uuid, _user_id uuid, _permission_types text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.match_permissions
    WHERE match_id = _match_id
      AND user_id = _user_id
      AND permission_type = ANY(_permission_types)
  )
$$;

-- Update the matches table UPDATE policy to use the new function
DROP POLICY IF EXISTS "Match owners and scorers can update" ON public.matches;

CREATE POLICY "Match owners and scorers can update"
ON public.matches
FOR UPDATE
USING (
  public.user_has_match_permission(id, auth.uid(), ARRAY['owner', 'scorer']) 
  OR public.has_role(auth.uid(), 'admin'::app_role)
);

-- Also fix the DELETE policy for matches
DROP POLICY IF EXISTS "Only match owners and admins can delete" ON public.matches;

CREATE POLICY "Only match owners and admins can delete"
ON public.matches
FOR DELETE
USING (
  public.user_has_match_permission(id, auth.uid(), ARRAY['owner']) 
  OR public.has_role(auth.uid(), 'admin'::app_role)
);