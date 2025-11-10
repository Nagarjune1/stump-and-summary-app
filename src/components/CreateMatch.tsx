import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectTrigger, SelectValue, SelectItem } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ensureValidSelectItemValue } from "@/utils/selectUtils";
import { Search, UserPlus } from "lucide-react";

interface CreateMatchProps {
  onMatchCreated?: (match: any) => void;
  onMatchStarted?: (match: any) => void;
}

const CreateMatch = ({ onMatchCreated, onMatchStarted }: CreateMatchProps) => {
  const [teams, setTeams] = useState([]);
  const [venues, setVenues] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
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
    noball_runs: 1,
    scorers: [] as any[]
  });

  useEffect(() => {
    fetchTeams();
    fetchVenues();
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (searchQuery.length >= 2) {
        searchProfiles();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const fetchTeams = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch teams",
          variant: "destructive"
        });
        return;
      }
      
      setTeams(data || []);
    } catch (error) {
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

      if (error) {
        toast({
          title: "Error",
          description: "Failed to fetch venues",
          variant: "destructive"
        });
        return;
      }
      
      setVenues(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch venues",
        variant: "destructive"
      });
    }
  };

  const searchProfiles = async () => {
    try {
      setSearching(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('id, profile_id, full_name, email')
        .ilike('profile_id', `%${searchQuery}%`)
        .limit(5);

      if (error) throw error;
      
      // Filter out users who already are scorers
      const filtered = (data || []).filter(
        profile => !formData.scorers.some((scorer: any) => scorer.id === profile.id)
      );
      
      setSearchResults(filtered);
    } catch (error) {
      console.error('Error searching profiles:', error);
      toast({
        title: "Error",
        description: "Failed to search profiles",
        variant: "destructive"
      });
    } finally {
      setSearching(false);
    }
  };

  const validateForm = () => {
    if (!formData.team1_id || !formData.team2_id) {
      toast({
        title: "Error",
        description: "Please select both teams",
        variant: "destructive"
      });
      return false;
    }

    if (formData.team1_id === formData.team2_id) {
      toast({
        title: "Error",
        description: "Please select different teams",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.venue || !formData.match_date) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);

      const { matchSchema } = await import('@/lib/validationSchemas');
      
      const validated = matchSchema.parse({
        team1_id: formData.team1_id,
        team2_id: formData.team2_id,
        venue: formData.venue,
        match_date: formData.match_date,
        match_time: formData.match_time || '',
        overs: formData.overs,
        format: formData.format,
        tournament: formData.tournament || '',
        description: formData.description || ''
      });

      const matchData = {
        team1_id: validated.team1_id,
        team2_id: validated.team2_id,
        venue: validated.venue,
        match_date: validated.match_date,
        format: validated.format,
        match_time: validated.match_time || null,
        overs: validated.overs,
        tournament: validated.tournament || null,
        description: validated.description || null,
        status: 'upcoming' as const,
        wide_runs: formData.wide_runs,
        noball_runs: formData.noball_runs
      };

      const { data, error } = await supabase
        .from('matches')
        .insert([matchData])
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Assign scorers
      if (formData.scorers.length > 0) {
        const scorerPermissions = formData.scorers.map((scorer: any) => ({
          match_id: data.id,
          user_id: scorer.id,
          permission_type: 'scorer',
          granted_by: data.created_by
        }));

        const { error: scorerError } = await supabase
          .from('match_permissions')
          .insert(scorerPermissions);

        if (scorerError) {
          console.error('Error assigning scorers:', scorerError);
          toast({
            title: "Warning",
            description: "Match created but failed to assign scorers",
            variant: "destructive"
          });
        }
      }

      toast({
        title: "Success",
        description: "Match created successfully!",
      });

      // Call the callback if provided
      if (onMatchCreated) {
        onMatchCreated(data);
      }

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
        noball_runs: 1,
        scorers: []
      });

    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create match",
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
                  {teams.map((team, index) => {
                    const safeTeamId = ensureValidSelectItemValue(team.id, `team1_${index}`);
                    console.log('Rendering Team 1 option:', { originalId: team.id, safeId: safeTeamId, name: team.name });
                    return (
                      <SelectItem key={`team1_${index}`} value={safeTeamId}>
                        {team.name}
                      </SelectItem>
                    );
                  })}
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
                  {teams.map((team, index) => {
                    const safeTeamId = ensureValidSelectItemValue(team.id, `team2_${index}`);
                    console.log('Rendering Team 2 option:', { originalId: team.id, safeId: safeTeamId, name: team.name });
                    return (
                      <SelectItem key={`team2_${index}`} value={safeTeamId}>
                        {team.name}
                      </SelectItem>
                    );
                  })}
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
                {venues.map((venue, index) => {
                  const safeVenueName = ensureValidSelectItemValue(venue.name, `venue_${index}`);
                  console.log('Rendering venue option:', { originalName: venue.name, safeName: safeVenueName });
                  return (
                    <SelectItem key={`venue_${index}`} value={safeVenueName}>
                      {venue.name} - {venue.location}
                    </SelectItem>
                  );
                })}
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

          <div className="grid grid-cols-4 gap-4">
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
              <Label htmlFor="format">Format</Label>
              <Select value={formData.format} onValueChange={(value) => handleInputChange('format', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="T20">T20</SelectItem>
                  <SelectItem value="ODI">ODI</SelectItem>
                  <SelectItem value="Test">Test</SelectItem>
                  <SelectItem value="T10">T10</SelectItem>
                  <SelectItem value="Custom">Custom</SelectItem>
                </SelectContent>
              </Select>
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

          <div>
            <Label htmlFor="scorers">Assign Scorers (Optional)</Label>
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Profile ID (e.g., ABC123)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {searching && (
                <div className="text-sm text-muted-foreground">Searching...</div>
              )}
              
              {searchResults.length > 0 && (
                <div className="border rounded-lg divide-y bg-card">
                  {searchResults.map((profile: any) => (
                    <div
                      key={profile.id}
                      className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p className="font-medium">{profile.full_name || profile.email || 'Unknown User'}</p>
                        <p className="text-sm text-muted-foreground">ID: {profile.profile_id}</p>
                      </div>
                      <Button
                        type="button"
                        onClick={() => {
                          if (!formData.scorers.some((s: any) => s.id === profile.id)) {
                            handleInputChange('scorers', [...formData.scorers, profile]);
                            setSearchQuery("");
                            setSearchResults([]);
                          }
                        }}
                        size="sm"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
                <div className="text-sm text-muted-foreground">No profiles found</div>
              )}
              
              {formData.scorers.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.scorers.map((scorer: any) => (
                    <Badge key={scorer.id} variant="secondary" className="flex items-center gap-1">
                      {scorer.full_name || scorer.email}
                      <button
                        type="button"
                        onClick={() => handleInputChange('scorers', formData.scorers.filter((s: any) => s.id !== scorer.id))}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
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
