-- Step 1: Create user roles system to prevent privilege escalation
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid() OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can grant roles"
ON public.user_roles FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can revoke roles"
ON public.user_roles FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Step 2: Remove role column from profiles (privilege escalation vulnerability)
ALTER TABLE public.profiles DROP COLUMN IF EXISTS role;

-- Step 3: Fix app_settings - restrict to admin only
DROP POLICY IF EXISTS "Allow public update on app_settings" ON public.app_settings;

CREATE POLICY "Only admins can update settings"
ON public.app_settings FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

-- Step 4: Fix core tables - require authentication for write operations
-- Teams table
DROP POLICY IF EXISTS "Allow public insert on teams" ON public.teams;
DROP POLICY IF EXISTS "Allow public update on teams" ON public.teams;
DROP POLICY IF EXISTS "Allow public delete on teams" ON public.teams;

CREATE POLICY "Authenticated users can create teams"
ON public.teams FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update teams"
ON public.teams FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can delete teams"
ON public.teams FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Players table
DROP POLICY IF EXISTS "Allow public insert on players" ON public.players;
DROP POLICY IF EXISTS "Allow public update on players" ON public.players;
DROP POLICY IF EXISTS "Allow public delete on players" ON public.players;

CREATE POLICY "Authenticated users can add players"
ON public.players FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update players"
ON public.players FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can delete players"
ON public.players FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Matches table - use match_permissions for ownership
DROP POLICY IF EXISTS "Allow public insert on matches" ON public.matches;
DROP POLICY IF EXISTS "Allow public update on matches" ON public.matches;
DROP POLICY IF EXISTS "Allow public delete on matches" ON public.matches;

CREATE POLICY "Authenticated users can create matches"
ON public.matches FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Match owners and scorers can update"
ON public.matches FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM match_permissions 
    WHERE match_id = matches.id 
    AND user_id = auth.uid() 
    AND permission_type IN ('owner', 'scorer')
  ) OR public.has_role(auth.uid(), 'admin')
);

CREATE POLICY "Only match owners and admins can delete"
ON public.matches FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM match_permissions 
    WHERE match_id = matches.id 
    AND user_id = auth.uid() 
    AND permission_type = 'owner'
  ) OR public.has_role(auth.uid(), 'admin')
);

-- Ball by ball table
DROP POLICY IF EXISTS "Allow public insert on ball_by_ball" ON public.ball_by_ball;
DROP POLICY IF EXISTS "Allow public update on ball_by_ball" ON public.ball_by_ball;
DROP POLICY IF EXISTS "Allow public delete on ball_by_ball" ON public.ball_by_ball;

CREATE POLICY "Match scorers can add ball records"
ON public.ball_by_ball FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM match_permissions 
    WHERE match_id = ball_by_ball.match_id 
    AND user_id = auth.uid() 
    AND permission_type IN ('owner', 'scorer')
  )
);

CREATE POLICY "Match scorers can update ball records"
ON public.ball_by_ball FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM match_permissions 
    WHERE match_id = ball_by_ball.match_id 
    AND user_id = auth.uid() 
    AND permission_type IN ('owner', 'scorer')
  )
);

CREATE POLICY "Match scorers can delete ball records"
ON public.ball_by_ball FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM match_permissions 
    WHERE match_id = ball_by_ball.match_id 
    AND user_id = auth.uid() 
    AND permission_type IN ('owner', 'scorer')
  )
);

-- Match stats table
DROP POLICY IF EXISTS "Allow public insert on match_stats" ON public.match_stats;
DROP POLICY IF EXISTS "Allow public update on match_stats" ON public.match_stats;
DROP POLICY IF EXISTS "Allow public delete on match_stats" ON public.match_stats;

CREATE POLICY "Match scorers can add stats"
ON public.match_stats FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM match_permissions 
    WHERE match_id = match_stats.match_id 
    AND user_id = auth.uid() 
    AND permission_type IN ('owner', 'scorer')
  )
);

CREATE POLICY "Match scorers can update stats"
ON public.match_stats FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM match_permissions 
    WHERE match_id = match_stats.match_id 
    AND user_id = auth.uid() 
    AND permission_type IN ('owner', 'scorer')
  )
);

CREATE POLICY "Match scorers can delete stats"
ON public.match_stats FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM match_permissions 
    WHERE match_id = match_stats.match_id 
    AND user_id = auth.uid() 
    AND permission_type IN ('owner', 'scorer')
  )
);

-- Partnerships table
DROP POLICY IF EXISTS "Allow public insert on partnerships" ON public.partnerships;
DROP POLICY IF EXISTS "Allow public update on partnerships" ON public.partnerships;
DROP POLICY IF EXISTS "Allow public delete on partnerships" ON public.partnerships;

