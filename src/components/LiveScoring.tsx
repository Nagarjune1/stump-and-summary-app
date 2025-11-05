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
import BowlerChangeModal from "./scoring/BowlerChangeModal";
import NewBatsmanModal from "./scoring/NewBatsmanModal";
import WicketSelector from "./WicketSelector";
import { validatePlayer, formatOvers } from "@/utils/scoringUtils";
import { useRealtimeMatch } from "@/hooks/useRealtimeMatch";
import { useRealtimePresence } from "@/hooks/useRealtimePresence";

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
  isOut?: boolean;
  dismissalType?: string;
  batted?: boolean;
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
  const [tossWinnerTeamId, setTossWinnerTeamId] = useState<string>('');
  const [tossDecision, setTossDecision] = useState<string>('');
  const [battingFirstTeam, setBattingFirstTeam] = useState<number | null>(null);
  const [currentBatsmen, setCurrentBatsmen] = useState<Player[]>([
    { id: '', name: '', team_id: '', runs: 0, balls: 0, fours: 0, sixes: 0 },
    { id: '', name: '', team_id: '', runs: 0, balls: 0, fours: 0, sixes: 0 }
  ]);
  const [currentBowler, setCurrentBowler] = useState<Player | null>(null);
  const [strikeBatsmanIndex, setStrikeBatsmanIndex] = useState<number>(0);
  const [matchSetup, setMatchSetup] = useState<any>(null);
  const [currentInnings, setCurrentInnings] = useState<number>(1);
  const [currentOver, setCurrentOver] = useState<number>(0);
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
  const [isProcessingScore, setIsProcessingScore] = useState<boolean>(false);
  const [showBowlerChangeModal, setShowBowlerChangeModal] = useState(false);
  const [showNewBatsmanModal, setShowNewBatsmanModal] = useState(false);
  const [showWicketModal, setShowWicketModal] = useState(false);
  const [wicketDetails, setWicketDetails] = useState(null);

  // Realtime subscription for match updates
  useRealtimeMatch(selectedMatch?.id || null, (update) => {
    console.log('Realtime update received:', update);
    toast({
      title: "Live Update",
      description: `Match updated: ${update.type}`,
    });
  });

  // Realtime presence tracking
  const { presenceUsers } = useRealtimePresence(
    selectedMatch?.id || null,
    selectedMatch ? {
      user_id: 'current_user',
      user_name: 'Scorer',
      role: 'scorer',
      online_at: new Date().toISOString()
    } : null
  );

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

  const handleTossComplete = (winnerTeamId: string, decision: string) => {
    console.log('Toss completed:', { winnerTeamId, decision });
    
    setTossWinnerTeamId(winnerTeamId);
    setTossDecision(decision);
    
    // Determine which team bats first based on toss decision
    const tossWinnerTeam = winnerTeamId === selectedMatch?.team1_id ? 1 : 2;
    const battingFirst = (decision === 'bat') ? tossWinnerTeam : (tossWinnerTeam === 1 ? 2 : 1);
    
    console.log('Toss winner team number:', tossWinnerTeam);
    console.log('Team batting first:', battingFirst);
    
    setBattingFirstTeam(battingFirst);
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
        runs: updatedBatsmen[index].runs || 0,
        balls: updatedBatsmen[index].balls || 0,
        fours: updatedBatsmen[index].fours || 0,
        sixes: updatedBatsmen[index].sixes || 0
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
        overs: currentBowler?.overs || 0,
        runs: currentBowler?.runs || 0,
        wickets: currentBowler?.wickets || 0
      });
    } else {
      setCurrentBowler(null);
    }
  };

  const checkInningsEnd = () => {
    const totalOvers = matchSetup?.overs || 20;
    const currentTeamScore = teamInnings[currentInnings - 1];
    
    // Check if all wickets are down (10 wickets in cricket)
    if (currentTeamScore.totalWickets >= 10) {
      console.log('Innings ended - all out');
      handleInningsEnd('all_out');
      return true;
    }

    // Check if target is achieved in 2nd innings
    if (currentInnings === 2 && teamInnings[0]) {
      const target = teamInnings[0].totalRuns + 1;
      console.log('Checking target:', currentTeamScore.totalRuns, 'vs', target);
      if (currentTeamScore.totalRuns >= target) {
        console.log('Innings ended - target achieved:', currentTeamScore.totalRuns, '>=', target);
        handleInningsEnd('target_achieved');
        return true;
      }
    }
    
    // Check if overs are completed (checked last to allow target achievement first)
    if (currentOver >= totalOvers) {
      console.log('Innings ended - overs completed:', currentOver, '>=', totalOvers);
      handleInningsEnd('overs_completed');
      return true;
    }

    return false;
  };

  const handleScore = (runs: number) => {
    if (isProcessingScore || !validateScoringState() || matchEnded) {
      return;
    }
    
    setIsProcessingScore(true);
    console.log(`Scoring ${runs} runs`);
    
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

    // Update bowler stats
    if (currentBowler) {
      const updatedBowler = { ...currentBowler };
      updatedBowler.runs = (updatedBowler.runs || 0) + runs;
      setCurrentBowler(updatedBowler);
    }

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
    
    // Check if innings ends after this ball
    setTimeout(() => {
      if (checkInningsEnd()) {
        setIsProcessingScore(false);
        return;
      }
      setIsProcessingScore(false);
    }, 100);
  };

  const handleWicket = (dismissalType: string) => {
    if (isProcessingScore || !validateScoringState() || matchEnded) {
      return;
    }
    
    setIsProcessingScore(true);
    console.log(`Wicket taken: ${dismissalType}`);

    const dismissedBatsman = currentBatsmen[strikeBatsmanIndex];
    const updatedBatsmen = [...currentBatsmen];
    updatedBatsmen[strikeBatsmanIndex].balls += 1;
    updatedBatsmen[strikeBatsmanIndex].isOut = true;
    updatedBatsmen[strikeBatsmanIndex].dismissalType = dismissalType;
    setCurrentBatsmen(updatedBatsmen);

    const updatedTeamInnings = [...teamInnings];
    updatedTeamInnings[currentInnings - 1].totalWickets += 1;
    updatedTeamInnings[currentInnings - 1].balls += 1;
    setTeamInnings(updatedTeamInnings);

    // Update bowler stats
    if (currentBowler) {
      const updatedBowler = { ...currentBowler };
      updatedBowler.wickets = (updatedBowler.wickets || 0) + 1;
      setCurrentBowler(updatedBowler);
    }

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

    // Set wicket details for new batsman modal
    setWicketDetails({
      dismissedPlayer: dismissedBatsman,
      dismissalType: dismissalType,
    });

    toast({
      title: "Wicket!",
      description: `${dismissedBatsman.name} is out (${dismissalType})`,
    });

    // Check if innings should end after wicket
    setTimeout(() => {
      if (checkInningsEnd()) {
        setIsProcessingScore(false);
        return;
      }
      // Show new batsman modal if innings continues
      setShowNewBatsmanModal(true);
      setIsProcessingScore(false);
    }, 1000);
  };

  const handleWicketSelect = (dismissalDetails: string) => {
    setShowWicketModal(false);
    handleWicket(dismissalDetails);
  };

  const handleExtra = (extraType: string, runs: number = 1) => {
    if (isProcessingScore || matchEnded) {
      return;
    }
    
    setIsProcessingScore(true);
    console.log(`Extra added: ${extraType} for ${runs} runs`);

    const updatedTeamInnings = [...teamInnings];
    updatedTeamInnings[currentInnings - 1].totalRuns += runs;
    updatedTeamInnings[currentInnings - 1].extras[extraType as keyof typeof updatedTeamInnings[0]['extras']] += runs;
    setTeamInnings(updatedTeamInnings);

    // Update bowler stats
    if (currentBowler) {
      const updatedBowler = { ...currentBowler };
      updatedBowler.runs = (updatedBowler.runs || 0) + runs;
      setCurrentBowler(updatedBowler);
    }

    // Wide and No-ball don't count as legal deliveries
    if (extraType === 'wides' || extraType === 'noballs') {
      console.log('Extra ball - no ball count increment');
    } else {
      // Byes and leg-byes are legal deliveries
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
    
    setTimeout(() => setIsProcessingScore(false), 100);
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

    setCurrentOver(prev => prev + 1);
    setCurrentBallInOver(0);
    
    // Switch strike at end of over
    switchStrike();
    
    toast({
      title: "Over Complete!",
      description: `Over ${currentOver + 1} completed. Select new bowler.`,
    });

    // Show bowler change modal
    setTimeout(() => {
      if (!checkInningsEnd()) {
        setShowBowlerChangeModal(true);
      }
    }, 1000);
  };

  const handleBowlerChange = (newBowler: any) => {
    setCurrentBowler(newBowler);
    setShowBowlerChangeModal(false);
    toast({
      title: "Bowler Changed",
      description: `${newBowler.name} is now bowling`,
    });
  };

  const handleInningsEnd = (reason: string) => {
    console.log('Innings ended:', reason, 'Current innings:', currentInnings);
    
    if (currentInnings === 1) {
      // Start 2nd innings
      setCurrentInnings(2);
      setCurrentOver(0);
      setCurrentBallInOver(0);
      
      // Reset players for 2nd innings
      setCurrentBatsmen([
        { id: '', name: '', team_id: '', runs: 0, balls: 0, fours: 0, sixes: 0 },
        { id: '', name: '', team_id: '', runs: 0, balls: 0, fours: 0, sixes: 0 }
      ]);
      setCurrentBowler(null);
      setStrikeBatsmanIndex(0);
      
      // Initialize 2nd innings team data
      const updatedTeamInnings = [...teamInnings];
      updatedTeamInnings[1] = {
        teamId: battingFirstTeam === 2 ? selectedMatch?.team1_id || '' : selectedMatch?.team2_id || '',
        teamName: battingFirstTeam === 2 ? selectedMatch?.team1_name || '' : selectedMatch?.team2_name || '',
        totalRuns: 0,
        totalWickets: 0,
        overs: 0,
        balls: 0,
        extras: { wides: 0, noballs: 0, byes: 0, legbyes: 0 }
      };
      setTeamInnings(updatedTeamInnings);
      
      toast({
        title: "1st Innings Complete!",
        description: `${teamInnings[0].teamName} scored ${teamInnings[0].totalRuns}/${teamInnings[0].totalWickets}. Starting 2nd innings.`,
      });
    } else {
      // Match completed
      setMatchEnded(true);
      toast({
        title: "Match Complete!",
        description: "Both innings completed. Match ended.",
      });
    }
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
    setCurrentOver(0);
    setCurrentBallInOver(0);
    
    // Initialize team innings based on who bats first
    setTeamInnings([
      {
        teamId: battingFirstTeam === 1 ? selectedMatch?.team1_id || '' : selectedMatch?.team2_id || '',
        teamName: battingFirstTeam === 1 ? selectedMatch?.team1_name || '' : selectedMatch?.team2_name || '',
        totalRuns: 0,
        totalWickets: 0,
        overs: 0,
        balls: 0,
        extras: { wides: 0, noballs: 0, byes: 0, legbyes: 0 }
      },
      {
        teamId: battingFirstTeam === 2 ? selectedMatch?.team1_id || '' : selectedMatch?.team2_id || '',
        teamName: battingFirstTeam === 2 ? selectedMatch?.team1_name || '' : selectedMatch?.team2_name || '',
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

  const getCurrentBattingTeamId = () => {
    if (currentInnings === 1) {
      return battingFirstTeam === 1 ? selectedMatch?.team1_id || '' : selectedMatch?.team2_id || '';
    } else {
      return battingFirstTeam === 1 ? selectedMatch?.team2_id || '' : selectedMatch?.team1_id || '';
    }
  };

  const getCurrentBowlingTeamId = () => {
    if (currentInnings === 1) {
      return battingFirstTeam === 1 ? selectedMatch?.team2_id || '' : selectedMatch?.team1_id || '';
    } else {
      return battingFirstTeam === 1 ? selectedMatch?.team1_id || '' : selectedMatch?.team2_id || '';
    }
  };

  const handleNewBatsman = (newBatsman: any) => {
    const updatedBatsmen = [...currentBatsmen];
    updatedBatsmen[strikeBatsmanIndex] = newBatsman;
    setCurrentBatsmen(updatedBatsmen);
    setShowNewBatsmanModal(false);
    setWicketDetails(null);
    
    toast({
      title: "New Batsman",
      description: `${newBatsman.name} is now batting`,
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
            battingTeam={battingFirstTeam}
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
        const battingTeamPlayers = battingFirstTeam === 1 ? team1Players : team2Players;
        const bowlingTeamPlayers = battingFirstTeam === 1 ? team2Players : team1Players;
        
        // Fix the team assignment based on current innings
        const currentBattingTeamPlayers = currentInnings === 1 ? 
          (battingFirstTeam === 1 ? team1Players : team2Players) :
          (battingFirstTeam === 1 ? team2Players : team1Players);
          
        const currentBowlingTeamPlayers = currentInnings === 1 ? 
          (battingFirstTeam === 1 ? team2Players : team1Players) :
          (battingFirstTeam === 1 ? team1Players : team2Players);

        return (
          <>
            <ScoringRuleEngine
              currentOver={currentOver}
              currentBall={currentBallInOver}
              totalOvers={matchSetup?.overs || 20}
              powerplayOvers={matchSetup?.powerplayOvers || 6}
              wickets={teamInnings[currentInnings - 1]?.totalWickets || 0}
              totalPlayers={11}
              onBowlerChangeRequired={() => setShowBowlerChangeModal(true)}
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
                      battingTeamId={getCurrentBattingTeamId()}
                      bowlingTeamId={getCurrentBowlingTeamId()}
                      onUpdateBatsman={handleUpdateBatsman}
                      onUpdateBowler={handleUpdateBowler}
                    />
                    
                    <ScoringControls
                      onScore={handleScore}
                      onWicket={() => setShowWicketModal(true)}
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
                  <div className="text-center py-8 bg-card/50 rounded-lg border border-primary/30">
                    <h2 className="text-3xl font-bold text-success mb-4">Match Ended</h2>
                    <div className="space-y-2 text-foreground">
                      <p className="text-lg">
                        <strong>{teamInnings[0]?.teamName}:</strong> {teamInnings[0]?.totalRuns}/{teamInnings[0]?.totalWickets} 
                        ({formatOvers(teamInnings[0]?.overs || 0, teamInnings[0]?.balls || 0)} overs)
                      </p>
                      <p className="text-lg">
                        <strong>{teamInnings[1]?.teamName}:</strong> {teamInnings[1]?.totalRuns}/{teamInnings[1]?.totalWickets} 
                        ({formatOvers(teamInnings[1]?.overs || 0, teamInnings[1]?.balls || 0)} overs)
                      </p>
                      {teamInnings[1] && teamInnings[0] && (
                        <div className="mt-4 p-4 bg-success/10 border border-success/30 rounded">
                          <p className="text-success font-semibold text-lg">
                            {teamInnings[1].totalRuns > teamInnings[0].totalRuns 
                              ? `${teamInnings[1].teamName} won by ${10 - teamInnings[1].totalWickets} wickets`
                              : teamInnings[0].totalRuns > teamInnings[1].totalRuns
                              ? `${teamInnings[0].teamName} won by ${teamInnings[0].totalRuns - teamInnings[1].totalRuns} runs`
                              : "Match Tied"
                            }
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </ScoringRuleEngine>

            {/* Modals */}
            <BowlerChangeModal
              open={showBowlerChangeModal}
              onClose={() => setShowBowlerChangeModal(false)}
              onBowlerSelect={handleBowlerChange}
              bowlingTeamPlayers={currentBowlingTeamPlayers}
              currentBowler={currentBowler}
              currentOver={currentOver}
            />

            <NewBatsmanModal
              open={showNewBatsmanModal}
              onClose={() => {
                setShowNewBatsmanModal(false);
                setWicketDetails(null);
              }}
              onBatsmanSelect={handleNewBatsman}
              battingTeamPlayers={currentBattingTeamPlayers}
              currentBatsmen={currentBatsmen}
              wicketDetails={wicketDetails}
            />

            <WicketSelector
              open={showWicketModal}
              onClose={() => setShowWicketModal(false)}
              onWicketSelect={handleWicketSelect}
              fieldingPlayers={currentBowlingTeamPlayers}
              currentBowler={currentBowler}
              currentBatsman={currentBatsmen[strikeBatsmanIndex]}
            />
          </>
        );
        
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Card className="m-4 neon-card border-primary/30">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-3xl font-bold text-primary">Live Cricket Scoring</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="border-primary/30 text-accent">
              <Clock className="mr-2 h-4 w-4" />
              {selectedMatch ? `${selectedMatch.team1_name} vs ${selectedMatch.team2_name}` : 'No Match Selected'}
            </Badge>
            {currentStep === 'scoring' && (
              <Badge variant="outline" className="border-warning text-warning">
                Innings {currentInnings} {matchEnded ? '(Match Ended)' : ''}
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
