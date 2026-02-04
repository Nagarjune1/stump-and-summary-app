import { supabase } from '@/integrations/supabase/client';
import { offlineSyncService } from './offlineSyncService';

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
  // Save a ball to ball_by_ball table with offline support
  async saveBall(ballData: BallData): Promise<boolean> {
    const insertData = {
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
      fielder_id: ballData.fielderId || null,
      shot_type: ballData.shotType || null,
      commentary: ballData.commentary || null
    };

    // Check if online
    if (offlineSyncService.isOnline()) {
      try {
        const { error } = await supabase
          .from('ball_by_ball')
          .insert(insertData);

        if (error) {
          console.error('Error saving ball, queuing for offline sync:', error);
          // Queue for later sync
          await offlineSyncService.queueOperation('insert', 'ball_by_ball', insertData);
          return true; // Return true as it's queued
        }
        
        console.log('Ball saved successfully:', ballData.overNumber + '.' + ballData.ballNumber);
        return true;
      } catch (error) {
        console.error('Error saving ball, queuing:', error);
        await offlineSyncService.queueOperation('insert', 'ball_by_ball', insertData);
        return true;
      }
    } else {
      // Offline - queue the operation
      console.log('Offline - queuing ball for sync:', ballData.overNumber + '.' + ballData.ballNumber);
      await offlineSyncService.queueOperation('insert', 'ball_by_ball', insertData);
      return true;
    }
  },

  // Update or insert player match stats with offline support
  async upsertPlayerStats(stats: PlayerStats): Promise<boolean> {
    const statsData = {
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
    };

    if (offlineSyncService.isOnline()) {
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
            console.error('Error updating player stats, queuing:', error);
            await offlineSyncService.queueOperation('update', 'match_stats', { 
              id: existingStats.id, 
              ...statsData 
            });
            return true;
          }
        } else {
          // Insert new stats
          const { error } = await supabase
            .from('match_stats')
            .insert(statsData);

          if (error) {
            console.error('Error inserting player stats, queuing:', error);
            await offlineSyncService.queueOperation('insert', 'match_stats', statsData);
            return true;
          }
        }

        console.log('Player stats saved for:', stats.playerId);
        return true;
      } catch (error) {
        console.error('Error upserting player stats, queuing:', error);
        await offlineSyncService.queueOperation('upsert', 'match_stats', statsData);
        return true;
      }
    } else {
      // Offline - queue the operation
      console.log('Offline - queuing stats for sync');
      await offlineSyncService.queueOperation('upsert', 'match_stats', statsData);
      return true;
    }
  },

  // Update match status with offline support
  async updateMatchStatus(matchId: string, status: string): Promise<boolean> {
    const updateData = { id: matchId, status };

    if (offlineSyncService.isOnline()) {
      try {
        const { error } = await supabase
          .from('matches')
          .update({ status })
          .eq('id', matchId);

        if (error) {
          console.error('Error updating match status, queuing:', error);
          await offlineSyncService.queueOperation('update', 'matches', updateData);
          return true;
        }
        
        return true;
      } catch (error) {
        console.error('Error updating match status, queuing:', error);
        await offlineSyncService.queueOperation('update', 'matches', updateData);
        return true;
      }
    } else {
      console.log('Offline - queuing match status update');
      await offlineSyncService.queueOperation('update', 'matches', updateData);
      return true;
    }
  },

  // Update match scores with offline support
  async updateMatchScores(
    matchId: string, 
    updates: Record<string, unknown>
  ): Promise<boolean> {
    const updateData = { id: matchId, ...updates };

    if (offlineSyncService.isOnline()) {
      try {
        const { error } = await supabase
          .from('matches')
          .update(updates)
          .eq('id', matchId);

        if (error) {
          console.error('Error updating match scores, queuing:', error);
          await offlineSyncService.queueOperation('update', 'matches', updateData);
          return true;
        }
        
        return true;
      } catch (error) {
        console.error('Error updating match scores, queuing:', error);
        await offlineSyncService.queueOperation('update', 'matches', updateData);
        return true;
      }
    } else {
      console.log('Offline - queuing match scores update');
      await offlineSyncService.queueOperation('update', 'matches', updateData);
      return true;
    }
  },

  // Delete last ball (for undo functionality)
  async deleteLastBall(matchId: string, innings: number): Promise<boolean> {
    // Note: Delete operations require online connectivity for data integrity
    if (!offlineSyncService.isOnline()) {
      console.warn('Undo requires online connectivity');
      return false;
    }

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
  },

  // Check if there are pending offline operations
  hasPendingOperations(): boolean {
    return offlineSyncService.getStatus().pendingCount > 0;
  },

  // Manually trigger sync
  async syncPendingOperations(): Promise<{ synced: number; failed: number }> {
    return offlineSyncService.syncPendingOperations();
  }
};

