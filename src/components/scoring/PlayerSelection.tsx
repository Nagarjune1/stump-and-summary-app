
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import SafeSelectItem from "@/components/ui/SafeSelectItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { ensureValidSelectItemValue } from "@/utils/selectUtils";

interface Player {
  id: string;
  name: string;
  runs?: number;
  balls?: number;
  fours?: number;
  sixes?: number;
  overs?: number;
  wickets?: number;
}

interface PlayerSelectionProps {
  currentBatsmen: Player[];
  currentBowler: Player;
  players: Player[];
  strikeBatsmanIndex: number;
  onUpdateBatsman: (index: number, field: string, value: string) => void;
  onUpdateBowler: (field: string, value: string) => void;
}

const PlayerSelection = ({
  currentBatsmen,
  currentBowler,
  players,
  strikeBatsmanIndex,
  onUpdateBatsman,
  onUpdateBowler
}: PlayerSelectionProps) => {
  console.log('PlayerSelection: Rendering with players:', players.length);

  // Filter players to ensure they have valid IDs
  const validPlayers = players.filter(player => player && player.id && player.name);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Current Players
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Batsmen */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentBatsmen.map((batsman, index) => (
            <div key={index} className="space-y-2">
              <Label>Batsman {index + 1} {index === strikeBatsmanIndex ? '(Strike)' : ''}</Label>
              <Select 
                value={batsman.id || ""} 
                onValueChange={(value) => {
                  if (value) {
                    onUpdateBatsman(index, 'id', value);
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select batsman" />
                </SelectTrigger>
                <SelectContent>
                  {validPlayers.map((player) => {
                    const safePlayerId = ensureValidSelectItemValue(player.id);
                    console.log('PlayerSelection: Rendering batsman option:', { 
                      originalId: player.id,
                      safeId: safePlayerId,
                      name: player.name
                    });
                    
                    return (
                      <SafeSelectItem key={player.id} value={safePlayerId}>
                        {player.name}
                      </SafeSelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {batsman.name && (
                <div className="text-sm text-gray-600">
                  {batsman.runs || 0} ({batsman.balls || 0}b) • {batsman.fours || 0}×4, {batsman.sixes || 0}×6
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bowler */}
        <div className="space-y-2">
          <Label>Current Bowler</Label>
          <Select 
            value={currentBowler?.id || ""} 
            onValueChange={(value) => {
              if (value) {
                onUpdateBowler('id', value);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select bowler" />
            </SelectTrigger>
            <SelectContent>
              {validPlayers.map((player) => {
                const safePlayerId = ensureValidSelectItemValue(player.id);
                console.log('PlayerSelection: Rendering bowler option:', { 
                  originalId: player.id,
                  safeId: safePlayerId,
                  name: player.name
                });
                
                return (
                  <SafeSelectItem key={player.id} value={safePlayerId}>
                    {player.name}
                  </SafeSelectItem>
                );
              })}
            </SelectContent>
          </Select>
          {currentBowler?.name && (
            <div className="text-sm text-gray-600">
              {(currentBowler.overs || 0).toFixed(1)}-{currentBowler.runs || 0}-{currentBowler.wickets || 0}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerSelection;
