
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const BowlerSelector = ({ 
  open, 
  onClose, 
  bowlingPlayers, 
  onBowlerSelect,
  currentOver 
}) => {
  const [selectedBowler, setSelectedBowler] = useState("");
  
  const handleBowlerSelect = () => {
    if (!selectedBowler) {
      toast({
        title: "Error",
        description: "Please select a bowler for the next over",
        variant: "destructive"
      });
      return;
    }

    const bowler = bowlingPlayers.find(p => p.id === selectedBowler);
    if (!bowler) return;

    const bowlerWithStats = {
      ...bowler,
      overs: 0,
      runs: 0,
      wickets: 0
    };

    onBowlerSelect(bowlerWithStats);
    onClose();
    setSelectedBowler("");

    toast({
      title: "Bowler Selected!",
      description: `${bowler.name} will bowl over ${currentOver + 1}`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Select Bowler for Over {currentOver + 1}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Bowlers</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedBowler} onValueChange={setSelectedBowler}>
                <SelectTrigger>
                  <SelectValue placeholder="Select bowler for next over" />
                </SelectTrigger>
                <SelectContent>
                  {bowlingPlayers.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name} ({player.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleBowlerSelect} className="bg-blue-600 hover:bg-blue-700">
              <Target className="w-4 h-4 mr-2" />
              Confirm Bowler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BowlerSelector;
