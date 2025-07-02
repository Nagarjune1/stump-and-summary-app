import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Timer, Target, Users, Activity, StopCircle, Plus, TrendingUp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ScoreCorrection from "./ScoreCorrection";
import PlayerManagement from "./PlayerManagement";
import ExportReport from "./ExportReport";
import PlayerSelector from "./PlayerSelector";
import ShotSelector from "./ShotSelector";
import MatchAnalytics from "./MatchAnalytics";
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
  const [extrasDialog, setExtrasDialog] = useState({ open: false, type: '', runs: 0 });
  const [newBatsmanDialog, setNewBatsmanDialog] = useState(false);
  const [selectedNewBatsman, setSelectedNewBatsman] = useState("");
  const [shotDialog, setShotDialog] = useState({ open: false, runs: 0 });
  const [winner, setWinner] = useState(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [mobileView, setMobileView] = useState('scorecard');

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
    setWinner(null);
  };

  const formatOvers = (overs, balls) => {
    return `${overs}.${balls}`;
  };

  const calculateRunRate = (runs, overs, balls) => {
    const totalOvers = overs + (balls / 6);
    return totalOvers > 0 ? (runs / totalOvers).toFixed(2) : '0.00';
  };

  const calculateRequiredRunRate = () => {
    if (currentInnings !== 2) return '-';
    const remainingRuns = innings1Score.runs + 1 - score.runs;
    const remainingOvers = (selectedMatch?.overs || 20) - currentOver - (currentBall / 6);
    return remainingOvers > 0 ? (remainingRuns / remainingOvers).toFixed(2) : '-';
  };

  const checkInningsComplete = () => {
    const totalOvers = selectedMatch?.overs || 20;
    return currentOver >= totalOvers || score.wickets >= 10;
  };

  const determineWinner = () => {
    if (currentInnings === 1) return null;
    
    const target = innings1Score.runs + 1;
    const battingTeamName = battingTeam === 1 ? selectedMatch.team1?.name : selectedMatch.team2?.name;
    const bowlingTeamName = battingTeam === 1 ? selectedMatch.team2?.name : selectedMatch.team1?.name;
    
    if (score.runs >= target) {
      return `${battingTeamName} wins by ${10 - score.wickets} wickets`;
    } else if (checkInningsComplete()) {
      return `${bowlingTeamName} wins by ${target - score.runs - 1} runs`;
    }
    
    return null;
  };

  const endInnings = () => {
    if (currentInnings === 1) {
      // Fix: Proper over calculation for innings end
      const finalOvers = currentBall === 0 ? currentOver : currentOver + 1;
      setInnings1Score({ 
        ...score, 
        overs: finalOvers
      });
      setIsInningsBreak(true);
      toast({
        title: "Innings 1 Complete!",
        description: `Final Score: ${score.runs}/${score.wickets} (${formatOvers(currentOver, currentBall)})`,
      });
    } else {
      const result = determineWinner();
      setWinner(result);
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
      const result = determineWinner();
      
      const { error } = await supabase
        .from('matches')
        .update({ 
          status: 'completed',
          team1_score: currentInnings === 1 ? `${score.runs}/${score.wickets}` : `${innings1Score.runs}/${innings1Score.wickets}`,
          team1_overs: currentInnings === 1 ? `${currentOver}.${currentBall}` : `${innings1Score.overs}.0`,
          team2_score: currentInnings === 2 ? `${score.runs}/${score.wickets}` : null,
          team2_overs: currentInnings === 2 ? `${currentOver}.${currentBall}` : null,
          result: result
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
        description: result || "Match completed successfully",
      });
    } catch (error) {
      console.error('Error ending match:', error);
    }
  };

  const processDelivery = (runs, isLegalDelivery = true, isWicket = false, shotType = null) => {
    if (matchEnded || isInningsBreak) return;

    // Add runs to score
    setScore(prev => ({ ...prev, runs: prev.runs + runs }));
    
    // Update batsman stats if legal delivery
    if (isLegalDelivery && currentBatsmen.length > strikerIndex) {
      const updatedBatsmen = [...currentBatsmen];
      updatedBatsmen[strikerIndex] = {
        ...updatedBatsmen[strikerIndex],
        runs: updatedBatsmen[strikerIndex].runs + runs,
        balls: updatedBatsmen[strikerIndex].balls + 1,
        fours: runs === 4 ? (updatedBatsmen[strikerIndex].fours || 0) + 1 : (updatedBatsmen[strikerIndex].fours || 0),
        sixes: runs === 6 ? (updatedBatsmen[strikerIndex].sixes || 0) + 1 : (updatedBatsmen[strikerIndex].sixes || 0),
        lastShot: shotType
      };
      setCurrentBatsmen(updatedBatsmen);
    }

    // Handle wicket
    if (isWicket) {
      setScore(prev => ({ ...prev, wickets: prev.wickets + 1 }));
      if (score.wickets + 1 < 10) {
        setNewBatsmanDialog(true);
      }
    }

    // Handle ball count and over completion for legal deliveries only
    if (isLegalDelivery) {
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
          const totalOvers = selectedMatch?.overs || 20;
          if (newOver >= totalOvers) {
            endInnings();
            return 0;
          }
          
          return 0;
        } else {
          setScore(prevScore => ({ ...prevScore, balls: newBall }));
          
          // Change strike on odd runs for legal deliveries
          if (runs % 2 === 1 && currentBatsmen.length === 2) {
            setStrikerIndex(strikerIndex === 0 ? 1 : 0);
          }
          
          return newBall;
        }
      });
    }

    // Check for target achieved in second innings
    if (currentInnings === 2 && score.runs + runs >= innings1Score.runs + 1) {
      const result = determineWinner();
      setWinner(result);
      endMatch();
      return;
    }

    // Check if wickets complete the innings
    if (score.wickets + (isWicket ? 1 : 0) >= 10) {
      endInnings();
      return;
    }

    toast({
      title: isWicket ? "Wicket!" : `${runs} run${runs > 1 ? 's' : ''} ${isLegalDelivery ? '' : '(Extra)'}`,
      description: `Current score: ${score.runs + runs}/${score.wickets + (isWicket ? 1 : 0)} (${formatOvers(currentOver, currentBall + (isLegalDelivery ? 1 : 0))})`,
    });
  };

  const addRun = (runs) => {
    if (runs > 0) {
      setShotDialog({ open: true, runs });
    } else {
      processDelivery(runs, true, false);
    }
  };

  const handleShotSelection = (shotType) => {
    processDelivery(shotDialog.runs, true, false, shotType);
    setShotDialog({ open: false, runs: 0 });
  };

  const addWicket = () => {
    processDelivery(0, true, true);
  };

  const handleExtras = (type) => {
    setExtrasDialog({ open: true, type, runs: 0 });
  };

  const addExtras = () => {
    const { type, runs } = extrasDialog;
    // Wide and No Ball add 1 extra run plus any additional runs
    processDelivery(runs + 1, false, false);
    setExtrasDialog({ open: false, type: '', runs: 0 });
    
    toast({
      title: `${type} added!`,
      description: `${runs + 1} runs added as extras`,
    });
  };

  const handleNewBatsman = () => {
    const newBatsman = (battingTeam === 1 ? team1Players : team2Players).find(p => p.id === selectedNewBatsman);
    if (!newBatsman) return;

    const updatedBatsmen = [...currentBatsmen];
    updatedBatsmen[strikerIndex] = {
      ...newBatsman,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0
    };
    
    setCurrentBatsmen(updatedBatsmen);
    setNewBatsmanDialog(false);
    setSelectedNewBatsman("");
    
    toast({
      title: "New Batsman!",
      description: `${newBatsman.name} is now batting`,
    });
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
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-center text-green-600">Match Completed!</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          {winner && (
            <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg mb-4">
              <h2 className="text-2xl font-bold text-yellow-800">{winner}</h2>
            </div>
          )}
          
          {/* Cricket Style Match Summary */}
          <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-6 rounded-lg">
            <h3 className="text-xl font-bold mb-4">{selectedMatch.team1?.name || 'Team 1'} vs {selectedMatch.team2?.name || 'Team 2'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/10 p-4 rounded-lg">
                <h4 className="font-bold text-lg mb-2">{selectedMatch.team1?.name || 'Team 1'}</h4>
                <div className="text-2xl font-bold">{innings1Score.runs}/{innings1Score.wickets}</div>
                <div className="text-sm">({innings1Score.overs}.0 overs)</div>
                <div className="text-xs mt-1">Run Rate: {calculateRunRate(innings1Score.runs, innings1Score.overs, 0)}</div>
              </div>
              {currentInnings === 2 && (
                <div className="bg-white/10 p-4 rounded-lg">
                  <h4 className="font-bold text-lg mb-2">{selectedMatch.team2?.name || 'Team 2'}</h4>
                  <div className="text-2xl font-bold">{score.runs}/{score.wickets}</div>
                  <div className="text-sm">({formatOvers(currentOver, currentBall)} overs)</div>
                  <div className="text-xs mt-1">Run Rate: {calculateRunRate(score.runs, currentOver, currentBall)}</div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-2">
            <Button
              onClick={() => setShowAnalytics(!showAnalytics)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4" />
              {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
            </Button>
            <ExportReport 
              matchData={selectedMatch}
              scoreData={score}
              currentBatsmen={currentBatsmen}
              currentBowler={currentBowler}
              innings1Score={innings1Score}
              currentInnings={currentInnings}
              winner={winner}
            />
          </div>
          {showAnalytics && (
            <MatchAnalytics
              matchData={selectedMatch}
              innings1Score={innings1Score}
              innings2Score={score}
              currentBatsmen={currentBatsmen}
              currentBowler={currentBowler}
            />
          )}
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
            <p className="text-xl font-bold">{innings1Score.runs}/{innings1Score.wickets} ({innings1Score.overs}.0 overs)</p>
            <p className="text-sm text-gray-600 mt-2">Target: {innings1Score.runs + 1} runs</p>
          </div>
          <Button 
            onClick={startInnings2}
            className="bg-green-600 hover:bg-green-700 text-white"
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
  const availableBatsmen = currentBattingPlayers.filter(p => 
    !currentBatsmen.some(b => b.id === p.id)
  );

  return (
    <div className="space-y-4 px-2 md:px-4">
      {/* Match Selection */}
      {liveMatches.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Select Live Match</CardTitle>
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

      {/* Mobile View Toggle */}
      <div className="block md:hidden">
        <div className="flex space-x-2 mb-4">
          <Button 
            variant={mobileView === 'scorecard' ? 'default' : 'outline'}
            onClick={() => setMobileView('scorecard')}
            className="flex-1"
          >
            Scorecard
          </Button>
          <Button 
            variant={mobileView === 'scoring' ? 'default' : 'outline'}
            onClick={() => setMobileView('scoring')}
            className="flex-1"
          >
            Scoring
          </Button>
        </div>
      </div>

      {/* Cricket Style Live Score Header */}
      <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div className="text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                {selectedMatch.team1?.name || 'Team 1'} vs {selectedMatch.team2?.name || 'Team 2'}
              </h2>
              <div className="flex flex-wrap justify-center md:justify-start gap-2 text-sm text-white/90 mt-2">
                <span>{selectedMatch.format} Match</span>
                <span>•</span>
                <span>Innings {currentInnings}</span>
                <span>•</span>
                <span>Over {formatOvers(currentOver, currentBall)} of {selectedMatch.overs || 20}</span>
                <span>•</span>
                <span>{selectedMatch.venue}</span>
              </div>
              {currentInnings === 2 && (
                <p className="text-yellow-200 text-sm font-medium mt-1">
                  Target: {innings1Score.runs + 1} runs • Need {innings1Score.runs + 1 - score.runs} runs
                </p>
              )}
            </div>
            <div className="flex items-center justify-center md:justify-end gap-2">
              <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>
              <Button 
                onClick={endMatch}
                variant="outline" 
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white border-red-600"
              >
                <StopCircle className="w-4 h-4 mr-1" />
                End Match
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Main Score Display - Cricket Style */}
          <div className="text-center mb-6">
            <div className="bg-white/10 p-6 rounded-lg mb-4">
              <div className="text-4xl md:text-5xl font-bold mb-2 text-white">
                {score.runs}/{score.wickets}
              </div>
              <div className="text-xl text-white/90">
                ({formatOvers(currentOver, currentBall)} overs)
              </div>
            </div>
            
            {/* Cricket Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="bg-white/10 p-3 rounded-lg">
                <div className="font-semibold text-white">Current RR</div>
                <div className="text-lg text-white">{calculateRunRate(score.runs, currentOver, currentBall)}</div>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <div className="font-semibold text-white">Required RR</div>
                <div className="text-lg text-white">{calculateRequiredRunRate()}</div>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <div className="font-semibold text-white">Partnership</div>
                <div className="text-lg text-white">
                  {currentBatsmen.length === 2 ? 
                    (currentBatsmen[0].runs + currentBatsmen[1].runs) : 
                    (currentBatsmen[0]?.runs || 0)
                  }
                </div>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <div className="font-semibold text-white">Batting</div>
                <div className="text-sm text-white">
                  {battingTeam === 1 ? selectedMatch.team1?.name : selectedMatch.team2?.name}
                </div>
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-2">
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
              innings1Score={innings1Score}
              currentInnings={currentInnings}
              winner={winner}
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

      <div className={`grid grid-cols-1 ${mobileView === 'scorecard' || window.innerWidth >= 1024 ? 'lg:grid-cols-2' : ''} gap-4`}>
        {/* Scoring Controls */}
        {(mobileView === 'scoring' || window.innerWidth >= 768) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5" />
                Quick Scoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3 mb-4">
                {[0, 1, 2, 3, 4, 6].map((runs) => (
                  <Button
                    key={runs}
                    onClick={() => addRun(runs)}
                    className={`h-14 text-xl font-bold text-white ${
                      runs === 4 ? 'bg-blue-600 hover:bg-blue-700' :
                      runs === 6 ? 'bg-orange-600 hover:bg-orange-700' :
                      'bg-gray-700 hover:bg-gray-800'
                    }`}
                    disabled={matchEnded || isInningsBreak}
                  >
                    {runs}
                  </Button>
                ))}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <Button 
                  onClick={addWicket} 
                  variant="destructive" 
                  className="h-12 text-white bg-red-600 hover:bg-red-700 font-semibold"
                  disabled={matchEnded || isInningsBreak}
                >
                  WICKET
                </Button>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    onClick={() => handleExtras('Wide')}
                    variant="outline" 
                    className="h-12 text-sm bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-600 font-semibold"
                    disabled={matchEnded || isInningsBreak}
                  >
                    WIDE
                  </Button>
                  <Button 
                    onClick={() => handleExtras('No Ball')}
                    variant="outline" 
                    className="h-12 text-sm bg-orange-600 hover:bg-orange-700 text-white border-orange-600 font-semibold"
                    disabled={matchEnded || isInningsBreak}
                  >
                    NO BALL
                  </Button>
                </div>
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
        )}

        {/* Current Players - Cricket Style */}
        {(mobileView === 'scorecard' || window.innerWidth >= 768) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5" />
                Current Players
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-3 text-green-700">Batsmen</h4>
                {currentBatsmen.length === 0 ? (
                  <p className="text-gray-500 text-sm">No batsmen selected yet</p>
                ) : (
                  currentBatsmen.map((batsman, index) => (
                    <div key={index} className={`flex justify-between items-center p-4 rounded-lg mb-3 border-2 ${
                      index === strikerIndex ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'
                    }`}>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-lg">
                            {batsman.name} 
                            {index === strikerIndex && <span className="text-green-600">*</span>}
                          </p>
                          {batsman.lastShot && (
                            <Badge variant="outline" className="text-xs">
                              {batsman.lastShot}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                          <span>{batsman.runs || 0}*({batsman.balls || 0})</span>
                          <span>4s: {batsman.fours || 0}</span>
                          <span>6s: {batsman.sixes || 0}</span>
                          <span>SR: {(batsman.balls || 0) > 0 ? (((batsman.runs || 0) / (batsman.balls || 0)) * 100).toFixed(1) : '0.0'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-700">{batsman.runs || 0}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div>
                <h4 className="font-medium mb-3 text-blue-700">Current Bowler</h4>
                {!currentBowler ? (
                  <p className="text-gray-500 text-sm">No bowler selected yet</p>
                ) : (
                  <div className="flex justify-between items-center p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <div className="flex-1">
                      <p className="font-semibold text-lg">{currentBowler.name}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                        <span>{currentBowler.overs || 0} ov</span>
                        <span>{currentBowler.runs || 0} runs</span>
                        <span>{currentBowler.wickets || 0} wkts</span>
                        <span>Econ: {(currentBowler.overs || 0) > 0 ? ((currentBowler.runs || 0) / (currentBowler.overs || 0)).toFixed(1) : '0.0'}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-700">{currentBowler.wickets || 0}/{currentBowler.runs || 0}</div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Over History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
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

      {/* Dialogs */}
      <Dialog open={extrasDialog.open} onOpenChange={(open) => setExtrasDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add {extrasDialog.type}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Additional Runs</label>
              <Input
                type="number"
                min="0"
                max="6"
                value={extrasDialog.runs}
                onChange={(e) => setExtrasDialog(prev => ({ ...prev, runs: parseInt(e.target.value) || 0 }))}
                placeholder="Enter additional runs"
              />
              <p className="text-sm text-gray-500 mt-1">
                Total runs will be {extrasDialog.runs + 1} (1 for {extrasDialog.type.toLowerCase()} + {extrasDialog.runs} additional)
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setExtrasDialog({ open: false, type: '', runs: 0 })}>
                Cancel
              </Button>
              <Button onClick={addExtras} className="bg-green-600 hover:bg-green-700 text-white">
                Add {extrasDialog.type}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={newBatsmanDialog} onOpenChange={setNewBatsmanDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select New Batsman</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Select value={selectedNewBatsman} onValueChange={setSelectedNewBatsman}>
              <SelectTrigger>
                <SelectValue placeholder="Select new batsman" />
              </SelectTrigger>
              <SelectContent>
                {availableBatsmen.map((player) => (
                  <SelectItem key={player.id} value={player.id}>
                    {player.name} ({player.role})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setNewBatsmanDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleNewBatsman} className="bg-green-600 hover:bg-green-700 text-white">
                Confirm
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ShotSelector
        open={shotDialog.open}
        onClose={() => setShotDialog({ open: false, runs: 0 })}
        onShotSelect={handleShotSelection}
        runs={shotDialog.runs}
      />
    </div>
  );
};

export default LiveScoring;
