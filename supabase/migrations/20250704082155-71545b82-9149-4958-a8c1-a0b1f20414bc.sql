
-- Create a table for app settings/configuration
CREATE TABLE public.app_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings for documentation display
INSERT INTO public.app_settings (setting_key, setting_value, description) VALUES
('show_documentation', 'true', 'Whether to show documentation in the app'),
('show_roadmap', 'true', 'Whether to show roadmap in the app'),
('app_version', '1.0.0', 'Current app version');

-- Add Row Level Security
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to settings
CREATE POLICY "Allow public read access on app_settings" 
  ON public.app_settings 
  FOR SELECT 
  USING (true);

-- Create policy for public update access to settings (for admin functionality)
CREATE POLICY "Allow public update on app_settings" 
  ON public.app_settings 
  FOR UPDATE 
  USING (true);
