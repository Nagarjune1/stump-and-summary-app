
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { guaranteedNonEmptyValue } from "@/utils/selectUtils";

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
    { value: "bowled", label: "Bowled" },
    { value: "caught", label: "Caught" },
    { value: "lbw", label: "LBW" },
    { value: "run_out", label: "Run Out" },
    { value: "stumped", label: "Stumped" },
    { value: "hit_wicket", label: "Hit Wicket" }
  ];

  // Filter and validate fielding players more strictly
  const validFieldingPlayers = fieldingPlayers.filter(p => 
    p && 
    p.id && 
    String(p.id).trim() !== '' &&
    p.name && 
    String(p.name).trim() !== ''
  );

  console.log('WicketSelector: Valid fielding players:', validFieldingPlayers.length);

  const handleConfirm = () => {
    if (!dismissalType || dismissalType.startsWith('fallback')) return;

    let dismissalText = dismissalType;
    
    if (dismissalType === "caught" && fielder && !fielder.startsWith('fallback') && !fielder.startsWith('no_players')) {
      const fielderName = fieldingPlayers.find(p => p.id === fielder)?.name || fielder;
      dismissalText = `caught by ${fielderName}`;
    } else if (dismissalType === "run_out" && fielder && !fielder.startsWith('fallback') && !fielder.startsWith('no_players')) {
      const fielderName = fieldingPlayers.find(p => p.id === fielder)?.name || fielder;
      dismissalText = `run out by ${fielderName}`;
    } else if (dismissalType === "stumped" && fielder && !fielder.startsWith('fallback') && !fielder.startsWith('no_players')) {
      const fielderName = fieldingPlayers.find(p => p.id === fielder)?.name || fielder;
      dismissalText = `stumped by ${fielderName}`;
    }

    onWicketSelect(dismissalText);
    handleClose();
  };

  const needsFielder = ["caught", "run_out", "stumped"].includes(dismissalType);

  const handleClose = () => {
    setDismissalType("");
    setFielder("");
    setBowler(currentBowler?.id ? String(currentBowler.id) : "");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Wicket</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="dismissal-type">Dismissal Type</Label>
            <Select value={dismissalType} onValueChange={setDismissalType}>
              <SelectTrigger>
                <SelectValue placeholder="Select dismissal type" />
              </SelectTrigger>
              <SelectContent>
                {dismissalTypes.map((type, index) => {
                  const safeValue = guaranteedNonEmptyValue(type.value, `dismissal_${index}`);
                  
                  return (
                    <SelectItem 
                      key={`dismissal_${index}_${type.value}`} 
                      value={safeValue}
                    >
                      {type.label}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {needsFielder && (
            <div>
              <Label htmlFor="fielder">
                {dismissalType === "caught" ? "Caught by" : 
                 dismissalType === "stumped" ? "Stumped by" : "Run out by"}
              </Label>
              <Select value={fielder} onValueChange={setFielder}>
                <SelectTrigger>
                  <SelectValue placeholder="Select fielder" />
                </SelectTrigger>
                <SelectContent>
                  {validFieldingPlayers.length === 0 ? (
                    <SelectItem value={guaranteedNonEmptyValue('no-fielders-available', 'no_fielders')}>
                      No fielders available
                    </SelectItem>
                  ) : (
                    validFieldingPlayers.map((player, index) => {
                      const safeId = guaranteedNonEmptyValue(player.id, `fielder_${index}`);
                      
                      return (
                        <SelectItem 
                          key={`fielder_${index}_${player.id}`} 
                          value={safeId}
                        >
                          {player.name}
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!dismissalType || dismissalType.startsWith('fallback') || (needsFielder && (!fielder || fielder.startsWith('fallback') || fielder.startsWith('no_players')))}
              className="flex-1"
            >
              Confirm Wicket
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WicketSelector;
