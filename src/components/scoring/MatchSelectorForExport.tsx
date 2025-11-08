import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { FileText } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { guaranteedNonEmptyValue } from '@/utils/selectUtils';

interface Match {
  id: string;
  team1_name: string;
  team2_name: string;
  match_date: string;
  venue: string;
  status: string;
  result?: string;
}

interface MatchSelectorForExportProps {
  onMatchSelect: (match: Match) => void;
}

const MatchSelectorForExport = ({ onMatchSelect }: MatchSelectorForExportProps) => {
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
        .eq('status', 'completed')
        .order('match_date', { ascending: false });

      if (error) throw error;
      
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
      setSelectedMatchId(matchId);
      onMatchSelect(match);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p>Loading completed matches...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Select Match to Export
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedMatchId} onValueChange={handleMatchSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select a completed match" />
          </SelectTrigger>
          <SelectContent>
            {matches.length === 0 ? (
              <SelectItem value={guaranteedNonEmptyValue('no-matches-available', 'no_matches')}>
                No completed matches available
              </SelectItem>
            ) : (
              matches.map((match, index) => {
                const matchValue = guaranteedNonEmptyValue(match.id, `match_${index}`);
                
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

export default MatchSelectorForExport;
