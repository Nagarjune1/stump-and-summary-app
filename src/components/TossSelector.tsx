
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TossSelector = ({ 
  isOpen, 
  onClose, 
  team1Name, 
  team2Name, 
  onTossComplete 
}: {
  isOpen: boolean;
  onClose: () => void;
  team1Name: string;
  team2Name: string;
  onTossComplete: (tossWinner: string, decision: string, battingFirst: number) => void;
}) => {
  const [tossWinner, setTossWinner] = useState("");
  const [decision, setDecision] = useState("");

  const handleTossComplete = () => {
    if (!tossWinner || !decision) return;
    
    // Determine which team bats first based on toss result
    let battingFirst = 1;
    if (tossWinner === team1Name && decision === "bowl") {
      battingFirst = 2;
    } else if (tossWinner === team2Name && decision === "bat") {
      battingFirst = 2;
    }
    
    onTossComplete(tossWinner, decision, battingFirst);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Toss Result</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Toss Winner</label>
            <Select value={tossWinner} onValueChange={setTossWinner}>
              <SelectTrigger>
                <SelectValue placeholder="Select toss winner" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={team1Name}>{team1Name}</SelectItem>
                <SelectItem value={team2Name}>{team2Name}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Decision</label>
            <Select value={decision} onValueChange={setDecision}>
              <SelectTrigger>
                <SelectValue placeholder="Select decision" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bat">Chose to bat first</SelectItem>
                <SelectItem value="bowl">Chose to bowl first</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleTossComplete}
              disabled={!tossWinner || !decision}
              className="bg-green-600 hover:bg-green-700"
            >
              Confirm Toss
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TossSelector;
