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
  const [battingTeam, setBattingTeam] = useState<number | null>(null); // 1 or 2
  const [currentBatsmen, setCurrentBatsmen] = useState<any[]>([{}, {}]);
  const [currentBowler, setCurrentBowler] = useState<any>(null);
  const [strikeBatsmanIndex, setStrikeBatsmanIndex] = useState<number>(0); // 0 or 1
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
  const [currentStep, setCurrentStep] = useState<'match-selection' | 'toss' | 'player-selection' | 'match-setup' | 'scoring'>('match-selection');

  useEffect(() => {
    if (selectedMatch) {
      fetchPlayers(selectedMatch.team1_id, 1);
      fetchPlayers(selectedMatch.team2_id, 2);
    }
  }, [selectedMatch]);

  useEffect(() => {
    // Combine players after both teams are fetched
    if (team1Players.length > 0 && team2Players.length > 0) {
      setAllPlayers([...team1Players, ...team2Players]);
    }
  }, [team1Players, team2Players]);

  const fetchPlayers = async (teamId: string, teamNumber: number) => {
    try {
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

      console.log(`Fetched players for team ${teamNumber}:`, data);
      if (teamNumber === 1) {
        setTeam1Players(data || []);
      } else {
        setTeam2Players(data || []);
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

    // Determine batting team based on toss decision
    const tossWinner = tossWinnerTeamId === selectedMatch?.team1_id ? 1 : 2;
    const battingFirst = (decision === 'bat') ? tossWinner : (tossWinner === 1 ? 2 : 1);

    setBattingTeam(battingFirst);
    setCurrentStep('player-selection');
  };

  const handlePlayersSelected = (batsmen: any[], bowler: any) => {
    console.log('Players selected:', { batsmen, bowler });
    setCurrentBatsmen(batsmen);
    setCurrentBowler(bowler);
    setCurrentStep('match-setup');
  };

  const handleUpdateBatsman = (index: number, field: string, value: string) => {
    console.log(`Updating batsman ${index}, field ${field} to value:`, value);
    const updatedBatsmen = [...currentBatsmen];
    
    // Find the player object from allPlayers based on the selected value (player ID)
    const selectedPlayer = allPlayers.find(player => player.id === value);

    if (selectedPlayer) {
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
      // Reset if no player is selected
      updatedBatsmen[index] = {};
    }

    setCurrentBatsmen(updatedBatsmen);
  };

  const handleUpdateBowler = (field: string, value: string) => {
    console.log(`Updating bowler, field ${field} to value:`, value);
    
    // Find the player object from allPlayers based on the selected value (player ID)
    const selectedPlayer = allPlayers.find(player => player.id === value);

    if (selectedPlayer) {
      setCurrentBowler({
        id: selectedPlayer.id,
        name: selectedPlayer.name,
        team_id: selectedPlayer.team_id,
        overs: 0,
        runs: 0,
        wickets: 0
      });
    } else {
      // Reset if no player is selected
      setCurrentBowler(null);
    }
  };

  const handleScore = (runs: number) => {
    console.log(`Scoring ${runs} runs`);
    
    // Update current batsman's stats
    const updatedBatsmen = [...currentBatsmen];
    updatedBatsmen[strikeBatsmanIndex].runs += runs;
    updatedBatsmen[strikeBatsmanIndex].balls += 1;
    setCurrentBatsmen(updatedBatsmen);

    // Update team innings stats
    const updatedTeamInnings = [...teamInnings];
    updatedTeamInnings[currentInnings - 1].totalRuns += runs;
    updatedTeamInnings[currentInnings - 1].balls += 1;
    setTeamInnings(updatedTeamInnings);

    // Update overall game stats
    setCurrentBall(prev => prev + 1);
    setCurrentBallInOver(prev => prev + 1);

    if (runs % 2 !== 0) {
      switchStrike();
    }

    if (currentBallInOver === matchSetup.ballsPerOver) {
      handleOverComplete();
    }
  };

  const handleWicket = (dismissalType: string) => {
    console.log(`Wicket taken: ${dismissalType}`);

    // Update current batsman's stats
    const updatedBatsmen = [...currentBatsmen];
    updatedBatsmen[strikeBatsmanIndex].balls += 1;
    setCurrentBatsmen(updatedBatsmen);

    // Update team innings stats
    const updatedTeamInnings = [...teamInnings];
    updatedTeamInnings[currentInnings - 1].totalWickets += 1;
    updatedTeamInnings[currentInnings - 1].balls += 1;
    setTeamInnings(updatedTeamInnings);

    // Update overall game stats
    setCurrentBall(prev => prev + 1);
    setCurrentBallInOver(prev => prev + 1);

    if (currentBallInOver === matchSetup.ballsPerOver) {
      handleOverComplete();
    }
  };

  const handleExtra = (extraType: string, runs: number = 1) => {
    console.log(`Extra added: ${extraType} for ${runs} runs`);

    // Update team innings stats
    const updatedTeamInnings = [...teamInnings];
    updatedTeamInnings[currentInnings - 1].totalRuns += runs;
    updatedTeamInnings[currentInnings - 1].extras[extraType] += runs;
    setTeamInnings(updatedTeamInnings);
  };

  const handleBoundary = (boundaryType: 'four' | 'six') => {
    console.log(`Scored a ${boundaryType}`);

    // Update current batsman's stats
    const updatedBatsmen = [...currentBatsmen];
    updatedBatsmen[strikeBatsmanIndex].runs += (boundaryType === 'four' ? 4 : 6);
    updatedBatsmen[strikeBatsmanIndex].balls += 1;
    updatedBatsmen[strikeBatsmanIndex][boundaryType === 'four' ? 'fours' : 'sixes'] += 1;
    setCurrentBatsmen(updatedBatsmen);

    // Update team innings stats
    const updatedTeamInnings = [...teamInnings];
    updatedTeamInnings[currentInnings - 1].totalRuns += (boundaryType === 'four' ? 4 : 6);
    updatedTeamInnings[currentInnings - 1].balls += 1;
    setTeamInnings(updatedTeamInnings);

    // Update overall game stats
    setCurrentBall(prev => prev + 1);
    setCurrentBallInOver(prev => prev + 1);

    if (currentBallInOver === matchSetup.ballsPerOver) {
      handleOverComplete();
    }
  };

  const handleOverComplete = () => {
    console.log('Over completed');

    // Update bowler's stats
    const updatedBowler = { ...currentBowler };
    updatedBowler.overs += 1;
    setCurrentBowler(updatedBowler);

    // Update innings stats
    const updatedTeamInnings = [...teamInnings];
    updatedTeamInnings[currentInnings - 1].overs += 1;
    setTeamInnings(updatedTeamInnings);

    // Reset ball in over
    setCurrentBallInOver(0);

    // Switch strike
    switchStrike();
  };

  const switchStrike = () => {
    console.log('Switching strike');
    setStrikeBatsmanIndex(prev => (prev === 0 ? 1 : 0));
  };

  const handleMatchSetupComplete = (setupData: any) => {
    console.log('Match setup completed:', setupData);
    setMatchSetup(setupData);
    setCurrentStep('scoring');
    
    // Initialize scoring state
    setCurrentInnings(1);
    setCurrentBall(0);
    setCurrentOver(0);
    setCurrentBallInOver(0);
    
    // Initialize team innings data
    setTeamInnings([
      {
        teamId: battingTeam === 1 ? selectedMatch.team1_id : selectedMatch.team2_id,
        teamName: battingTeam === 1 ? selectedMatch.team1_name : selectedMatch.team2_name,
        totalRuns: 0,
        totalWickets: 0,
        overs: 0,
        balls: 0,
        extras: { wides: 0, noballs: 0, byes: 0, legbyes: 0 }
      },
      {
        teamId: battingTeam === 2 ? selectedMatch.team1_id : selectedMatch.team2_id,
        teamName: battingTeam === 2 ? selectedMatch.team1_name : selectedMatch.team2_name,
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
            
            <PlayerSelection
              currentBatsmen={currentBatsmen}
              currentBowler={currentBowler}
              players={allPlayers}
              strikeBatsmanIndex={strikeBatsmanIndex}
              currentInnings={currentInnings}
              battingTeamId={currentInnings === 1 ? 
                (battingTeam === 1 ? selectedMatch?.team1_id : selectedMatch?.team2_id) :
                (battingTeam === 1 ? selectedMatch?.team2_id : selectedMatch?.team1_id)
              }
              bowlingTeamId={currentInnings === 1 ? 
                (battingTeam === 1 ? selectedMatch?.team2_id : selectedMatch?.team1_id) :
                (battingTeam === 1 ? selectedMatch?.team1_id : selectedMatch?.team2_id)
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
              isValidToScore={currentBatsmen[0]?.id && currentBatsmen[1]?.id && currentBowler?.id}
              currentOver={currentOver}
              currentBall={currentBallInOver}
              totalOvers={matchSetup?.totalOvers || 20}
              powerplayOvers={matchSetup?.powerplayOvers || 6}
              isPowerplay={currentOver < (matchSetup?.powerplayOvers || 6)}
              isFreehit={false}
            />
          </div>
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
                Innings {currentInnings}
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
