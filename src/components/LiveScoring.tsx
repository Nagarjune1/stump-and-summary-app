import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Timer, Target, Users, Activity, StopCircle, Plus, TrendingUp, Trophy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import ScoreCorrection from "./ScoreCorrection";
import PlayerManagement from "./PlayerManagement";
import ExportReport from "./ExportReport";
import PlayerSelector from "./PlayerSelector";
import ShotSelector from "./ShotSelector";
import MatchAnalytics from "./MatchAnalytics";
import ManOfMatchSelector from "./ManOfMatchSelector";
import BowlerSelector from "./BowlerSelector";
import EnhancedCricketScoreboard from "./EnhancedCricketScoreboard";
import TossSelector from "./TossSelector";
import CompleteMatchScorecard from "./CompleteMatchScorecard";
import PostMatchPerformers from "./PostMatchPerformers";
import WicketSelector from "./WicketSelector";
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
  const [momDialog, setMomDialog] = useState(false);
  const [bowlerDialog, setBowlerDialog] = useState(false);
  const [recentBalls, setRecentBalls] = useState([]);
  const [manOfMatch, setManOfMatch] = useState(null);
  const [manOfSeries, setManOfSeries] = useState(null);
  const [bowlers, setBowlers] = useState([]);
  const [wickets, setWickets] = useState([]);
  const [oversData, setOversData] = useState([]);
  const [tossCompleted, setTossCompleted] = useState(false);
  const [tossDialog, setTossDialog] = useState(false);
  const [tossResult, setTossResult] = useState({ winner: '', decision: '', tossInfo: '' });
  const [wicketDialog, setWicketDialog] = useState(false);

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
    setRecentBalls([]);
    setManOfMatch(null);
    setManOfSeries(null);
    setTossCompleted(false);
    setTossResult({ winner: '', decision: '', tossInfo: '' });
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
    setRecentBalls([]);
    
    toast({
      title: "Innings 2 Started!",
      description: `Target: ${innings1Score.runs + 1} runs`,
    });
  };

  const endMatch = async () => {
    try {
      const result = determineWinner();
      
      // Save player stats first
      await savePlayerStats();
      
      const { error } = await supabase
        .from('matches')
        .update({ 
          status: 'completed',
          team1_score: battingTeam === 1 ? `${score.runs}/${score.wickets}` : `${innings1Score.runs}/${innings1Score.wickets}`,
          team1_overs: battingTeam === 1 ? `${currentOver}.${currentBall}` : `${innings1Score.overs}.0`,
          team2_score: battingTeam === 2 ? `${score.runs}/${score.wickets}` : currentInnings === 2 ? `${score.runs}/${score.wickets}` : null,
          team2_overs: battingTeam === 2 ? `${currentOver}.${currentBall}` : currentInnings === 2 ? `${currentOver}.${currentBall}` : null,
          result: result,
          toss_winner: tossResult.winner,
          toss_decision: tossResult.decision
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
      setMomDialog(true);
      
      toast({
        title: "Match Ended!",
        description: result || "Match completed successfully",
      });
    } catch (error) {
      console.error('Error ending match:', error);
    }
  };

  const savePlayerStats = async () => {
    if (!selectedMatch) return;

    try {
      // Save batting stats
      for (const batsman of currentBatsmen) {
        if (batsman.runs !== undefined || batsman.balls !== undefined) {
          await supabase.from('match_stats').upsert({
            match_id: selectedMatch.id,
            player_id: batsman.id,
            innings: currentInnings,
            runs_scored: batsman.runs || 0,
            balls_faced: batsman.balls || 0,
            fours: batsman.fours || 0,
            sixes: batsman.sixes || 0,
            strike_rate: (batsman.balls || 0) > 0 ? ((batsman.runs || 0) / (batsman.balls || 0)) * 100 : 0,
            dismissal_type: batsman.dismissalType || null
          });

          // Update player career stats
          const { data: playerData } = await supabase
            .from('players')
            .select('*')
            .eq('id', batsman.id)
            .single();

          if (playerData) {
            const newRuns = (playerData.runs || 0) + (batsman.runs || 0);
            const newMatches = (playerData.matches || 0) + (currentInnings === 1 ? 1 : 0);
            const newAverage = newMatches > 0 ? newRuns / newMatches : 0;

            await supabase
              .from('players')
              .update({
                runs: newRuns,
                matches: newMatches,
                average: newAverage,
                strike_rate: (batsman.balls || 0) > 0 ? ((batsman.runs || 0) / (batsman.balls || 0)) * 100 : (playerData.strike_rate || 0),
                best_score: Math.max(batsman.runs || 0, parseInt(playerData.best_score || '0')) + (batsman.isOut ? '' : '*')
              })
              .eq('id', batsman.id);
          }
        }
      }

      // Save bowling stats
      for (const bowler of bowlers) {
        if (bowler.overs !== undefined || bowler.runs !== undefined) {
          await supabase.from('match_stats').upsert({
            match_id: selectedMatch.id,
            player_id: bowler.id,
            innings: currentInnings,
            overs_bowled: bowler.overs || 0,
            runs_conceded: bowler.runs || 0,
            wickets_taken: bowler.wickets || 0,
            economy_rate: (bowler.overs || 0) > 0 ? (bowler.runs || 0) / (bowler.overs || 0) : 0
          });

          // Update player career stats
          const { data: playerData } = await supabase
            .from('players')
            .select('*')
            .eq('id', bowler.id)
            .single();

          if (playerData) {
            const newWickets = (playerData.wickets || 0) + (bowler.wickets || 0);
            const newMatches = (playerData.matches || 0) + (currentInnings === 1 ? 1 : 0);

            await supabase
              .from('players')
              .update({
                wickets: newWickets,
                matches: newMatches,
                economy: (bowler.overs || 0) > 0 ? (bowler.runs || 0) / (bowler.overs || 0) : (playerData.economy || 0),
                best_bowling: bowler.wickets > parseInt((playerData.best_bowling || '0/0').split('/')[0]) ? 
                  `${bowler.wickets}/${bowler.runs}` : playerData.best_bowling
              })
              .eq('id', bowler.id);
          }
        }
      }
    } catch (error) {
      console.error('Error saving player stats:', error);
    }
  };

  const processDelivery = (runs, isLegalDelivery = true, isWicket = false, shotType = null, wicketDetails = null) => {
    if (matchEnded || isInningsBreak) return;

    // Safety check for current batsmen
    if (currentBatsmen.length === 0 || !currentBatsmen[strikerIndex]) {
      toast({
        title: "Error",
        description: "Please select batsmen first",
        variant: "destructive"
      });
      return;
    }

    // Add to recent balls
    const ballResult = isWicket ? 'W' : runs.toString();
    setRecentBalls(prev => [...prev, ballResult]);

    // Add runs to score
    setScore(prev => ({ ...prev, runs: prev.runs + runs }));
    
    // Update batsman stats if legal delivery
    if (isLegalDelivery && currentBatsmen[strikerIndex]) {
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

    // Update bowler stats if legal delivery
    if (isLegalDelivery && currentBowler) {
      setCurrentBowler(prev => ({
        ...prev,
        runs: (prev.runs || 0) + runs,
        wickets: isWicket ? (prev.wickets || 0) + 1 : (prev.wickets || 0)
      }));
    }

    // Handle wicket
    if (isWicket) {
      setScore(prev => ({ ...prev, wickets: prev.wickets + 1 }));
      if (score.wickets + 1 < 10) {
        setNewBatsmanDialog(true);
      }
      // Add wicket details
      setWickets(prev => [...prev, {
        player: currentBatsmen[strikerIndex]?.name || 'Unknown',
        runs: score.runs,
        wicketNumber: score.wickets + 1,
        overs: formatOvers(currentOver, currentBall),
        dismissal: wicketDetails || 'bowled'
      }]);
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
          
          // Update bowler overs
          if (currentBowler) {
            setCurrentBowler(prevBowler => ({
              ...prevBowler,
              overs: (prevBowler.overs || 0) + 1
            }));
          }
          
          // Change strike at end of over
          if (currentBatsmen.length === 2) {
            setStrikerIndex(strikerIndex === 0 ? 1 : 0);
          }
          
          // Show bowler selection dialog for next over
          const totalOvers = selectedMatch?.overs || 20;
          if (newOver < totalOvers && score.wickets + (isWicket ? 1 : 0) < 10) {
            setBowlerDialog(true);
          }
          
          // Check if innings is complete
          if (newOver >= totalOvers) {
            endInnings();
            return 0;
          }
          
          // Update overs data
          setOversData(prev => [...prev, {
            over: newOver,
            runs: runs,
            runRate: calculateRunRate(score.runs, newOver, 0)
          }]);
          
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
    // Safety check for current batsmen
    if (currentBatsmen.length === 0 || !currentBatsmen[strikerIndex]) {
      toast({
        title: "Error",
        description: "Please select batsmen first",
        variant: "destructive"
      });
      return;
    }
    setWicketDialog(true);
  };

  const handleWicketSelect = (wicketDetails) => {
    processDelivery(0, true, true, null, wicketDetails);
    setWicketDialog(false);
  };

  const handleExtras = (type) => {
    setExtrasDialog({ open: true, type, runs: 0 });
  };

  const addExtras = () => {
    const { type, runs } = extrasDialog;
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

  const handleBatsmenSelect = (batsmen) => {
    setCurrentBatsmen(batsmen);
    setStrikerIndex(0);
  };

  const handleBowlerSelect = (bowler) => {
    setCurrentBowler(bowler);
    setBowlerDialog(false);
    // Update bowlers array
    setBowlers(prev => {
      const bowlerExists = prev.some(b => b.id === bowler.id);
      if (bowlerExists) {
        return prev.map(b => (b.id === bowler.id ? bowler : b));
      } else {
        return [...prev, bowler];
      }
    });
  };

  const handleMomSelected = (mom, mos) => {
    setManOfMatch(mom);
    setManOfSeries(mos);
    setMomDialog(false);
  };

  const handleTossComplete = (tossWinner, decision, battingFirst) => {
    const tossInfo = `${tossWinner} won the toss and elected to ${decision} first`;
    setTossResult({ winner: tossWinner, decision, tossInfo });
    setBattingTeam(battingFirst);
    setTossCompleted(true);
    
    console.log('Toss completed:', { tossWinner, decision, battingFirst, tossInfo });
    
    toast({
      title: "Toss Completed!",
      description: tossInfo,
    });
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
    const allPlayers = [...team1Players, ...team2Players].map(player => {
      // Find player stats from current match
      const battingStats = currentBatsmen.find(b => b.id === player.id) || {};
      const bowlingStats = bowlers.find(b => b.id === player.id) || {};
      
      return {
        ...player,
        ...battingStats,
        ...bowlingStats
      };
    });

    return (
      <div className="space-y-6">
        <CompleteMatchScorecard
          matchData={selectedMatch}
          innings1Data={innings1Score}
          innings2Data={currentInnings === 2 ? score : null}
          team1Players={battingTeam === 1 ? allPlayers.filter(p => team1Players.some(t1 => t1.id === p.id)) : allPlayers.filter(p => team2Players.some(t2 => t2.id === p.id))}
          team2Players={battingTeam === 1 ? allPlayers.filter(p => team2Players.some(t2 => t2.id === p.id)) : allPlayers.filter(p => team1Players.some(t1 => t1.id === p.id))}
          result={winner}
          tossInfo={tossResult.tossInfo}
        />
        
        <PostMatchPerformers
          allPlayers={allPlayers}
          matchData={selectedMatch}
          manOfMatch={manOfMatch}
          bestBowler={null}
        />
        
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
            manOfMatch={manOfMatch}
            manOfSeries={manOfSeries}
            recentBalls={recentBalls}
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
      </div>
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

  // Show toss dialog only once when match is ready but toss not completed
  if (!tossCompleted && selectedMatch && team1Players.length > 0 && team2Players.length > 0 && !matchEnded) {
    return (
      <div className="space-y-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-center">Ready to Start Match</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-bold mb-2">Match Setup Complete</h3>
              <p className="text-sm text-gray-600">
                {selectedMatch.team1?.name} vs {selectedMatch.team2?.name}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                Teams and players are ready. Complete the toss to begin.
              </p>
            </div>
            <Button 
              onClick={() => setTossDialog(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
              size="lg"
            >
              Complete Toss & Start Match
            </Button>
          </CardContent>
        </Card>

        <TossSelector
          isOpen={tossDialog}
          onClose={() => setTossDialog(false)}
          team1Name={selectedMatch.team1?.name}
          team2Name={selectedMatch.team2?.name}
          onTossComplete={handleTossComplete}
        />
      </div>
    );
  }

  const currentBattingPlayers = battingTeam === 1 ? team1Players : team2Players;
  const currentBowlingPlayers = battingTeam === 1 ? team2Players : team1Players;
  const availableBatsmen = currentBattingPlayers.filter(p => 
    !currentBatsmen.some(b => b.id === p.id)
  );

  return (
    <div className="space-y-4 px-2 md:px-4">
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

      <PlayerSelector
        battingPlayers={currentBattingPlayers}
        bowlingPlayers={currentBowlingPlayers}
        onBatsmenSelect={handleBatsmenSelect}
        onBowlerSelect={handleBowlerSelect}
        currentBatsmen={currentBatsmen}
        currentBowler={currentBowler}
      />

      <EnhancedCricketScoreboard
        matchData={selectedMatch}
        score={score}
        currentBatsmen={currentBatsmen}
        currentBowler={currentBowler}
        innings1Score={innings1Score}
        currentInnings={currentInnings}
        currentOver={currentOver}
        currentBall={currentBall}
        battingTeam={battingTeam}
        target={innings1Score.runs + 1}
        requiredRunRate={calculateRequiredRunRate()}
        currentRunRate={calculateRunRate(score.runs, currentOver, currentBall)}
        recentBalls={recentBalls}
        bowlers={bowlers}
        wickets={wickets}
        oversData={oversData}
      />

      {/* Quick Scoring Panel */}
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
              manOfMatch={manOfMatch}
              manOfSeries={manOfSeries}
              recentBalls={recentBalls}
            />
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
        </CardContent>
      </Card>

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

      <WicketSelector
        open={wicketDialog}
        onClose={() => setWicketDialog(false)}
        onWicketSelect={handleWicketSelect}
        fieldingPlayers={currentBowlingPlayers}
        currentBowler={currentBowler}
        currentBatsman={currentBatsmen[strikerIndex]}
      />

      <ManOfMatchSelector
        open={momDialog}
        onClose={() => setMomDialog(false)}
        matchData={selectedMatch}
        team1Players={team1Players}
        team2Players={team2Players}
        onMomSelected={handleMomSelected}
      />

      <BowlerSelector
        open={bowlerDialog}
        onClose={() => setBowlerDialog(false)}
        bowlingPlayers={currentBowlingPlayers}
        onBowlerSelect={handleBowlerSelect}
        currentOver={currentOver}
      />
    </div>
  );
};

export default LiveScoring;
