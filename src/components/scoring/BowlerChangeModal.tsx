
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { guaranteedNonEmptyValue, validatePlayer } from "@/utils/scoringUtils";
import { Users } from "lucide-react";

interface BowlerChangeModalProps {
  open: boolean;
  onClose: () => void;
  onBowlerSelect: (bowler: any) => void;
  bowlingTeamPlayers: any[];
  currentBowler: any;
  currentOver: number;
}

const BowlerChangeModal = ({
  open,
  onClose,
  onBowlerSelect,
  bowlingTeamPlayers,
  currentBowler,
  currentOver
}: BowlerChangeModalProps) => {
  const [selectedBowlerId, setSelectedBowlerId] = useState("");

  const availableBowlers = bowlingTeamPlayers.filter(player => 
    validatePlayer(player) && player.id !== currentBowler?.id
  );

  const handleConfirm = () => {
    if (!selectedBowlerId || selectedBowlerId.startsWith('fallback') || selectedBowlerId.startsWith('no_players')) {
      return;
    }

    const selectedBowler = availableBowlers.find(p => p.id === selectedBowlerId);
    if (selectedBowler && validatePlayer(selectedBowler)) {
      onBowlerSelect({
        ...selectedBowler,
        overs: selectedBowler.overs || 0,
        runs: selectedBowler.runs || 0,
        wickets: selectedBowler.wickets || 0
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedBowlerId("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary neon-glow">
            <Users className="w-5 h-5" />
            Select New Bowler - Over {currentOver + 1}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-warning/10 border border-warning/30 rounded p-3">
            <p className="text-sm text-foreground">
              Over {currentOver} completed. Please select a new bowler for over {currentOver + 1}.
            </p>
            {currentBowler && (
              <p className="text-xs text-muted-foreground mt-1">
                Previous bowler: {currentBowler.name} ({(currentBowler.overs || 0).toFixed(1)} ov, {currentBowler.runs || 0} runs, {currentBowler.wickets || 0} wickets)
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="bowler-select" className="text-foreground">New Bowler *</Label>
            <Select value={selectedBowlerId} onValueChange={setSelectedBowlerId}>
              <SelectTrigger className="border-primary/30 focus:border-primary">
                <SelectValue placeholder="Select new bowler" />
              </SelectTrigger>
              <SelectContent className="bg-card border-primary/30">
                {availableBowlers.length === 0 ? (
                  <SelectItem value={guaranteedNonEmptyValue('no_bowlers', 'no_bowlers')}>
                    No available bowlers
                  </SelectItem>
                ) : (
                  availableBowlers.map((player, index) => {
                    const safeValue = guaranteedNonEmptyValue(player.id, `bowler_${index}`);
                    return (
                      <SelectItem key={`bowler_${index}_${player.id}`} value={safeValue}>
                        <div className="flex justify-between items-center w-full">
                          <span className="text-foreground">{player.name}</span>
                          <span className="text-xs text-accent ml-4">
                            {(player.overs || 0).toFixed(1)} ov, {player.runs || 0} runs, {player.wickets || 0} wkts
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} className="border-primary/30 text-foreground">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedBowlerId || selectedBowlerId.startsWith('fallback') || selectedBowlerId.startsWith('no_bowlers')}
            className="bg-primary hover:bg-primary/90 neon-glow"
          >
            Confirm Bowler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BowlerChangeModal;
