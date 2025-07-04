
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
import BowlerSelector from "./BowlerSelector";
import ExportReport from "./ExportReport";
import MatchAnalytics from "./MatchAnalytics";
import PostMatchPerformers from "./PostMatchPerformers";

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
      
      // Check if match has toss completed
      if (matchData.toss_winner && matchData.toss_decision) {
        console.log('Toss already completed');
        setTossCompleted(true);
        setShowToss(false);
      } else {
        console.log('Toss not completed, showing toss dialog');
        setShowToss(true);
        setTossCompleted(false);
      }

      // Check match status
      if (matchData.status === 'completed') {
        setMatchEnded(true);
        setIsMatchActive(false);
        setWinner(matchData.result);
      } else if (matchData.status === 'live') {
        setIsMatchActive(true);
        setMatchEnded(false);
      }

      // Load existing match data if available
      await loadMatchData(matchData.id);
    } catch (error) {
      console.error('Error checking match status:', error);
    }
  };

  const loadMatchData = async (matchId) => {
    try {
      // Load ball by ball data
      const { data: ballData, error: ballError } = await supabase
        .from('ball_by_ball')
        .select('*')
        .eq('match_id', matchId)
        .order('over_number', { ascending: true })
        .order('ball_number', { ascending: true });

      if (ballError) throw ballError;

      if (ballData && ballData.length > 0) {
        // Calculate current score from ball data
        const innings1Balls = ballData.filter(ball => ball.innings === 1);
        const innings2Balls = ballData.filter(ball => ball.innings === 2);

        // Calculate innings 1 score
        const inn1Runs = innings1Balls.reduce((total, ball) => total + ball.runs + ball.extras, 0);
        const inn1Wickets = innings1Balls.filter(ball => ball.is_wicket).length;
        const inn1Overs = Math.floor(Math.max(...innings1Balls.map(ball => ball.over_number * 6 + ball.ball_number), 0) / 6);

        setInnings1Score({
          runs: inn1Runs,
          wickets: inn1Wickets,
          overs: inn1Overs
        });

        // If there's innings 2 data, set current innings to 2
        if (innings2Balls.length > 0) {
          setCurrentInnings(2);
          const inn2Runs = innings2Balls.reduce((total, ball) => total + ball.runs + ball.extras, 0);
          const inn2Wickets = innings2Balls.filter(ball => ball.is_wicket).length;
          const inn2Overs = Math.floor(Math.max(...innings2Balls.map(ball => ball.over_number * 6 + ball.ball_number), 0) / 6);
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

      // Update local match state
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
    setCurrentBatsmen(batsmen);
    setCurrentBowler(bowler);
    setPlayersSelected(true);
    
    toast({
      title: "Players Selected!",
      description: "Match is ready to begin",
    });
  };

  const addRuns = async (runs) => {
    if (!isMatchActive || matchEnded) return;

    try {
      const newBalls = (scoreData.balls + 1) % 6;
      const newOvers = newBalls === 0 ? scoreData.overs + 1 : scoreData.overs;
      const newRuns = scoreData.runs + runs;

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

  const addWicket = async (wicketType = 'bowled') => {
    if (!isMatchActive || matchEnded) return;

    try {
      const newWickets = scoreData.wickets + 1;
      const newBalls = (scoreData.balls + 1) % 6;
      const newOvers = newBalls === 0 ? scoreData.overs + 1 : scoreData.overs;

      // Record ball by ball
      await recordBall({
        runs: 0,
        extras: 0,
        is_wicket: true,
        wicket_type: wicketType,
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

      // Check if innings should end
      await checkInningsEnd(newOvers, newWickets, scoreData.runs);

    } catch (error) {
      console.error('Error adding wicket:', error);
      toast({
        title: "Error",
        description: "Failed to add wicket",
        variant: "destructive"
      });
    }
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

      // Update recent balls
      setRecentBalls(prev => [
        ...prev.slice(-11),
        {
          runs: ballData.runs || 0,
          extras: ballData.extras || 0,
          is_wicket: ballData.is_wicket || false,
          over_number: ballData.over_number,
          ball_number: ballData.ball_number
        }
      ]);

    } catch (error) {
      console.error('Error recording ball:', error);
      throw error;
    }
  };

  const checkInningsEnd = async (overs, wickets, runs) => {
    const matchOvers = match?.overs || 20;
    
    // Check if innings should end
    if (overs >= matchOvers || wickets >= 10) {
      if (currentInnings === 1) {
        // End of first innings
        setInnings1Score({
          runs: scoreData.runs,
          wickets: scoreData.wickets,
          overs: scoreData.overs
        });
        
        setCurrentInnings(2);
        setScoreData({
          runs: 0,
          wickets: 0,
          overs: 0,
          balls: 0,
          extras: 0
        });
        
        toast({
          title: "Innings Break",
          description: "First innings completed. Starting second innings...",
        });
      } else {
        // End of second innings - match completed
        await endMatch();
      }
    } else if (currentInnings === 2 && runs > innings1Score.runs) {
      // Team 2 has won by chasing the target
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
          result = `${match.team2?.name || 'Team 2'} won by ${10 - scoreData.wickets} wickets`;
        } else if (scoreData.runs < innings1Score.runs) {
          result = `${match.team1?.name || 'Team 1'} won by ${innings1Score.runs - scoreData.runs} runs`;
        } else {
          result = 'Match tied';
        }
      } else {
        result = `${match.team1?.name || 'Team 1'} won`;
      }

      console.log('Ending match with result:', result);

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
      
      // Update local match state
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
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                {match.team1?.name || 'Team 1'} vs {match.team2?.name || 'Team 2'}
              </h2>
              <p className="text-green-100">{match.venue} • {match.format}</p>
            </div>
            <div className="text-right">
              <Badge variant="secondary" className="mb-2">
                {matchEnded ? 'Completed' : isMatchActive ? 'Live' : 'Not Started'}
              </Badge>
              <div className="text-sm text-green-100">
                {match.match_date}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Score */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {currentInnings === 1 ? (match.team1?.name || 'Team 1') : (match.team2?.name || 'Team 2')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {scoreData.runs}/{scoreData.wickets}
            </div>
            <div className="text-gray-600">
              Overs: {scoreData.overs}.{scoreData.balls} | Run Rate: {scoreData.overs > 0 ? (scoreData.runs / scoreData.overs).toFixed(2) : '0.00'}
            </div>
          </CardContent>
        </Card>

        {currentInnings === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>{match.team1?.name || 'Team 1'} (1st Innings)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-2">
                {innings1Score.runs}/{innings1Score.wickets}
              </div>
              <div className="text-gray-600">
                Overs: {innings1Score.overs}.0 | Run Rate: {innings1Score.overs > 0 ? (innings1Score.runs / innings1Score.overs).toFixed(2) : '0.00'}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Match Status */}
      {matchEnded && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <span className="font-semibold text-yellow-800">Match Result: {winner}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="scoring" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scoring">Scoring</TabsTrigger>
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
                      >
                        {runs}
                      </Button>
                    ))}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button onClick={() => addWicket()} variant="destructive">
                      Wicket
                    </Button>
                    <Button onClick={endMatch} variant="outline" className="border-red-500 text-red-500 hover:bg-red-50">
                      End Match
                    </Button>
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
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">Batsmen</h4>
                      {currentBatsmen.map((batsman, index) => (
                        <div key={index} className="text-sm p-2 bg-gray-50 rounded">
                          {batsman.name} - {batsman.runs || 0}*({batsman.balls || 0})
                        </div>
                      ))}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Bowler</h4>
                      {currentBowler && (
                        <div className="text-sm p-2 bg-gray-50 rounded">
                          {currentBowler.name} - {currentBowler.overs || 0}-{currentBowler.runs || 0}-{currentBowler.wickets || 0}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Recent Balls</h4>
                      <div className="flex gap-1 flex-wrap">
                        {recentBalls.slice(-6).map((ball, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded text-xs ${
                              ball.is_wicket ? 'bg-red-100 text-red-800' :
                              ball.runs >= 4 ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {ball.is_wicket ? 'W' : ball.runs}
                          </span>
                        ))}
                      </div>
                    </div>
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
            scoreData={scoreData}
            innings1Score={innings1Score}
            currentInnings={currentInnings}
            recentBalls={recentBalls}
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
          />
        </TabsContent>

        {matchEnded && (
          <TabsContent value="awards">
            <PostMatchPerformers
              matchId={match.id}
              team1Id={match.team1_id}
              team2Id={match.team2_id}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default LiveScoring;
