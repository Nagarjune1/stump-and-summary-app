
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Target, Play, RotateCcw, Loader2 } from "lucide-react";
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

interface MatchWithProgress extends Match {
  hasProgress: boolean;
  ballCount?: number;
  currentScore?: string;
}

interface MatchSelectorProps {
  onMatchSelect: (match: Match) => void;
}

const MatchSelector = ({ onMatchSelect }: MatchSelectorProps) => {
  const [matches, setMatches] = useState<MatchWithProgress[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [selectedMatch, setSelectedMatch] = useState<MatchWithProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingProgress, setCheckingProgress] = useState(false);

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
      
      // Transform the data to match our Match interface and filter out invalid matches
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
            // Get current score summary
            const { data: balls } = await supabase
              .from('ball_by_ball')
              .select('innings, runs, extras, is_wicket')
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

  const handleResumeMatch = () => {
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

        {/* Show match details and action buttons when a match is selected */}
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

            {/* Action Buttons */}
            <div className="flex gap-3">
              {selectedMatch.hasProgress ? (
                <Button 
                  onClick={handleResumeMatch} 
                  className="flex-1 gap-2"
                  size="lg"
                >
                  <RotateCcw className="w-4 h-4" />
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
  );
};

export default MatchSelector;
