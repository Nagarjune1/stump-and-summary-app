
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Search, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import TeamPlayers from "./TeamPlayers";
import TeamCard from "./TeamCard";

interface Team {
  id: string;
  name: string;
  city?: string;
  created_at: string;
  playerCount?: number;
}

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  const [newTeam, setNewTeam] = useState({
    name: "",
    city: ""
  });

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    filterTeams();
  }, [teams, searchTerm]);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      
      // Fetch teams with player count
      const { data: teamsData, error } = await supabase
        .from('teams')
        .select(`
          *,
          players(count)
        `)
        .order('name');
      
      if (error) throw error;
      
      // Transform data to include player count
      const teamsWithCount = teamsData?.map(team => ({
        ...team,
        playerCount: team.players?.[0]?.count || 0
      })) || [];
      
      setTeams(teamsWithCount);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch teams",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTeams = () => {
    let filtered = [...teams];
    
    if (searchTerm) {
      filtered = filtered.filter(team =>
        team.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (team.city && team.city.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredTeams(filtered);
  };

  const handleAddTeam = async () => {
    if (!newTeam.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter team name",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('teams')
        .insert([{
          name: newTeam.name.trim(),
          city: newTeam.city.trim() || null
        }]);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `${newTeam.name} has been added successfully`,
      });

      setNewTeam({ name: "", city: "" });
      setIsAddDialogOpen(false);
      fetchTeams();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add team",
        variant: "destructive"
      });
    }
  };

  const handleEditTeam = async () => {
    if (!editingTeam || !editingTeam.name.trim()) {
      toast({
        title: "Error",
        description: "Please enter team name",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('teams')
        .update({
          name: editingTeam.name.trim(),
          city: editingTeam.city?.trim() || null
        })
        .eq('id', editingTeam.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `${editingTeam.name} has been updated successfully`,
      });

      setEditingTeam(null);
      setIsEditDialogOpen(false);
      fetchTeams();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update team",
        variant: "destructive"
      });
    }
  };

  const handleDeleteTeam = async (team: Team) => {
    if (team.playerCount && team.playerCount > 0) {
      toast({
        title: "Cannot Delete",
        description: `${team.name} has ${team.playerCount} players. Remove players first.`,
        variant: "destructive"
      });
      return;
    }

    const confirmed = window.confirm(`Are you sure you want to delete ${team.name}?`);
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', team.id);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `${team.name} has been deleted successfully`,
      });

      fetchTeams();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete team",
        variant: "destructive"
      });
    }
  };

  const openEditDialog = (team: Team) => {
    setEditingTeam({ ...team });
    setIsEditDialogOpen(true);
  };

  const handleTeamPlayersClick = (team: Team) => {
    setSelectedTeam(team);
  };

  if (selectedTeam) {
    return (
      <TeamPlayers 
        team={selectedTeam} 
        onBack={() => setSelectedTeam(null)} 
      />
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-primary neon-glow">Loading teams...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary neon-glow">Teams Management</h2>
          <p className="text-accent">Manage your cricket teams and their details</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="cricket-success neon-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add Team
            </Button>
          </DialogTrigger>
          <DialogContent className="neon-card max-w-md">
            <DialogHeader>
              <DialogTitle className="text-primary neon-glow">Add New Team</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="teamName" className="text-foreground">Team Name *</Label>
                <Input
                  id="teamName"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                  placeholder="Enter team name"
                  className="bg-input border-border text-foreground"
                />
              </div>
              
              <div>
                <Label htmlFor="teamCity" className="text-foreground">City</Label>
                <Input
                  id="teamCity"
                  value={newTeam.city}
                  onChange={(e) => setNewTeam({...newTeam, city: e.target.value})}
                  placeholder="Enter city (optional)"
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setNewTeam({ name: "", city: "" });
                    setIsAddDialogOpen(false);
                  }}
                  className="border-border text-foreground hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button onClick={handleAddTeam} className="cricket-success neon-glow">
                  Add Team
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="neon-card">
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-3 h-4 w-4 text-accent" />
            <Input
              placeholder="Search teams or cities..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-input border-border text-foreground"
            />
          </div>
        </CardContent>
      </Card>

      {/* Teams List */}
      {filteredTeams.length === 0 ? (
        <Card className="neon-card text-center py-12">
          <CardContent>
            <Users className="mx-auto h-12 w-12 text-accent mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-primary">No Teams Found</h3>
            <p className="text-muted-foreground mb-4">
              {teams.length === 0 
                ? "Get started by adding your first team" 
                : "No teams match your search criteria"}
            </p>
            {teams.length === 0 && (
              <Button 
                onClick={() => setIsAddDialogOpen(true)}
                className="cricket-success neon-glow"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Team
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeams.map((team) => (
            <TeamCard
              key={team.id}
              team={team}
              onEdit={openEditDialog}
              onDelete={handleDeleteTeam}
              onViewPlayers={handleTeamPlayersClick}
            />
          ))}
        </div>
      )}

      {/* Edit Team Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="neon-card max-w-md">
          <DialogHeader>
            <DialogTitle className="text-primary neon-glow">Edit Team</DialogTitle>
          </DialogHeader>
          {editingTeam && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="editTeamName" className="text-foreground">Team Name *</Label>
                <Input
                  id="editTeamName"
                  value={editingTeam.name}
                  onChange={(e) => setEditingTeam({...editingTeam, name: e.target.value})}
                  placeholder="Enter team name"
                  className="bg-input border-border text-foreground"
                />
              </div>
              
              <div>
                <Label htmlFor="editTeamCity" className="text-foreground">City</Label>
                <Input
                  id="editTeamCity"
                  value={editingTeam.city || ""}
                  onChange={(e) => setEditingTeam({...editingTeam, city: e.target.value})}
                  placeholder="Enter city (optional)"
                  className="bg-input border-border text-foreground"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setEditingTeam(null);
                    setIsEditDialogOpen(false);
                  }}
                  className="border-border text-foreground hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button onClick={handleEditTeam} className="cricket-primary neon-glow">
                  Update Team
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Summary */}
      {teams.length > 0 && (
        <div className="text-sm text-muted-foreground text-center pt-4 border-t border-border">
          Total: {teams.length} teams • Showing: {filteredTeams.length} teams
        </div>
      )}
    </div>
  );
};

export default Teams;
