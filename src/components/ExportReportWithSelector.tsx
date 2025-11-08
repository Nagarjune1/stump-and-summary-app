import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import MatchSelectorForExport from './scoring/MatchSelectorForExport';
import EnhancedExportReport from './EnhancedExportReport';

const ExportReportWithSelector = () => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [exportData, setExportData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedMatch) {
      fetchMatchData(selectedMatch.id);
    }
  }, [selectedMatch]);

  const fetchMatchData = async (matchId: string) => {
    try {
      setLoading(true);

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

      // Calculate score data from ball by ball
      const innings1Balls = balls?.filter(b => b.innings === 1) || [];
      const innings2Balls = balls?.filter(b => b.innings === 2) || [];

      const calculateScore = (balls: any[]) => {
        const runs = balls.reduce((sum, ball) => sum + (ball.runs || 0) + (ball.extras || 0), 0);
        const wickets = balls.filter(b => b.is_wicket).length;
        const totalBalls = balls.length;
        const overs = Math.floor(totalBalls / 6);
        const ballsInOver = totalBalls % 6;
        
        return {
          runs,
          wickets,
          overs: `${overs}.${ballsInOver}`
        };
      };

      const innings1Score = calculateScore(innings1Balls);
      const innings2Score = innings2Balls.length > 0 ? calculateScore(innings2Balls) : null;

      // Get top performers
      const battingStats = stats?.filter(s => s.balls_faced > 0) || [];
      const bowlingStats = stats?.filter(s => s.overs_bowled > 0) || [];

      const topPerformers = [
        ...battingStats
          .sort((a, b) => (b.runs_scored || 0) - (a.runs_scored || 0))
          .slice(0, 2)
          .map(s => ({
            name: s.player?.name || 'Unknown',
            runs: s.runs_scored || 0,
            wickets: 0,
            type: 'batting'
          })),
        ...bowlingStats
          .sort((a, b) => (b.wickets_taken || 0) - (a.wickets_taken || 0))
          .slice(0, 1)
          .map(s => ({
            name: s.player?.name || 'Unknown',
            runs: 0,
            wickets: s.wickets_taken || 0,
            type: 'bowling'
          }))
      ];

      setMatchData(match);
      setExportData({
        scoreData: innings2Score || innings1Score,
        innings1Score,
        innings2Score,
        currentBatsmen: battingStats.slice(0, 2).map((s: any) => ({
          name: s.player?.name || 'Unknown',
          runs: s.runs_scored || 0,
          balls: s.balls_faced || 0,
          fours: s.fours || 0,
          sixes: s.sixes || 0
        })),
        currentBowler: bowlingStats.length > 0 ? {
          name: bowlingStats[0].player?.name || 'Unknown',
          overs: bowlingStats[0].overs_bowled || 0,
          runs: bowlingStats[0].runs_conceded || 0,
          wickets: bowlingStats[0].wickets_taken || 0
        } : null,
        currentInnings: innings2Balls.length > 0 ? 2 : 1,
        winner: match.result || null,
        recentBalls: balls?.slice(-10).map(b => 
          b.is_wicket ? 'W' : 
          b.runs === 4 ? '4' : 
          b.runs === 6 ? '6' : 
          String(b.runs || 0)
        ) || [],
        topPerformers,
        fallOfWickets: balls?.filter(b => b.is_wicket).map((b: any, idx: number) => ({
          wicket: idx + 1,
          score: balls.slice(0, balls.indexOf(b) + 1)
            .reduce((sum, ball) => sum + (ball.runs || 0) + (ball.extras || 0), 0),
          over: `${b.over_number}.${b.ball_number}`,
          player: b.batsman_id
        })) || [],
        bowlingFigures: bowlingStats.map((s: any) => ({
          name: s.player?.name || 'Unknown',
          overs: s.overs_bowled || 0,
          runs: s.runs_conceded || 0,
          wickets: s.wickets_taken || 0,
          economy: s.economy_rate || 0
        }))
      });
    } catch (error) {
      console.error('Error fetching match data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSelect = (match: any) => {
    setSelectedMatch(match);
  };

  if (!selectedMatch) {
    return (
      <div className="p-6">
        <MatchSelectorForExport onMatchSelect={handleMatchSelect} />
      </div>
    );
  }

  if (loading || !exportData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-primary">Loading match data...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <MatchSelectorForExport onMatchSelect={handleMatchSelect} />
      <EnhancedExportReport 
        matchData={matchData}
        {...exportData}
      />
    </div>
  );
};

export default ExportReportWithSelector;
