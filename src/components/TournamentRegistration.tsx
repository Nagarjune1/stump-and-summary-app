
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Calendar, MapPin, Trophy, IndianRupee, Plus, Shuffle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ensureValidSelectItemValue } from "@/utils/selectUtils";

const TournamentRegistration = ({ tournaments, onUpdate }) => {
  const [teams, setTeams] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [showFixtureDialog, setShowFixtureDialog] = useState(false);
  const [selectedTournamentForFixture, setSelectedTournamentForFixture] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fixtureType, setFixtureType] = useState('all'); // 'all', 'groups'
  const [numberOfGroups, setNumberOfGroups] = useState(2);
  const [teamGroups, setTeamGroups] = useState({});

  useEffect(() => {
    fetchTeams();
    fetchRegistrations();
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
    }
  };

  const fetchRegistrations = async () => {
    try {
      const { data, error } = await supabase
        .from('tournament_teams')
        .select(`
          *,
          tournament:tournaments(name),
          team:teams(name, city)
        `)
        .order('registration_date', { ascending: false });

      if (error) throw error;
      setRegistrations(data || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
    }
  };

  const handleRegisterTeam = async () => {
    if (!selectedTournament || !selectedTeam) {
      toast({
        title: "Error",
        description: "Please select both tournament and team",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('tournament_teams')
        .insert({
          tournament_id: selectedTournament,
          team_id: selectedTeam,
          payment_status: 'pending'
        });

      if (error) {
        if (error.code === '23505') {
          toast({
            title: "Error",
            description: "Team is already registered for this tournament",
            variant: "destructive"
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: "Success!",
        description: "Team registered successfully!",
      });
      setShowRegistrationDialog(false);
      setSelectedTournament('');
      setSelectedTeam('');
      fetchRegistrations();
      onUpdate();
    } catch (error) {
      console.error('Error registering team:', error);
      toast({
        title: "Error",
        description: "Failed to register team",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updatePaymentStatus = async (registrationId, status) => {
    try {
      const { error } = await supabase
        .from('tournament_teams')
        .update({ payment_status: status })
        .eq('id', registrationId);

      if (error) throw error;

      toast({
        title: "Success!",
        description: `Payment status updated to ${status}`,
      });
      fetchRegistrations();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive"
      });
    }
  };

  const generateFixtures = async (tournamentId) => {
    try {
      setLoading(true);
      
      // Get all registered teams for this tournament
      const { data: registeredTeams, error: teamsError } = await supabase
        .from('tournament_teams')
        .select(`
          team_id,
          team:teams(id, name)
        `)
        .eq('tournament_id', tournamentId)
        .eq('payment_status', 'paid');

      if (teamsError) throw teamsError;

      if (registeredTeams.length < 2) {
        toast({
          title: "Error",
          description: "At least 2 paid teams required to generate fixtures",
          variant: "destructive"
        });
        return;
      }

      const fixtures = [];
      const teams = registeredTeams.map(rt => rt.team);

      if (fixtureType === 'all') {
        // Generate round-robin fixtures for all teams
        for (let i = 0; i < teams.length; i++) {
          for (let j = i + 1; j < teams.length; j++) {
            await createMatch(teams[i], teams[j], tournamentId, 'League Stage', fixtures.length + 1, fixtures);
          }
        }
      } else {
        // Generate fixtures with groups
        const groups = distributeTeamsIntoGroups(teams, numberOfGroups);
        
        // Within-group matches
        for (let groupIndex = 0; groupIndex < groups.length; groupIndex++) {
          const groupTeams = groups[groupIndex];
          for (let i = 0; i < groupTeams.length; i++) {
            for (let j = i + 1; j < groupTeams.length; j++) {
              await createMatch(
                groupTeams[i], 
                groupTeams[j], 
                tournamentId, 
                `Group ${String.fromCharCode(65 + groupIndex)}`, 
                fixtures.length + 1,
                fixtures
              );
            }
          }
        }
      }

      toast({
        title: "Success!",
        description: `Generated ${fixtures.length} fixtures successfully!`,
      });
      setShowFixtureDialog(false);
      setFixtureType('all');
      setNumberOfGroups(2);
      
    } catch (error) {
      console.error('Error generating fixtures:', error);
      toast({
        title: "Error",
        description: "Failed to generate fixtures",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createMatch = async (team1, team2, tournamentId, roundName, matchNumber, fixtures) => {
    const matchData = {
      team1_id: team1.id,
      team2_id: team2.id,
      format: 'T20',
      match_date: new Date().toISOString().split('T')[0],
      venue: 'TBD',
      status: 'upcoming',
      tournament: selectedTournamentForFixture?.name || 'Tournament'
    };

    const { data: match, error: matchError } = await supabase
      .from('matches')
      .insert([matchData])
      .select()
      .single();

    if (matchError) throw matchError;

    const tournamentMatchData = {
      tournament_id: tournamentId,
      match_id: match.id,
      round_name: roundName,
      match_number: matchNumber
    };

    const { error: tournamentMatchError } = await supabase
      .from('tournament_matches')
      .insert([tournamentMatchData]);

    if (tournamentMatchError) throw tournamentMatchError;

    fixtures.push({
      team1: team1.name,
      team2: team2.name,
      matchNumber
    });
  };

  const distributeTeamsIntoGroups = (teams, numGroups) => {
    const groups = Array.from({ length: numGroups }, () => []);
    teams.forEach((team, index) => {
      groups[index % numGroups].push(team);
    });
    return groups;
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'cricket-success';
      case 'pending': return 'cricket-warning';
      case 'refunded': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const openTournaments = tournaments.filter(t => 
    t.status === 'registration_open' || t.status === 'upcoming'
  );

  const getRegisteredTeamsCount = (tournamentId) => {
    return registrations.filter(r => r.tournament_id === tournamentId && r.payment_status === 'paid').length;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-primary neon-glow">Tournament Registration</h2>
          <p className="text-accent">Manage team registrations for tournaments</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
            <DialogTrigger asChild>
              <Button className="cricket-success neon-glow">
                <Plus className="w-4 h-4 mr-2" />
                Register Team
              </Button>
            </DialogTrigger>
            <DialogContent className="neon-card">
              <DialogHeader>
                <DialogTitle className="text-primary neon-glow">Register Team for Tournament</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="tournament" className="text-foreground">Select Tournament</Label>
                  <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Choose tournament" />
                    </SelectTrigger>
                    <SelectContent className="neon-card">
                      {openTournaments.map((tournament) => (
                        <SelectItem key={tournament.id} value={ensureValidSelectItemValue(tournament.id, `tournament_${tournament.name}`)}>
                          {tournament.name}
                          {tournament.registration_fee > 0 && (
                            <span className="text-sm text-muted-foreground ml-2">
                              (₹{tournament.registration_fee})
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="team" className="text-foreground">Select Team</Label>
                  <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Choose team" />
                    </SelectTrigger>
                    <SelectContent className="neon-card">
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={ensureValidSelectItemValue(team.id, `team_${team.name}`)}>
                          {team.name}
                          {team.city && <span className="text-sm text-muted-foreground ml-2">({team.city})</span>}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowRegistrationDialog(false)} className="border-border text-foreground hover:bg-muted">
                    Cancel
                  </Button>
                  <Button onClick={handleRegisterTeam} disabled={loading} className="cricket-primary neon-glow">
                    {loading ? 'Registering...' : 'Register Team'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Open Tournaments */}
      <Card className="neon-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary neon-glow">
            <Trophy className="w-5 h-5" />
            Open for Registration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {openTournaments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No tournaments open for registration</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {openTournaments.map((tournament) => {
                const registeredCount = getRegisteredTeamsCount(tournament.id);
                
                return (
                  <Card key={tournament.id} className="neon-card border-success/30">
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-primary neon-glow">{tournament.name}</h3>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedTournamentForFixture(tournament);
                              setShowFixtureDialog(true);
                            }}
                            disabled={registeredCount < 2}
                            className="border-primary text-primary hover:bg-primary/10"
                          >
                            <Shuffle className="w-4 h-4 mr-1" />
                            Generate Fixtures
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-accent">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(tournament.start_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-accent">
                          <Users className="w-4 h-4" />
                          <span>{registeredCount}/{tournament.max_teams} teams registered</span>
                        </div>
                        {tournament.registration_fee > 0 && (
                          <div className="flex items-center gap-2 text-sm text-success">
                            <IndianRupee className="w-4 h-4" />
                            <span>₹{tournament.registration_fee} registration fee</span>
                          </div>
                        )}
                        <Badge className="cricket-success neon-glow">
                          {tournament.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Registrations */}
      <Card className="neon-card">
        <CardHeader>
          <CardTitle className="text-primary neon-glow">Recent Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          {registrations.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No registrations yet</p>
          ) : (
            <div className="space-y-3">
              {registrations.slice(0, 10).map((registration) => (
                <div key={registration.id} className="flex items-center justify-between p-3 bg-card rounded-lg border border-border">
                  <div className="flex-1">
                    <div className="font-medium text-primary">{registration.team?.name}</div>
                    <div className="text-sm text-accent">{registration.tournament?.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Registered: {new Date(registration.registration_date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`${getPaymentStatusColor(registration.payment_status)} text-xs neon-glow`}>
                      {registration.payment_status.toUpperCase()}
                    </Badge>
                    
                    {registration.payment_status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => updatePaymentStatus(registration.id, 'paid')}
                        className="cricket-success neon-glow"
                      >
                        Mark Paid
                      </Button>
                    )}
                    
                    {registration.payment_status === 'paid' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updatePaymentStatus(registration.id, 'pending')}
                        className="border-warning text-warning hover:bg-warning/10"
                      >
                        Mark Pending
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Generate Fixtures Dialog */}
      <Dialog open={showFixtureDialog} onOpenChange={setShowFixtureDialog}>
        <DialogContent className="neon-card max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-primary neon-glow">Generate Tournament Fixtures</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-accent">
              Configure fixture generation for <strong>{selectedTournamentForFixture?.name}</strong>
            </p>
            
            <div className="p-3 bg-primary/10 rounded-lg border border-primary/30">
              <p className="text-sm text-primary">
                <strong>{getRegisteredTeamsCount(selectedTournamentForFixture?.id || '')}</strong> teams 
                are registered and paid.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="fixtureType" className="text-foreground">Fixture Format</Label>
                <Select value={fixtureType} onValueChange={setFixtureType}>
                  <SelectTrigger className="bg-input border-border text-foreground">
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent className="neon-card">
                    <SelectItem value="all">All Teams (Round Robin)</SelectItem>
                    <SelectItem value="groups">Group Stage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {fixtureType === 'groups' && (
                <div>
                  <Label htmlFor="numberOfGroups" className="text-foreground">Number of Groups</Label>
                  <Select value={String(numberOfGroups)} onValueChange={(val) => setNumberOfGroups(Number(val))}>
                    <SelectTrigger className="bg-input border-border text-foreground">
                      <SelectValue placeholder="Select groups" />
                    </SelectTrigger>
                    <SelectContent className="neon-card">
                      <SelectItem value="2">2 Groups</SelectItem>
                      <SelectItem value="3">3 Groups</SelectItem>
                      <SelectItem value="4">4 Groups</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    Teams will be evenly distributed across groups
                  </p>
                </div>
              )}

              <div className="p-3 bg-success/10 rounded-lg border border-success/30">
                <p className="text-sm text-success">
                  {fixtureType === 'all' 
                    ? `Will generate ${Math.floor(getRegisteredTeamsCount(selectedTournamentForFixture?.id || '') * 
                        (getRegisteredTeamsCount(selectedTournamentForFixture?.id || '') - 1) / 2)} matches (all teams play each other)`
                    : `Will generate group stage matches with ${numberOfGroups} groups`
                  }
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowFixtureDialog(false)} className="border-border text-foreground hover:bg-muted">
                Cancel
              </Button>
              <Button 
                onClick={() => generateFixtures(selectedTournamentForFixture?.id)}
                disabled={loading}
                className="cricket-primary neon-glow"
              >
                {loading ? 'Generating...' : 'Generate Fixtures'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TournamentRegistration;
