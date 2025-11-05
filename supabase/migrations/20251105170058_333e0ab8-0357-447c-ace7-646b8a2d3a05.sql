-- Drop existing policies to recreate them correctly
DROP POLICY IF EXISTS "Allow public read access on matches" ON matches;
DROP POLICY IF EXISTS "Allow public read access on teams" ON teams;
DROP POLICY IF EXISTS "Allow public read access on players" ON players;
DROP POLICY IF EXISTS "Allow public read access on ball_by_ball" ON ball_by_ball;
DROP POLICY IF EXISTS "Allow public read access on match_stats" ON match_stats;
DROP POLICY IF EXISTS "Allow public read access on partnerships" ON partnerships;
DROP POLICY IF EXISTS "Allow public read access on series" ON series;
DROP POLICY IF EXISTS "Allow public read access on tournament_matches" ON tournament_matches;

-- Recreate SELECT policies for public read access
CREATE POLICY "Allow public read access on matches"
ON matches FOR SELECT
USING (true);

CREATE POLICY "Allow public read access on teams"
ON teams FOR SELECT
USING (true);

CREATE POLICY "Allow public read access on players"
ON players FOR SELECT
USING (true);

CREATE POLICY "Allow public read access on ball_by_ball"
ON ball_by_ball FOR SELECT
USING (true);

CREATE POLICY "Allow public read access on match_stats"
ON match_stats FOR SELECT
USING (true);

CREATE POLICY "Allow public read access on partnerships"
ON partnerships FOR SELECT
USING (true);

CREATE POLICY "Allow public read access on series"
ON series FOR SELECT
USING (true);

CREATE POLICY "Allow public read access on tournament_matches"
ON tournament_matches FOR SELECT
USING (true);

-- Recreate the trigger for auto-setting created_by on matches
DROP TRIGGER IF EXISTS handle_new_match_trigger ON matches;
CREATE TRIGGER handle_new_match_trigger
  BEFORE INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_match();

-- Recreate the trigger for auto-creating match permissions
DROP TRIGGER IF EXISTS handle_match_owner_permission_trigger ON matches;
CREATE TRIGGER handle_match_owner_permission_trigger
  AFTER INSERT ON matches
  FOR EACH ROW
  EXECUTE FUNCTION handle_match_owner_permission();