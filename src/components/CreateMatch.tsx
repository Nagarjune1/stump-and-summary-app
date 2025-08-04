
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import SafeSelectItem from "@/components/ui/SafeSelectItem";

const CreateMatch = () => {
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    team1_id: "",
    team2_id: "",
    venue: "",
    match_date: "",
    match_time: "",
    overs: 20,
    format: "T20",
    tournament: "",
    description: "",
    wide_runs: 1,
    noball_runs: 1
  });

  useEffect(() => {
    fetchTeams();
    fetchVenues();
  }, []);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
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

  const fetchVenues = async () => {
    try {
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name');

      if (error) throw error;
      setVenues(data || []);
    } catch (error) {
      console.error('Error fetching venues:', error);
      toast({
        title: "Error",
        description: "Failed to fetch venues",
        variant: "destructive"
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.team1_id || !formData.team2_id) {
      toast({
        title: "Error",
        description: "Please select both teams",
        variant: "destructive"
      });
      return;
    }

    if (formData.team1_id === formData.team2_id) {
      toast({
        title: "Error",
        description: "Please select different teams",
        variant: "destructive"
      });
      return;
    }

    if (!formData.venue || !formData.match_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('matches')
        .insert([{
          team1_id: formData.team1_id,
          team2_id: formData.team2_id,
          venue: formData.venue,
          match_date: formData.match_date,
          match_time: formData.match_time || null,
          overs: formData.overs,
          format: formData.format,
          tournament: formData.tournament || null,
          description: formData.description || null,
          status: 'upcoming'
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Match created successfully!",
      });

      // Reset form
      setFormData({
        team1_id: "",
        team2_id: "",
        venue: "",
        match_date: "",
        match_time: "",
        overs: 20,
        format: "T20",
        tournament: "",
        description: "",
        wide_runs: 1,
        noball_runs: 1
      });

    } catch (error) {
      console.error('Error creating match:', error);
      toast({
        title: "Error",
        description: "Failed to create match",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Match</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="team1">Team 1 *</Label>
              <Select value={formData.team1_id} onValueChange={(value) => handleInputChange('team1_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Team 1" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SafeSelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SafeSelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="team2">Team 2 *</Label>
              <Select value={formData.team2_id} onValueChange={(value) => handleInputChange('team2_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Team 2" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SafeSelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SafeSelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="venue">Venue *</Label>
            <Select value={formData.venue} onValueChange={(value) => handleInputChange('venue', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Venue" />
              </SelectTrigger>
              <SelectContent>
                {venues.map((venue) => (
                  <SafeSelectItem key={venue.id} value={venue.name}>
                    {venue.name} - {venue.location}
                  </SafeSelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="match_date">Match Date *</Label>
              <Input
                type="date"
                id="match_date"
                value={formData.match_date}
                onChange={(e) => handleInputChange('match_date', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="match_time">Match Time</Label>
              <Input
                type="time"
                id="match_time"
                value={formData.match_time}
                onChange={(e) => handleInputChange('match_time', e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="overs">Total Overs *</Label>
              <Input
                type="number"
                id="overs"
                value={formData.overs}
                onChange={(e) => handleInputChange('overs', parseInt(e.target.value) || 20)}
                min="1"
                max="50"
                required
              />
            </div>

            <div>
              <Label htmlFor="wide_runs">Wide Ball Runs</Label>
              <Input
                type="number"
                id="wide_runs"
                value={formData.wide_runs}
                onChange={(e) => handleInputChange('wide_runs', parseInt(e.target.value) || 1)}
                min="0"
                max="10"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Extra runs for wide balls (default: 1)
              </p>
            </div>

            <div>
              <Label htmlFor="noball_runs">No Ball Runs</Label>
              <Input
                type="number"
                id="noball_runs"
                value={formData.noball_runs}
                onChange={(e) => handleInputChange('noball_runs', parseInt(e.target.value) || 1)}
                min="0"
                max="10"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Extra runs for no balls (default: 1)
              </p>
            </div>
          </div>

          <div>
            <Label htmlFor="format">Match Format</Label>
            <Select value={formData.format} onValueChange={(value) => handleInputChange('format', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Format" />
              </SelectTrigger>
              <SelectContent>
                <SafeSelectItem value="T20">T20</SafeSelectItem>
                <SafeSelectItem value="ODI">ODI</SafeSelectItem>
                <SafeSelectItem value="Test">Test</SafeSelectItem>
                <SafeSelectItem value="T10">T10</SafeSelectItem>
                <SafeSelectItem value="Custom">Custom</SafeSelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tournament">Tournament (Optional)</Label>
            <Input
              id="tournament"
              value={formData.tournament}
              onChange={(e) => handleInputChange('tournament', e.target.value)}
              placeholder="Enter tournament name"
            />
          </div>

          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter match description"
              rows={3}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Match"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreateMatch;
