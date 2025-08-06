import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Trophy, Calendar, MapPin, Clock } from 'lucide-react';
import MatchSelector from './scoring/MatchSelector';
import MatchSetup from './scoring/MatchSetup';
import ScoringControls from './scoring/ScoringControls';
import ScoreDisplay from './scoring/ScoreDisplay';
import PlayerSelection from './scoring/PlayerSelection';
import NewBatsmanSelector from './scoring/NewBatsmanSelector';

const LiveScoring = () => {
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [matchStarted, setMatchStarted] = useState(false);
  const [currentInnings, setCurrentInnings] = useState(1);
  const [currentOver, setCurrentOver] = useState(1);
  const [currentBall, setCurrentBall] = useState(1);
  const [totalScore, setTotalScore] = useState(0);
  const [totalWickets, setTotalWickets] = useState(0);
  const [runRate, setRunRate] = useState(0);
  const [requiredRunRate, setRequiredRunRate] = useState(0);
  const [ballHistory, setBallHistory] = useState([]);
  const [currentBatsmen, setCurrentBatsmen] = useState([
    { id: '', name: '', runs: 0, balls: 0, fours: 0, sixes: 0 },
    { id: '', name: '', runs: 0, balls: 0, fours: 0, sixes: 0 }
  ]);
  const [currentBowler, setCurrentBowler] = useState({ id: '', name: '', overs: 0, runs: 0, wickets: 0 });
  const [strikeBatsmanIndex, setStrikeBatsmanIndex] = useState(0);
  const [showNewBatsmanDialog, setShowNewBatsmanDialog] = useState(false);
  const [wicketInfo, setWicketInfo] = useState(null);
  const [players, setPlayers] = useState([]);
  const [team1Score, setTeam1Score] = useState({ runs: 0, wickets: 0, overs: 0 });
  const [team2Score, setTeam2Score] = useState({ runs: 0, wickets: 0, overs: 0 });
  const [isMatchCompleted, setIsMatchCompleted] = useState(false);
  const [matchResult, setMatchResult] = useState('');

  useEffect(() => {
    if (selectedMatch && matchStarted) {
      fetchPlayers();
    }
  }, [selectedMatch, matchStarted]);

  useEffect(() => {
    if (selectedMatch && selectedMatch.overs) {
      calculateRunRates();
    }
  }, [totalScore, currentOver, currentBall, selectedMatch, currentInnings]);

  const fetchPlayers = async () => {
    if (!selectedMatch) return;

    try {
      const { data: team1Players } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', selectedMatch.team1_id);

      const { data: team2Players } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', selectedMatch.team2_id);

      setPlayers([...(team1Players || []), ...(team2Players || [])]);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const calculateRunRates = () => {
    const totalBalls = (currentOver - 1) * 6 + (currentBall - 1);
    const currentRunRate = totalBalls > 0 ? (totalScore / totalBalls) * 6 : 0;
    setRunRate(currentRunRate);

    if (currentInnings === 2 && selectedMatch?.overs) {
      const remainingBalls = (selectedMatch.overs * 6) - totalBalls;
      const target = team1Score.runs + 1;
      const required = target - totalScore;
      const requiredRate = remainingBalls > 0 ? (required / remainingBalls) * 6 : 0;
      setRequiredRunRate(requiredRate);
    }
  };

  const checkMatchCompletion = () => {
    const maxOvers = selectedMatch?.overs || 20;
    const maxWickets = 10;
    
    // Check if innings completed
    const inningsComplete = totalWickets >= maxWickets || currentOver > maxOvers;
    
    if (inningsComplete) {
      if (currentInnings === 1) {
        // First innings complete, start second innings
        setTeam1Score({ runs: totalScore, wickets: totalWickets, overs: currentOver - 1 + (currentBall - 1) / 6 });
        startSecondInnings();
      } else {
        // Second innings complete, determine winner
        completeMatch();
      }
    }
  };

  const startSecondInnings = () => {
    setCurrentInnings(2);
    setCurrentOver(1);
    setCurrentBall(1);
    setTotalScore(0);
    setTotalWickets(0);
    setCurrentBatsmen([
      { id: '', name: '', runs: 0, balls: 0, fours: 0, sixes: 0 },
      { id: '', name: '', runs: 0, balls: 0, fours: 0, sixes: 0 }
    ]);
    setCurrentBowler({ id: '', name: '', overs: 0, runs: 0, wickets: 0 });
    setStrikeBatsmanIndex(0);
    setBallHistory([]);
    
    toast.success('First innings completed! Starting second innings...');
  };

  const completeMatch = () => {
    setIsMatchCompleted(true);
    const finalTeam2Score = { runs: totalScore, wickets: totalWickets, overs: currentOver - 1 + (currentBall - 1) / 6 };
    setTeam2Score(finalTeam2Score);
    
    // Determine match result
    let result = '';
    if (totalScore > team1Score.runs) {
      const wicketsLeft = 10 - totalWickets;
      result = `${selectedMatch.team2_name} won by ${wicketsLeft} wickets`;
    } else if (team1Score.runs > totalScore) {
      const runsMargin = team1Score.runs - totalScore;
      result = `${selectedMatch.team1_name} won by ${runsMargin} runs`;
    } else {
      result = 'Match tied';
    }
    
    setMatchResult(result);
    updateMatchResult(result, finalTeam2Score);
    toast.success(`Match completed! ${result}`);
  };

  const updateMatchResult = async (result, finalTeam2Score) => {
    try {
      await supabase
        .from('matches')
        .update({
          result: result,
          status: 'completed',
          team1_score: `${team1Score.runs}/${team1Score.wickets}`,
          team1_overs: team1Score.overs.toFixed(1),
          team2_score: `${finalTeam2Score.runs}/${finalTeam2Score.wickets}`,
          team2_overs: finalTeam2Score.overs.toFixed(1)
        })
        .eq('id', selectedMatch.id);
    } catch (error) {
      console.error('Error updating match result:', error);
    }
  };

  const handleScore = async (runs, extras = 0, isWicket = false, extraType = null, wicketType = null, fielder = null) => {
    if (isMatchCompleted) {
      toast.error('Match is already completed!');
      return;
    }

    try {
      const ballData = {
        match_id: selectedMatch.id,
        innings: currentInnings,
        over_number: currentOver,
        ball_number: currentBall,
        batsman_id: currentBatsmen[strikeBatsmanIndex].id,
        bowler_id: currentBowler.id,
        runs: runs,
        extras: extras,
        is_wicket: isWicket,
        extra_type: extraType,
        wicket_type: wicketType,
        fielder_id: fielder
      };

      const { error } = await supabase.from('ball_by_ball').insert([ballData]);
      if (error) throw error;

      // Update scores
      setTotalScore(prev => prev + runs + extras);
      
      if (isWicket) {
        setTotalWickets(prev => prev + 1);
        setWicketInfo({ type: wicketType, fielder });
        setShowNewBatsmanDialog(true);
      }

      // Update batsman stats
      if (!isWicket || wicketType !== 'run out') {
        const newBatsmen = [...currentBatsmen];
        newBatsmen[strikeBatsmanIndex].runs += runs;
        newBatsmen[strikeBatsmanIndex].balls += 1;
        
        if (runs === 4) newBatsmen[strikeBatsmanIndex].fours += 1;
        if (runs === 6) newBatsmen[strikeBatsmanIndex].sixes += 1;
        
        setCurrentBatsmen(newBatsmen);
      }

      // Update bowler stats
      const newBowler = { ...currentBowler };
      newBowler.runs += runs + extras;
      if (isWicket) newBowler.wickets += 1;
      setCurrentBowler(newBowler);

      // Update ball history
      setBallHistory(prev => [...prev, { runs, extras, isWicket, wicketType }]);

      // Handle ball progression
      if (!extraType || extraType === 'bye' || extraType === 'leg-bye') {
        if (currentBall === 6) {
          setCurrentOver(prev => prev + 1);
          setCurrentBall(1);
          // Switch strike for new over
          setStrikeBatsmanIndex(prev => prev === 0 ? 1 : 0);
        } else {
          setCurrentBall(prev => prev + 1);
        }
      }

      // Switch strike for odd runs
      if (runs % 2 === 1) {
        setStrikeBatsmanIndex(prev => prev === 0 ? 1 : 0);
      }

      // Check for match completion
      setTimeout(checkMatchCompletion, 100);

    } catch (error) {
      console.error('Error saving ball data:', error);
      toast.error('Failed to save ball data');
    }
  };

  const handleUpdateBatsman = (index, field, value) => {
    const player = players.find(p => p.id === value);
    if (player) {
      const newBatsmen = [...currentBatsmen];
      newBatsmen[index] = {
        ...newBatsmen[index],
        id: player.id,
        name: player.name
      };
      setCurrentBatsmen(newBatsmen);
    }
  };

  const handleUpdateBowler = (field, value) => {
    if (field === 'id') {
      const player = players.find(p => p.id === value);
      if (player) {
        setCurrentBowler({
          ...currentBowler,
          id: player.id,
          name: player.name
        });
      }
    }
  };

  const handleNewBatsman = (playerId) => {
    const player = players.find(p => p.id === playerId);
    if (player) {
      const newBatsmen = [...currentBatsmen];
      newBatsmen[strikeBatsmanIndex] = {
        id: player.id,
        name: player.name,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0
      };
      setCurrentBatsmen(newBatsmen);
      setShowNewBatsmanDialog(false);
      setWicketInfo(null);
    }
  };

  if (!selectedMatch) {
    return <MatchSelector onMatchSelect={setSelectedMatch} />;
  }

  if (!matchStarted) {
    return (
      <MatchSetup 
        matchData={selectedMatch} 
        onMatchSetupComplete={() => setMatchStarted(true)}
        onBack={() => setSelectedMatch(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Live Cricket Scoring
            </CardTitle>
            <Badge variant={isMatchCompleted ? "destructive" : "default"}>
              {isMatchCompleted ? "Completed" : "Live"}
            </Badge>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{selectedMatch.match_date}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{selectedMatch.match_time}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{selectedMatch.venue}</span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Match Result */}
      {isMatchCompleted && matchResult && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-green-800">{matchResult}</h3>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score Display */}
      <ScoreDisplay
        currentInnings={currentInnings}
        team1Name={selectedMatch.team1_name}
        team2Name={selectedMatch.team2_name}
        team1Score={team1Score}
        team2Score={{ runs: totalScore, wickets: totalWickets, overs: currentOver - 1 + (currentBall - 1) / 6 }}
        currentOver={currentOver}
        currentBall={currentBall}
        totalScore={totalScore}
        totalWickets={totalWickets}
        runRate={runRate}
        requiredRunRate={requiredRunRate}
        target={currentInnings === 2 ? team1Score.runs + 1 : null}
      />

      {!isMatchCompleted && (
        <>
          {/* Player Selection */}
          <PlayerSelection
            currentBatsmen={currentBatsmen}
            currentBowler={currentBowler}
            players={players}
            strikeBatsmanIndex={strikeBatsmanIndex}
            onUpdateBatsman={handleUpdateBatsman}
            onUpdateBowler={handleUpdateBowler}
          />

          {/* Scoring Controls */}
          <ScoringControls onRecordBall={handleScore} />
        </>
      )}

      {/* New Batsman Dialog */}
      <Dialog open={showNewBatsmanDialog} onOpenChange={setShowNewBatsmanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select New Batsman</DialogTitle>
          </DialogHeader>
          <NewBatsmanSelector
            players={players}
            currentBatsmen={currentBatsmen}
            onSelect={handleNewBatsman}
            wicketInfo={wicketInfo}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveScoring;
