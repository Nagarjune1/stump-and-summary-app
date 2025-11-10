-- Fix the generate_profile_id function to set search_path for security
CREATE OR REPLACE FUNCTION generate_profile_id()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;