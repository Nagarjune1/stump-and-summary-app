
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const BowlerSelector = ({ 
  open, 
  onClose, 
  onBowlerSelect,
  bowlingPlayers = [],
  currentBowler = null
}) => {
  const [selectedBowler, setSelectedBowler] = useState(null);

  const handleBowlerConfirm = () => {
    if (!selectedBowler) {
      toast({
        title: "Error",
        description: "Please select a bowler",
        variant: "destructive"
      });
      return;
    }

    onBowlerSelect(selectedBowler);
    handleClose();
  };

  const handleClose = () => {
    setSelectedBowler(null);
    onClose();
  };

  // Filter out current bowler to prevent consecutive overs
  const availableBowlers = bowlingPlayers.filter(player => 
    player.id !== currentBowler?.id
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Select Bowler for Next Over
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Bowlers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {availableBowlers.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No bowlers available</p>
              ) : (
                availableBowlers.map((player) => (
                  <div
                    key={player.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedBowler?.id === player.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedBowler(player)}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{player.name}</h4>
                        <p className="text-sm text-gray-600">
                          {player.bowling_style || 'Right-arm Medium'}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium">
                          {player.wickets || 0}/{player.runs || 0}
                        </div>
                        <div className="text-gray-500">
                          {player.overs || 0} Ov
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleBowlerConfirm} 
              className="bg-blue-600 hover:bg-blue-700"
              disabled={!selectedBowler}
            >
              <Users className="w-4 h-4 mr-2" />
              Select Bowler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BowlerSelector;
