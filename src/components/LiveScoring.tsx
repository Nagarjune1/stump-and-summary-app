
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

  // Memoized values for performance
  const isMatchActive = useMemo(() => 
    matchStatus === 'in_progress' || matchStatus === 'scheduled',
    [matchStatus]
  );

  const canScore = useMemo(() => 
    matchId && isMatchActive && matchStatus !== 'completed',
    [matchId, isMatchActive, matchStatus]
  );

  // Fetch data functions
  const fetchMatches = useCallback(async () => {
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

      if (error) throw error;
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: "Error",
        description: "Failed to fetch matches",
        variant: "destructive"
      });
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

  useEffect(() => {
    fetchMatches();
    fetchPlayers();
  }, [fetchMatches, fetchPlayers]);

  const loadMatchData = useCallback(async (selectedMatchId) => {
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

      if (error) throw error;

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
      toast({
        title: "Error",
        description: "Failed to load match data",
        variant: "destructive"
      });
    }
  }, []);

  const recordBall = useCallback(async (runs, extras = 0, extraType = '', isWicket = false, wicketType = '') => {
    if (!canScore) return;

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
            // Switch strike at end of over
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
          toast({
            title: "Innings Complete",
            description: `${team1Name}: ${newScore.runs}/${newScore.wickets} (${newScore.overs}.${newScore.balls})`,
          });
        }
      } else {
        const newScore = updateScore(innings2Score);
        setInnings2Score(newScore);
      }

      // Update batsman and bowler stats
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

      // Record ball in database
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
  }, [canScore, matchStatus, matchId, currentInnings, innings1Score, innings2Score, totalOvers, team1Name, currentBatsmen, strikeBatsmanIndex, currentBowler]);

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
  }, []);

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
          <MatchSelector 
            matches={matches}
            selectedMatchId={matchId}
            onMatchSelect={loadMatchData}
          />

          {matchId && (
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
