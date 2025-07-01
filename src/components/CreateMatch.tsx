import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarDays, MapPin, Users, Settings, Play } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Team {
  id: string;
  name: string;
  city: string;
}

const CreateMatch = ({ onMatchCreated, onMatchStarted }) => {
  const [matchData, setMatchData] = useState({
    team1_id: "",
    team2_id: "",
    venue: "",
    match_date: "",
    match_time: "",
    format: "",
    overs: "",
    tournament: "",
    description: "",
    toss_winner: "",
    elected_to: ""
  });

  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [createdMatch, setCreatedMatch] = useState(null);
  const [recentMatches, setRecentMatches] = useState([]);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching teams:', error);
        return;
      }
      
      setTeams(data || []);
    } catch (error) {
      console.error('Error fetching teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMatch = async () => {
    if (!matchData.team1_id || !matchData.team2_id || !matchData.venue || !matchData.match_date) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive"
      });
      return;
    }

    if (matchData.team1_id === matchData.team2_id) {
      toast({
        title: "Error", 
        description: "Please select different teams",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('matches')
        .insert([{
          team1_id: matchData.team1_id,
          team2_id: matchData.team2_id,
          venue: matchData.venue,
          match_date: matchData.match_date,
          match_time: matchData.match_time || null,
          format: matchData.format,
          overs: matchData.overs ? parseInt(matchData.overs) : null,
          tournament: matchData.tournament || null,
          description: matchData.description || null,
          status: 'upcoming'
        }])
        .select(`
          *,
          team1:teams!matches_team1_id_fkey(name),
          team2:teams!matches_team2_id_fkey(name)
        `);

      if (error) {
        console.error('Error creating match:', error);
        toast({
          title: "Error",
          description: "Failed to create match",
          variant: "destructive"
        });
        return;
      }

      const team1Name = teams.find(t => t.id === matchData.team1_id)?.name;
      const team2Name = teams.find(t => t.id === matchData.team2_id)?.name;

      setCreatedMatch(data[0]);
      
      if (onMatchCreated && data[0]) {
        onMatchCreated(data[0]);
      }
      
      toast({
        title: "Success!",
        description: `Match created: ${team1Name} vs ${team2Name}. Now set toss details to start.`,
      });

    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        title: "Error",
        description: "Failed to create match",
        variant: "destructive"
      });
    }
  };

  const handleStartMatch = async (match) => {
    try {
      // Extract the match ID from the match object
      const matchId = typeof match === 'string' ? match : match.id;
      
      const { data, error } = await supabase
        .from('matches')
        .update({ status: 'live' })
        .eq('id', matchId)
        .select(`
          *,
          team1:teams!matches_team1_id_fkey(name),
          team2:teams!matches_team2_id_fkey(name)
        `);

      if (error) {
        console.error('Error starting match:', error);
        toast({
          title: "Error",
          description: "Failed to start match",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Match Started!",
        description: `${data[0].team1.name} vs ${data[0].team2.name} is now live`,
      });

      if (onMatchStarted && data[0]) {
        onMatchStarted(data[0]);
      }

      fetchRecentMatches();
    } catch (error) {
      console.error('Error starting match:', error);
      toast({
        title: "Error",
        description: "Failed to start match",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setMatchData({
      team1_id: "",
      team2_id: "",
      venue: "",
      match_date: "",
      match_time: "",
      format: "",
      overs: "",
      tournament: "",
      description: "",
      toss_winner: "",
      elected_to: ""
    });
    setCreatedMatch(null);
  };

  const fetchRecentMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          status,
          result,
          match_date,
          match_time,
          venue,
          format,
          overs,
          team1:teams!matches_team1_id_fkey(name),
          team2:teams!matches_team2_id_fkey(name)
        `)
        .order('match_date', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent matches:', error);
        return;
      }

      setRecentMatches(data || []);
    } catch (error) {
      console.error('Error fetching recent matches:', error);
    }
  };

  useEffect(() => {
    fetchRecentMatches();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading teams...</div>
      </div>
    );
  }

  const team1 = teams.find(t => t.id === matchData.team1_id);
  const team2 = teams.find(t => t.id === matchData.team2_id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">
          {createdMatch ? "Set Toss Details & Start Match" : "Create New Match"}
        </h2>
        <p className="text-gray-600">
          {createdMatch ? "Configure toss details to begin live scoring" : "Set up a new cricket match for live scoring"}
        </p>
      </div>

      {createdMatch && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Match Created Successfully!</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-xl font-bold">{team1?.name} vs {team2?.name}</h3>
                <p className="text-gray-600">{matchData.venue} • {new Date(matchData.match_date).toLocaleDateString()}</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-base font-medium">Who won the toss? *</Label>
                  <RadioGroup
                    value={matchData.toss_winner}
                    onValueChange={(value) => setMatchData({...matchData, toss_winner: value})}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={matchData.team1_id} id="team1_toss" />
                      <Label htmlFor="team1_toss">{team1?.name}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={matchData.team2_id} id="team2_toss" />
                      <Label htmlFor="team2_toss">{team2?.name}</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div>
                  <Label className="text-base font-medium">They elected to: *</Label>
                  <RadioGroup
                    value={matchData.elected_to}
                    onValueChange={(value) => setMatchData({...matchData, elected_to: value})}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bat" id="elect_bat" />
                      <Label htmlFor="elect_bat">Bat</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="bowl" id="elect_bowl" />
                      <Label htmlFor="elect_bowl">Bowl</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <div className="flex justify-center gap-4 mt-6">
                <Button 
                  onClick={handleStartMatch}
                  className="bg-green-600 hover:bg-green-700 px-8 py-3 text-lg"
                  disabled={!matchData.toss_winner || !matchData.elected_to}
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Match & Begin Scoring
                </Button>
                <Button 
                  onClick={resetForm}
                  variant="outline"
                  className="px-6 py-3"
                >
                  Create Another Match
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!createdMatch && (
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
                  <Select onValueChange={(value) => setMatchData({...matchData, team1_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Team 1" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id} disabled={team.id === matchData.team2_id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="team2">Team 2 *</Label>
                  <Select onValueChange={(value) => setMatchData({...matchData, team2_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Team 2" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id} disabled={team.id === matchData.team1_id}>
                          {team.name}
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
                    value={matchData.match_date}
                    onChange={(e) => setMatchData({...matchData, match_date: e.target.value})}
                  />
                </div>

                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={matchData.match_time}
                    onChange={(e) => setMatchData({...matchData, match_time: e.target.value})}
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
              {team1 && team2 && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                  <h4 className="font-semibold mb-3">Match Preview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-blue-600" />
                      <span>{team1.name} vs {team2.name}</span>
                    </div>
                    {matchData.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-green-600" />
                        <span>{matchData.venue}</span>
                      </div>
                    )}
                    {matchData.match_date && (
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-purple-600" />
                        <span>{new Date(matchData.match_date).toLocaleDateString()}</span>
                        {matchData.match_time && <span>at {matchData.match_time}</span>}
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
      )}

      {!createdMatch && (
        <div className="flex justify-center">
          <Button 
            onClick={handleCreateMatch}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 px-8 py-3 text-lg"
            disabled={teams.length === 0}
          >
            {teams.length === 0 ? "No Teams Available" : "Create Match"}
          </Button>
        </div>
      )}

      {/* Recent Matches */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Matches</CardTitle>
        </CardHeader>
        <CardContent>
          {recentMatches.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No matches created yet</p>
          ) : (
            <div className="space-y-3">
              {recentMatches.map((match) => (
                <div key={match.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">
                      {match.team1?.name || 'Team 1'} vs {match.team2?.name || 'Team 2'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {match.venue} • {new Date(match.match_date).toLocaleDateString()}
                      {match.match_time && ` at ${match.match_time}`}
                    </p>
                    {match.format && (
                      <p className="text-xs text-gray-500">
                        {match.format}{match.overs && ` • ${match.overs} overs`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={match.status === "live" ? "default" : match.status === "completed" ? "secondary" : "outline"}>
                      {match.status}
                    </Badge>
                    {match.status === 'upcoming' && (
                      <Button 
                        onClick={() => handleStartMatch(match)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Start Match
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateMatch;
