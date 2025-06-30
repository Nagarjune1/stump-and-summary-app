
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Timer, Target, Users, Activity } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ScoreCorrection from "./ScoreCorrection";
import PlayerManagement from "./PlayerManagement";
import ExportReport from "./ExportReport";
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

  useEffect(() => {
    fetchLiveMatches();
  }, []);

  useEffect(() => {
    if (currentMatch) {
      setSelectedMatch(currentMatch);
      resetScorecard();
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
      
      // If no current match is selected but there are live matches, select the first one
      if (!selectedMatch && data && data.length > 0) {
        setSelectedMatch(data[0]);
        resetScorecard();
      }
    } catch (error) {
      console.error('Error fetching live matches:', error);
    }
  };

  const resetScorecard = () => {
    setScore({ runs: 0, wickets: 0, overs: 0, balls: 0 });
    setCurrentBatsmen([]);
    setCurrentBowler(null);
    setOverHistory([]);
    setCurrentBall(0);
    setCurrentOver(0);
  };

  const addRun = (runs) => {
    setScore(prev => ({ ...prev, runs: prev.runs + runs }));
    
    // Increment ball count for valid deliveries (not wides/no-balls)
    setCurrentBall(prev => {
      const newBall = prev + 1;
      if (newBall >= 6) {
        setCurrentOver(prevOver => prevOver + 1);
        setScore(prevScore => ({ 
          ...prevScore, 
          overs: Math.floor(prevScore.overs) + 1,
          balls: 0
        }));
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
    setScore(prev => ({ ...prev, wickets: prev.wickets + 1 }));
    
    // Increment ball count for wicket
    setCurrentBall(prev => {
      const newBall = prev + 1;
      if (newBall >= 6) {
        setCurrentOver(prevOver => prevOver + 1);
        setScore(prevScore => ({ 
          ...prevScore, 
          overs: Math.floor(prevScore.overs) + 1,
          balls: 0
        }));
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
  };

  const handleScoreUpdate = (newScore) => {
    setScore(newScore);
  };

  const handlePlayerAdded = (newPlayer) => {
    console.log('New player added:', newPlayer);
    // Refresh any player lists if needed
  };

  const handleMatchSelect = (matchId) => {
    const match = liveMatches.find(m => m.id === matchId);
    if (match) {
      setSelectedMatch(match);
      resetScorecard();
    }
  };

  const editBallCount = (newBalls) => {
    if (newBalls >= 0 && newBalls < 6) {
      setCurrentBall(newBalls);
      setScore(prev => ({ ...prev, balls: newBalls }));
    }
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
              <h2 className="text-xl font-bold">{selectedMatch.team1?.name || 'Team 1'} vs {selectedMatch.team2?.name || 'Team 2'}</h2>
              <p className="text-blue-100">{selectedMatch.format} Match • Over {currentOver}.{currentBall} of {selectedMatch.overs || 20}</p>
              <p className="text-blue-100 text-sm">{selectedMatch.venue}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold mb-2">{score.runs}/{score.wickets}</div>
            <div className="text-lg">({currentOver}.{currentBall} overs)</div>
            <div className="mt-2 flex items-center justify-center gap-4">
              <span>Balls: </span>
              <Input
                type="number"
                min="0"
                max="5"
                value={currentBall}
                onChange={(e) => editBallCount(parseInt(e.target.value) || 0)}
                className="w-16 text-center text-black"
              />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div>
                <div className="font-semibold">Run Rate</div>
                <div>{currentOver > 0 ? ((score.runs / (currentOver + currentBall/6)).toFixed(2)) : '0.00'}</div>
              </div>
              <div>
                <div className="font-semibold">Total Overs</div>
                <div>{selectedMatch.overs || 20}</div>
              </div>
              <div>
                <div className="font-semibold">Venue</div>
                <div>{selectedMatch.venue}</div>
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
                >
                  {runs}
                </Button>
              ))}
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Button onClick={addWicket} variant="destructive" className="h-12">
                Wicket
              </Button>
              <Button variant="outline" className="h-12">
                Wide/No Ball
              </Button>
            </div>

            <div className="space-y-3">
              <Select>
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
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg mb-2">
                    <div>
                      <p className="font-medium">{batsman.name} {index === 0 && "*"}</p>
                      <p className="text-sm text-gray-600">{batsman.runs}({batsman.balls}) • 4s: {batsman.fours} • 6s: {batsman.sixes}</p>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{batsman.runs}</div>
                      <div className="text-xs text-gray-500">SR: {batsman.balls > 0 ? ((batsman.runs / batsman.balls) * 100).toFixed(1) : '0.0'}</div>
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
                    <p className="text-sm text-gray-600">{currentBowler.overs} overs • {currentBowler.runs} runs • {currentBowler.wickets} wickets</p>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">{currentBowler.wickets}/{currentBowler.runs}</div>
                    <div className="text-xs text-gray-500">Econ: {currentBowler.overs > 0 ? (currentBowler.runs / currentBowler.overs).toFixed(1) : '0.0'}</div>
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
