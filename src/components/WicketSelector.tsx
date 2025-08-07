
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import SafeSelectItem from "@/components/ui/SafeSelectItem";
import { Label } from "@/components/ui/label";
import { createSafeSelectOptions, ensureValidSelectItemValue } from "@/utils/selectUtils";

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

  // Use safe validation for fielding players with more robust filtering
  const validFieldingPlayers = createSafeSelectOptions(
    fieldingPlayers.filter(p => p && p.id && String(p.id).trim() && p.name && String(p.name).trim()), 
    'fielder'
  );

  console.log('WicketSelector: Valid fielding players:', validFieldingPlayers.length);

  const handleConfirm = () => {
    if (!dismissalType) return;

    let dismissalText = dismissalType;
    
    if (dismissalType === "caught" && fielder) {
      const fielderName = fieldingPlayers.find(p => p.id === fielder)?.name || fielder;
      dismissalText = `caught by ${fielderName}`;
    } else if (dismissalType === "run_out" && fielder) {
      const fielderName = fieldingPlayers.find(p => p.id === fielder)?.name || fielder;
      dismissalText = `run out by ${fielderName}`;
    } else if (dismissalType === "stumped" && fielder) {
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
                {dismissalTypes.map((type) => {
                  const safeValue = ensureValidSelectItemValue(type.value, `dismissal_${type.value}_${Date.now()}`);
                  
                  // Skip if somehow still empty
                  if (!safeValue || safeValue.trim() === '') {
                    console.error('WicketSelector: Skipping dismissal type with empty value:', type);
                    return null;
                  }
                  
                  return (
                    <SafeSelectItem 
                      key={type.value} 
                      value={safeValue}
                    >
                      {type.label}
                    </SafeSelectItem>
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
                  {validFieldingPlayers.map((player, index) => {
                    const safeId = ensureValidSelectItemValue(player.id, `fielder_${index}_${Date.now()}`);
                    
                    // Skip if somehow still empty
                    if (!safeId || safeId.trim() === '') {
                      console.error('WicketSelector: Skipping fielder with empty value:', player);
                      return null;
                    }
                    
                    return (
                      <SafeSelectItem 
                        key={safeId} 
                        value={safeId}
                      >
                        {player.name}
                      </SafeSelectItem>
                    );
                  })}
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
              disabled={!dismissalType || (needsFielder && !fielder)}
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
