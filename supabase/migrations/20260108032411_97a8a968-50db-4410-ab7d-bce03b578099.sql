-- Fix infinite recursion in match_permissions RLS policies
-- Use a security definer function that doesn't query match_permissions

-- Drop existing problematic policies first
DROP POLICY IF EXISTS "Match owners and scorers can manage permissions" ON public.match_permissions;
DROP POLICY IF EXISTS "Only match creators can establish initial ownership" ON public.match_permissions;
DROP POLICY IF EXISTS "Users can view match permissions they're involved in" ON public.match_permissions;

-- Create helper function to check if user is match creator or admin (does NOT query match_permissions)
CREATE OR REPLACE FUNCTION public.is_match_creator_or_admin(_match_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.matches 
      WHERE id = _match_id AND created_by = auth.uid()
    )
$$;

-- SELECT policy: users can see their own permissions or permissions they granted
CREATE POLICY "Users can view their match permissions"
ON public.match_permissions
FOR SELECT
USING (
  user_id = auth.uid()
  OR granted_by = auth.uid()
  OR public.is_match_creator_or_admin(match_id)
);

-- INSERT policy: match creators and admins can add permissions
CREATE POLICY "Match creators and admins can add permissions"
ON public.match_permissions
FOR INSERT
WITH CHECK (
  public.is_match_creator_or_admin(match_id)
);

-- UPDATE policy: match creators and admins can update permissions
CREATE POLICY "Match creators and admins can update permissions"
ON public.match_permissions
FOR UPDATE
USING (
  public.is_match_creator_or_admin(match_id)
);

-- DELETE policy: match creators and admins can delete permissions
CREATE POLICY "Match creators and admins can delete permissions"
ON public.match_permissions
FOR DELETE
USING (
  public.is_match_creator_or_admin(match_id)
);

-- Also update the policies for ball_by_ball and match_stats to use a non-recursive check
-- Drop existing policies
DROP POLICY IF EXISTS "Match scorers can add ball records" ON public.ball_by_ball;
DROP POLICY IF EXISTS "Match scorers can update ball records" ON public.ball_by_ball;
DROP POLICY IF EXISTS "Match scorers can delete ball records" ON public.ball_by_ball;
DROP POLICY IF EXISTS "Match scorers can add stats" ON public.match_stats;
DROP POLICY IF EXISTS "Match scorers can update stats" ON public.match_stats;
DROP POLICY IF EXISTS "Match scorers can delete stats" ON public.match_stats;

-- Create helper function that safely checks match permission using the table directly
CREATE OR REPLACE FUNCTION public.can_score_match(_match_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR EXISTS (
      SELECT 1 FROM public.matches 
      WHERE id = _match_id AND created_by = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.match_permissions 
      WHERE match_id = _match_id 
      AND user_id = auth.uid() 
      AND permission_type IN ('owner', 'scorer')
    )
$$;

-- Recreate ball_by_ball policies using the safe function
CREATE POLICY "Match scorers can add ball records"
ON public.ball_by_ball
FOR INSERT
WITH CHECK (public.can_score_match(match_id));

CREATE POLICY "Match scorers can update ball records"
ON public.ball_by_ball
FOR UPDATE
USING (public.can_score_match(match_id));

CREATE POLICY "Match scorers can delete ball records"
ON public.ball_by_ball
FOR DELETE
USING (public.can_score_match(match_id));

-- Recreate match_stats policies using the safe function
CREATE POLICY "Match scorers can add stats"
ON public.match_stats
FOR INSERT
WITH CHECK (public.can_score_match(match_id));

CREATE POLICY "Match scorers can update stats"
ON public.match_stats
FOR UPDATE
USING (public.can_score_match(match_id));

CREATE POLICY "Match scorers can delete stats"
ON public.match_stats
FOR DELETE
USING (public.can_score_match(match_id));