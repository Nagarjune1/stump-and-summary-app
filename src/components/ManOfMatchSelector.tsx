
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { createSafeSelectOptions, createSafeSelectValue } from "@/utils/selectUtils";

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
  
  // Create safe player options with proper validation
  const validTeam1Players = createSafeSelectOptions(
    team1Players.filter(p => p && p.id && p.name), 
    'team1_player'
  );
  const validTeam2Players = createSafeSelectOptions(
    team2Players.filter(p => p && p.id && p.name), 
    'team2_player'
  );
  const allValidPlayers = [...validTeam1Players, ...validTeam2Players];

  console.log('ManOfMatchSelector: Processing players for awards:', {
    team1Count: validTeam1Players.length,
    team2Count: validTeam2Players.length,
    totalCount: allValidPlayers.length,
    matchId: matchData?.id
  });

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
      const updateData = { 
        man_of_match: selectedMom
      };

      // Only add man_of_series if it's a series match and MoS is selected
      if (matchData?.series_id && selectedMos) {
        updateData.man_of_series = selectedMos;
      }

      const { error } = await supabase
        .from('matches')
        .update(updateData)
        .eq('id', matchData.id);

      if (error) {
        console.error('Error saving awards:', error);
        throw error;
      }

      const momPlayer = allValidPlayers.find(p => p.id === selectedMom);
      const mosPlayer = selectedMos ? allValidPlayers.find(p => p.id === selectedMos) : null;

      toast({
        title: "Awards Selected!",
        description: `Man of the Match: ${momPlayer?.name || 'Unknown'}${mosPlayer ? `, Man of the Series: ${mosPlayer.name}` : ''}`,
      });

      if (onMomSelected) {
        onMomSelected(momPlayer, mosPlayer);
      }
      
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

  if (!matchData || allValidPlayers.length === 0) {
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
            <p className="text-sm text-gray-400 mt-2">
              Please ensure players are properly configured for both teams
            </p>
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
              <CardTitle className="text-lg">Man of the Match *</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedMom} onValueChange={setSelectedMom}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Man of the Match" />
                </SelectTrigger>
                <SelectContent>
                  {allValidPlayers.map((player) => {
                    const teamName = createSafeSelectValue(
                      player.team_id === String(matchData.team1_id) 
                        ? matchData.team1?.name 
                        : matchData.team2?.name,
                      'Team'
                    );
                    
                    console.log('Rendering MoM option:', { 
                      playerId: player.id, 
                      playerName: player.name, 
                      teamName 
                    });
                    
                    return (
                      <SelectItem key={player.id} value={player.id}>
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
                <p className="text-sm text-gray-600">Optional - for series matches</p>
              </CardHeader>
              <CardContent>
                <Select value={selectedMos} onValueChange={setSelectedMos}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Man of the Series (Optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {allValidPlayers.map((player) => {
                      const teamName = createSafeSelectValue(
                        player.team_id === String(matchData.team1_id) 
                          ? matchData.team1?.name 
                          : matchData.team2?.name,
                        'Team'
                      );
                      
                      console.log('Rendering MoS option:', { 
                        playerId: player.id, 
                        playerName: player.name, 
                        teamName 
                      });
                      
                      return (
                        <SelectItem key={player.id} value={player.id}>
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
            <Button 
              onClick={handleSaveMom} 
              className="bg-yellow-600 hover:bg-yellow-700"
              disabled={!selectedMom}
            >
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
