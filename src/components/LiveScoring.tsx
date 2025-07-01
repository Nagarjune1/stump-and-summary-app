
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Timer, Target, Users, Activity, StopCircle } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ScoreCorrection from "./ScoreCorrection";
import PlayerManagement from "./PlayerManagement";
import ExportReport from "./ExportReport";
import PlayerSelector from "./PlayerSelector";
import { supabase } from "@/integrations/supabase/client";

const LiveScoring = ({ currentMatch }) => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(currentMatch);
  const [score, setScore] = useState({ runs: 0, wickets: 0, overs: 0, balls: 0 });
  const [currentBatsmen, setCurrentBatsmen] = useState([]);
  const [currentBowler, setCurrentBowler] = useState(null);
  const [overHistory, setOverHistory] = useState([]);
  const [currentBall, setCurrentBall] = useState(0);
  const [currentOver, setCurrentOver] = useState(0);
  const [currentInnings, setCurrentInnings] = useState(1);
  const [isInningsBreak, setIsInningsBreak] = useState(false);
  const [strikerIndex, setStrikerIndex] = useState(0);
  const [matchEnded, setMatchEnded] = useState(false);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [battingTeam, setBattingTeam] = useState(1);
  const [innings1Score, setInnings1Score] = useState({ runs: 0, wickets: 0, overs: 0 });

  useEffect(() => {
    fetchLiveMatches();
  }, []);

  useEffect(() => {
    if (currentMatch) {
      setSelectedMatch(currentMatch);
      resetScorecard();
      fetchTeamPlayers();
    }
  }, [currentMatch]);

  const fetchLiveMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!matches_team1_id_fkey(name),
          team2:teams!matches_team2_id_fkey(name)
        `)
        .eq('status', 'live')
        .order('match_date', { ascending: false });

      if (error) {
        console.error('Error fetching live matches:', error);
        return;
      }

      setLiveMatches(data || []);
      
      if (!selectedMatch && data && data.length > 0) {
        setSelectedMatch(data[0]);
        resetScorecard();
        fetchTeamPlayers();
      }
    } catch (error) {
      console.error('Error fetching live matches:', error);
    }
  };

  const fetchTeamPlayers = async () => {
    if (!selectedMatch) return;
    
    try {
      const { data: team1Data, error: team1Error } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', selectedMatch.team1_id);
      
      const { data: team2Data, error: team2Error } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', selectedMatch.team2_id);

      if (team1Error || team2Error) {
        console.error('Error fetching players:', team1Error || team2Error);
        return;
      }

      setTeam1Players(team1Data || []);
      setTeam2Players(team2Data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const resetScorecard = () => {
    setScore({ runs: 0, wickets: 0, overs: 0, balls: 0 });
    setCurrentBatsmen([]);
    setCurrentBowler(null);
    setOverHistory([]);
    setCurrentBall(0);
    setCurrentOver(0);
    setCurrentInnings(1);
    setIsInningsBreak(false);
    setStrikerIndex(0);
    setMatchEnded(false);
    setBattingTeam(1);
    setInnings1Score({ runs: 0, wickets: 0, overs: 0 });
  };

  const checkInningsComplete = () => {
    const totalOvers = selectedMatch?.overs || 20;
    return currentOver >= totalOvers || score.wickets >= 10;
  };

  const endInnings = () => {
    if (currentInnings === 1) {
      setInnings1Score({ ...score, overs: currentOver });
      setIsInningsBreak(true);
      toast({
        title: "Innings 1 Complete!",
        description: `Final Score: ${score.runs}/${score.wickets} (${currentOver}.${currentBall})`,
      });
    } else {
      endMatch();
    }
  };

  const startInnings2 = () => {
    setCurrentInnings(2);
    setIsInningsBreak(false);
    setScore({ runs: 0, wickets: 0, overs: 0, balls: 0 });
    setCurrentBall(0);
    setCurrentOver(0);
    setCurrentBatsmen([]);
    setCurrentBowler(null);
    setBattingTeam(battingTeam === 1 ? 2 : 1);
    setStrikerIndex(0);
    
    toast({
      title: "Innings 2 Started!",
      description: `Target: ${innings1Score.runs + 1} runs`,
    });
  };

  const endMatch = async () => {
    try {
      const { error } = await supabase
        .from('matches')
        .update({ 
          status: 'completed',
          team1_score: currentInnings === 1 ? `${score.runs}/${score.wickets}` : `${innings1Score.runs}/${innings1Score.wickets}`,
          team1_overs: currentInnings === 1 ? `${currentOver}.${currentBall}` : `${innings1Score.overs}.0`,
          team2_score: currentInnings === 2 ? `${score.runs}/${score.wickets}` : null,
          team2_overs: currentInnings === 2 ? `${currentOver}.${currentBall}` : null
        })
        .eq('id', selectedMatch.id);

      if (error) {
        console.error('Error ending match:', error);
        toast({
          title: "Error",
          description: "Failed to end match",
          variant: "destructive"
        });
        return;
      }

      setMatchEnded(true);
      toast({
        title: "Match Ended!",
        description: "Match has been completed successfully",
      });
    } catch (error) {
      console.error('Error ending match:', error);
    }
  };

  const addRun = (runs) => {
    if (matchEnded || isInningsBreak) return;

    setScore(prev => ({ ...prev, runs: prev.runs + runs }));
    
    // Update batsman stats
    if (currentBatsmen.length > strikerIndex) {
      const updatedBatsmen = [...currentBatsmen];
      updatedBatsmen[strikerIndex] = {
        ...updatedBatsmen[strikerIndex],
        runs: updatedBatsmen[strikerIndex].runs + runs,
        balls: updatedBatsmen[strikerIndex].balls + 1,
        fours: runs === 4 ? (updatedBatsmen[strikerIndex].fours || 0) + 1 : (updatedBatsmen[strikerIndex].fours || 0),
        sixes: runs === 6 ? (updatedBatsmen[strikerIndex].sixes || 0) + 1 : (updatedBatsmen[strikerIndex].sixes || 0)
      };
      setCurrentBatsmen(updatedBatsmen);
    }

    // Change strike on odd runs
    if (runs % 2 === 1 && currentBatsmen.length === 2) {
      setStrikerIndex(strikerIndex === 0 ? 1 : 0);
    }
    
    setCurrentBall(prev => {
      const newBall = prev + 1;
      if (newBall >= 6) {
        const newOver = currentOver + 1;
        setCurrentOver(newOver);
        setScore(prevScore => ({ 
          ...prevScore, 
          overs: newOver,
          balls: 0
        }));
        
        // Change strike at end of over
        if (currentBatsmen.length === 2) {
          setStrikerIndex(strikerIndex === 0 ? 1 : 0);
        }
        
        // Check if innings is complete
        if (checkInningsComplete()) {
          endInnings();
        }
        
        return 0;
      }
      setScore(prevScore => ({ ...prevScore, balls: newBall }));
      return newBall;
    });

    toast({
      title: `${runs} run${runs > 1 ? 's' : ''} added!`,
      description: `Current score: ${score.runs + runs}/${score.wickets} (${currentOver}.${currentBall + 1})`,
    });
  };

  const addWicket = () => {
    if (matchEnded || isInningsBreak) return;

    setScore(prev => ({ ...prev, wickets: prev.wickets + 1 }));
    
    setCurrentBall(prev => {
      const newBall = prev + 1;
      if (newBall >= 6) {
        const newOver = currentOver + 1;
        setCurrentOver(newOver);
        setScore(prevScore => ({ 
          ...prevScore, 
          overs: newOver,
          balls: 0
        }));
        
        if (checkInningsComplete()) {
          endInnings();
        }
        
        return 0;
      }
      setScore(prevScore => ({ ...prevScore, balls: newBall }));
      return newBall;
    });

    toast({
      title: "Wicket fallen!",
      description: `Current score: ${score.runs}/${score.wickets + 1} (${currentOver}.${currentBall + 1})`,
      variant: "destructive"
    });

    // Check if innings is complete
    if (score.wickets + 1 >= 10 || checkInningsComplete()) {
      endInnings();
    }
  };

  const handleScoreUpdate = (newScore) => {
    setScore(newScore);
  };

  const handlePlayerAdded = (newPlayer) => {
    console.log('New player added:', newPlayer);
    fetchTeamPlayers();
  };

  const handleMatchSelect = (matchId) => {
    const match = liveMatches.find(m => m.id === matchId);
    if (match) {
      setSelectedMatch(match);
      resetScorecard();
      fetchTeamPlayers();
    }
  };

  const editBallCount = (newBalls) => {
    if (newBalls >= 0 && newBalls < 6) {
      setCurrentBall(newBalls);
      setScore(prev => ({ ...prev, balls: newBalls }));
    }
  };

  const handleBatsmenSelect = (batsmen) => {
    setCurrentBatsmen(batsmen);
    setStrikerIndex(0);
  };

  const handleBowlerSelect = (bowler) => {
    setCurrentBowler(bowler);
  };

  if (liveMatches.length === 0) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">No Live Matches</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">Start a match to begin live scoring</p>
        </CardContent>
      </Card>
    );
  }

  if (!selectedMatch) {
    return (
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Select a Match</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 mb-4">Please select a live match to start scoring</p>
        </CardContent>
      </Card>
    );
  }

  if (matchEnded) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-green-600">Match Completed!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">{selectedMatch.team1?.name || 'Team 1'} vs {selectedMatch.team2?.name || 'Team 2'}</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Innings 1: {innings1Score.runs}/{innings1Score.wickets} ({innings1Score.overs} overs)</p>
              </div>
              {currentInnings === 2 && (
                <div>
                  <p className="font-medium">Innings 2: {score.runs}/{score.wickets} ({currentOver}.{currentBall} overs)</p>
                </div>
              )}
            </div>
          </div>
          <ExportReport 
            matchData={selectedMatch}
            scoreData={score}
            currentBatsmen={currentBatsmen}
            currentBowler={currentBowler}
          />
        </CardContent>
      </Card>
    );
  }

  if (isInningsBreak) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center">Innings Break</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Innings 1 Complete</h3>
            <p className="text-xl font-bold">{innings1Score.runs}/{innings1Score.wickets} ({innings1Score.overs} overs)</p>
            <p className="text-sm text-gray-600 mt-2">Target: {innings1Score.runs + 1} runs</p>
          </div>
          <Button 
            onClick={startInnings2}
            className="bg-green-600 hover:bg-green-700"
            size="lg"
          >
            Start Innings 2
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentBattingPlayers = battingTeam === 1 ? team1Players : team2Players;
  const currentBowlingPlayers = battingTeam === 1 ? team2Players : team1Players;

  return (
    <div className="space-y-6">
      {/* Match Selection */}
      {liveMatches.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Select Live Match</CardTitle>
          </CardHeader>
          <CardContent>
            <Select onValueChange={handleMatchSelect} value={selectedMatch?.id}>
              <SelectTrigger>
                <SelectValue placeholder="Select a live match" />
              </SelectTrigger>
              <SelectContent>
                {liveMatches.map((match) => (
                  <SelectItem key={match.id} value={match.id}>
                    {match.team1?.name} vs {match.team2?.name} - {match.venue}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}

      {/* Live Score Header */}
      <Card className="bg-gradient-to-r from-blue-600 to-green-600 text-white">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">{selectedMatch.team1?.name || 'Team 1'} vs {selectedMatch.team2?.name || 'Team 2'}</h2>
              <p className="text-blue-100">{selectedMatch.format} Match • Innings {currentInnings} • Over {currentOver}.{currentBall} of {selectedMatch.overs || 20}</p>
              <p className="text-blue-100 text-sm">{selectedMatch.venue}</p>
              {currentInnings === 2 && (
                <p className="text-yellow-200 text-sm font-medium">Target: {innings1Score.runs + 1} runs</p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>
              <Button 
                onClick={endMatch}
                variant="outline" 
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white border-red-600 hover:text-white"
              >
                <StopCircle className="w-4 h-4 mr-1" />
                End Match
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2 text-white">{score.runs}/{score.wickets}</div>
            <div className="text-lg text-white">({currentOver}.{currentBall} overs)</div>
            <div className="mt-2 flex items-center justify-center gap-4 text-white">
              <span>Balls: </span>
              <Input
                type="number"
                min="0"
                max="5"
                value={currentBall}
                onChange={(e) => editBallCount(parseInt(e.target.value) || 0)}
                className="w-16 text-center text-black bg-white"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm text-white">
              <div>
                <div className="font-semibold">Run Rate</div>
                <div>{currentOver > 0 ? ((score.runs / (currentOver + currentBall/6)).toFixed(2)) : '0.00'}</div>
              </div>
              <div>
                <div className="font-semibold">Required Rate</div>
                <div>
                  {currentInnings === 2 && currentOver < (selectedMatch.overs || 20) ? 
                    (((innings1Score.runs + 1 - score.runs) / ((selectedMatch.overs || 20) - currentOver - currentBall/6)).toFixed(2)) : 
                    '-'
                  }
                </div>
              </div>
              <div>
                <div className="font-semibold">Batting</div>
                <div>{battingTeam === 1 ? selectedMatch.team1?.name : selectedMatch.team2?.name}</div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex justify-center gap-3 mt-4">
            <ScoreCorrection 
              currentScore={score} 
              onScoreUpdate={handleScoreUpdate}
            />
            <PlayerManagement 
              currentMatch={selectedMatch}
              onPlayerAdded={handlePlayerAdded}
            />
            <ExportReport 
              matchData={selectedMatch}
              scoreData={score}
              currentBatsmen={currentBatsmen}
              currentBowler={currentBowler}
            />
          </div>
        </CardContent>
      </Card>

      {/* Player Selection */}
      <PlayerSelector
        battingPlayers={currentBattingPlayers}
        bowlingPlayers={currentBowlingPlayers}
        onBatsmenSelect={handleBatsmenSelect}
        onBowlerSelect={handleBowlerSelect}
        currentBatsmen={currentBatsmen}
        currentBowler={currentBowler}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scoring Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Quick Scoring
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[0, 1, 2, 3, 4, 6].map((runs) => (
                <Button
                  key={runs}
                  onClick={() => addRun(runs)}
                  className={`h-12 text-lg font-bold ${
                    runs === 4 ? 'bg-blue-500 hover:bg-blue-600' :
                    runs === 6 ? 'bg-orange-500 hover:bg-orange-600' :
                    'bg-gray-500 hover:bg-gray-600'
                  }`}
                  disabled={matchEnded || isInningsBreak}
                >
                  {runs}
                </Button>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button 
                onClick={addWicket} 
                variant="destructive" 
                className="h-12"
                disabled={matchEnded || isInningsBreak}
              >
                Wicket
              </Button>
              <Button 
                variant="outline" 
                className="h-12"
                disabled={matchEnded || isInningsBreak}
              >
                Wide/No Ball
              </Button>
            </div>

            <div className="space-y-3">
              <Select disabled={matchEnded || isInningsBreak}>
                <SelectTrigger>
                  <SelectValue placeholder="Select dismissal type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bowled">Bowled</SelectItem>
                  <SelectItem value="caught">Caught</SelectItem>
                  <SelectItem value="lbw">LBW</SelectItem>
                  <SelectItem value="stumped">Stumped</SelectItem>
                  <SelectItem value="runout">Run Out</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Current Players */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Current Players
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Batsmen</h4>
              {currentBatsmen.length === 0 ? (
                <p className="text-gray-500 text-sm">No batsmen selected yet</p>
              ) : (
                currentBatsmen.map((batsman, index) => (
                  <div key={index} className={`flex justify-between items-center p-3 rounded-lg mb-2 ${
                    index === strikerIndex ? 'bg-green-100 border-2 border-green-300' : 'bg-gray-50'
                  }`}>
                    <div>
                      <p className="font-medium">
                        {batsman.name} 
                        {index === strikerIndex && <span className="text-green-600 ml-1">*</span>}
                      </p>
                      <p className="text-sm text-gray-600">
                        {batsman.runs || 0}({batsman.balls || 0}) • 4s: {batsman.fours || 0} • 6s: {batsman.sixes || 0}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{batsman.runs || 0}</div>
                      <div className="text-xs text-gray-500">
                        SR: {(batsman.balls || 0) > 0 ? (((batsman.runs || 0) / (batsman.balls || 0)) * 100).toFixed(1) : '0.0'}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div>
              <h4 className="font-medium mb-2">Current Bowler</h4>
              {!currentBowler ? (
                <p className="text-gray-500 text-sm">No bowler selected yet</p>
              ) : (
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{currentBowler.name}</p>
                    <p className="text-sm text-gray-600">
                      {currentBowler.overs || 0} overs • {currentBowler.runs || 0} runs • {currentBowler.wickets || 0} wickets
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{currentBowler.wickets || 0}/{currentBowler.runs || 0}</div>
                    <div className="text-xs text-gray-500">
                      Econ: {(currentBowler.overs || 0) > 0 ? ((currentBowler.runs || 0) / (currentBowler.overs || 0)).toFixed(1) : '0.0'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Over History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Overs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {overHistory.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No overs completed yet</p>
            ) : (
              overHistory.map((over, index) => (
                <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  <Badge variant="outline">Over {index + 1}</Badge>
                  <span className="font-mono text-sm">{over}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveScoring;
