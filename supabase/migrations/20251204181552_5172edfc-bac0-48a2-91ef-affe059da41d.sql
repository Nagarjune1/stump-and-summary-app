-- Add created_by column to teams table
ALTER TABLE public.teams ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Create team_permissions table for team-level admin management
CREATE TABLE public.team_permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_type text NOT NULL DEFAULT 'admin',
  granted_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Enable RLS on team_permissions
ALTER TABLE public.team_permissions ENABLE ROW LEVEL SECURITY;

-- Function to check if user has team permission
CREATE OR REPLACE FUNCTION public.user_has_team_permission(_team_id uuid, _user_id uuid, _permission_types text[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.team_permissions
    WHERE team_id = _team_id
      AND user_id = _user_id
      AND permission_type = ANY(_permission_types)
  )
$$;

-- RLS Policies for team_permissions

-- Team admins can view permissions for their teams
CREATE POLICY "Team admins can view team permissions"
ON public.team_permissions
FOR SELECT
USING (
  user_has_team_permission(team_id, auth.uid(), ARRAY['owner', 'admin'])
  OR user_id = auth.uid()
);

-- Only team owners can add new admins
CREATE POLICY "Team owners can add admins"
ON public.team_permissions
FOR INSERT
WITH CHECK (
  user_has_team_permission(team_id, auth.uid(), ARRAY['owner'])
  OR (
    -- Allow initial owner creation when team is created
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE id = team_id AND created_by = auth.uid()
    )
  )
  OR has_role(auth.uid(), 'admin')
);

-- Only team owners can remove admins
CREATE POLICY "Team owners can remove admins"
ON public.team_permissions
FOR DELETE
USING (
  user_has_team_permission(team_id, auth.uid(), ARRAY['owner'])
  OR has_role(auth.uid(), 'admin')
);

-- Update teams RLS policy for UPDATE to use team permissions
DROP POLICY IF EXISTS "Authenticated users can update teams" ON public.teams;

CREATE POLICY "Team admins can update their teams"
ON public.teams
FOR UPDATE
USING (
  user_has_team_permission(id, auth.uid(), ARRAY['owner', 'admin'])
  OR has_role(auth.uid(), 'admin')
);

-- Trigger to auto-assign owner permission when team is created
CREATE OR REPLACE FUNCTION public.handle_new_team()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_team_owner_permission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.team_permissions (team_id, user_id, permission_type, granted_by)
  VALUES (NEW.id, NEW.created_by, 'owner', NEW.created_by);
  RETURN NEW;
END;
$$;

-- Create triggers
DROP TRIGGER IF EXISTS on_team_created ON public.teams;
CREATE TRIGGER on_team_created
  BEFORE INSERT ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_team();

DROP TRIGGER IF EXISTS on_team_created_add_owner ON public.teams;
CREATE TRIGGER on_team_created_add_owner
  AFTER INSERT ON public.teams
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_team_owner_permission();

-- Update players RLS to allow team admins to manage players
DROP POLICY IF EXISTS "Authenticated users can update players" ON public.players;

CREATE POLICY "Team admins can update their team players"
ON public.players
FOR UPDATE
USING (
  (team_id IS NOT NULL AND user_has_team_permission(team_id, auth.uid(), ARRAY['owner', 'admin']))
  OR has_role(auth.uid(), 'admin')
);

-- Allow team admins to delete their team's players
DROP POLICY IF EXISTS "Only admins can delete players" ON public.players;

CREATE POLICY "Team admins can delete their team players"
ON public.players
FOR DELETE
USING (
  (team_id IS NOT NULL AND user_has_team_permission(team_id, auth.uid(), ARRAY['owner', 'admin']))
  OR has_role(auth.uid(), 'admin')
);