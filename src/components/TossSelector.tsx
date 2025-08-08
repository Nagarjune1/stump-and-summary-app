
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { guaranteedNonEmptyValue } from "@/utils/selectUtils";

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

  // Create safe team values using the utility function - ensure they're never empty
  const team1Value = guaranteedNonEmptyValue(match.team1?.name || `team1_${match.id}`, 'team1');
  const team2Value = guaranteedNonEmptyValue(match.team2?.name || `team2_${match.id}`, 'team2');

  console.log('TossSelector: Team values:', { team1Value, team2Value });

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
              <SelectItem value={team1Value}>
                {match.team1?.name || 'Team 1'}
              </SelectItem>
              <SelectItem value={team2Value}>
                {match.team2?.name || 'Team 2'}
              </SelectItem>
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
              <SelectItem value={guaranteedNonEmptyValue('bat', 'bat_decision')}>
                Chose to bat first
              </SelectItem>
              <SelectItem value={guaranteedNonEmptyValue('bowl', 'bowl_decision')}>
                Chose to bowl first
              </SelectItem>
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
