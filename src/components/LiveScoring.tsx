
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Target, Trophy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import MatchSelector from "./scoring/MatchSelector";
import TossSelector from "./TossSelector";
import PlayerSelector from "./PlayerSelector";
import MatchSetup from "./scoring/MatchSetup";
import PlayerSelection from "./scoring/PlayerSelection";
import ScoringControls from "./scoring/ScoringControls";
import ScoreDisplay from "./scoring/ScoreDisplay";
import ScoringRuleEngine from "./scoring/ScoringRuleEngine";
import { validatePlayer, formatOvers } from "@/utils/scoringUtils";

interface Match {
  id: string;
  team1_id: string;
  team2_id: string;
  team1_name: string;
  team2_name: string;
  match_date: string;
  venue: string;
  overs: number;
}

interface Player {
  id: string;
  name: string;
  team_id: string;
  batting_style?: string;
  bowling_style?: string;
  role?: string;
  average?: number;
  strike_rate?: number;
  wickets?: number;
  economy?: number;
  runs?: number;
  balls?: number;
  fours?: number;
  sixes?: number;
  overs?: number;
}

interface TeamInnings {
  teamId: string;
  teamName: string;
  totalRuns: number;
  totalWickets: number;
  overs: number;
  balls: number;
  extras: {
    wides: number;
    noballs: number;
    byes: number;
    legbyes: number;
  };
}

