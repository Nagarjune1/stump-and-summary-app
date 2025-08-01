import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import SafeSelectItem from "@/components/ui/SafeSelectItem";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RotateCcw, Users, Target, Clock, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ensureValidSelectItemValue } from "@/utils/selectUtils";
import MatchAnalytics from "./MatchAnalytics";

const LiveScoring = () => {
  const [matchId, setMatchId] = useState("");
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");
  const [totalOvers, setTotalOvers] = useState(20);
  const [currentInnings, setCurrentInnings] = useState(1);
  const [matchStatus, setMatchStatus] = useState("not_started");
  
  const [innings1Score, setInnings1Score] = useState({
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0
  });
  
  const [innings2Score, setInnings2Score] = useState({
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0
  });

  const [currentBatsmen, setCurrentBatsmen] = useState([
    { id: "", name: "", runs: 0, balls: 0, fours: 0, sixes: 0 },
    { id: "", name: "", runs: 0, balls: 0, fours: 0, sixes: 0 }
  ]);
  
  const [currentBowler, setCurrentBowler] = useState({
    id: "", name: "", overs: 0, runs: 0, wickets: 0
  });

  const [strikeBatsmanIndex, setStrikeBatsmanIndex] = useState(0);
  const [recentBalls, setRecentBalls] = useState([]);
  const [players, setPlayers] = useState([]);
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    fetchMatches();
    fetchPlayers();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!matches_team1_id_fkey(name),
          team2:teams!matches_team2_id_fkey(name)
        `)
        .in('status', ['scheduled', 'in_progress'])
        .order('match_date', { ascending: true });

      if (error) {
        console.error('Error fetching matches:', error);
        return;
      }

      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('name');

      if (error) {
        console.error('Error fetching players:', error);
        return;
      }

      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const checkMatchCompletion = () => {
    if (!innings1Score || !innings2Score || currentInnings !== 2) return;

    const target = innings1Score.runs + 1;
    const ballsRemaining = (totalOvers * 6) - (innings2Score.overs * 6 + innings2Score.balls);
    
    console.log('Match completion check:', {
      target,
      ballsRemaining,
      innings2Runs: innings2Score.runs,
      innings2Wickets: innings2Score.wickets
    });

    // Match completed if:
    // 1. Second innings reaches or exceeds target (win)
    // 2. Second innings all out before reaching target (loss)
    // 3. All overs completed in second innings
    
    const secondInningsComplete = innings2Score.overs >= totalOvers || ballsRemaining <= 0;
    const targetReached = innings2Score.runs >= target;
    const allOut = innings2Score.wickets >= 10;

    if (targetReached) {
      // Second team wins
      const result = `${team2Name} won by ${10 - innings2Score.wickets} wickets`;
      completeMatch(result);
    } else if (allOut || secondInningsComplete) {
      if (innings2Score.runs > innings1Score.runs) {
        const result = `${team2Name} won by ${innings2Score.runs - innings1Score.runs} runs`;
        completeMatch(result);
      } else if (innings2Score.runs < innings1Score.runs) {
        const result = `${team1Name} won by ${innings1Score.runs - innings2Score.runs} runs`;
        completeMatch(result);
      } else {
        // Tied match - only if no balls remaining
        completeMatch("Match Tied");
      }
    }
    // Otherwise, match continues
  };

  const completeMatch = async (result) => {
    try {
      await supabase
        .from('matches')
        .update({ 
          status: 'completed', 
          result,
          team1_score: `${innings1Score?.runs}/${innings1Score?.wickets} (${innings1Score?.overs}.${innings1Score?.balls})`,
          team2_score: `${innings2Score?.runs}/${innings2Score?.wickets} (${innings2Score?.overs}.${innings2Score?.balls})`
        })
        .eq('id', matchId);

      // Update player statistics
      await updatePlayerStatistics();

      toast({
        title: "Match Completed!",
        description: result,
      });

      setMatchStatus('completed');
    } catch (error) {
      console.error('Error completing match:', error);
      toast({
        title: "Error",
        description: "Failed to complete match",
        variant: "destructive"
      });
    }
  };

  const updatePlayerStatistics = async () => {
    try {
      // Get all match stats for this match
      const { data: matchStats, error: statsError } = await supabase
        .from('match_stats')
        .select('*')
        .eq('match_id', matchId);

      if (statsError || !matchStats) {
        console.error('Error fetching match stats:', statsError);
        return;
      }

      // Update each player's career statistics
      for (const stat of matchStats) {
        const { data: currentPlayer, error: playerError } = await supabase
          .from('players')
          .select('*')
          .eq('id', stat.player_id)
          .single();

        if (playerError || !currentPlayer) continue;

        const updatedMatches = (currentPlayer.matches || 0) + 1;
        const updatedRuns = (currentPlayer.runs || 0) + (stat.runs_scored || 0);
        const updatedWickets = (currentPlayer.wickets || 0) + (stat.wickets_taken || 0);
        const updatedAverage = updatedRuns > 0 ? (updatedRuns / Math.max(updatedMatches, 1)) : 0;
        const ballsFaced = stat.balls_faced || 1;
        const updatedStrikeRate = ballsFaced > 0 ? ((stat.runs_scored || 0) / ballsFaced) * 100 : 0;
        const oversBowled = stat.overs_bowled || 0;
        const runsConceded = stat.runs_conceded || 0;
        const updatedEconomy = oversBowled > 0 ? runsConceded / oversBowled : 0;

        // Update best score
        let bestScore = currentPlayer.best_score || '0';
        if (stat.runs_scored && stat.runs_scored > parseInt(bestScore.split('*')[0])) {
          bestScore = stat.dismissal_type ? `${stat.runs_scored}` : `${stat.runs_scored}*`;
        }

        // Update best bowling
        let bestBowling = currentPlayer.best_bowling || '0/0';
        const currentBestWickets = parseInt(bestBowling.split('/')[0]);
        const currentBestRuns = parseInt(bestBowling.split('/')[1]);
        if ((stat.wickets_taken || 0) > currentBestWickets || 
            ((stat.wickets_taken || 0) === currentBestWickets && (stat.runs_conceded || 0) < currentBestRuns)) {
          bestBowling = `${stat.wickets_taken || 0}/${stat.runs_conceded || 0}`;
        }

        await supabase
          .from('players')
          .update({
            matches: updatedMatches,
            runs: updatedRuns,
            wickets: updatedWickets,
            average: updatedAverage,
            strike_rate: updatedStrikeRate,
            economy: updatedEconomy,
            best_score: bestScore,
            best_bowling: bestBowling
          })
          .eq('id', stat.player_id);
      }

      console.log('Player statistics updated successfully');
    } catch (error) {
      console.error('Error updating player statistics:', error);
    }
  };

  const loadMatchData = async (selectedMatchId) => {
    try {
      const { data: match, error } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!matches_team1_id_fkey(name),
          team2:teams!matches_team2_id_fkey(name)
        `)
        .eq('id', selectedMatchId)
        .single();

      if (error) {
        console.error('Error loading match:', error);
        return;
      }

      setMatchId(selectedMatchId);
      setTeam1Name(match.team1?.name || '');
      setTeam2Name(match.team2?.name || '');
      setTotalOvers(match.overs || 20);
      setMatchStatus(match.status || 'not_started');

      // Parse existing scores if available
      if (match.team1_score) {
        const [runs, wickets, overs] = match.team1_score.split(/[\/\(\)]/);
        const [overNum, ballNum] = (overs || '0.0').split('.');
        setInnings1Score({
          runs: parseInt(runs) || 0,
          wickets: parseInt(wickets) || 0,
          overs: parseInt(overNum) || 0,
          balls: parseInt(ballNum) || 0
        });
      }

      if (match.team2_score) {
        const [runs, wickets, overs] = match.team2_score.split(/[\/\(\)]/);
        const [overNum, ballNum] = (overs || '0.0').split('.');
        setInnings2Score({
          runs: parseInt(runs) || 0,
          wickets: parseInt(wickets) || 0,
          overs: parseInt(overNum) || 0,
          balls: parseInt(ballNum) || 0
        });
      }

      toast({
        title: "Match Loaded",
        description: `${match.team1?.name} vs ${match.team2?.name}`,
      });
    } catch (error) {
      console.error('Error loading match data:', error);
    }
  };

  const recordBall = async (runs, extras = 0, extraType = '', isWicket = false, wicketType = '', shotType = '', fielderId = null) => {
    if (matchStatus === 'completed') return;

    try {
      // Update match status to in_progress if not already
      if (matchStatus === 'not_started' || matchStatus === 'scheduled') {
        await supabase
          .from('matches')
          .update({ status: 'in_progress' })
          .eq('id', matchId);
        setMatchStatus('in_progress');
      }

      // Update current innings score
      if (currentInnings === 1) {
        const newScore = { ...innings1Score };
        newScore.runs += runs + extras;
        if (isWicket) newScore.wickets += 1;
        
        // Only increment ball count for legal deliveries
        if (!extraType || extraType === 'bye' || extraType === 'leg-bye') {
          newScore.balls += 1;
          if (newScore.balls === 6) {
            newScore.overs += 1;
            newScore.balls = 0;
            // Switch strike at end of over
            setStrikeBatsmanIndex(prev => prev === 0 ? 1 : 0);
          }
        }
        
        setInnings1Score(newScore);
        
        // Check if innings is complete
        if (newScore.wickets >= 10 || newScore.overs >= totalOvers) {
          setCurrentInnings(2);
          toast({
            title: "Innings Complete",
            description: `${team1Name}: ${newScore.runs}/${newScore.wickets} (${newScore.overs}.${newScore.balls})`,
          });
        }
      } else {
        const newScore = { ...innings2Score };
        newScore.runs += runs + extras;
        if (isWicket) newScore.wickets += 1;
        
        // Only increment ball count for legal deliveries
        if (!extraType || extraType === 'bye' || extraType === 'leg-bye') {
          newScore.balls += 1;
          if (newScore.balls === 6) {
            newScore.overs += 1;
            newScore.balls = 0;
            // Switch strike at end of over
            setStrikeBatsmanIndex(prev => prev === 0 ? 1 : 0);
          }
        }
        
        setInnings2Score(newScore);
      }

      // Update current batsman stats
      if (!isWicket && runs > 0) {
        const updatedBatsmen = [...currentBatsmen];
        updatedBatsmen[strikeBatsmanIndex].runs += runs;
        updatedBatsmen[strikeBatsmanIndex].balls += 1;
        if (runs === 4) updatedBatsmen[strikeBatsmanIndex].fours += 1;
        if (runs === 6) updatedBatsmen[strikeBatsmanIndex].sixes += 1;
        
        // Switch strike for odd runs
        if (runs % 2 === 1) {
          setStrikeBatsmanIndex(prev => prev === 0 ? 1 : 0);
        }
        
        setCurrentBatsmen(updatedBatsmen);
      }

      // Update bowler stats
      const updatedBowler = { ...currentBowler };
      updatedBowler.runs += runs + extras;
      if (isWicket) updatedBowler.wickets += 1;
      if (!extraType || extraType === 'bye' || extraType === 'leg-bye') {
        updatedBowler.overs += 1/6;
      }
      setCurrentBowler(updatedBowler);

      const ballData = {
        match_id: matchId,
        innings: currentInnings,
        over_number: currentInnings === 1 ? (innings1Score?.overs || 0) + 1 : (innings2Score?.overs || 0) + 1,
        ball_number: currentInnings === 1 ? (innings1Score?.balls || 0) + 1 : (innings2Score?.balls || 0) + 1,
        batsman_id: currentBatsmen[strikeBatsmanIndex]?.id || null,
        bowler_id: currentBowler?.id || null,
        runs,
        extras,
        extra_type: extraType || null,
        is_wicket: isWicket,
        wicket_type: wicketType || null,
        shot_type: shotType || null,
        fielder_id: fielderId,
        commentary: `${runs} run${runs !== 1 ? 's' : ''}${isWicket ? `, ${wicketType}` : ''}`
      };

      const { error } = await supabase
        .from('ball_by_ball')
        .insert([ballData]);

      if (error) throw error;

      const ballValue = ballData.is_wicket ? 'W' : ballData.runs.toString();
      setRecentBalls(prev => [
        ...prev.slice(-11),
        ballValue
      ]);

      // Update match stats for batsman and bowler
      await updateMatchStats(runs, extras, isWicket, wicketType);
      
      // Check if match is completed after this ball
      setTimeout(() => {
        checkMatchCompletion();
      }, 100);

    } catch (error) {
      console.error('Error recording ball:', error);
      toast({
        title: "Error",
        description: "Failed to record ball",
        variant: "destructive"
      });
    }
  };

  const updateMatchStats = async (runs, extras, isWicket, wicketType) => {
    try {
      const batsmanId = currentBatsmen[strikeBatsmanIndex]?.id;
      const bowlerId = currentBowler?.id;

      if (batsmanId) {
        // Update or create batsman stats
        const { data: existingBatsmanStats } = await supabase
          .from('match_stats')
          .select('*')
          .eq('match_id', matchId)
          .eq('player_id', batsmanId)
          .eq('innings', currentInnings)
          .single();

        const updatedRunsScored = (existingBatsmanStats?.runs_scored || 0) + runs;
        const updatedBallsFaced = (existingBatsmanStats?.balls_faced || 0) + 1;
        const updatedFours = (existingBatsmanStats?.fours || 0) + (runs === 4 ? 1 : 0);
        const updatedSixes = (existingBatsmanStats?.sixes || 0) + (runs === 6 ? 1 : 0);
        const calculatedStrikeRate = updatedBallsFaced > 0 ? (updatedRunsScored / updatedBallsFaced) * 100 : 0;

        const batsmanStats = {
          match_id: matchId,
          player_id: batsmanId,
          innings: currentInnings,
          runs_scored: updatedRunsScored,
          balls_faced: updatedBallsFaced,
          fours: updatedFours,
          sixes: updatedSixes,
          strike_rate: calculatedStrikeRate,
          dismissal_type: isWicket ? wicketType : existingBatsmanStats?.dismissal_type
        };

        if (existingBatsmanStats) {
          await supabase
            .from('match_stats')
            .update(batsmanStats)
            .eq('id', existingBatsmanStats.id);
        } else {
          await supabase
            .from('match_stats')
            .insert([batsmanStats]);
        }
      }

      if (bowlerId) {
        // Update or create bowler stats
        const { data: existingBowlerStats } = await supabase
          .from('match_stats')
          .select('*')
          .eq('match_id', matchId)
          .eq('player_id', bowlerId)
          .eq('innings', currentInnings)
          .single();

        const updatedOversBowled = (existingBowlerStats?.overs_bowled || 0) + (1/6);
        const updatedRunsConceded = (existingBowlerStats?.runs_conceded || 0) + runs + extras;
        const updatedWicketsTaken = (existingBowlerStats?.wickets_taken || 0) + (isWicket ? 1 : 0);
        const calculatedEconomyRate = updatedOversBowled > 0 ? updatedRunsConceded / updatedOversBowled : 0;

        const bowlerStats = {
          match_id: matchId,
          player_id: bowlerId,
          innings: currentInnings,
          overs_bowled: updatedOversBowled,
          runs_conceded: updatedRunsConceded,
          wickets_taken: updatedWicketsTaken,
          economy_rate: calculatedEconomyRate
        };

        if (existingBowlerStats) {
          await supabase
            .from('match_stats')
            .update(bowlerStats)
            .eq('id', existingBowlerStats.id);
        } else {
          await supabase
            .from('match_stats')
            .insert([bowlerStats]);
        }
      }
    } catch (error) {
      console.error('Error updating match stats:', error);
    }
  };

  const updateBatsman = (index, field, value) => {
    const updatedBatsmen = [...currentBatsmen];
    if (field === 'id') {
      const player = players.find(p => p.id === value);
      updatedBatsmen[index] = {
        id: value,
        name: player?.name || '',
        runs: updatedBatsmen[index].runs,
        balls: updatedBatsmen[index].balls,
        fours: updatedBatsmen[index].fours,
        sixes: updatedBatsmen[index].sixes
      };
    } else {
      updatedBatsmen[index][field] = value;
    }
    setCurrentBatsmen(updatedBatsmen);
  };

  const updateBowler = (field, value) => {
    if (field === 'id') {
      const player = players.find(p => p.id === value);
      setCurrentBowler({
        id: value,
        name: player?.name || '',
        overs: currentBowler.overs,
        runs: currentBowler.runs,
        wickets: currentBowler.wickets
      });
    } else {
      setCurrentBowler(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Live Scoring</h2>
        <div className="flex gap-2">
          <Badge variant={matchStatus === 'in_progress' ? 'default' : 'secondary'}>
            {matchStatus.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="scoring" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scoring">Live Scoring</TabsTrigger>
          <TabsTrigger value="analytics">Match Analytics</TabsTrigger>
          <TabsTrigger value="setup">Match Setup</TabsTrigger>
        </TabsList>

        <TabsContent value="scoring" className="space-y-4">
          {/* Match Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Select Match
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={matchId} onValueChange={loadMatchData}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a match to score" />
                </SelectTrigger>
                <SelectContent>
                  {matches.map((match) => (
                    <SafeSelectItem key={match.id} value={ensureValidSelectItemValue(match.id)}>
                      {match.team1?.name} vs {match.team2?.name} - {new Date(match.match_date).toLocaleDateString()}
                    </SafeSelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {matchId && (
            <>
              {/* Current Score Display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{team1Name} - 1st Innings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {innings1Score.runs}/{innings1Score.wickets}
                    </div>
                    <div className="text-gray-600">
                      ({innings1Score.overs}.{innings1Score.balls} overs)
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{team2Name} - 2nd Innings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {innings2Score.runs}/{innings2Score.wickets}
                    </div>
                    <div className="text-gray-600">
                      ({innings2Score.overs}.{innings2Score.balls} overs)
                    </div>
                    {currentInnings === 2 && innings1Score.runs > 0 && (
                      <div className="text-sm text-blue-600 mt-2">
                        Need {innings1Score.runs + 1 - innings2Score.runs} runs from {(totalOvers * 6) - (innings2Score.overs * 6 + innings2Score.balls)} balls
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Current Players */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Current Players
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Batsmen */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {currentBatsmen.map((batsman, index) => (
                      <div key={index} className="space-y-2">
                        <Label>Batsman {index + 1} {index === strikeBatsmanIndex ? '(Strike)' : ''}</Label>
                        <Select 
                          value={batsman.id} 
                          onValueChange={(value) => updateBatsman(index, 'id', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select batsman" />
                          </SelectTrigger>
                          <SelectContent>
                            {players.map((player) => (
                              <SafeSelectItem key={player.id} value={ensureValidSelectItemValue(player.id)}>
                                {player.name}
                              </SafeSelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {batsman.name && (
                          <div className="text-sm text-gray-600">
                            {batsman.runs} ({batsman.balls}b) • {batsman.fours}×4, {batsman.sixes}×6
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Bowler */}
                  <div className="space-y-2">
                    <Label>Current Bowler</Label>
                    <Select 
                      value={currentBowler.id} 
                      onValueChange={(value) => updateBowler('id', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select bowler" />
                      </SelectTrigger>
                      <SelectContent>
                        {players.map((player) => (
                          <SafeSelectItem key={player.id} value={ensureValidSelectItemValue(player.id)}>
                            {player.name}
                          </SafeSelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {currentBowler.name && (
                      <div className="text-sm text-gray-600">
                        {currentBowler.overs.toFixed(1)}-{currentBowler.runs}-{currentBowler.wickets}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Scoring Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle>Score Ball</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[0, 1, 2, 3, 4, 6].map((runs) => (
                      <Button
                        key={runs}
                        onClick={() => recordBall(runs)}
                        variant={runs === 0 ? "outline" : "default"}
                        className={runs === 4 ? "bg-green-600 hover:bg-green-700" : runs === 6 ? "bg-purple-600 hover:bg-purple-700" : ""}
                      >
                        {runs}
                      </Button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-4">
                    <Button
                      onClick={() => recordBall(0, 1, 'wide')}
                      variant="outline"
                      className="text-orange-600"
                    >
                      Wide
                    </Button>
                    <Button
                      onClick={() => recordBall(0, 1, 'no-ball')}
                      variant="outline"
                      className="text-red-600"
                    >
                      No Ball
                    </Button>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      onClick={() => recordBall(0, 0, '', true, 'bowled')}
                      variant="destructive"
                    >
                      Bowled
                    </Button>
                    <Button
                      onClick={() => recordBall(0, 0, '', true, 'caught')}
                      variant="destructive"
                    >
                      Caught
                    </Button>
                    <Button
                      onClick={() => recordBall(0, 0, '', true, 'lbw')}
                      variant="destructive"
                    >
                      LBW
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Balls */}
              {recentBalls.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Balls</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 flex-wrap">
                      {recentBalls.map((ball, index) => (
                        <Badge
                          key={index}
                          variant={ball === 'W' ? 'destructive' : ball === '4' ? 'default' : ball === '6' ? 'secondary' : 'outline'}
                        >
                          {ball}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <MatchAnalytics 
            matchData={{ matchId, team1Name, team2Name, totalOvers }}
            innings1Score={innings1Score}
            innings2Score={innings2Score}
            currentBatsmen={currentBatsmen}
            currentBowler={currentBowler}
          />
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Match Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Total Overs</Label>
                <Input
                  type="number"
                  value={totalOvers}
                  onChange={(e) => setTotalOvers(parseInt(e.target.value) || 20)}
                  min="1"
                  max="50"
                />
              </div>
              
              <div>
                <Label>Current Innings</Label>
                <Select value={currentInnings.toString()} onValueChange={(value) => setCurrentInnings(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SafeSelectItem value="1">1st Innings</SafeSelectItem>
                    <SafeSelectItem value="2">2nd Innings</SafeSelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={() => {
                  setInnings1Score({ runs: 0, wickets: 0, overs: 0, balls: 0 });
                  setInnings2Score({ runs: 0, wickets: 0, overs: 0, balls: 0 });
                  setCurrentInnings(1);
                  setRecentBalls([]);
                  setCurrentBatsmen([
                    { id: "", name: "", runs: 0, balls: 0, fours: 0, sixes: 0 },
                    { id: "", name: "", runs: 0, balls: 0, fours: 0, sixes: 0 }
                  ]);
                  setCurrentBowler({ id: "", name: "", overs: 0, runs: 0, wickets: 0 });
                  setStrikeBatsmanIndex(0);
                }}
                variant="outline"
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset Match
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LiveScoring;
