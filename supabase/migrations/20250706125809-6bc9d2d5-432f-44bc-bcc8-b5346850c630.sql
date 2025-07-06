
-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create match permissions table
CREATE TABLE public.match_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_type TEXT CHECK (permission_type IN ('owner', 'scorer', 'viewer')) DEFAULT 'viewer',
  granted_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(match_id, user_id)
);

-- Enable RLS on match permissions
ALTER TABLE public.match_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for match permissions
CREATE POLICY "Users can view match permissions they're involved in" ON public.match_permissions
  FOR SELECT USING (
    user_id = auth.uid() OR 
    granted_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.match_permissions mp 
      WHERE mp.match_id = match_permissions.match_id 
      AND mp.user_id = auth.uid() 
      AND mp.permission_type IN ('owner', 'scorer')
    )
  );

CREATE POLICY "Match owners and scorers can manage permissions" ON public.match_permissions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.match_permissions mp 
      WHERE mp.match_id = match_permissions.match_id 
      AND mp.user_id = auth.uid() 
      AND mp.permission_type IN ('owner', 'scorer')
    )
  );

-- Add created_by field to matches table
ALTER TABLE public.matches ADD COLUMN created_by UUID REFERENCES auth.users(id);

-- Update existing matches to have a created_by (you may want to set this to a specific user)
-- UPDATE public.matches SET created_by = 'some-uuid-here' WHERE created_by IS NULL;

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to automatically set match owner when match is created
CREATE OR REPLACE FUNCTION public.handle_new_match()
RETURNS trigger AS $$
BEGIN
  -- Set the created_by to current user if not already set
  IF NEW.created_by IS NULL THEN
    NEW.created_by = auth.uid();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new match creation
CREATE TRIGGER on_match_created
  BEFORE INSERT ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_match();

-- Create function to automatically add owner permission when match is created
CREATE OR REPLACE FUNCTION public.handle_match_owner_permission()
RETURNS trigger AS $$
BEGIN
  -- Add owner permission for the user who created the match
  INSERT INTO public.match_permissions (match_id, user_id, permission_type, granted_by)
  VALUES (NEW.id, NEW.created_by, 'owner', NEW.created_by);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for match owner permission
CREATE TRIGGER on_match_created_add_owner
  AFTER INSERT ON public.matches
  FOR EACH ROW EXECUTE FUNCTION public.handle_match_owner_permission();
