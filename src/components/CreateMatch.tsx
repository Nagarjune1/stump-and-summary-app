
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, Users, Settings } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CreateMatch = ({ onMatchCreated }) => {
  const [matchData, setMatchData] = useState({
    team1: "",
    team2: "",
    venue: "",
    date: "",
    time: "",
    format: "",
    overs: "",
    tournament: "",
    description: ""
  });

  const [teams] = useState([
    "Mumbai Warriors",
    "Delhi Dynamos", 
    "Chennai Champions",
    "Kolkata Knights",
    "Bangalore Bulls",
    "Hyderabad Hawks",
    "Rajasthan Royals",
    "Punjab Kings"
  ]);

  const handleCreateMatch = () => {
    if (!matchData.team1 || !matchData.team2 || !matchData.venue || !matchData.date) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    if (matchData.team1 === matchData.team2) {
      toast({
        title: "Error", 
        description: "Please select different teams",
        variant: "destructive"
      });
      return;
    }

    const newMatch = {
      id: Date.now(),
      ...matchData,
      status: "upcoming",
      created: new Date().toISOString()
    };

    onMatchCreated(newMatch);
    
    toast({
      title: "Success!",
      description: `Match created: ${matchData.team1} vs ${matchData.team2}`,
    });

    // Reset form
    setMatchData({
      team1: "",
      team2: "",
      venue: "",
      date: "",
      time: "",
      format: "",
      overs: "",
      tournament: "",
      description: ""
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Create New Match</h2>
        <p className="text-gray-600">Set up a new cricket match for live scoring</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Match Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Match Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="team1">Team 1 *</Label>
                <Select onValueChange={(value) => setMatchData({...matchData, team1: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Team 1" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team} value={team} disabled={team === matchData.team2}>
                        {team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="team2">Team 2 *</Label>
                <Select onValueChange={(value) => setMatchData({...matchData, team2: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Team 2" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team} value={team} disabled={team === matchData.team1}>
                        {team}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="venue">Venue *</Label>
              <Input
                id="venue"
                value={matchData.venue}
                onChange={(e) => setMatchData({...matchData, venue: e.target.value})}
                placeholder="Enter venue name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={matchData.date}
                  onChange={(e) => setMatchData({...matchData, date: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={matchData.time}
                  onChange={(e) => setMatchData({...matchData, time: e.target.value})}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tournament">Tournament/Series</Label>
              <Input
                id="tournament"
                value={matchData.tournament}
                onChange={(e) => setMatchData({...matchData, tournament: e.target.value})}
                placeholder="Enter tournament name (optional)"
              />
            </div>
          </CardContent>
        </Card>

        {/* Match Format */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Match Format
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="format">Format</Label>
              <Select onValueChange={(value) => setMatchData({...matchData, format: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select match format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T20">T20 (20 overs)</SelectItem>
                  <SelectItem value="ODI">ODI (50 overs)</SelectItem>
                  <SelectItem value="Test">Test Match</SelectItem>
                  <SelectItem value="T10">T10 (10 overs)</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {matchData.format === "Custom" && (
              <div>
                <Label htmlFor="overs">Number of Overs</Label>
                <Input
                  id="overs"
                  type="number"
                  value={matchData.overs}
                  onChange={(e) => setMatchData({...matchData, overs: e.target.value})}
                  placeholder="Enter number of overs"
                  min="1"
                  max="50"
                />
              </div>
            )}

            <div>
              <Label htmlFor="description">Match Description</Label>
              <Textarea
                id="description"
                value={matchData.description}
                onChange={(e) => setMatchData({...matchData, description: e.target.value})}
                placeholder="Add any additional details about the match..."
                rows={4}
              />
            </div>

            {/* Match Preview */}
            {matchData.team1 && matchData.team2 && (
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                <h4 className="font-semibold mb-3">Match Preview</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>{matchData.team1} vs {matchData.team2}</span>
                  </div>
                  {matchData.venue && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span>{matchData.venue}</span>
                    </div>
                  )}
                  {matchData.date && (
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-purple-600" />
                      <span>{new Date(matchData.date).toLocaleDateString()}</span>
                      {matchData.time && <span>at {matchData.time}</span>}
                    </div>
                  )}
                  {matchData.format && (
                    <div>
                      <Badge variant="outline">
                        {matchData.format} {matchData.format === "Custom" && matchData.overs ? `(${matchData.overs} overs)` : ""}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Button 
          onClick={handleCreateMatch}
          className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8 py-3 text-lg"
        >
          Create Match & Start Scoring
        </Button>
      </div>
    </div>
  );
};

export default CreateMatch;
