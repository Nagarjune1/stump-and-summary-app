
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { createSafeSelectOptions } from "@/utils/selectUtils";

const WicketSelector = ({ 
  open, 
  onClose, 
  onWicketSelect,
  fieldingPlayers = [],
  currentBowler,
  currentBatsman
}) => {
  const [dismissalType, setDismissalType] = useState("");
  const [fielder, setFielder] = useState("");
  const [bowler, setBowler] = useState(currentBowler?.id ? String(currentBowler.id) : "");

  const dismissalTypes = [
    "bowled",
    "caught",
    "lbw",
    "run out",
    "stumped",
    "hit wicket",
    "retired hurt",
    "obstructing the field"
  ];

  const handleWicketConfirm = () => {
    if (!dismissalType) {
      toast({
        title: "Error",
        description: "Please select dismissal type",
        variant: "destructive"
      });
      return;
    }

    let dismissalText = dismissalType;
    
    if (dismissalType === "caught" && fielder && bowler) {
      const fielderName = validFieldingPlayers.find(p => p.id === fielder)?.name || "unknown";
      const bowlerName = validFieldingPlayers.find(p => p.id === bowler)?.name || currentBowler?.name || "unknown";
      dismissalText = `c ${fielderName} b ${bowlerName}`;
    } else if (dismissalType === "bowled" && bowler) {
      const bowlerName = validFieldingPlayers.find(p => p.id === bowler)?.name || currentBowler?.name || "unknown";
      dismissalText = `b ${bowlerName}`;
    } else if (dismissalType === "lbw" && bowler) {
      const bowlerName = validFieldingPlayers.find(p => p.id === bowler)?.name || currentBowler?.name || "unknown";
      dismissalText = `lbw b ${bowlerName}`;
    } else if (dismissalType === "stumped" && fielder && bowler) {
      const fielderName = validFieldingPlayers.find(p => p.id === fielder)?.name || "unknown";
      const bowlerName = validFieldingPlayers.find(p => p.id === bowler)?.name || currentBowler?.name || "unknown";
      dismissalText = `st ${fielderName} b ${bowlerName}`;
    } else if (dismissalType === "run out" && fielder) {
      const fielderName = validFieldingPlayers.find(p => p.id === fielder)?.name || "unknown";
      dismissalText = `run out (${fielderName})`;
    }

    onWicketSelect(dismissalText);
    handleClose();
  };

  const handleClose = () => {
    setDismissalType("");
    setFielder("");
    setBowler(currentBowler?.id ? String(currentBowler.id) : "");
    onClose();
  };

  const needsFielder = ["caught", "stumped", "run out"].includes(dismissalType);
  const needsBowler = ["caught", "bowled", "lbw", "stumped"].includes(dismissalType);

  // Use safe validation for fielding players
  const validFieldingPlayers = createSafeSelectOptions(fieldingPlayers, 'fielder');
  console.log('WicketSelector: Valid fielding players:', validFieldingPlayers.length);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Wicket Details - {currentBatsman?.name || 'Unknown Batsman'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">How was the batsman dismissed?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Dismissal Type</label>
                <Select value={dismissalType} onValueChange={setDismissalType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select dismissal type" />
                  </SelectTrigger>
                  <SelectContent>
                    {dismissalTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {needsFielder && validFieldingPlayers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {dismissalType === "caught" ? "Caught by" : 
                     dismissalType === "stumped" ? "Stumped by" : "Run out by"}
                  </label>
                  <Select value={fielder} onValueChange={setFielder}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select fielder" />
                    </SelectTrigger>
                    <SelectContent>
                      {validFieldingPlayers.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {needsBowler && dismissalType !== "run out" && validFieldingPlayers.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">Bowler</label>
                  <Select value={bowler} onValueChange={setBowler}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bowler" />
                    </SelectTrigger>
                    <SelectContent>
                      {validFieldingPlayers.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleWicketConfirm} className="bg-red-600 hover:bg-red-700">
              <Target className="w-4 h-4 mr-2" />
              Confirm Wicket
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WicketSelector;
