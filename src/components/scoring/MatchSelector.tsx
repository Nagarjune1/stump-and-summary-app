
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import SafeSelectItem from "@/components/ui/SafeSelectItem";
import { Target } from "lucide-react";
import { ensureValidSelectItemValue } from "@/utils/selectUtils";

interface Match {
  id: string;
  team1?: { name: string };
  team2?: { name: string };
  match_date: string;
}

interface MatchSelectorProps {
  matches: Match[];
  selectedMatchId: string;
  onMatchSelect: (matchId: string) => void;
}

const MatchSelector = ({ matches, selectedMatchId, onMatchSelect }: MatchSelectorProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Select Match
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedMatchId} onValueChange={onMatchSelect}>
          <SelectTrigger>
            <SelectValue placeholder="Select a match to score" />
          </SelectTrigger>
          <SelectContent>
            {matches.map((match) => (
              <SafeSelectItem key={match.id} value={ensureValidSelectItemValue(match.id)}>
                {match.team1?.name || 'Team 1'} vs {match.team2?.name || 'Team 2'} - {new Date(match.match_date).toLocaleDateString()}
              </SafeSelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default MatchSelector;
