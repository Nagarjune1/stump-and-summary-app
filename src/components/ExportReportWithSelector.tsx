import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { guaranteedNonEmptyValue } from '@/utils/selectUtils';
import EnhancedExportReport from "./EnhancedExportReport";

const ExportReportWithSelector = () => {
  const [completedMatches, setCompletedMatches] = useState([]);
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [selectedMatchData, setSelectedMatchData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedMatches();
  }, []);

  const fetchCompletedMatches = async () => {
    try {
      const { data: matches, error } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!matches_team1_id_fkey(name),
          team2:teams!matches_team2_id_fkey(name)
        `)
        .eq('status', 'completed')
        .order('match_date', { ascending: false });

      if (error) throw error;
      setCompletedMatches(matches || []);
      
      // Auto-select first match if available
      if (matches && matches.length > 0) {
        setSelectedMatchId(matches[0].id);
        fetchMatchDetails(matches[0].id);
      }
    } catch (error) {
      console.error('Error fetching completed matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchDetails = async (matchId) => {
    try {
      setLoading(true);
      
      // Fetch match data
      const { data: matchData, error: matchError } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!matches_team1_id_fkey(name),
          team2:teams!matches_team2_id_fkey(name)
        `)
        .eq('id', matchId)
        .single();

      if (matchError) throw matchError;

      // Fetch ball-by-ball data
      const { data: ballData, error: ballError } = await supabase
        .from('ball_by_ball')
        .select('*')
        .eq('match_id', matchId)
        .order('innings')
        .order('over_number')
        .order('ball_number');

      if (ballError) throw ballError;

      // Fetch match stats
      const { data: statsData, error: statsError } = await supabase
        .from('match_stats')
        .select('*')
        .eq('match_id', matchId);

      if (statsError) throw statsError;

      // Process data for export
      const processedData = {
        matchData,
        scoreData: {
          runs: matchData.team2_score ? parseInt(matchData.team2_score.split('/')[0]) : 0,
          wickets: matchData.team2_score ? parseInt(matchData.team2_score.split('/')[1]) : 0,
          overs: matchData.team2_overs || 0
        },
        innings1Score: {
          runs: matchData.team1_score ? parseInt(matchData.team1_score.split('/')[0]) : 0,
          wickets: matchData.team1_score ? parseInt(matchData.team1_score.split('/')[1]) : 0,
          overs: matchData.team1_overs || 0
        },
        innings2Score: {
          runs: matchData.team2_score ? parseInt(matchData.team2_score.split('/')[0]) : 0,
          wickets: matchData.team2_score ? parseInt(matchData.team2_score.split('/')[1]) : 0,
          overs: matchData.team2_overs || 0
        },
        recentBalls: ballData?.slice(-10).map(ball => 
          ball.is_wicket ? 'W' : ball.runs.toString()
        ) || [],
        topPerformers: statsData?.sort((a, b) => b.runs_scored - a.runs_scored).slice(0, 5) || [],
        fallOfWickets: ballData?.filter(ball => ball.is_wicket).map((ball, index) => ({
          wicket: index + 1,
          score: ball.runs,
          over: `${ball.over_number}.${ball.ball_number}`
        })) || [],
        bowlingFigures: statsData?.filter(stat => stat.wickets_taken > 0) || [],
        currentBatsmen: [],
        currentBowler: null,
        currentInnings: 2,
        winner: matchData.result
      };

      setSelectedMatchData(processedData);
    } catch (error) {
      console.error('Error fetching match details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSelect = (matchId) => {
    if (!matchId || matchId.startsWith('no-matches')) {
      return;
    }
    
    setSelectedMatchId(matchId);
    fetchMatchDetails(matchId);
  };

  if (loading && !selectedMatchData) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-primary animate-pulse">Loading matches...</div>
        </div>
      </div>
    );
  }

  if (completedMatches.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Export Match Reports</h1>
          <p className="text-accent">Generate and export completed match reports</p>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold text-primary mb-2">No Completed Matches</h3>
            <p className="text-muted-foreground">There are no completed matches to export.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Export Match Reports</h1>
        <p className="text-accent">Generate and export completed match reports</p>
      </div>

      {/* Match Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Match to Export</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedMatchId} onValueChange={handleMatchSelect}>
            <SelectTrigger>
              <SelectValue placeholder="Select a completed match" />
            </SelectTrigger>
            <SelectContent>
              {completedMatches.map((match, index) => {
                const matchValue = guaranteedNonEmptyValue(match.id, `match_${index}`);
                return (
                  <SelectItem key={`match_${index}_${match.id}`} value={matchValue}>
                    {match.team1?.name} vs {match.team2?.name} - {new Date(match.match_date).toLocaleDateString()}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Export Report Component */}
      {selectedMatchData && (
        <EnhancedExportReport
          matchData={selectedMatchData.matchData}
          scoreData={selectedMatchData.scoreData}
          currentBatsmen={selectedMatchData.currentBatsmen}
          currentBowler={selectedMatchData.currentBowler}
          innings1Score={selectedMatchData.innings1Score}
          innings2Score={selectedMatchData.innings2Score}
          currentInnings={selectedMatchData.currentInnings}
          winner={selectedMatchData.winner}
          recentBalls={selectedMatchData.recentBalls}
          topPerformers={selectedMatchData.topPerformers}
          fallOfWickets={selectedMatchData.fallOfWickets}
          bowlingFigures={selectedMatchData.bowlingFigures}
        />
      )}
    </div>
  );
};

export default ExportReportWithSelector;
