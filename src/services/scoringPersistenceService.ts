import { supabase } from '@/integrations/supabase/client';

interface BallData {
  matchId: string;
  innings: number;
  overNumber: number;
  ballNumber: number;
  batsmanId: string;
  bowlerId: string;
  runs: number;
  extras: number;
  extraType?: string;
  isWicket: boolean;
  wicketType?: string;
  dismissedPlayerId?: string;
  fielderId?: string;
  shotType?: string;
  commentary?: string;
}

interface PlayerStats {
  matchId: string;
  playerId: string;
  innings: number;
  runsScored?: number;
  ballsFaced?: number;
  fours?: number;
  sixes?: number;
  oversBowled?: number;
  runsConceded?: number;
  wicketsTaken?: number;
  dismissalType?: string;
}

export const scoringPersistenceService = {
  // Save a ball to ball_by_ball table
  async saveBall(ballData: BallData): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('ball_by_ball')
        .insert({
          match_id: ballData.matchId,
          innings: ballData.innings,
          over_number: ballData.overNumber,
          ball_number: ballData.ballNumber,
          batsman_id: ballData.batsmanId,
          bowler_id: ballData.bowlerId,
          runs: ballData.runs,
          extras: ballData.extras,
          extra_type: ballData.extraType || null,
          is_wicket: ballData.isWicket,
          wicket_type: ballData.wicketType || null,
          dismissed_player_id: ballData.dismissedPlayerId || null,
          fielder_id: ballData.fielderId || null,
          shot_type: ballData.shotType || null,
          commentary: ballData.commentary || null
        });

      if (error) {
        console.error('Error saving ball:', error);
        return false;
      }
      
      console.log('Ball saved successfully:', ballData.overNumber + '.' + ballData.ballNumber);
      return true;
    } catch (error) {
      console.error('Error saving ball:', error);
      return false;
    }
  },

  // Update or insert player match stats
  async upsertPlayerStats(stats: PlayerStats): Promise<boolean> {
    try {
      // First, check if stats exist for this player in this match/innings
      const { data: existingStats } = await supabase
        .from('match_stats')
        .select('id, runs_scored, balls_faced, fours, sixes, overs_bowled, runs_conceded, wickets_taken')
        .eq('match_id', stats.matchId)
        .eq('player_id', stats.playerId)
        .eq('innings', stats.innings)
        .maybeSingle();

      if (existingStats) {
        // Update existing stats
        const { error } = await supabase
          .from('match_stats')
          .update({
            runs_scored: stats.runsScored ?? existingStats.runs_scored,
            balls_faced: stats.ballsFaced ?? existingStats.balls_faced,
            fours: stats.fours ?? existingStats.fours,
            sixes: stats.sixes ?? existingStats.sixes,
            overs_bowled: stats.oversBowled ?? existingStats.overs_bowled,
            runs_conceded: stats.runsConceded ?? existingStats.runs_conceded,
            wickets_taken: stats.wicketsTaken ?? existingStats.wickets_taken,
            dismissal_type: stats.dismissalType || null
          })
          .eq('id', existingStats.id);

        if (error) {
          console.error('Error updating player stats:', error);
          return false;
        }
      } else {
        // Insert new stats
        const { error } = await supabase
          .from('match_stats')
          .insert({
            match_id: stats.matchId,
            player_id: stats.playerId,
            innings: stats.innings,
            runs_scored: stats.runsScored || 0,
            balls_faced: stats.ballsFaced || 0,
            fours: stats.fours || 0,
            sixes: stats.sixes || 0,
            overs_bowled: stats.oversBowled || 0,
            runs_conceded: stats.runsConceded || 0,
            wickets_taken: stats.wicketsTaken || 0,
            dismissal_type: stats.dismissalType || null
          });

        if (error) {
          console.error('Error inserting player stats:', error);
          return false;
        }
      }

      console.log('Player stats saved for:', stats.playerId);
      return true;
    } catch (error) {
      console.error('Error upserting player stats:', error);
      return false;
    }
  },

  // Update match status
  async updateMatchStatus(matchId: string, status: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ status })
        .eq('id', matchId);

      if (error) {
        console.error('Error updating match status:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error updating match status:', error);
      return false;
    }
  },

  // Delete last ball (for undo functionality)
  async deleteLastBall(matchId: string, innings: number): Promise<boolean> {
    try {
      // Get the last ball
      const { data: lastBall } = await supabase
        .from('ball_by_ball')
        .select('id')
        .eq('match_id', matchId)
        .eq('innings', innings)
        .order('over_number', { ascending: false })
        .order('ball_number', { ascending: false })
        .limit(1)
        .single();

      if (lastBall) {
        const { error } = await supabase
          .from('ball_by_ball')
          .delete()
          .eq('id', lastBall.id);

        if (error) {
          console.error('Error deleting last ball:', error);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting last ball:', error);
      return false;
    }
  }
};
