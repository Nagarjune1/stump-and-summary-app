
-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  logo_url TEXT,
  ball_type TEXT NOT NULL CHECK (ball_type IN ('tennis', 'leather', 'tape')),
  tournament_style TEXT NOT NULL CHECK (tournament_style IN ('knockout', 'league', 'round_robin', 'group_stage')),
  category TEXT NOT NULL CHECK (category IN ('u16', 'u19', 'u23', 'open', 'corporate', 'box_cricket')),
  start_date DATE NOT NULL,
  end_date DATE,
  registration_fee DECIMAL(10,2) DEFAULT 0,
  prize_money DECIMAL(10,2) DEFAULT 0,
  max_teams INTEGER DEFAULT 16,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled')),
  organizer_name TEXT NOT NULL,
  organizer_contact TEXT,
  organizer_email TEXT,
  venue_id UUID,
  rules TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create tournament_teams junction table
CREATE TABLE public.tournament_teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  registration_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
  UNIQUE(tournament_id, team_id)
);

-- Create tournament_matches table for scheduling
CREATE TABLE public.tournament_matches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  round_name TEXT NOT NULL, -- 'Group A', 'Quarter Final', 'Semi Final', 'Final'
  match_number INTEGER NOT NULL,
  scheduled_date DATE,
  scheduled_time TIME,
  UNIQUE(tournament_id, match_id)
);

-- Create tournament_sponsors table
CREATE TABLE public.tournament_sponsors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  sponsor_name TEXT NOT NULL,
  sponsor_logo_url TEXT,
  sponsor_type TEXT CHECK (sponsor_type IN ('title', 'main', 'associate', 'official')),
  sponsor_amount DECIMAL(10,2),
  visibility_package TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tournament_officials table
CREATE TABLE public.tournament_officials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  official_name TEXT NOT NULL,
  official_type TEXT NOT NULL CHECK (official_type IN ('umpire', 'scorer', 'commentator')),
  contact_info TEXT,
  rate_per_match DECIMAL(10,2),
  matches_assigned INTEGER DEFAULT 0
);

-- Create venues table for ground management
CREATE TABLE public.venues (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  city TEXT,
  capacity INTEGER,
  pitch_type TEXT,
  facilities TEXT[], -- Array of facilities like 'parking', 'canteen', 'dressing_room'
  cost_per_match DECIMAL(10,2),
  contact_person TEXT,
  contact_number TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  total_matches INTEGER DEFAULT 0,
  photos TEXT[], -- Array of photo URLs
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add foreign key constraint for venue_id in tournaments
ALTER TABLE public.tournaments 
ADD CONSTRAINT tournaments_venue_id_fkey 
FOREIGN KEY (venue_id) REFERENCES venues(id);

-- Enable RLS for all tables
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_sponsors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tournament_officials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (adjust as needed for your auth requirements)
CREATE POLICY "Allow public read access on tournaments" ON public.tournaments FOR SELECT USING (true);
CREATE POLICY "Allow public insert on tournaments" ON public.tournaments FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on tournaments" ON public.tournaments FOR UPDATE USING (true);

CREATE POLICY "Allow public read access on tournament_teams" ON public.tournament_teams FOR SELECT USING (true);
CREATE POLICY "Allow public insert on tournament_teams" ON public.tournament_teams FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on tournament_matches" ON public.tournament_matches FOR SELECT USING (true);
CREATE POLICY "Allow public insert on tournament_matches" ON public.tournament_matches FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on tournament_sponsors" ON public.tournament_sponsors FOR SELECT USING (true);
CREATE POLICY "Allow public insert on tournament_sponsors" ON public.tournament_sponsors FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on tournament_officials" ON public.tournament_officials FOR SELECT USING (true);
CREATE POLICY "Allow public insert on tournament_officials" ON public.tournament_officials FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access on venues" ON public.venues FOR SELECT USING (true);
CREATE POLICY "Allow public insert on venues" ON public.venues FOR INSERT WITH CHECK (true);

-- Insert some sample venues
INSERT INTO public.venues (name, location, city, capacity, pitch_type, facilities, cost_per_match, contact_person, contact_number, rating, photos) VALUES
('Green Park Cricket Ground', 'Sector 15, Green Park', 'Delhi', 5000, 'Turf', ARRAY['parking', 'canteen', 'dressing_room', 'floodlights'], 15000.00, 'Rajesh Kumar', '+91-9876543210', 4.5, ARRAY['https://example.com/ground1.jpg']),
('Sunrise Sports Complex', 'Banjara Hills', 'Hyderabad', 3000, 'Matting', ARRAY['parking', 'canteen', 'dressing_room'], 10000.00, 'Suresh Reddy', '+91-9876543211', 4.2, ARRAY['https://example.com/ground2.jpg']),
('Victory Cricket Stadium', 'Andheri West', 'Mumbai', 8000, 'Turf', ARRAY['parking', 'canteen', 'dressing_room', 'floodlights', 'commentary_box'], 25000.00, 'Amit Sharma', '+91-9876543212', 4.8, ARRAY['https://example.com/ground3.jpg']);
