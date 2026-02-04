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
import { notificationService } from "@/services/notificationService";
import { useScoringSound } from "@/hooks/useScoringSound";
import { scoringPersistenceService } from "@/services/scoringPersistenceService";
import { useConfetti } from "@/hooks/useConfetti";
import { OfflineSyncIndicator } from "./OfflineSyncIndicator";

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
  const [recentWickets, setRecentWickets] = useState<any[]>([]);
  const [currentOverBalls, setCurrentOverBalls] = useState<Array<{ runs: number; isWicket: boolean; isExtra: boolean; extraType?: string }>>([]);
  const [lastBallAction, setLastBallAction] = useState<{
    batsmen: Player[];
    bowler: Player | null;
    teamInnings: TeamInnings[];
    currentBallInOver: number;
    currentOver: number;
    currentOverBalls: Array<{ runs: number; isWicket: boolean; isExtra: boolean; extraType?: string }>;
    strikeBatsmanIndex: number;
  } | null>(null);

  // Scoring sounds
  const { playSound } = useScoringSound();
  
  // Confetti for milestones
  const { celebrateMilestone } = useConfetti();

  // Initialize notification service
  useEffect(() => {
    notificationService.initialize().catch(() => {});
  }, []);

  // Realtime subscription for match updates
  useRealtimeMatch(selectedMatch?.id || null, (update) => {
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
        toast({
          title: "Error",
          description: `Failed to fetch players for team ${teamNumber}`,
          variant: "destructive"
        });
        return;
      }

      const validPlayers = (data || []).filter(validatePlayer);
      
      if (teamNumber === 1) {
        setTeam1Players(validPlayers);
      } else {
        setTeam2Players(validPlayers);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to fetch players for team ${teamNumber}`,
        variant: "destructive"
      });
    }
  };

  const handleMatchSelect = async (match: Match) => {
    setSelectedMatch(match);
    
    // Check if match is already in progress (has ball-by-ball data)
    try {
      const { data: existingBalls, error: ballsError } = await supabase
        .from('ball_by_ball')
        .select('*')
        .eq('match_id', match.id)
        .order('innings')
        .order('over_number')
        .order('ball_number');

      if (ballsError) throw ballsError;

      // If match has existing data, restore the state
      if (existingBalls && existingBalls.length > 0) {
        console.log('Restoring match state from', existingBalls.length, 'balls');
        await restoreMatchState(match, existingBalls);
        return;
      }
    } catch (error) {
      console.error('Error checking existing match data:', error);
    }

    // No existing data, start fresh with toss
    setCurrentStep('toss');
  };

  const restoreMatchState = async (match: Match, balls: any[]) => {
    try {
      // Fetch match stats for player data
      const { data: stats, error: statsError } = await supabase
        .from('match_stats')
        .select('*, player:players(id, name, role, team_id)')
        .eq('match_id', match.id);

      if (statsError) throw statsError;

      // Fetch full match details to get toss info
      const { data: matchDetails, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .eq('id', match.id)
        .single();

      if (matchError) throw matchError;

      // Determine current innings
      const innings1Balls = balls.filter(b => b.innings === 1);
      const innings2Balls = balls.filter(b => b.innings === 2);
      const restoredInnings = innings2Balls.length > 0 ? 2 : 1;
      const currentBalls = restoredInnings === 2 ? innings2Balls : innings1Balls;

      // Calculate innings data
      const calculateInningsData = (inningsBalls: any[]) => {
        const runs = inningsBalls.reduce((sum, ball) => sum + (ball.runs || 0) + (ball.extras || 0), 0);
        const wickets = inningsBalls.filter(b => b.is_wicket).length;
        const totalBalls = inningsBalls.filter(b => !b.extra_type || (b.extra_type !== 'wides' && b.extra_type !== 'noballs')).length;
        const overs = Math.floor(totalBalls / 6);
        const ballsInOver = totalBalls % 6;
        const extras = {
          wides: inningsBalls.filter(b => b.extra_type === 'wides').reduce((sum, b) => sum + (b.extras || 1), 0),
          noballs: inningsBalls.filter(b => b.extra_type === 'noballs').reduce((sum, b) => sum + (b.extras || 1), 0),
          byes: inningsBalls.filter(b => b.extra_type === 'byes').reduce((sum, b) => sum + (b.extras || 0), 0),
          legbyes: inningsBalls.filter(b => b.extra_type === 'legbyes').reduce((sum, b) => sum + (b.extras || 0), 0),
        };
        return { runs, wickets, overs, ballsInOver, extras };
      };

      const innings1Data = calculateInningsData(innings1Balls);
      const innings2Data = calculateInningsData(innings2Balls);

      // Restore team innings
      const restoredTeamInnings: TeamInnings[] = [
        {
          teamId: match.team1_id,
          teamName: match.team1_name,
          totalRuns: innings1Data.runs,
          totalWickets: innings1Data.wickets,
          overs: innings1Data.overs,
          balls: innings1Data.ballsInOver,
          extras: innings1Data.extras
        },
        {
          teamId: match.team2_id,
          teamName: match.team2_name,
          totalRuns: innings2Data.runs,
          totalWickets: innings2Data.wickets,
          overs: innings2Data.overs,
          balls: innings2Data.ballsInOver,
          extras: innings2Data.extras
        }
      ];

      // Determine which team is batting based on toss
      const tossWinner = matchDetails.toss_winner;
      const tossDecision = matchDetails.toss_decision;
      let battingFirst = 1;
      
      if (tossWinner && tossDecision) {
        const tossWinnerIsTeam1 = tossWinner === match.team1_id || tossWinner === match.team1_name;
        if (tossDecision === 'bat') {
          battingFirst = tossWinnerIsTeam1 ? 1 : 2;
        } else {
          battingFirst = tossWinnerIsTeam1 ? 2 : 1;
        }
      }

      // Get current batsmen from stats (not dismissed in current innings)
      const currentInningsStats = stats?.filter(s => 
        s.innings === restoredInnings && 
        (s.balls_faced || 0) > 0 && 
        !s.dismissal_type
      ) || [];
      
      currentInningsStats.sort((a: any, b: any) => (b.balls_faced || 0) - (a.balls_faced || 0));
      
      const restoredBatsmen = currentInningsStats.slice(0, 2).map((s: any) => ({
        id: s.player_id,
        name: s.player?.name || 'Unknown',
        team_id: s.player?.team_id || '',
        runs: s.runs_scored || 0,
        balls: s.balls_faced || 0,
        fours: s.fours || 0,
        sixes: s.sixes || 0,
        isOut: false
      }));

      // Get current bowler (most recent bowler from current innings)
      const bowlingStats = stats?.filter(s => 
        s.innings === restoredInnings && 
        (s.overs_bowled || 0) > 0
      ) || [];
      
      bowlingStats.sort((a: any, b: any) => (b.overs_bowled || 0) - (a.overs_bowled || 0));
      
      const restoredBowler = bowlingStats.length > 0 ? {
        id: bowlingStats[0].player_id,
        name: bowlingStats[0].player?.name || 'Unknown',
        team_id: bowlingStats[0].player?.team_id || '',
        overs: bowlingStats[0].overs_bowled || 0,
        runs: bowlingStats[0].runs_conceded || 0,
        wickets: bowlingStats[0].wickets_taken || 0
      } : null;

      // Current over balls
      const currentOverData = restoredInnings === 2 ? innings2Data : innings1Data;
      const lastCompletedOver = currentOverData.overs;
      const currentOverBallsFromDb = currentBalls.filter(b => 
        b.over_number === lastCompletedOver && 
        (!b.extra_type || (b.extra_type !== 'wides' && b.extra_type !== 'noballs'))
      );
      
      const restoredCurrentOverBalls = currentOverBallsFromDb.map((b: any) => ({
        runs: b.runs || 0,
        isWicket: b.is_wicket || false,
        isExtra: !!b.extra_type,
        extraType: b.extra_type
      }));

      // Set all restored state
      setTossWinnerTeamId(tossWinner || '');
      setTossDecision(tossDecision || '');
      setBattingFirstTeam(battingFirst);
      setCurrentInnings(restoredInnings);
      setCurrentOver(currentOverData.overs);
      setCurrentBallInOver(currentOverData.ballsInOver);
      setTeamInnings(restoredTeamInnings);
      setCurrentOverBalls(restoredCurrentOverBalls);
      
      if (restoredBatsmen.length === 2) {
        setCurrentBatsmen(restoredBatsmen);
      } else if (restoredBatsmen.length === 1) {
        setCurrentBatsmen([
          restoredBatsmen[0],
          { id: '', name: '', team_id: '', runs: 0, balls: 0, fours: 0, sixes: 0 }
        ]);
      }
      
      if (restoredBowler) {
        setCurrentBowler(restoredBowler);
      }

      // Set match setup defaults
      setMatchSetup({
        overs: match.overs || 20,
        ballsPerOver: 6,
        powerplayOvers: match.overs === 50 ? 10 : 6,
        drsReviews: 2,
        wideRuns: 1,
        noBallRuns: 1
      });

      toast({
        title: "Match Resumed",
        description: `Continuing from ${currentOverData.overs}.${currentOverData.ballsInOver} overs`,
      });

      // Go directly to scoring
      setCurrentStep('scoring');
      
    } catch (error) {
      console.error('Error restoring match state:', error);
      toast({
        title: "Error",
        description: "Failed to restore match state. Starting fresh.",
        variant: "destructive"
      });
      setCurrentStep('toss');
    }
  };

  const handleTossComplete = (winnerTeamId: string, decision: string) => {
    setTossWinnerTeamId(winnerTeamId);
    setTossDecision(decision);
    
    // Determine which team bats first based on toss decision
    const tossWinnerTeam = winnerTeamId === selectedMatch?.team1_id ? 1 : 2;
    const battingFirst = (decision === 'bat') ? tossWinnerTeam : (tossWinnerTeam === 1 ? 2 : 1);
    
    setBattingFirstTeam(battingFirst);
    setCurrentStep('player-selection');
  };

  const handlePlayersSelected = (batsmen: Player[], bowler: Player) => {
    
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
      handleInningsEnd('all_out');
      return true;
    }

    // Check if target is achieved in 2nd innings
    if (currentInnings === 2 && teamInnings[0]) {
      const target = teamInnings[0].totalRuns + 1;
      if (currentTeamScore.totalRuns >= target) {
        handleInningsEnd('target_achieved');
        return true;
      }
    }
    
    // Check if overs are completed (checked last to allow target achievement first)
    if (currentOver >= totalOvers) {
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
    
    // Save state for undo
    setLastBallAction({
      batsmen: currentBatsmen.map(b => ({ ...b })),
      bowler: currentBowler ? { ...currentBowler } : null,
      teamInnings: teamInnings.map(t => ({ ...t, extras: { ...t.extras } })),
      currentBallInOver,
      currentOver,
      currentOverBalls: [...currentOverBalls],
      strikeBatsmanIndex,
    });
    
    const updatedBatsmen = [...currentBatsmen];
    const previousScore = { ...updatedBatsmen[strikeBatsmanIndex] };
    
    updatedBatsmen[strikeBatsmanIndex].runs += runs;
    updatedBatsmen[strikeBatsmanIndex].balls += 1;
    
    if (runs === 4) {
      updatedBatsmen[strikeBatsmanIndex].fours += 1;
      playSound('four');
    } else if (runs === 6) {
      updatedBatsmen[strikeBatsmanIndex].sixes += 1;
      playSound('six');
    } else if (runs > 0) {
      playSound('run');
    }
    
    setCurrentBatsmen(updatedBatsmen);

    // Check for milestones and send notifications
    const milestone = notificationService.detectMilestone(
      updatedBatsmen[strikeBatsmanIndex],
      selectedMatch?.id || '',
      previousScore
    );
    
    if (milestone) {
      const settings = JSON.parse(localStorage.getItem('notification_settings') || '{}');
      const shouldNotify = 
        (milestone.type === 'century' && settings.century !== false) ||
        (milestone.type === 'half_century' && settings.halfCentury !== false);
      
      if (shouldNotify) {
        notificationService.sendLocalNotification(milestone);
      }
      
      // Trigger confetti celebration for milestones
      if (milestone.type === 'century' || milestone.type === 'half_century') {
        celebrateMilestone(milestone.type);
      }
    }

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

    // Save ball to database for realtime updates
    if (selectedMatch && currentBatsmen[strikeBatsmanIndex]?.id && currentBowler?.id) {
      scoringPersistenceService.saveBall({
        matchId: selectedMatch.id,
        innings: currentInnings,
        overNumber: currentOver,
        ballNumber: currentBallInOver,
        batsmanId: currentBatsmen[strikeBatsmanIndex].id,
        bowlerId: currentBowler.id,
        runs: runs,
        extras: 0,
        isWicket: false
      });

      // Update batsman stats
      scoringPersistenceService.upsertPlayerStats({
        matchId: selectedMatch.id,
        playerId: currentBatsmen[strikeBatsmanIndex].id,
        innings: currentInnings,
        runsScored: updatedBatsmen[strikeBatsmanIndex].runs,
        ballsFaced: updatedBatsmen[strikeBatsmanIndex].balls,
        fours: updatedBatsmen[strikeBatsmanIndex].fours,
        sixes: updatedBatsmen[strikeBatsmanIndex].sixes
      });

      // Update bowler stats
      scoringPersistenceService.upsertPlayerStats({
        matchId: selectedMatch.id,
        playerId: currentBowler.id,
        innings: currentInnings,
        oversBowled: (currentOver * 6 + currentBallInOver + 1) / 6,
        runsConceded: (currentBowler.runs || 0) + runs,
        wicketsTaken: currentBowler.wickets || 0
      });
    }

    // Track ball in current over
    setCurrentOverBalls(prev => [...prev, { runs, isWicket: false, isExtra: false }]);

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
    
    // Save state for undo
    setLastBallAction({
      batsmen: currentBatsmen.map(b => ({ ...b })),
      bowler: currentBowler ? { ...currentBowler } : null,
      teamInnings: teamInnings.map(t => ({ ...t, extras: { ...t.extras } })),
      currentBallInOver,
      currentOver,
      currentOverBalls: [...currentOverBalls],
      strikeBatsmanIndex,
    });

    // Play wicket sound
    playSound('wicket');

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
      const previousBowlerStats = { ...currentBowler };
      const updatedBowler = { ...currentBowler };
      updatedBowler.wickets = (updatedBowler.wickets || 0) + 1;
      setCurrentBowler(updatedBowler);
      
      // Track wicket for hat-trick detection
      const wicketData = {
        bowler_id: currentBowler.id,
        bowler_name: currentBowler.name,
        over_number: currentOver,
        ball_number: currentBallInOver,
        match_id: selectedMatch?.id,
      };
      
      const updatedRecentWickets = [...recentWickets, wicketData].slice(-5);
      setRecentWickets(updatedRecentWickets);
      
      // Check for hat-trick
      const hatTrick = notificationService.detectHatTrick(updatedRecentWickets);
      if (hatTrick) {
        const settings = JSON.parse(localStorage.getItem('notification_settings') || '{}');
        if (settings.hatTrick !== false) {
          notificationService.sendLocalNotification(hatTrick);
        }
      }
      
      // Check for 5-wicket milestone
      const fiveWicketMilestone = notificationService.detectMilestone(
        updatedBowler,
        selectedMatch?.id || '',
        previousBowlerStats
      );
      
      if (fiveWicketMilestone) {
        const settings = JSON.parse(localStorage.getItem('notification_settings') || '{}');
        if (settings.fiveWickets !== false) {
          notificationService.sendLocalNotification(fiveWicketMilestone);
        }
      }
    }

    // Save wicket ball to database for realtime updates
    if (selectedMatch && dismissedBatsman?.id && currentBowler?.id) {
      scoringPersistenceService.saveBall({
        matchId: selectedMatch.id,
        innings: currentInnings,
        overNumber: currentOver,
        ballNumber: currentBallInOver,
        batsmanId: dismissedBatsman.id,
        bowlerId: currentBowler.id,
        runs: 0,
        extras: 0,
        isWicket: true,
        wicketType: dismissalType,
        dismissedPlayerId: dismissedBatsman.id
      });

      // Update dismissed batsman stats
      scoringPersistenceService.upsertPlayerStats({
        matchId: selectedMatch.id,
        playerId: dismissedBatsman.id,
        innings: currentInnings,
        runsScored: updatedBatsmen[strikeBatsmanIndex].runs,
        ballsFaced: updatedBatsmen[strikeBatsmanIndex].balls,
        fours: updatedBatsmen[strikeBatsmanIndex].fours,
        sixes: updatedBatsmen[strikeBatsmanIndex].sixes,
        dismissalType: dismissalType
      });

      // Update bowler stats
      scoringPersistenceService.upsertPlayerStats({
        matchId: selectedMatch.id,
        playerId: currentBowler.id,
        innings: currentInnings,
        oversBowled: (currentOver * 6 + currentBallInOver + 1) / 6,
        runsConceded: currentBowler.runs || 0,
        wicketsTaken: (currentBowler.wickets || 0) + 1
      });
    }

    // Track wicket in current over
    setCurrentOverBalls(prev => [...prev, { runs: 0, isWicket: true, isExtra: false }]);

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
    
    // Save state for undo (only for legal deliveries - byes/legbyes)
    if (extraType !== 'wides' && extraType !== 'noballs') {
      setLastBallAction({
        batsmen: currentBatsmen.map(b => ({ ...b })),
        bowler: currentBowler ? { ...currentBowler } : null,
        teamInnings: teamInnings.map(t => ({ ...t, extras: { ...t.extras } })),
        currentBallInOver,
        currentOver,
        currentOverBalls: [...currentOverBalls],
        strikeBatsmanIndex,
      });
    }

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

    // Save extra ball to database for realtime updates
    if (selectedMatch && currentBatsmen[strikeBatsmanIndex]?.id && currentBowler?.id) {
      scoringPersistenceService.saveBall({
        matchId: selectedMatch.id,
        innings: currentInnings,
        overNumber: currentOver,
        ballNumber: currentBallInOver,
        batsmanId: currentBatsmen[strikeBatsmanIndex].id,
        bowlerId: currentBowler.id,
        runs: 0,
        extras: runs,
        extraType: extraType,
        isWicket: false
      });

      // Update bowler stats
      scoringPersistenceService.upsertPlayerStats({
        matchId: selectedMatch.id,
        playerId: currentBowler.id,
        innings: currentInnings,
        runsConceded: (currentBowler.runs || 0) + runs,
        wicketsTaken: currentBowler.wickets || 0
      });
    }

    // Wide and No-ball don't count as legal deliveries
    if (extraType === 'wides' || extraType === 'noballs') {
      // Track extra but don't count as legal delivery (won't show in ball indicator as it's not a legal ball)
    } else {
      // Byes and leg-byes are legal deliveries - track in current over
      setCurrentOverBalls(prev => [...prev, { runs, isWicket: false, isExtra: true, extraType }]);
      
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
    if (currentBowler) {
      const updatedBowler = { ...currentBowler };
      updatedBowler.overs = (updatedBowler.overs || 0) + 1;
      setCurrentBowler(updatedBowler);
    }

    const updatedTeamInnings = [...teamInnings];
    updatedTeamInnings[currentInnings - 1].overs += 1;
    setTeamInnings(updatedTeamInnings);

    // Increment completed overs (currentBallInOver is reset to 0 by the caller)
    setCurrentOver(prev => prev + 1);
    
    // Reset current over balls for new over
    setCurrentOverBalls([]);
    
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

  const handleInningsEnd = async (reason: string) => {
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
      
      // Update match with 1st innings score
      if (selectedMatch?.id) {
        const team1Score = `${teamInnings[0].totalRuns}/${teamInnings[0].totalWickets}`;
        const team1Overs = `${teamInnings[0].overs}.${teamInnings[0].balls}`;
        
        try {
          await supabase
            .from('matches')
            .update({ 
              team1_score: team1Score,
              team1_overs: team1Overs
            })
            .eq('id', selectedMatch.id);
        } catch (error) {
          console.error('Failed to update 1st innings score:', error);
        }
      }
      
      toast({
        title: "1st Innings Complete!",
        description: `${teamInnings[0].teamName} scored ${teamInnings[0].totalRuns}/${teamInnings[0].totalWickets}. Starting 2nd innings.`,
      });
    } else {
      // Match completed
      setMatchEnded(true);
      
      // Calculate winner and margin
      const winningTeam = teamInnings[1].totalRuns > teamInnings[0].totalRuns
        ? teamInnings[1].teamName
        : teamInnings[0].teamName;
      
      const margin = teamInnings[1].totalRuns > teamInnings[0].totalRuns
        ? `by ${10 - teamInnings[1].totalWickets} wickets`
        : `by ${teamInnings[0].totalRuns - teamInnings[1].totalRuns} runs`;
      
      const resultText = `${winningTeam} won ${margin}`;
      
      // Update match status to 'completed' and save final scores
      if (selectedMatch?.id) {
        const team2Score = `${teamInnings[1].totalRuns}/${teamInnings[1].totalWickets}`;
        const team2Overs = `${teamInnings[1].overs}.${teamInnings[1].balls}`;
        
        try {
          await supabase
            .from('matches')
            .update({ 
              status: 'completed',
              team2_score: team2Score,
              team2_overs: team2Overs,
              result: resultText
            })
            .eq('id', selectedMatch.id);
        } catch (error) {
          console.error('Failed to update match result:', error);
        }
      }
      
      // Send match result notification
      const settings = JSON.parse(localStorage.getItem('notification_settings') || '{}');
      if (settings.matchResult !== false) {
        notificationService.sendLocalNotification({
          type: 'match_result',
          player: winningTeam,
          details: `${winningTeam} wins ${margin}!`,
          matchId: selectedMatch?.id || '',
        });
      }
      
      toast({
        title: "Match Complete!",
        description: resultText,
      });
    }
  };

  const handlePowerplayEnd = () => {
    // Powerplay ended - no action needed
  };

  const switchStrike = () => {
    setStrikeBatsmanIndex(prev => (prev === 0 ? 1 : 0));
  };

  const handleUndoLastBall = () => {
    if (!lastBallAction) {
      toast({
        title: "Cannot Undo",
        description: "No action to undo",
        variant: "destructive"
      });
      return;
    }

    // Restore previous state
    setCurrentBatsmen(lastBallAction.batsmen);
    setCurrentBowler(lastBallAction.bowler);
    setTeamInnings(lastBallAction.teamInnings);
    setCurrentBallInOver(lastBallAction.currentBallInOver);
    setCurrentOver(lastBallAction.currentOver);
    setCurrentOverBalls(lastBallAction.currentOverBalls);
    setStrikeBatsmanIndex(lastBallAction.strikeBatsmanIndex);
    
    // Clear the last action so it can't be undone again
    setLastBallAction(null);
    
    toast({
      title: "Undo Successful",
      description: "Last ball has been reverted",
    });
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

  const handleMatchSetupComplete = async (setupData: any) => {
    setMatchSetup(setupData);
    setCurrentStep('scoring');
    
    setCurrentInnings(1);
    setCurrentOver(0);
    setCurrentBallInOver(0);
    
    // Update match status to 'live' in the database
    if (selectedMatch?.id) {
      try {
        await supabase
          .from('matches')
          .update({ 
            status: 'live',
            toss_winner: tossWinnerTeamId === selectedMatch.team1_id ? selectedMatch.team1_name : selectedMatch.team2_name,
            toss_decision: tossDecision
          })
          .eq('id', selectedMatch.id);
      } catch (error) {
        console.error('Failed to update match status:', error);
      }
    }
    
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
                  currentOverBalls={currentOverBalls}
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
                      onUndoLastBall={handleUndoLastBall}
                      isValidToScore={Boolean(currentBatsmen[0]?.id && currentBatsmen[1]?.id && currentBowler?.id)}
                      canUndo={lastBallAction !== null}
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
            <OfflineSyncIndicator />
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
