import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RotateCcw, Trophy, Users, Clock, Target } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TossSelector from "./TossSelector";
import PlayerSelector from "./PlayerSelector";
import WicketSelector from "./WicketSelector";
import BowlerSelector from "./BowlerSelector";
import ExportReport from "./ExportReport";
import MatchAnalytics from "./MatchAnalytics";
import PostMatchPerformers from "./PostMatchPerformers";
import EnhancedCricketScoreboard from "./EnhancedCricketScoreboard";

const LiveScoring = ({ currentMatch = null }) => {
  const [match, setMatch] = useState(currentMatch);
  const [scoreData, setScoreData] = useState({
    runs: 0,
    wickets: 0,
    overs: 0,
    balls: 0,
    extras: 0
  });

  const [innings1Score, setInnings1Score] = useState({
    runs: 0,
    wickets: 0,
    overs: 0
  });

  const [currentInnings, setCurrentInnings] = useState(1);
  const [isMatchActive, setIsMatchActive] = useState(false);
  const [matchEnded, setMatchEnded] = useState(false);
  const [winner, setWinner] = useState(null);
  const [currentBatsmen, setCurrentBatsmen] = useState([]);
  const [currentBowler, setCurrentBowler] = useState(null);
  const [recentBalls, setRecentBalls] = useState([]);
  const [showToss, setShowToss] = useState(false);
  const [tossCompleted, setTossCompleted] = useState(false);
  const [playersSelected, setPlayersSelected] = useState(false);
  const [matchInitialized, setMatchInitialized] = useState(false);
  const [allPlayers, setAllPlayers] = useState([]);
  const [team1Players, setTeam1Players] = useState([]);
  const [team2Players, setTeam2Players] = useState([]);
  const [showWicketSelector, setShowWicketSelector] = useState(false);
  const [showBowlerSelector, setShowBowlerSelector] = useState(false);
  const [battingTeam, setBattingTeam] = useState(1);
  const [wicketBatsman, setWicketBatsman] = useState(null);
  const [fallOfWickets, setFallOfWickets] = useState([]);
  const [oversData, setOversData] = useState([]);

  useEffect(() => {
    if (currentMatch && !matchInitialized) {
      console.log('Initializing match:', currentMatch);
      setMatch(currentMatch);
      checkMatchStatus(currentMatch);
      setMatchInitialized(true);
    }
  }, [currentMatch, matchInitialized]);

  const checkMatchStatus = async (matchData) => {
    if (!matchData) return;

    try {
      console.log('Checking match status for:', matchData.id);
      
      if (matchData.toss_winner && matchData.toss_decision) {
        console.log('Toss already completed');
        setTossCompleted(true);
        setShowToss(false);
        
        // Set batting team based on toss decision
        if (matchData.toss_decision === 'bat') {
          setBattingTeam(matchData.toss_winner === matchData.team1?.name ? 1 : 2);
        } else {
          setBattingTeam(matchData.toss_winner === matchData.team1?.name ? 2 : 1);
        }
      } else {
        console.log('Toss not completed, showing toss dialog');
        setShowToss(true);
        setTossCompleted(false);
      }

      if (matchData.status === 'completed') {
        setMatchEnded(true);
        setIsMatchActive(false);
        setWinner(matchData.result);
      } else if (matchData.status === 'live') {
        setIsMatchActive(true);
        setMatchEnded(false);
      }

      await loadMatchData(matchData.id);
      await loadAllPlayers(matchData);
    } catch (error) {
      console.error('Error checking match status:', error);
    }
  };

  const loadAllPlayers = async (matchData) => {
    try {
      const { data: team1PlayersData } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', matchData.team1_id);

      const { data: team2PlayersData } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', matchData.team2_id);

      setTeam1Players(team1PlayersData || []);
      setTeam2Players(team2PlayersData || []);
      setAllPlayers([...(team1PlayersData || []), ...(team2PlayersData || [])]);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const loadMatchData = async (matchId) => {
    try {
      const { data: ballData, error: ballError } = await supabase
        .from('ball_by_ball')
        .select('*')
        .eq('match_id', matchId)
        .order('over_number', { ascending: true })
        .order('ball_number', { ascending: true });

      if (ballError) throw ballError;

      if (ballData && ballData.length > 0) {
        const innings1Balls = ballData.filter(ball => ball.innings === 1);
        const innings2Balls = ballData.filter(ball => ball.innings === 2);

        const inn1Runs = innings1Balls.reduce((total, ball) => total + ball.runs + ball.extras, 0);
        const inn1Wickets = innings1Balls.filter(ball => ball.is_wicket).length;
        const inn1Overs = Math.floor(Math.max(...innings1Balls.map(ball => ball.over_number), 0));

        setInnings1Score({
          runs: inn1Runs,
          wickets: inn1Wickets,
          overs: inn1Overs
        });

        if (innings2Balls.length > 0) {
          setCurrentInnings(2);
          const inn2Runs = innings2Balls.reduce((total, ball) => total + ball.runs + ball.extras, 0);
          const inn2Wickets = innings2Balls.filter(ball => ball.is_wicket).length;
          const inn2Overs = Math.floor(Math.max(...innings2Balls.map(ball => ball.over_number), 0));
          const inn2Balls_count = innings2Balls.length % 6;

          setScoreData({
            runs: inn2Runs,
            wickets: inn2Wickets,
            overs: inn2Overs,
            balls: inn2Balls_count,
            extras: innings2Balls.reduce((total, ball) => total + ball.extras, 0)
          });
        }

        setRecentBalls(ballData.slice(-12));
      }
    } catch (error) {
      console.error('Error loading match data:', error);
    }
  };

  const handleTossComplete = async (tossWinner, tossDecision) => {
    try {
      console.log('Completing toss:', { tossWinner, tossDecision });
      
      if (!match?.id) {
        throw new Error('No match selected');
      }

      const { error } = await supabase
        .from('matches')
        .update({
          toss_winner: tossWinner,
          toss_decision: tossDecision,
          status: 'live'
        })
        .eq('id', match.id);

      if (error) throw error;

      const updatedMatch = {
        ...match,
        toss_winner: tossWinner,
        toss_decision: tossDecision,
        status: 'live'
      };
      
      setMatch(updatedMatch);
      setTossCompleted(true);
      setShowToss(false);
      setIsMatchActive(true);

      // Set batting team based on toss decision
      if (tossDecision === 'bat') {
        setBattingTeam(tossWinner === match.team1?.name ? 1 : 2);
      } else {
        setBattingTeam(tossWinner === match.team1?.name ? 2 : 1);
      }

      toast({
        title: "Toss Completed!",
        description: `${tossWinner} won the toss and chose to ${tossDecision}`,
      });
    } catch (error) {
      console.error('Error completing toss:', error);
      toast({
        title: "Error",
        description: "Failed to complete toss",
        variant: "destructive"
      });
    }
  };

  const handlePlayersSelected = (batsmen, bowler) => {
    console.log('Players selected:', { batsmen, bowler });
    setCurrentBatsmen(batsmen.map(b => ({ ...b, runs: 0, balls: 0, fours: 0, sixes: 0, isOut: false })));
    setCurrentBowler({ ...bowler, overs: 0, runs: 0, wickets: 0, maidens: 0 });
    setPlayersSelected(true);
    
    toast({
      title: "Players Selected!",
      description: "Match is ready to begin",
    });
  };

  const updateBatsmanStats = (runs) => {
    setCurrentBatsmen(prev => prev.map((batsman, index) => {
      if (index === 0) { // Strike batsman
        return {
          ...batsman,
          runs: (batsman.runs || 0) + runs,
          balls: (batsman.balls || 0) + 1,
          fours: runs === 4 ? (batsman.fours || 0) + 1 : (batsman.fours || 0),
          sixes: runs === 6 ? (batsman.sixes || 0) + 1 : (batsman.sixes || 0)
        };
      }
      return batsman;
    }));

    // Switch strike for odd runs
    if (runs % 2 === 1) {
      setCurrentBatsmen(prev => [prev[1], prev[0]]);
    }
  };

  const updateBowlerStats = (runs, isWicket = false) => {
    setCurrentBowler(prev => {
      if (!prev) return prev;
      
      return {
        ...prev,
        runs: (prev.runs || 0) + runs,
        wickets: isWicket ? (prev.wickets || 0) + 1 : (prev.wickets || 0),
        overs: Math.floor(((prev.balls || 0) + 1) / 6) + (((prev.balls || 0) + 1) % 6) / 10,
        balls: ((prev.balls || 0) + 1)
      };
    });
  };

  const addRuns = async (runs) => {
    if (!isMatchActive || matchEnded) return;

    try {
      const newBalls = (scoreData.balls + 1) % 6;
      const newOvers = newBalls === 0 ? scoreData.overs + 1 : scoreData.overs;
      const newRuns = scoreData.runs + runs;

      // Update batsman and bowler stats
      updateBatsmanStats(runs);
      updateBowlerStats(runs);

      // Record ball by ball
      await recordBall({
        runs,
        extras: 0,
        is_wicket: false,
        over_number: newOvers,
        ball_number: newBalls === 0 ? 6 : newBalls,
        innings: currentInnings
      });

      setScoreData(prev => ({
        ...prev,
        runs: newRuns,
        balls: newBalls,
        overs: newOvers
      }));

      // Check for over completion
      if (newBalls === 0) {
        toast({
          title: "Over Completed!",
          description: `${newOvers} overs completed`,
        });
        
        // Switch strike at end of over
        setCurrentBatsmen(prev => [prev[1], prev[0]]);
        
        // Show bowler selector for next over
        setTimeout(() => {
          setShowBowlerSelector(true);
        }, 1000);
      }

      // Check if innings should end
      await checkInningsEnd(newOvers, scoreData.wickets, newRuns);

    } catch (error) {
      console.error('Error adding runs:', error);
      toast({
        title: "Error",
        description: "Failed to add runs",
        variant: "destructive"
      });
    }
  };

  const handleWicket = () => {
    if (!isMatchActive || matchEnded) return;
    
    // Find the current strike batsman
    const strikeBatsman = currentBatsmen[0];
    setWicketBatsman(strikeBatsman);
    setShowWicketSelector(true);
  };

  const handleWicketSelect = async (dismissalText) => {
    try {
      const newWickets = scoreData.wickets + 1;
      const newBalls = (scoreData.balls + 1) % 6;
      const newOvers = newBalls === 0 ? scoreData.overs + 1 : scoreData.overs;

      // Update batsman stats to mark as out
      setCurrentBatsmen(prev => prev.map((batsman, index) => {
        if (index === 0) { // Strike batsman who got out
          return {
            ...batsman,
            isOut: true,
            dismissalType: dismissalText,
            balls: (batsman.balls || 0) + 1
          };
        }
        return batsman;
      }));

      // Update bowler stats
      updateBowlerStats(0, true);

      // Add to fall of wickets
      setFallOfWickets(prev => [...prev, {
        runs: scoreData.runs,
        wicketNumber: newWickets,
        player: wicketBatsman?.name || 'Unknown',
        overs: `${scoreData.overs}.${scoreData.balls}`,
        dismissal: dismissalText
      }]);

      // Record ball by ball
      await recordBall({
        runs: 0,
        extras: 0,
        is_wicket: true,
        wicket_type: dismissalText,
        over_number: newOvers,
        ball_number: newBalls === 0 ? 6 : newBalls,
        innings: currentInnings
      });

      setScoreData(prev => ({
        ...prev,
        wickets: newWickets,
        balls: newBalls,
        overs: newOvers
      }));

      // Check for over completion
      if (newBalls === 0) {
        toast({
          title: "Over Completed!",
          description: `${newOvers} overs completed`,
        });
        
        setTimeout(() => {
          setShowBowlerSelector(true);
        }, 1000);
      }

      // Check if innings should end
      await checkInningsEnd(newOvers, newWickets, scoreData.runs);

      setShowWicketSelector(false);
      setWicketBatsman(null);

    } catch (error) {
      console.error('Error adding wicket:', error);
      toast({
        title: "Error",
        description: "Failed to add wicket",
        variant: "destructive"
      });
    }
  };

  const handleBowlerSelected = (bowler) => {
    setCurrentBowler({ ...bowler, overs: 0, runs: 0, wickets: 0, maidens: 0, balls: 0 });
    setShowBowlerSelector(false);
    
    toast({
      title: "Bowler Selected",
      description: `${bowler.name} will bowl the next over`,
    });
  };

  const recordBall = async (ballData) => {
    if (!match?.id) return;

    try {
      const { error } = await supabase
        .from('ball_by_ball')
        .insert({
          match_id: match.id,
          innings: ballData.innings,
          over_number: ballData.over_number,
          ball_number: ballData.ball_number,
          runs: ballData.runs || 0,
          extras: ballData.extras || 0,
          is_wicket: ballData.is_wicket || false,
          wicket_type: ballData.wicket_type || null,
          batsman_id: currentBatsmen[0]?.id || null,
          bowler_id: currentBowler?.id || null
        });

      if (error) throw error;

      setRecentBalls(prev => [
        ...prev.slice(-11),
        ballData.is_wicket ? 'W' : ballData.runs.toString()
      ]);

    } catch (error) {
      console.error('Error recording ball:', error);
      throw error;
    }
  };

  const checkInningsEnd = async (overs, wickets, runs) => {
    const matchOvers = match?.overs || 20;
    
    if (overs >= matchOvers || wickets >= 10) {
      if (currentInnings === 1) {
        setInnings1Score({
          runs: runs,
          wickets: wickets,
          overs: overs
        });
        
        setCurrentInnings(2);
        setBattingTeam(battingTeam === 1 ? 2 : 1);
        setScoreData({
          runs: 0,
          wickets: 0,
          overs: 0,
          balls: 0,
          extras: 0
        });
        
        // Reset players for second innings
        setPlayersSelected(false);
        setCurrentBatsmen([]);
        setCurrentBowler(null);
        
        toast({
          title: "Innings Break",
          description: "First innings completed. Starting second innings...",
        });
      } else {
        await endMatch();
      }
    } else if (currentInnings === 2 && runs > innings1Score.runs) {
      await endMatch();
    }
  };

  const endMatch = async () => {
    try {
      if (!match?.id) {
        throw new Error('No match ID available');
      }

      let result = '';
      if (currentInnings === 2) {
        if (scoreData.runs > innings1Score.runs) {
          const battingTeamName = battingTeam === 1 ? match.team1?.name : match.team2?.name;
          result = `${battingTeamName} won by ${10 - scoreData.wickets} wickets`;
        } else if (scoreData.runs < innings1Score.runs) {
          const bowlingTeamName = battingTeam === 1 ? match.team2?.name : match.team1?.name;
          result = `${bowlingTeamName} won by ${innings1Score.runs - scoreData.runs} runs`;
        } else {
          result = 'Match tied';
        }
      } else {
        const battingTeamName = battingTeam === 1 ? match.team1?.name : match.team2?.name;
        result = `${battingTeamName} won`;
      }

      const { error } = await supabase
        .from('matches')
        .update({
          status: 'completed',
          result: result,
          team1_score: `${innings1Score.runs}/${innings1Score.wickets}`,
          team1_overs: `${innings1Score.overs}.0`,
          team2_score: currentInnings === 2 ? `${scoreData.runs}/${scoreData.wickets}` : null,
          team2_overs: currentInnings === 2 ? `${scoreData.overs}.${scoreData.balls}` : null
        })
        .eq('id', match.id);

      if (error) {
        console.error('Supabase error ending match:', error);
        throw error;
      }

      setMatchEnded(true);
      setIsMatchActive(false);
      setWinner(result);
      
      setMatch(prev => ({
        ...prev,
        status: 'completed',
        result: result
      }));

      toast({
        title: "Match Completed!",
        description: result,
      });

    } catch (error) {
      console.error('Error ending match:', error);
      toast({
        title: "Error",
        description: "Failed to end match. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getCurrentRunRate = () => {
    if (scoreData.overs === 0) return '0.00';
    const totalBalls = scoreData.overs * 6 + scoreData.balls;
    return totalBalls > 0 ? (scoreData.runs / (totalBalls / 6)).toFixed(2) : '0.00';
  };

  const getRequiredRunRate = () => {
    if (currentInnings === 1) return '0.00';
    const target = innings1Score.runs + 1;
    const ballsRemaining = ((match?.overs || 20) * 6) - (scoreData.overs * 6 + scoreData.balls);
    return ballsRemaining > 0 ? ((target - scoreData.runs) / (ballsRemaining / 6)).toFixed(2) : '0.00';
  };

  if (!match) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Clock className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold mb-2">No Active Match</h3>
          <p className="text-gray-600">Create a match to start live scoring</p>
        </CardContent>
      </Card>
    );
  }

  if (showToss && !tossCompleted) {
    return (
      <TossSelector
        match={match}
        onTossComplete={handleTossComplete}
      />
    );
  }

  if (tossCompleted && !playersSelected && !matchEnded) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Select Opening Players</CardTitle>
          </CardHeader>
          <CardContent>
            <PlayerSelector
              match={match}
              onPlayersSelected={handlePlayersSelected}
              battingTeam={battingTeam}
              team1Players={team1Players}
              team2Players={team2Players}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Cricket Scoreboard */}
      <EnhancedCricketScoreboard
        matchData={match}
        score={scoreData}
        currentBatsmen={currentBatsmen}
        currentBowler={currentBowler}
        innings1Score={innings1Score}
        currentInnings={currentInnings}
        currentOver={scoreData.overs}
        currentBall={scoreData.balls}
        battingTeam={battingTeam}
        target={currentInnings === 2 ? innings1Score.runs + 1 : 0}
        requiredRunRate={getRequiredRunRate()}
        currentRunRate={getCurrentRunRate()}
        recentBalls={recentBalls}
        team1Players={team1Players}
        team2Players={team2Players}
        fallOfWickets={fallOfWickets}
        bowlers={battingTeam === 1 ? team2Players : team1Players}
        wickets={fallOfWickets}
        oversData={oversData}
      />

      <Tabs defaultValue="scoring" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scoring">Live Scoring</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          {matchEnded && <TabsTrigger value="awards">Awards</TabsTrigger>}
        </TabsList>

        <TabsContent value="scoring" className="space-y-4">
          {!matchEnded && isMatchActive && (
            <>
              {/* Scoring Buttons */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Scoring</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3 mb-4">
                    {[0, 1, 2, 3, 4, 6].map((runs) => (
                      <Button
                        key={runs}
                        onClick={() => addRuns(runs)}
                        variant={runs === 0 ? "outline" : runs >= 4 ? "default" : "secondary"}
                        className="h-12 text-lg font-bold"
                        disabled={!currentBatsmen.length || !currentBowler}
                      >
                        {runs}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      onClick={handleWicket} 
                      variant="destructive"
                      disabled={!currentBatsmen.length || !currentBowler}
                    >
                      Wicket
                    </Button>
                    <Button onClick={endMatch} variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
                      End Match
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {matchEnded && (
            <Card>
              <CardContent className="text-center py-8">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-2xl font-bold mb-2">Match Completed!</h3>
                <p className="text-lg text-gray-600 mb-4">{winner}</p>
                <div className="flex justify-center gap-4">
                  <Button onClick={() => window.location.reload()}>
                    <RotateCcw className="w-4 h-4 mr-2" />
                    New Match
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <MatchAnalytics
            matchData={match}
            innings1Score={innings1Score}
            innings2Score={currentInnings === 2 ? scoreData : null}
            currentBatsmen={currentBatsmen}
            currentBowler={currentBowler}
          />
        </TabsContent>

        <TabsContent value="export">
          <ExportReport
            matchData={match}
            scoreData={scoreData}
            currentBatsmen={currentBatsmen}
            currentBowler={currentBowler}
            innings1Score={innings1Score}
            currentInnings={currentInnings}
            winner={winner}
            recentBalls={recentBalls}
            fallOfWickets={fallOfWickets}
            team1Players={team1Players}
            team2Players={team2Players}
          />
        </TabsContent>

        {matchEnded && (
          <TabsContent value="awards">
            <PostMatchPerformers
              allPlayers={allPlayers}
              matchData={match}
              manOfMatch={allPlayers[0]}
              bestBowler={allPlayers[1]}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Wicket Selector Dialog */}
      <WicketSelector
        open={showWicketSelector}
        onClose={() => setShowWicketSelector(false)}
        onWicketSelect={handleWicketSelect}
        fieldingPlayers={battingTeam === 1 ? team2Players : team1Players}
        currentBowler={currentBowler}
        currentBatsman={wicketBatsman}
      />

      {/* Bowler Selector Dialog */}
      <BowlerSelector
        open={showBowlerSelector}
        onClose={() => setShowBowlerSelector(false)}
        onBowlerSelect={handleBowlerSelected}
        bowlingPlayers={battingTeam === 1 ? team2Players : team1Players}
        currentBowler={currentBowler}
      />
    </div>
  );
};

export default LiveScoring;
