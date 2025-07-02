
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const ManOfMatchSelector = ({ 
  open, 
  onClose, 
  matchData, 
  team1Players, 
  team2Players,
  onMomSelected 
}) => {
  const [selectedMom, setSelectedMom] = useState("");
  const [selectedMos, setSelectedMos] = useState("");
  
  const allPlayers = [...team1Players, ...team2Players];

  const handleSaveMom = async () => {
    if (!selectedMom) {
      toast({
        title: "Error",
        description: "Please select Man of the Match",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('matches')
        .update({ 
          man_of_match: selectedMom,
          ...(matchData.series_id && selectedMos ? { man_of_series: selectedMos } : {})
        })
        .eq('id', matchData.id);

      if (error) throw error;

      const momPlayer = allPlayers.find(p => p.id === selectedMom);
      const mosPlayer = selectedMos ? allPlayers.find(p => p.id === selectedMos) : null;

      toast({
        title: "Awards Selected!",
        description: `Man of the Match: ${momPlayer?.name}${mosPlayer ? `, Man of the Series: ${mosPlayer.name}` : ''}`,
      });

      onMomSelected(momPlayer, mosPlayer);
      onClose();
    } catch (error) {
      console.error('Error saving awards:', error);
      toast({
        title: "Error",
        description: "Failed to save awards",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-600" />
            Select Awards
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Man of the Match</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedMom} onValueChange={setSelectedMom}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Man of the Match" />
                </SelectTrigger>
                <SelectContent>
                  {allPlayers.map((player) => (
                    <SelectItem key={player.id} value={player.id}>
                      {player.name} ({player.team_id === matchData.team1_id ? matchData.team1?.name : matchData.team2?.name})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {matchData.series_id && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Man of the Series</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedMos} onValueChange={setSelectedMos}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Man of the Series (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {allPlayers.map((player) => (
                      <SelectItem key={player.id} value={player.id}>
                        {player.name} ({player.team_id === matchData.team1_id ? matchData.team1?.name : matchData.team2?.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSaveMom} className="bg-yellow-600 hover:bg-yellow-700">
              <Trophy className="w-4 h-4 mr-2" />
              Save Awards
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManOfMatchSelector;
