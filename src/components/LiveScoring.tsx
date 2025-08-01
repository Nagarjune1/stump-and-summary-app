
import { useState, useEffect, useCallback, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import SafeSelectItem from "@/components/ui/SafeSelectItem";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MatchAnalytics from "./MatchAnalytics";
import MatchSelector from "./scoring/MatchSelector";
import ScoreDisplay from "./scoring/ScoreDisplay";
import PlayerSelection from "./scoring/PlayerSelection";
import ScoringControls from "./scoring/ScoringControls";
import TossSelector from "./TossSelector";
import PlayerSelector from "./PlayerSelector";
import WicketSelector from "./WicketSelector";
import CompleteMatchScorecard from "./CompleteMatchScorecard";
import { ensureValidSelectItemValue } from "@/utils/selectUtils";

const LiveScoring = () => {
  const [matchId, setMatchId] = useState("");
  const [match, setMatch] = useState(null);
  const [team1Name, setTeam1Name] = useState("");
  const [team2Name, setTeam2Name] = useState("");
  const [totalOvers, setTotalOvers] = useState(20);
  const [currentInnings, setCurrentInnings] = useState(1);
  const [matchStatus, setMatchStatus] = useState("not_started");
  const [battingTeam, setBattingTeam] = useState(1);
  const [tossCompleted, setTossCompleted] = useState(false);
  const [playersSelected, setPlayersSelected] = useState(false);
  
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
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wicketDialogOpen, setWicketDialogOpen] = useState(false);
  const [showScoreboard, setShowScoreboard] = useState(false);

  // Memoized values for performance
  const isMatchActive = useMemo(() => 
    ['in_progress', 'live', 'upcoming', 'scheduled'].includes(matchStatus),
    [matchStatus]
  );

  const canScore = useMemo(() => 
    matchId && (matchStatus === 'in_progress' || matchStatus === 'live') && playersSelected,
    [matchId, matchStatus, playersSelected]
  );

  // Fetch data functions
  const fetchMatches = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!matches_team1_id_fkey(name),
          team2:teams!matches_team2_id_fkey(name)
        `)
        .in('status', ['scheduled', 'in_progress', 'live', 'upcoming'])
        .order('match_date', { ascending: true });

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to fetch matches",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPlayers = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .order('name');

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast({
        title: "Error",
        description: "Failed to fetch players",
        variant: "destructive"
      });
    }
  }, []);

  const fetchTeamPlayers = useCallback(async (team1Id, team2Id) => {
    try {
      const { data: team1Data, error: team1Error } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', team1Id);

      const { data: team2Data, error: team2Error } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', team2Id);

      if (team1Error || team2Error) throw team1Error || team2Error;

      setTeam1Players(team1Data || []);
      setTeam2Players(team2Data || []);
    } catch (error) {
      console.error('Error fetching team players:', error);
      toast({
        title: "Error",
        description: "Failed to fetch team players",
        variant: "destructive"
      });
    }
  }, []);

  useEffect(() => {
    fetchMatches();
    fetchPlayers();
  }, [fetchMatches, fetchPlayers]);

  const loadMatchData = useCallback(async (selectedMatchId) => {
    if (!selectedMatchId) return;
    
    try {
      setLoading(true);
      const { data: matchData, error } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!matches_team1_id_fkey(name),
          team2:teams!matches_team2_id_fkey(name)
        `)
        .eq('id', selectedMatchId)
        .single();

      if (error) throw error;

      setMatch(matchData);
      setMatchId(selectedMatchId);
      setTeam1Name(matchData.team1?.name || '');
      setTeam2Name(matchData.team2?.name || '');
      setTotalOvers(matchData.overs || 20);
      setMatchStatus(matchData.status || 'upcoming');
      setTossCompleted(!!matchData.toss_winner);

      // Set batting team based on toss decision
      if (matchData.toss_winner && matchData.toss_decision) {
        const team1Won = matchData.toss_winner === matchData.team1?.name;
        if (matchData.toss_decision === 'bat') {
          setBattingTeam(team1Won ? 1 : 2);
        } else {
          setBattingTeam(team1Won ? 2 : 1);
        }
      }

      // Fetch team players
      await fetchTeamPlayers(matchData.team1_id, matchData.team2_id);

      // Parse existing scores if available
      if (matchData.team1_score) {
        const [runs, wickets, overs] = matchData.team1_score.split(/[\/\(\)]/);
        const [overNum, ballNum] = (overs || '0.0').split('.');
        setInnings1Score({
          runs: parseInt(runs) || 0,
          wickets: parseInt(wickets) || 0,
          overs: parseInt(overNum) || 0,
          balls: parseInt(ballNum) || 0
        });
      }

      if (matchData.team2_score) {
        const [runs, wickets, overs] = matchData.team2_score.split(/[\/\(\)]/);
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
        description: `${matchData.team1?.name} vs ${matchData.team2?.name}`,
      });
    } catch (error) {
      console.error('Error loading match data:', error);
      toast({
        title: "Error",
        description: "Failed to load match data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [fetchTeamPlayers]);

  const handleTossComplete = useCallback((tossWinner, tossDecision) => {
    setTossCompleted(true);
    const team1Won = tossWinner === team1Name;
    
    if (tossDecision === 'bat') {
      setBattingTeam(team1Won ? 1 : 2);
    } else {
      setBattingTeam(team1Won ? 2 : 1);
    }
    
    toast({
      title: "Toss Completed",
      description: `${tossWinner} chose to ${tossDecision} first`,
    });
  }, [team1Name]);

  const handlePlayersSelected = useCallback((selectedBatsmen, selectedBowler) => {
    setCurrentBatsmen([
      { ...selectedBatsmen[0], runs: 0, balls: 0, fours: 0, sixes: 0 },
      { ...selectedBatsmen[1], runs: 0, balls: 0, fours: 0, sixes: 0 }
    ]);
    setCurrentBowler({ ...selectedBowler, overs: 0, runs: 0, wickets: 0 });
    setPlayersSelected(true);
    setMatchStatus('live');
    
    // Update match status in database
    supabase
      .from('matches')
      .update({ status: 'live' })
      .eq('id', matchId);

    toast({
      title: "Match Started",
      description: "Players selected, ready to score!",
    });
  }, [matchId]);

  const recordBall = useCallback(async (runs, extras = 0, extraType = '', isWicket = false, wicketType = '') => {
    if (!canScore) return;

    try {
      // Update current innings score
      const updateScore = (currentScore) => {
        const newScore = { ...currentScore };
        newScore.runs += runs + extras;
        if (isWicket) newScore.wickets += 1;
        
        // Only increment ball count for legal deliveries
        if (!extraType || extraType === 'bye' || extraType === 'leg-bye') {
          newScore.balls += 1;
          if (newScore.balls === 6) {
            newScore.overs += 1;
            newScore.balls = 0;
            // Switch strike at end of over and change bowler
            setStrikeBatsmanIndex(prev => prev === 0 ? 1 : 0);
          }
        }
        return newScore;
      };

      if (currentInnings === 1) {
        const newScore = updateScore(innings1Score);
        setInnings1Score(newScore);
        
        // Check if innings is complete
        if (newScore.wickets >= 10 || newScore.overs >= totalOvers) {
          setCurrentInnings(2);
          setBattingTeam(battingTeam === 1 ? 2 : 1);
          setPlayersSelected(false); // Reset for new innings
          toast({
            title: "Innings Complete",
            description: `${newScore.runs}/${newScore.wickets} (${newScore.overs}.${newScore.balls})`,
          });
        }
      } else {
        const newScore = updateScore(innings2Score);
        setInnings2Score(newScore);
        
        // Check if match is complete
        if (newScore.runs > innings1Score.runs || newScore.wickets >= 10 || newScore.overs >= totalOvers) {
          const resultText = newScore.runs > innings1Score.runs 
            ? `${battingTeam === 1 ? team1Name : team2Name} wins by ${10 - newScore.wickets} wickets`
            : innings1Score.runs > newScore.runs 
            ? `${battingTeam === 1 ? team2Name : team1Name} wins by ${innings1Score.runs - newScore.runs} runs`
            : "Match tied";
          
          await supabase
            .from('matches')
            .update({ 
              status: 'completed',
              result: resultText,
              team1_score: `${innings1Score.runs}/${innings1Score.wickets} (${innings1Score.overs}.${innings1Score.balls})`,
              team2_score: `${newScore.runs}/${newScore.wickets} (${newScore.overs}.${newScore.balls})`
            })
            .eq('id', matchId);
            
          setMatchStatus('completed');
          setShowScoreboard(true);
          await updatePlayerStats();
          toast({
            title: "Match Complete",
            description: resultText,
          });
        }
      }

      // Update batsman stats
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

      // Handle wicket
      if (isWicket) {
        setWicketDialogOpen(true);
      }

      // Update bowler stats
      const updatedBowler = { ...currentBowler };
      updatedBowler.runs += runs + extras;
      if (isWicket) updatedBowler.wickets += 1;
      if (!extraType || extraType === 'bye' || extraType === 'leg-bye') {
        updatedBowler.overs += 1/6;
      }
      setCurrentBowler(updatedBowler);

      // Record ball in database
      const currentScore = currentInnings === 1 ? innings1Score : innings2Score;
      const ballData = {
        match_id: matchId,
        innings: currentInnings,
        over_number: Math.floor(currentScore.balls / 6) + 1,
        ball_number: (currentScore.balls % 6) + 1,
        batsman_id: currentBatsmen[strikeBatsmanIndex]?.id || null,
        bowler_id: currentBowler?.id || null,
        runs,
        extras,
        extra_type: extraType || null,
        is_wicket: isWicket,
        wicket_type: wicketType || null,
        commentary: `${runs} run${runs !== 1 ? 's' : ''}${isWicket ? `, ${wicketType}` : ''}`
      };

      const { error } = await supabase
        .from('ball_by_ball')
        .insert([ballData]);

      if (error) throw error;

      const ballValue = isWicket ? 'W' : runs.toString();
      setRecentBalls(prev => [...prev.slice(-11), ballValue]);

    } catch (error) {
      console.error('Error recording ball:', error);
      toast({
        title: "Error",
        description: "Failed to record ball",
        variant: "destructive"
      });
    }
  }, [canScore, matchId, currentInnings, innings1Score, innings2Score, totalOvers, team1Name, team2Name, battingTeam, currentBatsmen, strikeBatsmanIndex, currentBowler]);

  const updatePlayerStats = useCallback(async () => {
    try {
      // Update player statistics after match
      for (const batsman of currentBatsmen) {
        if (batsman.id) {
          const { error } = await supabase
            .from('players')
            .update({
              matches: supabase.rpc('increment', { field: 'matches' }),
              runs: supabase.rpc('increment', { field: 'runs', value: batsman.runs }),
            })
            .eq('id', batsman.id);
          
          if (error) console.error('Error updating batsman stats:', error);
        }
      }

      if (currentBowler.id) {
        const { error } = await supabase
          .from('players')
          .update({
            matches: supabase.rpc('increment', { field: 'matches' }),
            wickets: supabase.rpc('increment', { field: 'wickets', value: currentBowler.wickets }),
          })
          .eq('id', currentBowler.id);
        
        if (error) console.error('Error updating bowler stats:', error);
      }
    } catch (error) {
      console.error('Error updating player stats:', error);
    }
  }, [currentBatsmen, currentBowler]);

  const handleWicketSelect = useCallback((dismissalText) => {
    // Handle new batsman selection after wicket
    setWicketDialogOpen(false);
    // This would typically open another dialog to select new batsman
  }, []);

  const updateBatsman = useCallback((index, field, value) => {
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
  }, [currentBatsmen, players]);

  const updateBowler = useCallback((field, value) => {
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
  }, [players, currentBowler]);

  const resetMatch = useCallback(() => {
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
    setTossCompleted(false);
    setPlayersSelected(false);
    setBattingTeam(1);
    setShowScoreboard(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  // Show complete scoreboard after match
  if (showScoreboard && matchStatus === 'completed') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Match Complete</h2>
          <Button onClick={() => setShowScoreboard(false)} variant="outline">
            Back to Scoring
          </Button>
        </div>
        <CompleteMatchScorecard
          matchData={match}
          innings1Score={innings1Score}
          innings2Score={innings2Score}
          currentBatsmen={currentBatsmen}
          currentBowler={currentBowler}
          matchResult={match?.result}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Live Scoring</h2>
        <div className="flex gap-2">
          <Badge variant={matchStatus === 'live' || matchStatus === 'in_progress' ? 'default' : 'secondary'}>
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
          <MatchSelector 
            matches={matches}
            selectedMatchId={matchId}
            onMatchSelect={loadMatchData}
          />

          {matchId && !tossCompleted && (
            <TossSelector 
              match={match}
              onTossComplete={handleTossComplete}
            />
          )}

          {matchId && tossCompleted && !playersSelected && (
            <PlayerSelector
              match={match}
              onPlayersSelected={handlePlayersSelected}
              battingTeam={battingTeam}
              team1Players={team1Players}
              team2Players={team2Players}
            />
          )}

          {matchId && playersSelected && (
            <>
              <ScoreDisplay
                team1Name={team1Name}
                team2Name={team2Name}
                innings1Score={innings1Score}
                innings2Score={innings2Score}
                currentInnings={currentInnings}
                totalOvers={totalOvers}
              />

              <PlayerSelection
                currentBatsmen={currentBatsmen}
                currentBowler={currentBowler}
                players={players}
                strikeBatsmanIndex={strikeBatsmanIndex}
                onUpdateBatsman={updateBatsman}
                onUpdateBowler={updateBowler}
              />

              <ScoringControls
                onRecordBall={recordBall}
                isDisabled={!canScore}
              />

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

          <WicketSelector
            open={wicketDialogOpen}
            onClose={() => setWicketDialogOpen(false)}
            onWicketSelect={handleWicketSelect}
            fieldingPlayers={battingTeam === 1 ? team2Players : team1Players}
            currentBowler={currentBowler}
            currentBatsman={currentBatsmen[strikeBatsmanIndex]}
          />
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
                onClick={resetMatch}
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
