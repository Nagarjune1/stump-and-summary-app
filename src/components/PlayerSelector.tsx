
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Target } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createSafeSelectOptions, ensureValidSelectItemValue } from "@/utils/selectUtils";

const PlayerSelector = ({ 
  match, 
  onPlayersSelected, 
  battingTeam = 1,
  team1Players = [],
  team2Players = []
}) => {
  const [selectedBatsmen, setSelectedBatsmen] = useState([]);
  const [selectedBowler, setSelectedBowler] = useState(null);

  // Use safe validation for players with proper filtering
  const validTeam1Players = createSafeSelectOptions(
    team1Players.filter(p => p && p.id && p.name), 
    'team1_player'
  );
  const validTeam2Players = createSafeSelectOptions(
    team2Players.filter(p => p && p.id && p.name), 
    'team2_player'
  );

  console.log('PlayerSelector: Valid players:', {
    team1Count: validTeam1Players.length,
    team2Count: validTeam2Players.length
  });

  const battingPlayers = battingTeam === 1 ? validTeam1Players : validTeam2Players;
  const bowlingPlayers = battingTeam === 1 ? validTeam2Players : validTeam1Players;
  const battingTeamName = battingTeam === 1 ? match?.team1?.name || 'Team 1' : match?.team2?.name || 'Team 2';
  const bowlingTeamName = battingTeam === 1 ? match?.team2?.name || 'Team 2' : match?.team1?.name || 'Team 1';

  const handleBatsmanSelect = (player) => {
    if (selectedBatsmen.find(b => b.id === player.id)) {
      setSelectedBatsmen(prev => prev.filter(b => b.id !== player.id));
    } else if (selectedBatsmen.length < 2) {
      setSelectedBatsmen(prev => [...prev, player]);
    } else {
      toast({
        title: "Maximum Batsmen Selected",
        description: "You can only select 2 opening batsmen",
        variant: "destructive"
      });
    }
  };

  const handleBowlerSelect = (player) => {
    setSelectedBowler(player);
  };

  const handleConfirm = () => {
    if (selectedBatsmen.length !== 2) {
      toast({
        title: "Select Opening Batsmen",
        description: "Please select exactly 2 opening batsmen",
        variant: "destructive"
      });
      return;
    }

    if (!selectedBowler) {
      toast({
        title: "Select Opening Bowler",
        description: "Please select the opening bowler",
        variant: "destructive"
      });
      return;
    }

    onPlayersSelected(selectedBatsmen, selectedBowler);
  };

  // Early return if match data is invalid
  if (!match) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No match data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold mb-2">Select Opening Players</h3>
        <p className="text-gray-600">
          {battingTeamName} will bat first, {bowlingTeamName} will bowl first
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Batting Team Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              {battingTeamName} - Opening Batsmen
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">
                Selected: {selectedBatsmen.length}/2
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {battingPlayers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No valid players available</p>
            ) : (
              battingPlayers.map((player) => {
                // Ensure player ID is valid for any potential SelectItem usage
                const safePlayerId = ensureValidSelectItemValue(player.id, `batsman_${player.name}_${Date.now()}`);
                
                return (
                  <div
                    key={safePlayerId}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedBatsmen.find(b => b.id === player.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleBatsmanSelect(player)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{player.name}</h4>
                        <p className="text-sm text-gray-600">
                          {player.batting_style || 'Right-handed'} • {player.role || 'Batsman'}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">Avg: {player.average || '0.00'}</div>
                        <div className="text-gray-500">SR: {player.strike_rate || '0.00'}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Bowling Team Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {bowlingTeamName} - Opening Bowler
            </CardTitle>
            <div className="flex gap-2">
              <Badge variant="outline">
                Selected: {selectedBowler ? 1 : 0}/1
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {bowlingPlayers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No valid players available</p>
            ) : (
              bowlingPlayers.map((player) => {
                // Ensure player ID is valid for any potential SelectItem usage
                const safePlayerId = ensureValidSelectItemValue(player.id, `bowler_${player.name}_${Date.now()}`);
                
                return (
                  <div
                    key={safePlayerId}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedBowler?.id === player.id
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleBowlerSelect(player)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{player.name}</h4>
                        <p className="text-sm text-gray-600">
                          {player.bowling_style || 'Right-arm Medium'} • {player.role || 'Bowler'}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">Wkts: {player.wickets || 0}</div>
                        <div className="text-gray-500">Eco: {player.economy || '0.00'}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>
      </div>

      {/* Confirmation */}
      <Card>
        <CardContent className="p-4">
          <div className="flex justify-between items-center">
            <div>
              <h4 className="font-medium">Ready to Start?</h4>
              <p className="text-sm text-gray-600">
                Batsmen: {selectedBatsmen.map(b => b.name).join(', ') || 'None selected'}<br/>
                Bowler: {selectedBowler?.name || 'None selected'}
              </p>
            </div>
            <Button 
              onClick={handleConfirm}
              disabled={selectedBatsmen.length !== 2 || !selectedBowler}
              className="bg-green-600 hover:bg-green-700"
            >
              Start Match
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlayerSelector;
