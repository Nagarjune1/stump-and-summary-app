
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import SafeSelectItem from "@/components/ui/SafeSelectItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ensureValidSelectItemValue } from "@/utils/selectUtils";

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

  // Filter out players who are already batting
  const availablePlayers = players.filter(player => 
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
                {availablePlayers.map((player) => {
                  const safePlayerId = ensureValidSelectItemValue(player.id);
                  console.log('NewBatsmanSelector: Rendering player option:', { 
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
