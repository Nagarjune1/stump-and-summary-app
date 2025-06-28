
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarContent, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trophy, Target, Activity } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PlayerProfiles = () => {
  const [players, setPlayers] = useState([
    {
      id: 1,
      name: "Virat Sharma",
      role: "Batsman",
      team: "Mumbai Warriors",
      matches: 45,
      runs: 1834,
      wickets: 2,
      average: 42.6,
      strikeRate: 145.2,
      bestScore: "156*",
      bestBowling: "2/15"
    },
    {
      id: 2,
      name: "Jasprit Kumar",
      role: "Bowler",
      team: "Delhi Dynamos",
      matches: 38,
      runs: 234,
      wickets: 56,
      average: 18.4,
      economy: 6.8,
      bestScore: "23*",
      bestBowling: "5/23"
    },
    {
      id: 3,
      name: "MS Patel",
      role: "All-rounder",
      team: "Chennai Champions",
      matches: 52,
      runs: 1245,
      wickets: 28,
      average: 35.6,
      strikeRate: 138.9,
      bestScore: "89*",
      bestBowling: "4/31"
    }
  ]);

  const [newPlayer, setNewPlayer] = useState({
    name: "",
    role: "",
    team: "",
    battingStyle: "",
    bowlingStyle: ""
  });

  const addPlayer = () => {
    if (!newPlayer.name || !newPlayer.role || !newPlayer.team) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    setPlayers([...players, {
      id: players.length + 1,
      ...newPlayer,
      matches: 0,
      runs: 0,
      wickets: 0,
      average: 0,
      strikeRate: 0,
      bestScore: "0",
      bestBowling: "0/0"
    }]);

    setNewPlayer({ name: "", role: "", team: "", battingStyle: "", bowlingStyle: "" });
    
    toast({
      title: "Success!",
      description: `${newPlayer.name} added to player database`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Player Profiles</h2>
        <Dialog>
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
                <Select onValueChange={(value) => setNewPlayer({...newPlayer, role: value})}>
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
                <Input
                  id="team"
                  value={newPlayer.team}
                  onChange={(e) => setNewPlayer({...newPlayer, team: e.target.value})}
                  placeholder="Enter team name"
                />
              </div>

              <div>
                <Label htmlFor="batting">Batting Style</Label>
                <Select onValueChange={(value) => setNewPlayer({...newPlayer, battingStyle: value})}>
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
                <Select onValueChange={(value) => setNewPlayer({...newPlayer, bowlingStyle: value})}>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {players.map((player) => (
          <Card key={player.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white">
                    {player.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-lg">{player.name}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline">{player.role}</Badge>
                    <Badge variant="secondary" className="text-xs">{player.team}</Badge>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-bold text-blue-600">{player.matches}</div>
                  <div className="text-gray-600">Matches</div>
                </div>
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="font-bold text-green-600">{player.runs}</div>
                  <div className="text-gray-600">Runs</div>
                </div>
              </div>

              {player.role !== "Bowler" && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average:</span>
                    <span className="font-medium">{player.average}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Strike Rate:</span>
                    <span className="font-medium">{player.strikeRate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Best Score:</span>
                    <span className="font-medium">{player.bestScore}</span>
                  </div>
                </div>
              )}

              {(player.role === "Bowler" || player.role === "All-rounder") && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Wickets:</span>
                    <span className="font-medium">{player.wickets}</span>
                  </div>
                  {player.economy && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Economy:</span>
                      <span className="font-medium">{player.economy}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Best Bowling:</span>
                    <span className="font-medium">{player.bestBowling}</span>
                  </div>
                </div>
              )}

              <Button variant="outline" className="w-full">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PlayerProfiles;
