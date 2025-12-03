-- Update existing profile IDs to use new format (FirstName4chars + 4digits)
UPDATE public.profiles
SET profile_id = public.generate_profile_id(full_name)
WHERE profile_id IS NOT NULL;