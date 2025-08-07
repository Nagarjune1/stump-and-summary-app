
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Player {
  id: string;
  name: string;
}

interface NewBatsmanSelectorProps {
  players: Player[];
  currentBatsmen: any[];
  onSelect: (playerId: string) => void;
  wicketInfo?: any;
}

const NewBatsmanSelector = ({ 
  players = [],
  currentBatsmen = [],
  onSelect,
  wicketInfo
}: NewBatsmanSelectorProps) => {
  const [selectedBatsman, setSelectedBatsman] = useState("");

  const handleConfirm = () => {
    if (!selectedBatsman) {
      toast({
        title: "Error",
        description: "Please select a batsman",
        variant: "destructive"
      });
      return;
    }

    onSelect(selectedBatsman);
    setSelectedBatsman("");
  };

  // Filter out players who are already batting and ensure valid IDs
  const availablePlayers = players.filter(player => 
    player && 
    player.id && 
    String(player.id).trim() !== '' &&
    !currentBatsmen.some(batsman => batsman.id === player.id)
  );

  console.log('NewBatsmanSelector: Available players:', availablePlayers.length);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            New Batsman Required
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Next Batsman</label>
            <Select value={selectedBatsman} onValueChange={setSelectedBatsman}>
              <SelectTrigger>
                <SelectValue placeholder="Select next batsman" />
              </SelectTrigger>
              <SelectContent>
                {availablePlayers.length === 0 ? (
                  <SelectItem value="no-players-available">No players available</SelectItem>
                ) : (
                  availablePlayers.map((player) => {
                    // Ensure we always have a valid, non-empty value
                    const playerValue = player.id || `fallback_player_${Date.now()}_${Math.random()}`;
                    
                    console.log('NewBatsmanSelector: Rendering player option:', { 
                      originalId: player.id,
                      value: playerValue,
                      name: player.name
                    });
                    
                    return (
                      <SelectItem key={player.id} value={playerValue}>
                        {player.name}
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700">
          <Users className="w-4 h-4 mr-2" />
          Confirm Selection
        </Button>
      </div>
    </div>
  );
};

export default NewBatsmanSelector;
