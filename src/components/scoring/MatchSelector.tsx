
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Target, Play, RotateCcw, Loader2, Users, Clock } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { guaranteedNonEmptyValue } from '@/utils/selectUtils';

interface Match {
  id: string;
  team1_id: string;
  team2_id: string;
  team1_name: string;
  team2_name: string;
  match_date: string;
  venue: string;
  overs: number;
  status?: string;
}

interface MatchProgress {
  innings1Score: number;
  innings1Wickets: number;
  innings1Overs: string;
  innings2Score: number;
  innings2Wickets: number;
  innings2Overs: string;
  currentInnings: number;
  currentBatsmen: { name: string; runs: number; balls: number }[];
  currentBowler: { name: string; overs: number; runs: number; wickets: number } | null;
  ballCount: number;
}

interface MatchWithProgress extends Match {
  hasProgress: boolean;
  ballCount?: number;
  currentScore?: string;
  progress?: MatchProgress;
}

interface MatchSelectorProps {
  onMatchSelect: (match: Match) => void;
}

const MatchSelector = ({ onMatchSelect }: MatchSelectorProps) => {
  const [matches, setMatches] = useState<MatchWithProgress[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [selectedMatch, setSelectedMatch] = useState<MatchWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [showResumeDialog, setShowResumeDialog] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!team1_id(name),
          team2:teams!team2_id(name)
        `)
        .eq('created_by', user.id)
        .in('status', ['upcoming', 'live'])
        .order('match_date');

      if (error) throw error;
      
      const transformedMatches: MatchWithProgress[] = (data || [])
        .map(match => ({
          ...match,
          team1_name: match.team1?.name || 'Team 1',
          team2_name: match.team2?.name || 'Team 2',
          hasProgress: false
        }))
        .filter(match => 
          match.id && 
          String(match.id).trim() !== '' && 
          match.team1_name && 
          match.team2_name
        );
      
      // Check for existing progress on each match
      const matchesWithProgress = await Promise.all(
        transformedMatches.map(async (match) => {
          const { count, error: countError } = await supabase
            .from('ball_by_ball')
            .select('*', { count: 'exact', head: true })
            .eq('match_id', match.id);
          
          if (!countError && count && count > 0) {
            const { data: balls } = await supabase
              .from('ball_by_ball')
              .select('innings, runs, extras, is_wicket, extra_type')
              .eq('match_id', match.id);
            
            const innings1 = balls?.filter(b => b.innings === 1) || [];
            const innings2 = balls?.filter(b => b.innings === 2) || [];
            
            const score1 = innings1.reduce((sum, b) => sum + (b.runs || 0) + (b.extras || 0), 0);
            const wickets1 = innings1.filter(b => b.is_wicket).length;
            const score2 = innings2.reduce((sum, b) => sum + (b.runs || 0) + (b.extras || 0), 0);
            const wickets2 = innings2.filter(b => b.is_wicket).length;
            
            const currentScore = innings2.length > 0 
              ? `${score1}/${wickets1} • ${score2}/${wickets2}`
              : `${score1}/${wickets1}`;
            
            return {
              ...match,
              hasProgress: true,
              ballCount: count,
              currentScore
            };
          }
          return match;
        })
      );
      
      setMatches(matchesWithProgress);
    } catch (error) {
      // Error handled silently
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedProgress = async (match: MatchWithProgress): Promise<MatchProgress | null> => {
    try {
      const { data: balls } = await supabase
        .from('ball_by_ball')
        .select('innings, runs, extras, is_wicket, extra_type')
        .eq('match_id', match.id);
      
      if (!balls || balls.length === 0) return null;

      const innings1 = balls.filter(b => b.innings === 1);
      const innings2 = balls.filter(b => b.innings === 2);
      
      const calculateInningsData = (inningsBalls: any[]) => {
        const runs = inningsBalls.reduce((sum, b) => sum + (b.runs || 0) + (b.extras || 0), 0);
        const wickets = inningsBalls.filter(b => b.is_wicket).length;
        const legalBalls = inningsBalls.filter(b => !b.extra_type || (b.extra_type !== 'wides' && b.extra_type !== 'noballs')).length;
        const overs = Math.floor(legalBalls / 6);
        const ballsInOver = legalBalls % 6;
        return { runs, wickets, overs: `${overs}.${ballsInOver}` };
      };

      const innings1Data = calculateInningsData(innings1);
      const innings2Data = calculateInningsData(innings2);
      const currentInnings = innings2.length > 0 ? 2 : 1;

      // Fetch current batsmen
      const { data: stats } = await supabase
        .from('match_stats')
        .select('*, player:players(id, name)')
        .eq('match_id', match.id)
        .eq('innings', currentInnings);

      const currentBatsmen = (stats || [])
        .filter(s => (s.balls_faced || 0) > 0 && !s.dismissal_type)
        .sort((a, b) => (b.balls_faced || 0) - (a.balls_faced || 0))
        .slice(0, 2)
        .map(s => ({
          name: s.player?.name || 'Unknown',
          runs: s.runs_scored || 0,
          balls: s.balls_faced || 0
        }));

      const bowlingStats = (stats || [])
        .filter(s => (s.overs_bowled || 0) > 0)
        .sort((a, b) => (b.overs_bowled || 0) - (a.overs_bowled || 0));

      const currentBowler = bowlingStats.length > 0 ? {
        name: bowlingStats[0].player?.name || 'Unknown',
        overs: bowlingStats[0].overs_bowled || 0,
        runs: bowlingStats[0].runs_conceded || 0,
        wickets: bowlingStats[0].wickets_taken || 0
      } : null;

      return {
        innings1Score: innings1Data.runs,
        innings1Wickets: innings1Data.wickets,
        innings1Overs: innings1Data.overs,
        innings2Score: innings2Data.runs,
        innings2Wickets: innings2Data.wickets,
        innings2Overs: innings2Data.overs,
        currentInnings,
        currentBatsmen,
        currentBowler,
        ballCount: balls.length
      };
    } catch (error) {
      console.error('Error fetching progress:', error);
      return null;
    }
  };

  const handleMatchChange = async (matchId: string) => {
    if (!matchId || matchId.startsWith('no-matches') || matchId.startsWith('fallback')) {
      return;
    }
    
    setSelectedMatchId(matchId);
    const match = matches.find(m => m.id === matchId);
    
    if (match) {
      setSelectedMatch(match);
    }
  };

  const handleStartMatch = () => {
    if (selectedMatch) {
      onMatchSelect(selectedMatch);
    }
  };

  const handleResumeClick = async () => {
    if (!selectedMatch) return;
    
    setLoadingProgress(true);
    const progress = await fetchDetailedProgress(selectedMatch);
    
    if (progress) {
      setSelectedMatch({ ...selectedMatch, progress });
    }
    
    setLoadingProgress(false);
    setShowResumeDialog(true);
  };

  const handleConfirmResume = () => {
    setShowResumeDialog(false);
    if (selectedMatch) {
      onMatchSelect(selectedMatch);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <p>Loading matches...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Select Match
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedMatchId} onValueChange={handleMatchChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select a match to score" />
            </SelectTrigger>
            <SelectContent>
              {matches.length === 0 ? (
                <SelectItem value={guaranteedNonEmptyValue('no-matches-available', 'no_matches')}>
                  No matches available
                </SelectItem>
              ) : (
                matches.map((match, index) => {
                  const matchValue = guaranteedNonEmptyValue(match.id, `match_${index}`);
                  
                  return (
                    <SelectItem key={`match_${index}_${match.id}`} value={matchValue}>
                      <div className="flex items-center gap-2">
                        <span>{match.team1_name} vs {match.team2_name}</span>
                        {match.hasProgress && (
                          <Badge variant="secondary" className="text-xs">
                            In Progress
                          </Badge>
                        )}
                      </div>
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>

          {selectedMatch && (
            <div className="space-y-4 pt-2">
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium">
                    {selectedMatch.team1_name} vs {selectedMatch.team2_name}
                  </span>
                  {selectedMatch.hasProgress && (
                    <Badge variant="default" className="bg-primary">
                      In Progress
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{new Date(selectedMatch.match_date).toLocaleDateString()} • {selectedMatch.venue}</p>
                  <p>{selectedMatch.overs} Overs</p>
                </div>
                {selectedMatch.hasProgress && selectedMatch.currentScore && (
                  <div className="pt-2 border-t border-border mt-2">
                    <p className="text-sm font-medium">Current Score: {selectedMatch.currentScore}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedMatch.ballCount} balls recorded
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                {selectedMatch.hasProgress ? (
                  <Button 
                    onClick={handleResumeClick} 
                    className="flex-1 gap-2"
                    size="lg"
                    disabled={loadingProgress}
                  >
                    {loadingProgress ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RotateCcw className="w-4 h-4" />
                    )}
                    Resume Match
                  </Button>
                ) : (
                  <Button 
                    onClick={handleStartMatch} 
                    className="flex-1 gap-2"
                    size="lg"
                  >
                    <Play className="w-4 h-4" />
                    Start Scoring
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resume Confirmation Dialog */}
      <Dialog open={showResumeDialog} onOpenChange={setShowResumeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5" />
              Resume Match
            </DialogTitle>
            <DialogDescription>
              The following match state will be restored:
            </DialogDescription>
          </DialogHeader>
          
          {selectedMatch?.progress && (
            <div className="space-y-4">
              {/* Score Summary */}
              <div className="p-4 rounded-lg bg-muted space-y-3">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-1">{selectedMatch.team1_name}</p>
                  <p className="text-2xl font-bold">
                    {selectedMatch.progress.innings1Score}/{selectedMatch.progress.innings1Wickets}
                    <span className="text-sm font-normal text-muted-foreground ml-2">
                      ({selectedMatch.progress.innings1Overs} ov)
                    </span>
                  </p>
                </div>
                
                {selectedMatch.progress.currentInnings === 2 && (
                  <div className="text-center border-t border-border pt-3">
                    <p className="text-sm text-muted-foreground mb-1">{selectedMatch.team2_name}</p>
                    <p className="text-2xl font-bold">
                      {selectedMatch.progress.innings2Score}/{selectedMatch.progress.innings2Wickets}
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        ({selectedMatch.progress.innings2Overs} ov)
                      </span>
                    </p>
                  </div>
                )}
              </div>

              {/* Current Batsmen */}
              {selectedMatch.progress.currentBatsmen.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Users className="w-4 h-4" />
                    Batsmen on Crease
                  </div>
                  <div className="grid gap-2">
                    {selectedMatch.progress.currentBatsmen.map((batsman, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2 rounded bg-muted/50">
                        <span>{batsman.name}</span>
                        <span className="font-medium">
                          {batsman.runs} ({batsman.balls})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Bowler */}
              {selectedMatch.progress.currentBowler && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Target className="w-4 h-4" />
                    Current Bowler
                  </div>
                  <div className="flex justify-between items-center p-2 rounded bg-muted/50">
                    <span>{selectedMatch.progress.currentBowler.name}</span>
                    <span className="font-medium">
                      {selectedMatch.progress.currentBowler.wickets}-{selectedMatch.progress.currentBowler.runs} ({selectedMatch.progress.currentBowler.overs} ov)
                    </span>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {selectedMatch.progress.ballCount} balls recorded • Innings {selectedMatch.progress.currentInnings}
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setShowResumeDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmResume} className="gap-2">
              <Play className="w-4 h-4" />
              Continue Match
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MatchSelector;
