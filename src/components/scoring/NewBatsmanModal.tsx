
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { validatePlayer } from "@/utils/scoringUtils";
import { guaranteedNonEmptyValue } from "@/utils/selectUtils";
import { UserPlus } from "lucide-react";

interface NewBatsmanModalProps {
  open: boolean;
  onClose: () => void;
  onBatsmanSelect: (batsman: any) => void;
  battingTeamPlayers: any[];
  currentBatsmen: any[];
  wicketDetails?: {
    dismissedPlayer: any;
    dismissalType: string;
    fielder?: any;
  };
}

const NewBatsmanModal = ({
  open,
  onClose,
  onBatsmanSelect,
  battingTeamPlayers,
  currentBatsmen,
  wicketDetails
}: NewBatsmanModalProps) => {
  const [selectedBatsmanId, setSelectedBatsmanId] = useState("");

  const availableBatsmen = battingTeamPlayers.filter(player => 
    validatePlayer(player) && 
    !currentBatsmen.some(b => b.id === player.id) &&
    !player.batted // Haven't batted in this innings yet
  );

  const handleConfirm = () => {
    if (!selectedBatsmanId || selectedBatsmanId.startsWith('fallback') || selectedBatsmanId.startsWith('no_players')) {
      return;
    }

    const selectedBatsman = availableBatsmen.find(p => p.id === selectedBatsmanId);
    if (selectedBatsman && validatePlayer(selectedBatsman)) {
      onBatsmanSelect({
        ...selectedBatsman,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        batted: true
      });
      handleClose();
    }
  };

  const handleClose = () => {
    setSelectedBatsmanId("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-card border-primary/30">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <UserPlus className="w-5 h-5" />
            Select New Batsman
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {wicketDetails && (
            <div className="bg-destructive/10 border border-destructive/30 rounded p-3">
              <p className="text-sm text-foreground font-medium">Wicket Fallen!</p>
              <p className="text-sm text-muted-foreground">
                {wicketDetails.dismissedPlayer.name} is out ({wicketDetails.dismissalType})
                {wicketDetails.fielder && ` - ${wicketDetails.fielder.name}`}
              </p>
              <div className="text-xs text-accent mt-1">
                Score: {wicketDetails.dismissedPlayer.runs || 0} ({wicketDetails.dismissedPlayer.balls || 0} balls)
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="batsman-select" className="text-foreground">New Batsman *</Label>
            <Select value={selectedBatsmanId} onValueChange={setSelectedBatsmanId}>
              <SelectTrigger className="border-primary/30 focus:border-primary">
                <SelectValue placeholder="Select new batsman" />
              </SelectTrigger>
              <SelectContent className="bg-card border-primary/30">
                {availableBatsmen.length === 0 ? (
                  <SelectItem value={guaranteedNonEmptyValue('no_batsmen', 'no_batsmen')}>
                    No available batsmen
                  </SelectItem>
                ) : (
                  availableBatsmen.map((player, index) => {
                    const safeValue = guaranteedNonEmptyValue(player.id, `batsman_${index}`);
                    return (
                      <SelectItem key={`batsman_${index}_${player.id}`} value={safeValue}>
                        <div className="flex justify-between items-center w-full">
                          <span className="text-foreground">{player.name}</span>
                          <span className="text-xs text-accent ml-4">
                            {player.role || 'Batsman'} • Avg: {player.average || 0}
                          </span>
                        </div>
                      </SelectItem>
                    );
                  })
                )}
              </SelectContent>
            </Select>
          </div>

          {availableBatsmen.length > 0 && (
            <div className="bg-muted/50 rounded p-2">
              <p className="text-xs text-muted-foreground">
                {availableBatsmen.length} batsmen available
              </p>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} className="border-primary/30 text-foreground">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm}
            disabled={!selectedBatsmanId || selectedBatsmanId.startsWith('fallback') || selectedBatsmanId.startsWith('no_batsmen')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Confirm Batsman
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewBatsmanModal;