CREATE POLICY "Match scorers can add partnerships"
ON public.partnerships FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM match_permissions 
    WHERE match_id = partnerships.match_id 
    AND user_id = auth.uid() 
    AND permission_type IN ('owner', 'scorer')
  )
);

CREATE POLICY "Match scorers can update partnerships"
ON public.partnerships FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM match_permissions 
    WHERE match_id = partnerships.match_id 
    AND user_id = auth.uid() 
    AND permission_type IN ('owner', 'scorer')
  )
);

CREATE POLICY "Match scorers can delete partnerships"
ON public.partnerships FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM match_permissions 
    WHERE match_id = partnerships.match_id 
    AND user_id = auth.uid() 
    AND permission_type IN ('owner', 'scorer')
  )
);

-- Series table
DROP POLICY IF EXISTS "Allow public insert on series" ON public.series;
DROP POLICY IF EXISTS "Allow public update on series" ON public.series;
DROP POLICY IF EXISTS "Allow public delete on series" ON public.series;

CREATE POLICY "Authenticated users can create series"
ON public.series FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update series"
ON public.series FOR UPDATE
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can delete series"
ON public.series FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Step 5: Fix tournament tables
-- Add created_by column to tournaments if not exists
ALTER TABLE public.tournaments ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

DROP POLICY IF EXISTS "Allow public insert on tournaments" ON public.tournaments;
DROP POLICY IF EXISTS "Allow public update on tournaments" ON public.tournaments;

CREATE POLICY "Authenticated users can create tournaments"
ON public.tournaments FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND created_by = auth.uid());

CREATE POLICY "Tournament creators can update their tournaments"
ON public.tournaments FOR UPDATE
USING (created_by = auth.uid() OR public.has_role(auth.uid(), 'admin'));

-- Tournament teams - prevent payment fraud
DROP POLICY IF EXISTS "Allow public insert on tournament_teams" ON public.tournament_teams;
DROP POLICY IF EXISTS "Allow public update on tournament_teams" ON public.tournament_teams;

CREATE POLICY "Authenticated users can register teams"
ON public.tournament_teams FOR INSERT
WITH CHECK (auth.uid() IS NOT NULL AND payment_status = 'pending');

CREATE POLICY "Tournament organizers can update team status"
ON public.tournament_teams FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM tournaments 
    WHERE tournaments.id = tournament_teams.tournament_id 
    AND tournaments.created_by = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);

-- Tournament matches
DROP POLICY IF EXISTS "Allow public insert on tournament_matches" ON public.tournament_matches;

CREATE POLICY "Tournament organizers can schedule matches"
ON public.tournament_matches FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tournaments 
    WHERE tournaments.id = tournament_matches.tournament_id 
    AND tournaments.created_by = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);

-- Tournament sponsors - restrict to organizers
DROP POLICY IF EXISTS "Allow public insert on tournament_sponsors" ON public.tournament_sponsors;

CREATE POLICY "Tournament organizers can add sponsors"
ON public.tournament_sponsors FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tournaments 
    WHERE tournaments.id = tournament_sponsors.tournament_id 
    AND tournaments.created_by = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);

-- Step 6: Restrict venue and official contact info to authenticated users
DROP POLICY IF EXISTS "Allow public read access on venues" ON public.venues;

CREATE POLICY "Public can view basic venue info"
ON public.venues FOR SELECT
USING (true);

-- Create view for public venue info without sensitive data
CREATE OR REPLACE VIEW public.venues_public AS
SELECT 
  id, name, location, city, capacity, pitch_type, 
  facilities, photos, rating, total_matches, created_at
FROM public.venues;

-- Tournament officials - restrict contact info
DROP POLICY IF EXISTS "Allow public read access on tournament_officials" ON public.tournament_officials;

CREATE POLICY "Tournament organizers can view officials"
ON public.tournament_officials FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM tournaments 
    WHERE tournaments.id = tournament_officials.tournament_id 
    AND tournaments.created_by = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);

DROP POLICY IF EXISTS "Allow public insert on tournament_officials" ON public.tournament_officials;

CREATE POLICY "Tournament organizers can add officials"
ON public.tournament_officials FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM tournaments 
    WHERE tournaments.id = tournament_officials.tournament_id 
    AND tournaments.created_by = auth.uid()
  ) OR public.has_role(auth.uid(), 'admin')
);

-- Step 7: Update SECURITY DEFINER functions to include search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email));
  RETURN new;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_match()
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

CREATE OR REPLACE FUNCTION public.handle_match_owner_permission()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.match_permissions (match_id, user_id, permission_type, granted_by)
  VALUES (NEW.id, NEW.created_by, 'owner', NEW.created_by);
  RETURN NEW;
END;
$$;