
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Target } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { ensureValidSelectItemValue } from '@/utils/selectUtils';

interface Match {
  id: string;
  team1_name: string;
  team2_name: string;
  match_date: string;
  venue: string;
  overs: number;
}

interface MatchSelectorProps {
  onMatchSelect: (match: Match) => void;
}

const MatchSelector = ({ onMatchSelect }: MatchSelectorProps) => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!team1_id(name),
          team2:teams!team2_id(name)
        `)
        .eq('status', 'upcoming')
        .order('match_date');

      if (error) throw error;
      
      // Transform the data to match our Match interface and filter out invalid matches
      const transformedMatches = (data || [])
        .map(match => ({
          ...match,
          team1_name: match.team1?.name || 'Team 1',
          team2_name: match.team2?.name || 'Team 2'
        }))
        .filter(match => 
          match.id && 
          String(match.id).trim() !== '' && 
          match.team1_name && 
          match.team2_name
        );
      
      console.log('MatchSelector: Valid matches after filtering:', transformedMatches.length);
      setMatches(transformedMatches);
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMatchSelect = (matchId: string) => {
    if (!matchId || matchId.startsWith('no-matches') || matchId.startsWith('fallback')) {
      return;
    }
    
    const match = matches.find(m => m.id === matchId);
    if (match) {
      onMatchSelect(match);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>Loading matches...</p>
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
      <CardContent>
        <Select value={selectedMatchId} onValueChange={handleMatchSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select a match to score" />
          </SelectTrigger>
          <SelectContent>
            {matches.length === 0 ? (
              <SelectItem value={ensureValidSelectItemValue('no-matches-available', 'no_matches')}>
                No matches available
              </SelectItem>
            ) : (
              matches.map((match, index) => {
                // Ensure we always have a valid, non-empty value
                const matchValue = ensureValidSelectItemValue(match.id, `match_${index}`);
                
                return (
                  <SelectItem key={`match_${index}_${match.id}`} value={matchValue}>
                    {match.team1_name} vs {match.team2_name} - {new Date(match.match_date).toLocaleDateString()}
                  </SelectItem>
                );
              })
            )}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default MatchSelector;
