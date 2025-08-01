
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
  team1Players = [], 
  team2Players = [],
  onMomSelected 
}) => {
  const [selectedMom, setSelectedMom] = useState("");
  const [selectedMos, setSelectedMos] = useState("");
  
  // More robust validation for players
  const isValidPlayer = (player) => {
    if (!player) {
      console.log('Invalid player: null/undefined');
      return false;
    }
    
    const hasValidId = player.id !== null && 
                      player.id !== undefined && 
                      String(player.id).trim() !== '';
    
    const hasValidName = player.name && 
                        String(player.name).trim() !== '';
    
    if (!hasValidId) {
      console.log('Invalid player ID:', player);
    }
    
    if (!hasValidName) {
      console.log('Invalid player name:', player);
    }
    
    return hasValidId && hasValidName;
  };

  const validTeam1Players = team1Players.filter(isValidPlayer);
  const validTeam2Players = team2Players.filter(isValidPlayer);
  const allPlayers = [...validTeam1Players, ...validTeam2Players];

  console.log('Valid players for MoM selection:', allPlayers);

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
          ...(matchData?.series_id && selectedMos ? { man_of_series: selectedMos } : {})
        })
        .eq('id', matchData.id);

      if (error) throw error;

      const momPlayer = allPlayers.find(p => String(p.id) === selectedMom);
      const mosPlayer = selectedMos ? allPlayers.find(p => String(p.id) === selectedMos) : null;

      toast({
        title: "Awards Selected!",
        description: `Man of the Match: ${momPlayer?.name || 'Unknown'}${mosPlayer ? `, Man of the Series: ${mosPlayer.name}` : ''}`,
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

  if (!matchData || allPlayers.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Select Awards
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-gray-500">No valid players available for selection</p>
          </div>
          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

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
                  {allPlayers.map((player) => {
                    const playerId = String(player.id);
                    const teamName = String(player.team_id) === String(matchData.team1_id) 
                      ? matchData.team1?.name || 'Team 1' 
                      : matchData.team2?.name || 'Team 2';
                    
                    console.log('Rendering MoM player with ID:', playerId);
                    
                    return (
                      <SelectItem key={playerId} value={playerId}>
                        {player.name} ({teamName})
                      </SelectItem>
                    );
                  })}
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
                    {allPlayers.map((player) => {
                      const playerId = String(player.id);
                      const teamName = String(player.team_id) === String(matchData.team1_id) 
                        ? matchData.team1?.name || 'Team 1' 
                        : matchData.team2?.name || 'Team 2';
                      
                      console.log('Rendering MoS player with ID:', playerId);
                      
                      return (
                        <SelectItem key={playerId} value={playerId}>
                          {player.name} ({teamName})
                        </SelectItem>
                      );
                    })}
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
