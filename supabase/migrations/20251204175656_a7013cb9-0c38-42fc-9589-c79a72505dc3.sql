-- Fix 1: Create a SECURITY DEFINER function for safe profile searching
CREATE OR REPLACE FUNCTION public.search_profiles_for_scorer(search_term TEXT)
RETURNS TABLE(id UUID, profile_id TEXT, display_name TEXT)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.profile_id, COALESCE(p.full_name, p.email) as display_name
  FROM public.profiles p
  WHERE p.profile_id ILIKE '%' || search_term || '%'
  LIMIT 10;
$$;

-- Remove the overly permissive SELECT policy on profiles
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;

-- Fix 2: Fix venues insert policy to require authentication
DROP POLICY IF EXISTS "Allow public insert on venues" ON public.venues;

CREATE POLICY "Authenticated users can insert venues" ON public.venues
FOR INSERT TO authenticated
WITH CHECK (auth.uid() IS NOT NULL);