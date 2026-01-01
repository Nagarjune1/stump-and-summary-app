import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import MatchSelectorForScoreboard from './scoring/MatchSelectorForScoreboard';
import EnhancedCricketScoreboard from './EnhancedCricketScoreboard';
import { Badge } from '@/components/ui/badge';
import { Radio } from 'lucide-react';

const ScoreboardWithSelector = () => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [scoreboardData, setScoreboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [isLiveUpdating, setIsLiveUpdating] = useState(false);

  const fetchMatchDetails = useCallback(async (matchId: string, isRealtimeUpdate = false) => {
    try {
      if (!isRealtimeUpdate) setLoading(true);
      if (isRealtimeUpdate) {
        setIsLiveUpdating(true);
        setTimeout(() => setIsLiveUpdating(false), 1000);
      }
      
      // Fetch match details
      const { data: match, error: matchError } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!team1_id(name),
          team2:teams!team2_id(name)
        `)
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;

      // Fetch ball by ball data
      const { data: balls, error: ballsError } = await supabase
        .from('ball_by_ball')
        .select('*')
        .eq('match_id', matchId)
        .order('innings')
        .order('over_number')
        .order('ball_number');

      if (ballsError) throw ballsError;

      // Fetch match stats
      const { data: stats, error: statsError } = await supabase
        .from('match_stats')
        .select(`
          *,
          player:players(name)
        `)
        .eq('match_id', matchId);

      if (statsError) throw statsError;

      // Calculate innings data
      const innings1Balls = balls?.filter(b => b.innings === 1) || [];
      const innings2Balls = balls?.filter(b => b.innings === 2) || [];

      const calculateInningsData = (balls: any[]) => {
        const runs = balls.reduce((sum, ball) => sum + (ball.runs || 0) + (ball.extras || 0), 0);
        const wickets = balls.filter(b => b.is_wicket).length;
        const totalBalls = balls.length;
        const overs = Math.floor(totalBalls / 6);
        const ballsInOver = totalBalls % 6;
        
        return {
          runs,
          wickets,
          overs,
          balls: ballsInOver
        };
      };

      const innings1 = calculateInningsData(innings1Balls);
      const innings2 = calculateInningsData(innings2Balls);
      const currentInnings = innings2Balls.length > 0 ? 2 : 1;
      const currentScore = currentInnings === 2 ? innings2 : innings1;

      // Get current batsmen from stats
      const battingStats = stats?.filter(s => s.innings === currentInnings && s.balls_faced > 0) || [];
      const currentBatsmen = battingStats.slice(0, 2).map((s: any) => ({
        id: s.player_id,
        name: s.player?.name || 'Unknown',
        runs: s.runs_scored || 0,
        balls: s.balls_faced || 0,
        fours: s.fours || 0,
        sixes: s.sixes || 0,
        isOut: !!s.dismissal_type
      }));

      // Get current bowler
      const bowlingStats = stats?.filter(s => s.innings === currentInnings && s.overs_bowled > 0) || [];
      const currentBowler = bowlingStats.length > 0 ? {
        id: bowlingStats[0].player_id,
        name: bowlingStats[0].player?.name || 'Unknown',
        overs: bowlingStats[0].overs_bowled || 0,
        runs: bowlingStats[0].runs_conceded || 0,
        wickets: bowlingStats[0].wickets_taken || 0
      } : null;

      // Recent balls
      const recentBalls = balls?.slice(-10).map(b => 
        b.is_wicket ? 'W' : 
        b.runs === 4 ? '4' : 
        b.runs === 6 ? '6' : 
        String(b.runs || 0)
      ) || [];

      setMatchData(match);
      setScoreboardData({
        score: currentScore,
        currentBatsmen,
        currentBowler,
        innings1Score: innings1,
        currentInnings,
        currentOver: currentScore.overs,
        currentBall: currentScore.balls,
        battingTeam: currentInnings,
        target: currentInnings === 2 ? innings1.runs + 1 : 0,
        requiredRunRate: currentInnings === 2 && innings1.runs > 0 
          ? (((innings1.runs + 1 - innings2.runs) / ((match.overs || 20) - (currentScore.overs + currentScore.balls / 6))) * 6).toFixed(2)
          : 0,
        currentRunRate: ((currentScore.runs / (currentScore.overs + currentScore.balls / 6)) * 6).toFixed(2) || '0.00',
        recentBalls,
        team1Players: battingStats,
        team2Players: bowlingStats,
        fallOfWickets: balls?.filter(b => b.is_wicket).map((b: any, idx: number) => ({
          wicket: idx + 1,
          score: balls.slice(0, balls.indexOf(b) + 1)
            .reduce((sum, ball) => sum + (ball.runs || 0) + (ball.extras || 0), 0),
          over: `${b.over_number}.${b.ball_number}`,
          player: b.batsman_id
        })) || [],
        bowlers: bowlingStats,
        wickets: balls?.filter(b => b.is_wicket) || [],
        oversData: []
      });
      
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error fetching match details:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      fetchMatchDetails(selectedMatch.id);
      
      // Set up real-time subscription for live updates
      const channel = supabase
        .channel(`scoreboard_${selectedMatch.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'matches',
            filter: `id=eq.${selectedMatch.id}`
          },
          () => fetchMatchDetails(selectedMatch.id, true)
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'ball_by_ball',
            filter: `match_id=eq.${selectedMatch.id}`
          },
          () => fetchMatchDetails(selectedMatch.id, true)
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'match_stats',
            filter: `match_id=eq.${selectedMatch.id}`
          },
          () => fetchMatchDetails(selectedMatch.id, true)
        )
        .subscribe((status) => {
          console.log('Scoreboard realtime status:', status);
        });

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedMatch, fetchMatchDetails]);

  const handleMatchSelect = (match: any) => {
    setSelectedMatch(match);
  };

  if (!selectedMatch) {
    return (
      <div className="p-6">
        <MatchSelectorForScoreboard onMatchSelect={handleMatchSelect} />
      </div>
    );
  }

  if (loading || !scoreboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-primary">Loading match data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Live Update Indicator */}
      <div className="flex items-center justify-between">
        <MatchSelectorForScoreboard onMatchSelect={handleMatchSelect} />
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`flex items-center gap-2 transition-all ${
              isLiveUpdating 
                ? 'bg-warning/20 border-warning text-warning animate-pulse' 
                : 'bg-accent/20 border-accent text-accent'
            }`}
          >
            <Radio className={`w-3 h-3 ${isLiveUpdating ? 'animate-ping' : ''}`} />
            {isLiveUpdating ? 'Updating...' : 'Live'}
          </Badge>
          {lastUpdate && (
            <span className="text-xs text-muted-foreground">
              Updated: {lastUpdate.toLocaleTimeString()}
            </span>
          )}
        </div>
      </div>
      <EnhancedCricketScoreboard
        matchData={matchData}
        {...scoreboardData}
      />
    </div>
  );
};

export default ScoreboardWithSelector;
