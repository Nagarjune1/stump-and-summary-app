
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, Search, Edit, Trash2, ArrowLeft, Shield } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useIsTeamAdmin } from "@/hooks/useIsTeamAdmin";

interface Player {
  id: string;
  name: string;
  role: string;
  batting_style?: string;
  bowling_style?: string;
  photo_url?: string;
  profile_id?: string;
  runs?: number;
  wickets?: number;
  matches?: number;
  created_at: string;
}

interface TeamPlayersProps {
  team: {
    id: string;
    name: string;
    city?: string;
  };
  onBack: () => void;
}

const TeamPlayers = ({ team, onBack }: TeamPlayersProps) => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const { isTeamAdmin } = useIsTeamAdmin(team.id);
  
  const [newPlayer, setNewPlayer] = useState({
    name: "",
    role: "",
    batting_style: "",
    bowling_style: ""
  });

  const roles = ["Batsman", "Bowler", "All-rounder", "Wicket-keeper"];
  const battingStyles = ["Right-hand", "Left-hand"];
  const bowlingStyles = ["Right-arm fast", "Left-arm fast", "Right-arm medium", "Left-arm medium", "Right-arm spin", "Left-arm spin"];

  useEffect(() => {
    fetchPlayers();
  }, [team.id]);

  useEffect(() => {
    filterPlayers();
  }, [players, searchTerm]);

  const fetchPlayers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', team.id)
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
    } finally {
      setLoading(false);
    }
  };

  const filterPlayers = () => {
    let filtered = [...players];
    
    if (searchTerm) {
      filtered = filtered.filter(player =>
        player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.role.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredPlayers(filtered);
  };

  const handleAddPlayer = async () => {
    if (!newPlayer.name.trim() || !newPlayer.role) {
      toast({
        title: "Error",
        description: "Please enter player name and role",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('players')
        .insert([{
          name: newPlayer.name.trim(),
          role: newPlayer.role,
          batting_style: newPlayer.batting_style || null,
          bowling_style: newPlayer.bowling_style || null,
          team_id: team.id
        }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `${newPlayer.name} has been added to ${team.name}`,
      });

      setNewPlayer({ name: "", role: "", batting_style: "", bowling_style: "" });
      setIsAddDialogOpen(false);
      fetchPlayers();
    } catch (error) {
      console.error('Error adding player:', error);
      toast({
        title: "Error",
        description: "Failed to add player",
        variant: "destructive"
      });
    }
  };

  const handleEditPlayer = async () => {
    if (!editingPlayer || !editingPlayer.name.trim() || !editingPlayer.role) {
      toast({
        title: "Error",
        description: "Please enter player name and role",
        variant: "destructive"
      });
      return;
    }

    try {
      const updateData: Record<string, unknown> = {
        name: editingPlayer.name.trim(),
        role: editingPlayer.role,
        batting_style: editingPlayer.batting_style || null,
        bowling_style: editingPlayer.bowling_style || null
      };

      // Only team admins can update profile_id
      if (isTeamAdmin) {
        updateData.profile_id = editingPlayer.profile_id?.trim() || null;
      }

      const { error } = await supabase
        .from('players')
        .update(updateData)
        .eq('id', editingPlayer.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `${editingPlayer.name} has been updated successfully`,
      });

      setEditingPlayer(null);
      setIsEditDialogOpen(false);
      fetchPlayers();
    } catch (error) {
      console.error('Error updating player:', error);
      toast({
        title: "Error",
        description: "Failed to update player",
        variant: "destructive"
      });
    }
  };

  const handleDeletePlayer = async (player: Player) => {
    const confirmed = window.confirm(`Are you sure you want to remove ${player.name} from ${team.name}?`);
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', player.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `${player.name} has been removed from ${team.name}`,
      });

      fetchPlayers();
    } catch (error) {
      console.error('Error deleting player:', error);
      toast({
        title: "Error",
        description: "Failed to remove player",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (player: Player) => {
    setEditingPlayer({ ...player });
    setIsEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-primary neon-glow">Loading players...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          onClick={onBack}
          className="text-primary hover:bg-primary/10 neon-glow"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Teams
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-primary neon-glow">{team.name} Players</h2>
          <p className="text-accent">{team.city && `${team.city} • `}{players.length} players</p>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-accent" />
          <Input
            placeholder="Search players..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-input border-border text-foreground neon-border"
          />
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="cricket-primary neon-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add Player
            </Button>
          </DialogTrigger>
          <DialogContent className="neon-card max-w-md">
            <DialogHeader>
              <DialogTitle className="text-primary neon-glow">Add New Player</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="playerName" className="text-foreground">Player Name *</Label>
                <Input
                  id="playerName"
                  value={newPlayer.name}
                  onChange={(e) => setNewPlayer({...newPlayer, name: e.target.value})}
                  placeholder="Enter player name"
                  className="bg-input border-border text-foreground"
                />
              </div>
              
              <div>
                <Label htmlFor="playerRole" className="text-foreground">Role *</Label>
                <Select value={newPlayer.role} onValueChange={(value) => setNewPlayer({...newPlayer, role: value})}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="neon-card">
                    {roles.map((role) => (
                      <SelectItem key={role} value={role} className="text-foreground">
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="battingStyle" className="text-foreground">Batting Style</Label>
                <Select value={newPlayer.batting_style} onValueChange={(value) => setNewPlayer({...newPlayer, batting_style: value})}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select batting style" />
                  </SelectTrigger>
                  <SelectContent className="neon-card">
                    {battingStyles.map((style) => (
                      <SelectItem key={style} value={style} className="text-foreground">
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bowlingStyle" className="text-foreground">Bowling Style</Label>
                <Select value={newPlayer.bowling_style} onValueChange={(value) => setNewPlayer({...newPlayer, bowling_style: value})}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select bowling style" />
                  </SelectTrigger>
                  <SelectContent className="neon-card">
                    {bowlingStyles.map((style) => (
                      <SelectItem key={style} value={style} className="text-foreground">
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setNewPlayer({ name: "", role: "", batting_style: "", bowling_style: "" });
                    setIsAddDialogOpen(false);
                  }}
                  className="border-border text-foreground hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button onClick={handleAddPlayer} className="cricket-primary neon-glow">
                  Add Player
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Players List */}
      {filteredPlayers.length === 0 ? (
        <Card className="neon-card text-center py-12">
          <CardContent>
            <div className="text-lg font-semibold mb-2 text-primary">No Players Found</div>
            <p className="text-accent mb-4">
              {players.length === 0 
                ? "Add your first player to get started" 
                : "No players match your search criteria"}
            </p>
            {players.length === 0 && (
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="cricket-primary neon-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add First Player
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlayers.map((player) => (
            <Card key={player.id} className="neon-card hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={player.photo_url} />
                      <AvatarFallback className="bg-primary/20 text-primary font-bold neon-glow">
                        {player.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg text-primary neon-glow">{player.name}</h3>
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="outline" className="text-accent border-accent">
                          {player.role}
                        </Badge>
                        {player.profile_id && (
                          <Badge variant="secondary" className="text-xs">
                            ID: {player.profile_id}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isTeamAdmin && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(player)}
                        className="text-accent hover:bg-accent/10"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeletePlayer(player)}
                        className="text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  {player.batting_style && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Batting:</span>
                      <span className="text-foreground">{player.batting_style}</span>
                    </div>
                  )}
                  
                  {player.bowling_style && (
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Bowling:</span>
                      <span className="text-foreground">{player.bowling_style}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary">{player.matches || 0}</div>
                      <div className="text-xs text-muted-foreground">Matches</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-success">{player.runs || 0}</div>
                      <div className="text-xs text-muted-foreground">Runs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-warning">{player.wickets || 0}</div>
                      <div className="text-xs text-muted-foreground">Wickets</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Player Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="neon-card max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary neon-glow">Edit Player</DialogTitle>
          </DialogHeader>
          {editingPlayer && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editPlayerName" className="text-foreground">Player Name *</Label>
                <Input
                  id="editPlayerName"
                  value={editingPlayer.name}
                  onChange={(e) => setEditingPlayer({...editingPlayer, name: e.target.value})}
                  placeholder="Enter player name"
                  className="bg-input border-border text-foreground"
                />
              </div>
              
              <div>
                <Label htmlFor="editPlayerRole" className="text-foreground">Role *</Label>
                <Select value={editingPlayer.role} onValueChange={(value) => setEditingPlayer({...editingPlayer, role: value})}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent className="neon-card">
                    {roles.map((role) => (
                      <SelectItem key={role} value={role} className="text-foreground">
                        {role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editBattingStyle" className="text-foreground">Batting Style</Label>
                <Select value={editingPlayer.batting_style || ""} onValueChange={(value) => setEditingPlayer({...editingPlayer, batting_style: value})}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select batting style" />
                  </SelectTrigger>
                  <SelectContent className="neon-card">
                    {battingStyles.map((style) => (
                      <SelectItem key={style} value={style} className="text-foreground">
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="editBowlingStyle" className="text-foreground">Bowling Style</Label>
                <Select value={editingPlayer.bowling_style || ""} onValueChange={(value) => setEditingPlayer({...editingPlayer, bowling_style: value})}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select bowling style" />
                  </SelectTrigger>
                  <SelectContent className="neon-card">
                    {bowlingStyles.map((style) => (
                      <SelectItem key={style} value={style} className="text-foreground">
                        {style}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Profile ID - Team Admin Only */}
              {isTeamAdmin && (
                <div className="border-t border-border pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-warning" />
                    <Label className="text-warning font-semibold">Team Admin Only</Label>
                  </div>
                  <div>
                    <Label htmlFor="editProfileId" className="text-foreground">Profile ID</Label>
                    <Input
                      id="editProfileId"
                      value={editingPlayer.profile_id || ""}
                      onChange={(e) => setEditingPlayer({...editingPlayer, profile_id: e.target.value})}
                      placeholder="Enter profile ID (e.g., JOHN1234)"
                      className="bg-input border-border text-foreground"
                      maxLength={8}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Link this player to a user profile by entering their Profile ID
                    </p>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingPlayer(null);
                    setIsEditDialogOpen(false);
                  }}
                  className="border-border text-foreground hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button onClick={handleEditPlayer} className="cricket-primary neon-glow">
                  Update Player
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamPlayers;
