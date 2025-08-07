
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Plus, Search, Eye } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PlayerDetailView from "./PlayerDetailView";

interface Team {
  id: string;
  name: string;
  city: string;
}

interface Player {
  id: string;
  name: string;
  role: string;
  team_id: string;
  batting_style?: string;
  bowling_style?: string;
  matches: number;
  runs: number;
  wickets: number;
  average: number;
  strike_rate: number;
  economy?: number;
  best_score: string;
  best_bowling: string;
  photo_url?: string;
  teams?: Team;
}

const PlayerProfiles = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTeam, setSelectedTeam] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    role: "",
    team_id: "",
    batting_style: "",
    bowling_style: ""
  });

  useEffect(() => {
    fetchTeams();
    fetchPlayers();
  }, []);

  useEffect(() => {
    filterPlayers();
  }, [players, searchTerm, selectedTeam, selectedRole]);

  const filterPlayers = () => {
    let filtered = [...players];

    if (searchTerm) {
      filtered = filtered.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedTeam) {
      filtered = filtered.filter(player => player.team_id === selectedTeam);
    }

    if (selectedRole) {
      filtered = filtered.filter(player => player.role === selectedRole);
    }

    setFilteredPlayers(filtered);
  };

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');
      
      if (error) throw error;
      // Filter out teams with invalid IDs
      const validTeams = (data || []).filter(team => team.id && String(team.id).trim() !== '');
      setTeams(validTeams);
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
      setLoading(true);
      const { data, error } = await supabase
        .from('players')
        .select(`
          *,
          teams (
            id,
            name,
            city
          )
        `)
        .order('name');
      
      if (error) throw error;
      
      // Filter out players with invalid data
      const validPlayers = (data || []).filter(player => 
        player.id && String(player.id).trim() !== '' &&
        player.name && String(player.name).trim() !== ''
      );
      
      setPlayers(validPlayers);
      setFilteredPlayers(validPlayers);
    } catch (error) {
      console.error('Error fetching players:', error);
      toast({
        title: "Error",
        description: "Failed to fetch players",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addPlayer = async () => {
    if (!newPlayer.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter player name",
        variant: "destructive"
      });
      return;
    }

    if (!newPlayer.role) {
      toast({
        title: "Error",
        description: "Please select player role",
        variant: "destructive"
      });
      return;
    }

    if (!newPlayer.team_id) {
      toast({
        title: "Error",
        description: "Please select team",
        variant: "destructive"
      });
      return;
    }

    try {
      const playerData = {
        name: newPlayer.name.trim(),
        role: newPlayer.role,
        team_id: newPlayer.team_id,
        batting_style: newPlayer.batting_style || null,
        bowling_style: newPlayer.bowling_style || null
      };

      const { error } = await supabase
        .from('players')
        .insert([playerData]);

      if (error) throw error;

      setNewPlayer({ name: "", role: "", team_id: "", batting_style: "", bowling_style: "" });
      setIsDialogOpen(false);
      fetchPlayers();
      
      toast({
        title: "Success!",
        description: `${newPlayer.name} added to player database`,
      });
    } catch (error) {
      console.error('Error adding player:', error);
      toast({
        title: "Error", 
        description: "Failed to add player",
        variant: "destructive"
      });
    }
  };

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player);
  };

  if (selectedPlayer) {
    return (
      <PlayerDetailView 
        player={selectedPlayer} 
        onBack={() => setSelectedPlayer(null)} 
      />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading players...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Player Profiles</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Player
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Player</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Player Name *</Label>
                <Input
                  id="name"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
                  placeholder="Enter player name"
                />
              </div>
              
              <div>
                <Label htmlFor="role">Role *</Label>
                <Select value={newPlayer.role} onValueChange={(value) => setNewPlayer({...newPlayer, role: value})}>
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

              <div>
                <Label htmlFor="team">Team *</Label>
                <Select value={newPlayer.team_id} onValueChange={(value) => setNewPlayer({...newPlayer, team_id: value})}>
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
                <Label htmlFor="batting">Batting Style</Label>
                <Select value={newPlayer.batting_style} onValueChange={(value) => setNewPlayer({...newPlayer, batting_style: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select batting style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Right-handed">Right-handed</SelectItem>
                    <SelectItem value="Left-handed">Left-handed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bowling">Bowling Style</Label>
                <Select value={newPlayer.bowling_style} onValueChange={(value) => setNewPlayer({...newPlayer, bowling_style: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select bowling style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fast">Fast</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Spin">Spin</SelectItem>
                    <SelectItem value="Off-spin">Off-spin</SelectItem>
                    <SelectItem value="Leg-spin">Leg-spin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={addPlayer} className="w-full bg-green-600 hover:bg-green-700">
                Add Player
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Teams</SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                <SelectItem value="Batsman">Batsman</SelectItem>
                <SelectItem value="Bowler">Bowler</SelectItem>
                <SelectItem value="All-rounder">All-rounder</SelectItem>
                <SelectItem value="Wicket-keeper">Wicket-keeper</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Players List */}
      {filteredPlayers.length === 0 ? (
        <Card className="text-center py-8">
          <CardContent>
            <p className="text-gray-600 mb-4">No players found</p>
            <p className="text-sm text-gray-500">
              {searchTerm || selectedTeam || selectedRole 
                ? "Try adjusting your filters" 
                : "Add your first player to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredPlayers.map((player) => (
            <Card key={player.id} className="hover:shadow-md transition-shadow cursor-pointer" 
                  onClick={() => handlePlayerSelect(player)}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={player.photo_url} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                        {player.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-lg">{player.name}</h3>
                        <Badge variant="outline">{player.role}</Badge>
                        <Badge variant="secondary" className="text-xs">
                          {player.teams?.name || 'No Team'}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        {player.teams?.city} • {player.batting_style} • {player.bowling_style}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm">
                    <div className="text-center">
                      <div className="font-bold text-blue-600">{player.matches || 0}</div>
                      <div className="text-gray-500">Matches</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-green-600">{player.runs || 0}</div>
                      <div className="text-gray-500">Runs</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-red-600">{player.wickets || 0}</div>
                      <div className="text-gray-500">Wickets</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold text-purple-600">{(player.average || 0).toFixed(1)}</div>
                      <div className="text-gray-500">Average</div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlayerProfiles;
