-- Update the generate_profile_id function to accept a name parameter
-- Format: First 4 characters of name (uppercase) + 4 random digits
CREATE OR REPLACE FUNCTION public.generate_profile_id(_full_name text DEFAULT NULL)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id TEXT;
  id_exists BOOLEAN;
  name_part TEXT;
  first_name TEXT;
BEGIN
  -- Extract first name (first word before space)
  first_name := COALESCE(split_part(COALESCE(_full_name, ''), ' ', 1), '');
  
  -- Get first 4 characters of first name, pad with 'X' if too short
  name_part := upper(rpad(left(regexp_replace(first_name, '[^a-zA-Z]', '', 'g'), 4), 4, 'X'));
  
  LOOP
    -- Generate: 4 chars from name + 4 random digits
    new_id := name_part || lpad(floor(random() * 10000)::text, 4, '0');
    
    -- Check if ID already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE profile_id = new_id) INTO id_exists;
    
    -- Exit loop if ID is unique
    EXIT WHEN NOT id_exists;
  END LOOP;
  
  RETURN new_id;
END;
$$;

-- Update the handle_new_user trigger to pass the full_name to generate_profile_id
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_full_name TEXT;
BEGIN
  user_full_name := COALESCE(new.raw_user_meta_data->>'full_name', new.email);
  
  INSERT INTO public.profiles (id, email, full_name, profile_id)
  VALUES (
    new.id, 
    new.email, 
    user_full_name,
    generate_profile_id(user_full_name)
  );
  RETURN new;
END;
$$;