const LiveScoring = () => {
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [team1Players, setTeam1Players] = useState<Player[]>([]);
  const [team2Players, setTeam2Players] = useState<Player[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [battingTeam, setBattingTeam] = useState<number | null>(null);
  const [currentBatsmen, setCurrentBatsmen] = useState<Player[]>([
    { id: '', name: '', team_id: '', runs: 0, balls: 0, fours: 0, sixes: 0 },
    { id: '', name: '', team_id: '', runs: 0, balls: 0, fours: 0, sixes: 0 }
  ]);
  const [currentBowler, setCurrentBowler] = useState<Player | null>(null);
  const [strikeBatsmanIndex, setStrikeBatsmanIndex] = useState<number>(0);
  const [matchSetup, setMatchSetup] = useState<any>(null);
  const [currentInnings, setCurrentInnings] = useState<number>(1);
  const [currentOver, setCurrentOver] = useState<number>(0);
  const [currentBall, setCurrentBall] = useState<number>(0);
  const [currentBallInOver, setCurrentBallInOver] = useState<number>(0);
  const [teamInnings, setTeamInnings] = useState<TeamInnings[]>([
    {
      teamId: '',
      teamName: '',
      totalRuns: 0,
      totalWickets: 0,
      overs: 0,
      balls: 0,
      extras: { wides: 0, noballs: 0, byes: 0, legbyes: 0 }
    },
    {
      teamId: '',
      teamName: '',
      totalRuns: 0,
      totalWickets: 0,
      overs: 0,
      balls: 0,
      extras: { wides: 0, noballs: 0, byes: 0, legbyes: 0 }
    }
  ]);
  const [matchEnded, setMatchEnded] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<'match-selection' | 'toss' | 'player-selection' | 'match-setup' | 'scoring'>('match-selection');

  useEffect(() => {
    if (selectedMatch) {
      fetchPlayers(selectedMatch.team1_id, 1);
      fetchPlayers(selectedMatch.team2_id, 2);
    }
  }, [selectedMatch]);

  useEffect(() => {
    if (team1Players.length > 0 && team2Players.length > 0) {
      const validTeam1Players = team1Players.filter(validatePlayer);
      const validTeam2Players = team2Players.filter(validatePlayer);
      setAllPlayers([...validTeam1Players, ...validTeam2Players]);
      
      console.log('Valid Team 1 Players:', validTeam1Players.length);
      console.log('Valid Team 2 Players:', validTeam2Players.length);
    }
  }, [team1Players, team2Players]);

  const fetchPlayers = async (teamId: string, teamNumber: number) => {
    try {
      console.log(`Fetching players for team ${teamNumber} with ID:`, teamId);
      
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', teamId)
        .order('name');

      if (error) {
        console.error('Error fetching players for team', teamNumber, ':', error);
        toast({
          title: "Error",
          description: `Failed to fetch players for team ${teamNumber}`,
          variant: "destructive"
        });
        return;
      }

      const validPlayers = (data || []).filter(validatePlayer);
      console.log(`Fetched ${validPlayers.length} valid players for team ${teamNumber}`);
      
      if (teamNumber === 1) {
        setTeam1Players(validPlayers);
      } else {
        setTeam2Players(validPlayers);
      }
    } catch (error) {
      console.error('Error fetching players for team', teamNumber, ':', error);
      toast({
        title: "Error",
        description: `Failed to fetch players for team ${teamNumber}`,
        variant: "destructive"
      });
    }
  };

  const handleMatchSelect = (match: Match) => {
    console.log('Match selected:', match);
    setSelectedMatch(match);
    setCurrentStep('toss');
  };

  const handleTossComplete = (tossWinnerTeamId: string, decision: string) => {
    console.log('Toss completed:', { tossWinnerTeamId, decision });

    const tossWinner = tossWinnerTeamId === selectedMatch?.team1_id ? 1 : 2;
    const battingFirst = (decision === 'bat') ? tossWinner : (tossWinner === 1 ? 2 : 1);

    setBattingTeam(battingFirst);
    setCurrentStep('player-selection');
  };

  const handlePlayersSelected = (batsmen: Player[], bowler: Player) => {
    console.log('Players selected:', { batsmen, bowler });
    
    // Validate and set batsmen
    const validBatsmen = batsmen.filter(validatePlayer).map(batsman => ({
      ...batsman,
      runs: 0,
      balls: 0,
      fours: 0,
      sixes: 0
    }));
    
    if (validBatsmen.length < 2) {
      toast({
        title: "Error",
        description: "Please select two valid batsmen",
        variant: "destructive"
      });
      return;
    }

    // Validate bowler
    if (!validatePlayer(bowler)) {
      toast({
        title: "Error", 
        description: "Please select a valid bowler",
        variant: "destructive"
      });
      return;
    }

    setCurrentBatsmen(validBatsmen);
    setCurrentBowler({
      ...bowler,
      runs: 0,
      wickets: 0,
      overs: 0
    });
    setCurrentStep('match-setup');
  };

  const handleUpdateBatsman = (index: number, field: string, value: string) => {
    console.log(`Updating batsman ${index}, field ${field} to value:`, value);
    
    if (index < 0 || index >= currentBatsmen.length) return;
    
    const updatedBatsmen = [...currentBatsmen];
    const selectedPlayer = allPlayers.find(player => player.id === value);

    if (selectedPlayer && validatePlayer(selectedPlayer)) {
      updatedBatsmen[index] = {
        id: selectedPlayer.id,
        name: selectedPlayer.name,
        team_id: selectedPlayer.team_id,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0
      };
    } else {
      updatedBatsmen[index] = {
        id: '',
        name: '',
        team_id: '',
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0
      };
    }

    setCurrentBatsmen(updatedBatsmen);
  };

  const handleUpdateBowler = (field: string, value: string) => {
    console.log(`Updating bowler, field ${field} to value:`, value);
    
    const selectedPlayer = allPlayers.find(player => player.id === value);

    if (selectedPlayer && validatePlayer(selectedPlayer)) {
      setCurrentBowler({
        id: selectedPlayer.id,
        name: selectedPlayer.name,
        team_id: selectedPlayer.team_id,
        overs: 0,
        runs: 0,
        wickets: 0
      });
    } else {
      setCurrentBowler(null);
    }
  };

  const checkInningsEnd = () => {
    const totalOvers = matchSetup?.overs || 20;
    const ballsPerOver = matchSetup?.ballsPerOver || 6;
    
    // Check if overs are completed
    if (currentOver >= totalOvers) {
      console.log('Innings ended - overs completed:', currentOver, '>=', totalOvers);
      setMatchEnded(true);
      toast({
        title: "Innings Complete!",
        description: `${totalOvers} overs completed. Innings ended.`,
      });
      return true;
    }

    // Check if all wickets are down
    if (teamInnings[currentInnings - 1].totalWickets >= 10) {
      console.log('Innings ended - all out');
      setMatchEnded(true);
      toast({
        title: "All Out!",
        description: "Team is all out. Innings ended.",
      });
      return true;
    }

    return false;
  };

  const handleScore = (runs: number) => {
    console.log(`Scoring ${runs} runs`);
    
    if (!validateScoringState() || matchEnded) return;
    
    const updatedBatsmen = [...currentBatsmen];
    updatedBatsmen[strikeBatsmanIndex].runs += runs;
    updatedBatsmen[strikeBatsmanIndex].balls += 1;
    
    if (runs === 4) {
      updatedBatsmen[strikeBatsmanIndex].fours += 1;
    } else if (runs === 6) {
      updatedBatsmen[strikeBatsmanIndex].sixes += 1;
    }
    
    setCurrentBatsmen(updatedBatsmen);

    const updatedTeamInnings = [...teamInnings];
    updatedTeamInnings[currentInnings - 1].totalRuns += runs;
    updatedTeamInnings[currentInnings - 1].balls += 1;
    setTeamInnings(updatedTeamInnings);

    setCurrentBall(prev => prev + 1);
    setCurrentBallInOver(prev => {
      const newBallInOver = prev + 1;
      const ballsPerOver = matchSetup?.ballsPerOver || 6;
      
      // Check if over is completed
      if (newBallInOver >= ballsPerOver) {
        handleOverComplete();
        return 0; // Reset for new over
      }
      
      return newBallInOver;
    });

    // Switch strike for odd runs
    if (runs % 2 !== 0) {
      switchStrike();
    }

    // Don't check innings end here - let the over completion handle it
  };

  const handleWicket = (dismissalType: string) => {
    console.log(`Wicket taken: ${dismissalType}`);
    
    if (!validateScoringState() || matchEnded) return;

    const updatedBatsmen = [...currentBatsmen];
    updatedBatsmen[strikeBatsmanIndex].balls += 1;
    setCurrentBatsmen(updatedBatsmen);

    const updatedTeamInnings = [...teamInnings];
    updatedTeamInnings[currentInnings - 1].totalWickets += 1;
    updatedTeamInnings[currentInnings - 1].balls += 1;
    setTeamInnings(updatedTeamInnings);

    setCurrentBall(prev => prev + 1);
    setCurrentBallInOver(prev => {
      const newBallInOver = prev + 1;
      const ballsPerOver = matchSetup?.ballsPerOver || 6;
      
      // Check if over is completed
      if (newBallInOver >= ballsPerOver) {
        handleOverComplete();
        return 0; // Reset for new over
      }
      
      return newBallInOver;
    });

    toast({
      title: "Wicket!",
      description: `${updatedBatsmen[strikeBatsmanIndex].name} is out (${dismissalType})`,
    });

    // Check if innings should end after wicket
    setTimeout(() => checkInningsEnd(), 100);
  };

  const handleExtra = (extraType: string, runs: number = 1) => {
    console.log(`Extra added: ${extraType} for ${runs} runs`);

    if (matchEnded) return;

    const updatedTeamInnings = [...teamInnings];
    updatedTeamInnings[currentInnings - 1].totalRuns += runs;
    updatedTeamInnings[currentInnings - 1].extras[extraType as keyof typeof updatedTeamInnings[0]['extras']] += runs;
    setTeamInnings(updatedTeamInnings);

    // Wide and No-ball don't count as legal deliveries
    if (extraType === 'wides' || extraType === 'noballs') {
      // Ball is re-bowled, don't increment ball count
      console.log('Extra ball - no ball count increment');
    } else {
      // Byes and leg-byes are legal deliveries
      setCurrentBall(prev => prev + 1);
      setCurrentBallInOver(prev => {
        const newBallInOver = prev + 1;
        const ballsPerOver = matchSetup?.ballsPerOver || 6;
        
        // Check if over is completed
        if (newBallInOver >= ballsPerOver) {
          handleOverComplete();
          return 0; // Reset for new over
        }
        
        return newBallInOver;
      });
    }
  };

  const handleBoundary = (boundaryType: 'four' | 'six') => {
    const runs = boundaryType === 'four' ? 4 : 6;
    handleScore(runs);
  };

  const handleOverComplete = () => {
    console.log('Over completed - current over:', currentOver);

    if (currentBowler) {
      const updatedBowler = { ...currentBowler };
      updatedBowler.overs = (updatedBowler.overs || 0) + 1;
      setCurrentBowler(updatedBowler);
    }

    const updatedTeamInnings = [...teamInnings];
    updatedTeamInnings[currentInnings - 1].overs += 1;
    setTeamInnings(updatedTeamInnings);

    setCurrentOver(prev => {
      const newOver = prev + 1;
      console.log('New over:', newOver, 'Total overs allowed:', matchSetup?.overs);
      
      // Check if innings should end after this over
      setTimeout(() => checkInningsEnd(), 100);
      
      return newOver;
    });
    
    setCurrentBallInOver(0);
    
    // Switch strike at end of over
    switchStrike();
    
    toast({
      title: "Over Complete!",
      description: `Over ${currentOver + 1} completed.`,
    });
  };

  const handleBowlerChangeRequired = () => {
    console.log('Bowler change required');
    // This will be called by the ScoringRuleEngine
  };

  const handleInningsEnd = (reason: string) => {
    console.log('Innings ended:', reason);
    setMatchEnded(true);
  };

  const handlePowerplayEnd = () => {
    console.log('Powerplay ended');
  };

  const switchStrike = () => {
    console.log('Switching strike');
    setStrikeBatsmanIndex(prev => (prev === 0 ? 1 : 0));
  };

  const validateScoringState = (): boolean => {
    if (!currentBatsmen[0]?.id || !currentBatsmen[1]?.id) {
      toast({
        title: "Error",
        description: "Both batsmen must be selected",
        variant: "destructive"
      });
      return false;
    }
    
    if (!currentBowler?.id) {
      toast({
        title: "Error", 
        description: "Bowler must be selected",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleMatchSetupComplete = (setupData: any) => {
    console.log('Match setup completed:', setupData);
    setMatchSetup(setupData);
    setCurrentStep('scoring');
    
    setCurrentInnings(1);
    setCurrentBall(0);
    setCurrentOver(0);
    setCurrentBallInOver(0);
    
    setTeamInnings([
      {
        teamId: battingTeam === 1 ? selectedMatch?.team1_id || '' : selectedMatch?.team2_id || '',
        teamName: battingTeam === 1 ? selectedMatch?.team1_name || '' : selectedMatch?.team2_name || '',
        totalRuns: 0,
        totalWickets: 0,
        overs: 0,
        balls: 0,
        extras: { wides: 0, noballs: 0, byes: 0, legbyes: 0 }
      },
      {
        teamId: battingTeam === 2 ? selectedMatch?.team1_id || '' : selectedMatch?.team2_id || '',
        teamName: battingTeam === 2 ? selectedMatch?.team1_name || '' : selectedMatch?.team2_name || '',
        totalRuns: 0,
        totalWickets: 0,
        overs: 0,
        balls: 0,
        extras: { wides: 0, noballs: 0, byes: 0, legbyes: 0 }
      }
    ]);
    
    toast({
      title: "Ready to Score!",
      description: "Match setup complete. You can now start scoring.",
    });
  };

  const renderContent = () => {
    switch (currentStep) {
      case 'match-selection':
        return <MatchSelector onMatchSelect={handleMatchSelect} />;
        
      case 'toss':
        return (
          <TossSelector 
            match={selectedMatch}
            onTossComplete={handleTossComplete}
          />
        );
        
      case 'player-selection':
        return (
          <PlayerSelector
            match={selectedMatch}
            onPlayersSelected={handlePlayersSelected}
            battingTeam={battingTeam}
            team1Players={team1Players}
            team2Players={team2Players}
          />
        );
        
      case 'match-setup':
        return (
          <MatchSetup
            matchData={selectedMatch}
            onMatchSetupComplete={handleMatchSetupComplete}
            onBack={() => setCurrentStep('player-selection')}
          />
        );
        
      case 'scoring':
        return (
          <ScoringRuleEngine
            currentOver={currentOver}
            currentBall={currentBallInOver}
            totalOvers={matchSetup?.overs || 20}
            powerplayOvers={matchSetup?.powerplayOvers || 6}
            wickets={teamInnings[currentInnings - 1]?.totalWickets || 0}
            totalPlayers={11}
            onBowlerChangeRequired={handleBowlerChangeRequired}
            onInningsEnd={handleInningsEnd}
            onPowerplayEnd={handlePowerplayEnd}
          >
            <div className="space-y-6">
              <ScoreDisplay 
                teamInnings={teamInnings}
                currentInnings={currentInnings}
                currentOver={currentOver}
                currentBallInOver={currentBallInOver}
                selectedMatch={selectedMatch}
                currentBatsmen={currentBatsmen}
                currentBowler={currentBowler}
                strikeBatsmanIndex={strikeBatsmanIndex}
                matchSetup={matchSetup}
              />
              
              {!matchEnded && (
                <>
                  <PlayerSelection
                    currentBatsmen={currentBatsmen}
                    currentBowler={currentBowler}
                    players={allPlayers}
                    strikeBatsmanIndex={strikeBatsmanIndex}
                    currentInnings={currentInnings}
                    battingTeamId={currentInnings === 1 ? 
                      (battingTeam === 1 ? selectedMatch?.team1_id || '' : selectedMatch?.team2_id || '') :
                      (battingTeam === 1 ? selectedMatch?.team2_id || '' : selectedMatch?.team1_id || '')
                    }
                    bowlingTeamId={currentInnings === 1 ? 
                      (battingTeam === 1 ? selectedMatch?.team2_id || '' : selectedMatch?.team1_id || '') :
                      (battingTeam === 1 ? selectedMatch?.team1_id || '' : selectedMatch?.team2_id || '')
                    }
                    onUpdateBatsman={handleUpdateBatsman}
                    onUpdateBowler={handleUpdateBowler}
                  />
                  
                  <ScoringControls
                    onScore={handleScore}
                    onWicket={handleWicket}
                    onExtra={handleExtra}
                    onBoundary={handleBoundary}
                    onUndoLastBall={() => {}}
                    isValidToScore={Boolean(currentBatsmen[0]?.id && currentBatsmen[1]?.id && currentBowler?.id)}
                    currentOver={currentOver}
                    currentBall={currentBallInOver}
                    totalOvers={matchSetup?.overs || 20}
                    powerplayOvers={matchSetup?.powerplayOvers || 6}
                    isPowerplay={currentOver < (matchSetup?.powerplayOvers || 6)}
                    isFreehit={false}
                  />
                </>
              )}
              
              {matchEnded && (
                <div className="text-center py-8">
                  <h2 className="text-2xl font-bold text-green-600 mb-4">Match Ended</h2>
                  <p className="text-gray-600">
                    Final Score: {teamInnings[currentInnings - 1]?.totalRuns}/{teamInnings[currentInnings - 1]?.totalWickets} 
                    ({formatOvers(teamInnings[currentInnings - 1]?.overs || 0, teamInnings[currentInnings - 1]?.balls || 0)} overs)
                  </p>
                </div>
              )}
            </div>
          </ScoringRuleEngine>
        );
        
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-2xl font-bold">Live Cricket Scoring</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">
              <Clock className="mr-2 h-4 w-4" />
              {selectedMatch ? `${selectedMatch.team1_name} vs ${selectedMatch.team2_name}` : 'No Match Selected'}
            </Badge>
            {currentStep === 'scoring' && (
              <Badge variant="outline">
                Innings {currentInnings} {matchEnded ? '(Ended)' : ''}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="pl-2">
          {renderContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default LiveScoring;
