
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Save, X, Users, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Team {
  id: string;
  name: string;
}

interface Player {
  id: string;
  name: string;
  role: string;
  team_id: string;
  batting_style?: string;
  bowling_style?: string;
  teams?: { name: string };
}

const PlayerManagement = ({ currentMatch, onPlayerAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    role: "",
    team_id: "",
    batting_style: "",
    bowling_style: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeams();
    fetchPlayers();
  }, []);

  useEffect(() => {
    filterPlayers();
  }, [players, searchTerm, selectedTeam]);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('id, name')
        .order('name');
      
      if (error) throw error;
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

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          teams(name)
        `)
        .order('name');
      
      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast({
        title: "Error",
        description: "Failed to fetch players",
        variant: "destructive"
      });
    }
  };

  const filterPlayers = () => {
    let filtered = players;
    
    if (searchTerm) {
      filtered = filtered.filter(player => 
        player.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedTeam !== "all") {
      filtered = filtered.filter(player => player.team_id === selectedTeam);
    }
    
    setFilteredPlayers(filtered);
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

      if (error) throw error;

      if (data && data.length > 0) {
        const teamName = teams.find(t => t.id === newPlayer.team_id)?.name;
        
        toast({
          title: "Player Added!",
          description: `${newPlayer.name} has been added to ${teamName}`,
        });

        if (onPlayerAdded) {
          onPlayerAdded(data[0]);
        }

        // Reset form and refresh players
        setNewPlayer({
          name: "",
          role: "",
          team_id: "",
          batting_style: "",
          bowling_style: ""
        });
        setIsOpen(false);
        fetchPlayers();
      }
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Batsman': return 'bg-blue-100 text-blue-800';
      case 'Bowler': return 'bg-red-100 text-red-800';
      case 'All-rounder': return 'bg-green-100 text-green-800';
      case 'Wicket-keeper': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Player Management
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2 bg-green-600 hover:bg-green-700">
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
                
                <div className="flex justify-end gap-2 pt-4">
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
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="All Teams" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Teams</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Players List */}
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {filteredPlayers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              {players.length === 0 ? "No players found. Add some players to get started!" : "No players match your search."}
            </div>
          ) : (
            filteredPlayers.map((player) => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{player.name}</h4>
                    <Badge className={getRoleColor(player.role)}>
                      {player.role}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    <span>{player.teams?.name}</span>
                    {player.batting_style && (
                      <span className="ml-3">• {player.batting_style}</span>
                    )}
                    {player.bowling_style && (
                      <span className="ml-3">• {player.bowling_style}</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {players.length > 0 && (
          <div className="text-sm text-gray-500 text-center pt-2">
            Showing {filteredPlayers.length} of {players.length} players
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerManagement;
