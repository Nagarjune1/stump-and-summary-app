
-- Add man_of_series column to matches table for series tracking
ALTER TABLE public.matches 
ADD COLUMN man_of_series UUID REFERENCES public.players(id);

-- Create a table to track ball-by-ball commentary and scoring
CREATE TABLE public.ball_by_ball (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) NOT NULL,
  innings INTEGER NOT NULL,
  over_number INTEGER NOT NULL,
  ball_number INTEGER NOT NULL,
  batsman_id UUID REFERENCES public.players(id),
  bowler_id UUID REFERENCES public.players(id),
  runs INTEGER NOT NULL DEFAULT 0,
  extras INTEGER NOT NULL DEFAULT 0,
  extra_type TEXT, -- 'wide', 'no_ball', 'bye', 'leg_bye'
  is_wicket BOOLEAN NOT NULL DEFAULT FALSE,
  wicket_type TEXT, -- 'bowled', 'caught', 'lbw', etc.
  shot_type TEXT, -- 'drive', 'cut', 'pull', etc.
  fielder_id UUID REFERENCES public.players(id),
  commentary TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for match statistics
CREATE TABLE public.match_stats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) NOT NULL,
  player_id UUID REFERENCES public.players(id) NOT NULL,
  innings INTEGER NOT NULL,
  -- Batting stats
  runs_scored INTEGER DEFAULT 0,
  balls_faced INTEGER DEFAULT 0,
  fours INTEGER DEFAULT 0,
  sixes INTEGER DEFAULT 0,
  strike_rate DECIMAL DEFAULT 0,
  dismissal_type TEXT,
  -- Bowling stats
  overs_bowled DECIMAL DEFAULT 0,
  runs_conceded INTEGER DEFAULT 0,
  wickets_taken INTEGER DEFAULT 0,
  economy_rate DECIMAL DEFAULT 0,
  -- Fielding stats
  catches INTEGER DEFAULT 0,
  run_outs INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create a table for series tracking
CREATE TABLE public.series (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  man_of_series UUID REFERENCES public.players(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add series_id to matches table
ALTER TABLE public.matches 
ADD COLUMN series_id UUID REFERENCES public.series(id);

-- Create partnerships table
CREATE TABLE public.partnerships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) NOT NULL,
  innings INTEGER NOT NULL,
  batsman1_id UUID REFERENCES public.players(id) NOT NULL,
  batsman2_id UUID REFERENCES public.players(id) NOT NULL,
  runs INTEGER NOT NULL DEFAULT 0,
  balls INTEGER NOT NULL DEFAULT 0,
  wicket_number INTEGER,
  partnership_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for new tables
ALTER TABLE public.ball_by_ball ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.match_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partnerships ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (matching existing pattern)
CREATE POLICY "Allow public read access on ball_by_ball" ON public.ball_by_ball FOR SELECT USING (true);
CREATE POLICY "Allow public insert on ball_by_ball" ON public.ball_by_ball FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on ball_by_ball" ON public.ball_by_ball FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on ball_by_ball" ON public.ball_by_ball FOR DELETE USING (true);

CREATE POLICY "Allow public read access on match_stats" ON public.match_stats FOR SELECT USING (true);
CREATE POLICY "Allow public insert on match_stats" ON public.match_stats FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on match_stats" ON public.match_stats FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on match_stats" ON public.match_stats FOR DELETE USING (true);

CREATE POLICY "Allow public read access on series" ON public.series FOR SELECT USING (true);
CREATE POLICY "Allow public insert on series" ON public.series FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on series" ON public.series FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on series" ON public.series FOR DELETE USING (true);

CREATE POLICY "Allow public read access on partnerships" ON public.partnerships FOR SELECT USING (true);
CREATE POLICY "Allow public insert on partnerships" ON public.partnerships FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update on partnerships" ON public.partnerships FOR UPDATE USING (true);
CREATE POLICY "Allow public delete on partnerships" ON public.partnerships FOR DELETE USING (true);
