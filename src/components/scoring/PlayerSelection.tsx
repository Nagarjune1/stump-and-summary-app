
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ensureValidSelectValue, validatePlayer, calculateStrikeRate } from "@/utils/scoringUtils";
import { guaranteedNonEmptyValue } from "@/utils/selectUtils";

interface Player {
  id: string;
  name: string;
  runs?: number;
  balls?: number;
  fours?: number;
  sixes?: number;
  overs?: number;
  wickets?: number;
  team_id: string;
}

interface PlayerSelectionProps {
  currentBatsmen: Player[];
  currentBowler: Player | null;
  players: Player[];
  strikeBatsmanIndex: number;
  currentInnings: number;
  battingTeamId: string;
  bowlingTeamId: string;
  onUpdateBatsman: (index: number, field: string, value: string) => void;
  onUpdateBowler: (field: string, value: string) => void;
}

const PlayerSelection = ({
  currentBatsmen,
  currentBowler,
  players,
  strikeBatsmanIndex,
  currentInnings,
  battingTeamId,
  bowlingTeamId,
  onUpdateBatsman,
  onUpdateBowler
}: PlayerSelectionProps) => {
  // Filter and validate players
  const battingTeamPlayers = players.filter(player => 
    validatePlayer(player) && player.team_id === battingTeamId
  );

  const bowlingTeamPlayers = players.filter(player => 
    validatePlayer(player) && player.team_id === bowlingTeamId
  );

  // Check if mandatory selections are missing
  const isStrikerMissing = !currentBatsmen[strikeBatsmanIndex]?.id;
  const isNonStrikerMissing = !currentBatsmen[strikeBatsmanIndex === 0 ? 1 : 0]?.id;
  const isBowlerMissing = !currentBowler?.id;

  const renderPlayerSelectOptions = (playersList: Player[], fallbackMessage: string, fallbackPrefix: string) => {
    if (playersList.length === 0) {
      return (
        <SelectItem value={guaranteedNonEmptyValue('no-players', fallbackPrefix)}>
          {fallbackMessage}
        </SelectItem>
      );
    }

    return playersList.map((player, index) => {
      const safeValue = guaranteedNonEmptyValue(player.id, `${fallbackPrefix}_${index}`);
      return (
        <SelectItem key={`${fallbackPrefix}_${index}_${player.id}`} value={safeValue}>
          {player.name}
        </SelectItem>
      );
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          Current Players - Innings {currentInnings}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Validation Alerts */}
        {(isStrikerMissing || isNonStrikerMissing || isBowlerMissing) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select: {[
                isStrikerMissing && "Striker",
                isNonStrikerMissing && "Non-striker", 
                isBowlerMissing && "Bowler"
              ].filter(Boolean).join(", ")}
            </AlertDescription>
          </Alert>
        )}

        {/* Batsmen Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentBatsmen.map((batsman, index) => (
            <div key={index} className="space-y-2">
              <Label className={index === strikeBatsmanIndex ? "text-red-600 font-semibold" : ""}>
                Batsman {index + 1} {index === strikeBatsmanIndex ? '(Striker) *' : '(Non-striker) *'}
              </Label>
              <Select 
                value={batsman?.id ? guaranteedNonEmptyValue(batsman.id, `batsman_${index}`) : ""} 
                onValueChange={(value) => {
                  if (value && !value.startsWith('no_players') && !value.startsWith('no-players') && !value.startsWith('fallback')) {
                    onUpdateBatsman(index, 'id', value);
                  }
                }}
              >
                <SelectTrigger className={!batsman?.id ? "border-red-500" : ""}>
                  <SelectValue placeholder={`Select batsman ${index + 1}`} />
                </SelectTrigger>
                <SelectContent>
                  {renderPlayerSelectOptions(battingTeamPlayers, "No batting team players found", `batsman_${index}`)}
                </SelectContent>
              </Select>
              {batsman?.name && (
                <div className="text-sm text-gray-600">
                  {batsman.runs || 0} ({batsman.balls || 0}b) • 
                  {batsman.fours || 0}×4, {batsman.sixes || 0}×6 • 
                  SR: {calculateStrikeRate(batsman.runs || 0, batsman.balls || 0).toFixed(1)}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bowler Selection */}
        <div className="space-y-2">
          <Label className={!currentBowler?.id ? "text-red-600 font-semibold" : ""}>
            Current Bowler *
          </Label>
          <Select 
            value={currentBowler?.id ? guaranteedNonEmptyValue(currentBowler.id, 'bowler') : ""} 
            onValueChange={(value) => {
              if (value && !value.startsWith('no_players') && !value.startsWith('no-players') && !value.startsWith('fallback')) {
                onUpdateBowler('id', value);
              }
            }}
          >
            <SelectTrigger className={!currentBowler?.id ? "border-red-500" : ""}>
              <SelectValue placeholder="Select bowler" />
            </SelectTrigger>
            <SelectContent>
              {renderPlayerSelectOptions(bowlingTeamPlayers, "No bowling team players found", 'bowler')}
            </SelectContent>
          </Select>
          {currentBowler?.name && (
            <div className="text-sm text-gray-600">
              {(currentBowler.overs || 0).toFixed(1)}-{currentBowler.runs || 0}-{currentBowler.wickets || 0}
              {(currentBowler.overs || 0) > 0 && (
                <span> • ECO: {((currentBowler.runs || 0) / (currentBowler.overs || 1)).toFixed(1)}</span>
              )}
            </div>
          )}
        </div>

        {/* Team Info Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-sm">
            <strong>Batting Team Players:</strong> {battingTeamPlayers.length}
          </div>
          <div className="text-sm">
            <strong>Bowling Team Players:</strong> {bowlingTeamPlayers.length}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PlayerSelection;
