
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { UserPlus, Save, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Team {
  id: string;
  name: string;
}

const PlayerManagement = ({ currentMatch, onPlayerAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    role: "",
    team_id: "",
    batting_style: "",
    bowling_style: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentMatch) {
      fetchMatchTeams();
    }
  }, [currentMatch]);

  const fetchMatchTeams = async () => {
    if (!currentMatch) return;
    
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .in('id', [currentMatch.team1_id, currentMatch.team2_id]);
      
      if (error) {
        console.error('Error fetching teams:', error);
        toast({
          title: "Error",
          description: "Failed to fetch teams",
          variant: "destructive"
        });
        return;
      }
      
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
      toast({
        title: "Error",
        description: "Failed to fetch teams",
        variant: "destructive"
      });
    }
  };

  const handleAddPlayer = async () => {
    if (!newPlayer.name || !newPlayer.role || !newPlayer.team_id) {
      toast({
        title: "Error",
        description: "Please fill all required fields (Name, Role, Team)",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('players')
        .insert([{
          name: newPlayer.name,
          role: newPlayer.role,
          team_id: newPlayer.team_id,
          batting_style: newPlayer.batting_style || null,
          bowling_style: newPlayer.bowling_style || null
        }])
        .select('*');

      if (error) {
        console.error('Error adding player:', error);
        toast({
          title: "Error",
          description: `Failed to add player: ${error.message}`,
          variant: "destructive"
        });
        return;
      }

      if (!data || data.length === 0) {
        toast({
          title: "Error",
          description: "No player data returned",
          variant: "destructive"
        });
        return;
      }

      const teamName = teams.find(t => t.id === newPlayer.team_id)?.name;
      
      toast({
        title: "Player Added!",
        description: `${newPlayer.name} has been added to ${teamName}`,
      });

      if (onPlayerAdded && data[0]) {
        onPlayerAdded(data[0]);
      }

      // Reset form
      setNewPlayer({
        name: "",
        role: "",
        team_id: "",
        batting_style: "",
        bowling_style: ""
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Error adding player:', error);
      toast({
        title: "Error",
        description: "Failed to add player",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setNewPlayer({
      name: "",
      role: "",
      team_id: "",
      batting_style: "",
      bowling_style: ""
    });
    setIsOpen(false);
  };

  if (!currentMatch) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Add Player
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Player</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="playerName">Player Name *</Label>
            <Input
              id="playerName"
              value={newPlayer.name}
              onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
              placeholder="Enter player name"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="team">Team *</Label>
            <Select 
              onValueChange={(value) => setNewPlayer({...newPlayer, team_id: value})}
              disabled={loading}
              value={newPlayer.team_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="role">Role *</Label>
            <Select 
              onValueChange={(value) => setNewPlayer({...newPlayer, role: value})}
              disabled={loading}
              value={newPlayer.role}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Batsman">Batsman</SelectItem>
                <SelectItem value="Bowler">Bowler</SelectItem>
                <SelectItem value="All-rounder">All-rounder</SelectItem>
                <SelectItem value="Wicket-keeper">Wicket-keeper</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="battingStyle">Batting Style</Label>
              <Select 
                onValueChange={(value) => setNewPlayer({...newPlayer, batting_style: value})}
                disabled={loading}
                value={newPlayer.batting_style}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Right-handed">Right-handed</SelectItem>
                  <SelectItem value="Left-handed">Left-handed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="bowlingStyle">Bowling Style</Label>
              <Select 
                onValueChange={(value) => setNewPlayer({...newPlayer, bowling_style: value})}
                disabled={loading}
                value={newPlayer.bowling_style}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Right-arm fast">Right-arm fast</SelectItem>
                  <SelectItem value="Left-arm fast">Left-arm fast</SelectItem>
                  <SelectItem value="Right-arm medium">Right-arm medium</SelectItem>
                  <SelectItem value="Left-arm medium">Left-arm medium</SelectItem>
                  <SelectItem value="Right-arm spin">Right-arm spin</SelectItem>
                  <SelectItem value="Left-arm spin">Left-arm spin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={loading}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleAddPlayer} 
              className="bg-green-600 hover:bg-green-700"
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Adding...' : 'Add Player'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerManagement;
