
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Search, Filter, Camera, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const EnhancedPlayerManagement = () => {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [filteredPlayers, setFilteredPlayers] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [playerStatsDialog, setPlayerStatsDialog] = useState(false);
  const [photoUploadDialog, setPhotoUploadDialog] = useState(false);

  useEffect(() => {
    fetchPlayersAndTeams();
  }, []);

  useEffect(() => {
    filterPlayers();
  }, [players, selectedTeam, searchTerm]);

  const fetchPlayersAndTeams = async () => {
    try {
      const { data: playersData, error: playersError } = await supabase
        .from('players')
        .select(`
          *,
          team:teams(name, city)
        `);

      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*');

      if (playersError || teamsError) {
        console.error('Error fetching data:', playersError || teamsError);
        return;
      }

      setPlayers(playersData || []);
      setTeams(teamsData || []);
    } catch (error) {
      console.error('Error fetching players and teams:', error);
    }
  };

  const filterPlayers = () => {
    let filtered = [...players];

    if (selectedTeam) {
      filtered = filtered.filter(player => player.team_id === selectedTeam);
    }

    if (searchTerm) {
      filtered = filtered.filter(player => 
        player.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPlayers(filtered);
  };

  const handlePlayerClick = (player) => {
    setSelectedPlayer(player);
    setPlayerStatsDialog(true);
  };

  const handlePhotoUpload = async (file) => {
    if (!selectedPlayer || !file) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedPlayer.id}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('player-photos')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('player-photos')
        .getPublicUrl(fileName);

      await supabase
        .from('players')
        .update({ photo_url: publicUrl })
        .eq('id', selectedPlayer.id);

      toast({
        title: "Photo uploaded successfully!",
        description: "Player photo has been updated.",
      });

      fetchPlayersAndTeams();
      setPhotoUploadDialog(false);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload player photo.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Player Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Teams</SelectItem>
                {teams.map(team => (
                  <SelectItem key={team.id} value={team.id}>
                    {team.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Players List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPlayers.map(player => (
              <Card key={player.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => handlePlayerClick(player)}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={player.photo_url} />
                      <AvatarFallback>{player.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="font-semibold">{player.name}</h3>
                      <p className="text-sm text-gray-600">{player.team?.name}</p>
                      <Badge variant="outline" className="text-xs">
                        {player.role}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Matches:</span> {player.matches || 0}
                    </div>
                    <div>
                      <span className="text-gray-600">Runs:</span> {player.runs || 0}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Player Stats Dialog */}
      <Dialog open={playerStatsDialog} onOpenChange={setPlayerStatsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={selectedPlayer?.photo_url} />
                <AvatarFallback>{selectedPlayer?.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              {selectedPlayer?.name} - Career Stats
            </DialogTitle>
          </DialogHeader>
          {selectedPlayer && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-lg font-semibold">{selectedPlayer.team?.name}</p>
                  <Badge>{selectedPlayer.role}</Badge>
                </div>
                <Button
                  onClick={() => setPhotoUploadDialog(true)}
                  variant="outline"
                  size="sm"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  Update Photo
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Batting Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Batting</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Matches:</span>
                      <span className="font-semibold">{selectedPlayer.matches || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Runs:</span>
                      <span className="font-semibold">{selectedPlayer.runs || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Average:</span>
                      <span className="font-semibold">{(selectedPlayer.average || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Strike Rate:</span>
                      <span className="font-semibold">{(selectedPlayer.strike_rate || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Best Score:</span>
                      <span className="font-semibold">{selectedPlayer.best_score || '0'}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Bowling Stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Bowling</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span>Wickets:</span>
                      <span className="font-semibold">{selectedPlayer.wickets || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Best Bowling:</span>
                      <span className="font-semibold">{selectedPlayer.best_bowling || '0/0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Economy:</span>
                      <span className="font-semibold">{(selectedPlayer.economy || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Style:</span>
                      <span className="font-semibold">{selectedPlayer.bowling_style || 'N/A'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Photo Upload Dialog */}
      <Dialog open={photoUploadDialog} onOpenChange={setPhotoUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Player Photo</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePhotoUpload(file);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EnhancedPlayerManagement;
