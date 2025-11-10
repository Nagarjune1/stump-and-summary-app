-- Add profile_id column to profiles table
ALTER TABLE public.profiles
ADD COLUMN profile_id TEXT UNIQUE;

-- Create a function to generate unique profile IDs
CREATE OR REPLACE FUNCTION generate_profile_id()
RETURNS TEXT AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a 6-character alphanumeric ID
    new_id := upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
    
    -- Check if ID already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE profile_id = new_id) INTO id_exists;
    
    -- Exit loop if ID is unique
    EXIT WHEN NOT id_exists;
  END LOOP;
  
  RETURN new_id;
END;
$$ LANGUAGE plpgsql;

-- Update existing profiles with unique profile IDs
UPDATE public.profiles
SET profile_id = generate_profile_id()
WHERE profile_id IS NULL;

-- Make profile_id NOT NULL after populating existing rows
ALTER TABLE public.profiles
ALTER COLUMN profile_id SET NOT NULL;

-- Add index for faster lookups
CREATE INDEX idx_profiles_profile_id ON public.profiles(profile_id);

-- Update the handle_new_user trigger to generate profile_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, profile_id)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    generate_profile_id()
  );
  RETURN new;
END;
$$;