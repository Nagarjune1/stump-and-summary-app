
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const TossSelector = ({ 
  match,
  onTossComplete 
}: {
  match: any;
  onTossComplete: (tossWinner: string, tossDecision: string) => void;
}) => {
  const [tossWinner, setTossWinner] = useState("");
  const [decision, setDecision] = useState("");

  const handleTossComplete = () => {
    if (!tossWinner || !decision) return;
    onTossComplete(tossWinner, decision);
  };

  if (!match) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Toss</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Toss Winner</label>
          <Select value={tossWinner} onValueChange={setTossWinner}>
            <SelectTrigger>
              <SelectValue placeholder="Select toss winner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={match.team1?.name || 'Team 1'}>{match.team1?.name || 'Team 1'}</SelectItem>
              <SelectItem value={match.team2?.name || 'Team 2'}>{match.team2?.name || 'Team 2'}</SelectItem>
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
          <Button 
            onClick={handleTossComplete}
            disabled={!tossWinner || !decision}
            className="bg-green-600 hover:bg-green-700"
          >
            Confirm Toss
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TossSelector;
