-- Drop duplicate triggers that are causing the duplicate key constraint violation
DROP TRIGGER IF EXISTS on_match_created ON public.matches;
DROP TRIGGER IF EXISTS on_match_created_add_owner ON public.matches;

-- The original triggers (handle_new_match_trigger and handle_match_owner_permission_trigger) will remain active