-- Enable realtime for match-related tables
ALTER TABLE matches REPLICA IDENTITY FULL;
ALTER TABLE ball_by_ball REPLICA IDENTITY FULL;
ALTER TABLE match_stats REPLICA IDENTITY FULL;
ALTER TABLE partnerships REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE ball_by_ball;
ALTER PUBLICATION supabase_realtime ADD TABLE match_stats;
ALTER PUBLICATION supabase_realtime ADD TABLE partnerships;