
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const TossSelector = ({ 
  match,
  onTossComplete 
}: {
  match: any;
  onTossComplete: (tossWinner: string, tossDecision: string) => void;
}) => {
  const [tossWinner, setTossWinner] = useState("");
  const [decision, setDecision] = useState("");

  const handleTossComplete = async () => {
    if (!tossWinner || !decision) {
      toast({
        title: "Error",
        description: "Please select both toss winner and decision",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Updating match with toss details:', { tossWinner, decision });
      
      const { error } = await supabase
        .from('matches')
        .update({
          toss_winner: tossWinner,
          toss_decision: decision
        })
        .eq('id', match.id);

      if (error) {
        console.error('Error updating toss:', error);
        toast({
          title: "Error",
          description: "Failed to complete toss",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Toss Completed!",
        description: `${tossWinner} won the toss and chose to ${decision}`,
      });

      onTossComplete(tossWinner, decision);
    } catch (error) {
      console.error('Error completing toss:', error);
      toast({
        title: "Error",
        description: "Failed to complete toss",
        variant: "destructive"
      });
    }
  };

  if (!match) return null;

  // Ensure team names are not empty
  const team1Name = match.team1?.name || 'Team 1';
  const team2Name = match.team2?.name || 'Team 2';

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
