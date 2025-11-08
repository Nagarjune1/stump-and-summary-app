
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Users, Calendar, MapPin, Trophy, DollarSign, Star, Edit, Settings, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TournamentDetails = ({ tournament, onBack, onUpdate }) => {
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [officials, setOfficials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournamentDetails();
  }, [tournament.id]);

  const fetchTournamentDetails = async () => {
    try {
      // Fetch registered teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('tournament_teams')
        .select(`
          *,
          team:teams(*)
        `)
        .eq('tournament_id', tournament.id);

      if (teamsError) throw teamsError;
      setTeams(teamsData || []);

      // Fetch tournament matches
      const { data: matchesData, error: matchesError } = await supabase
        .from('tournament_matches')
        .select(`
          *,
          match:matches(
            *,
            team1:teams!matches_team1_id_fkey(name),
            team2:teams!matches_team2_id_fkey(name)
          )
        `)
        .eq('tournament_id', tournament.id);

      if (matchesError) throw matchesError;
      setMatches(matchesData || []);

      // Fetch sponsors
      const { data: sponsorsData, error: sponsorsError } = await supabase
        .from('tournament_sponsors')
        .select('*')
        .eq('tournament_id', tournament.id);

      if (sponsorsError) throw sponsorsError;
      setSponsors(sponsorsData || []);

      // Fetch officials
      const { data: officialsData, error: officialsError } = await supabase
        .from('tournament_officials')
        .select('*')
        .eq('tournament_id', tournament.id);

      if (officialsError) throw officialsError;
      setOfficials(officialsData || []);
    } catch (error) {
      console.error('Error fetching tournament details:', error);
      toast.error('Failed to load tournament details');
    } finally {
      setLoading(false);
    }
  };

  const updateTournamentStatus = async (newStatus) => {
    try {
      const { error } = await supabase
        .from('tournaments')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', tournament.id);

      if (error) throw error;

      toast.success(`Tournament status updated to ${newStatus.replace('_', ' ')}`);
      onUpdate();
    } catch (error) {
      console.error('Error updating tournament status:', error);
      toast.error('Failed to update tournament status');
    }
  };

  const handleDeleteTournament = async () => {
    if (!confirm('Are you sure you want to delete this tournament? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('tournaments')
        .delete()
        .eq('id', tournament.id);

      if (error) throw error;

      toast.success('Tournament deleted successfully');
      onBack();
    } catch (error) {
      console.error('Error deleting tournament:', error);
      toast.error('Failed to delete tournament');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming': return 'bg-blue-500';
      case 'registration_open': return 'bg-green-500';
      case 'in_progress': return 'bg-yellow-500';
      case 'completed': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryLabel = (category) => {
    const labels = {
      'u16': 'Under 16',
      'u19': 'Under 19', 
      'u23': 'Under 23',
      'open': 'Open',
      'corporate': 'Corporate',
      'box_cricket': 'Box Cricket'
    };
    return labels[category] || category;
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading tournament details...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={onBack} className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{tournament.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className={`${getStatusColor(tournament.status)} text-white`}>
                {tournament.status.replace('_', ' ').toUpperCase()}
              </Badge>
              <span className="text-gray-600">{getCategoryLabel(tournament.category)}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Edit className="w-4 h-4" />
            Edit
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{teams.length}</div>
                <div className="text-sm text-gray-600">Registered Teams</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{matches.length}</div>
                <div className="text-sm text-gray-600">Matches Scheduled</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{sponsors.length}</div>
                <div className="text-sm text-gray-600">Sponsors</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold">
                  ₹{tournament.prize_money?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-gray-600">Prize Money</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tournament Details Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="matches">Matches</TabsTrigger>
          <TabsTrigger value="sponsors">Sponsors</TabsTrigger>
          <TabsTrigger value="officials">Officials</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tournament Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span>Start Date: {new Date(tournament.start_date).toLocaleDateString()}</span>
                </div>
                {tournament.end_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span>End Date: {new Date(tournament.end_date).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{tournament.venue?.name || 'Venue TBD'}</span>
                </div>
                <div>
                  <span className="font-medium">Ball Type:</span> {tournament.ball_type}
                </div>
                <div>
                  <span className="font-medium">Format:</span> {tournament.tournament_style.replace('_', ' ')}
                </div>
                <div>
                  <span className="font-medium">Registration Fee:</span> ₹{tournament.registration_fee || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organizer Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="font-medium">Name:</span> {tournament.organizer_name}
                </div>
                {tournament.organizer_contact && (
                  <div>
                    <span className="font-medium">Contact:</span> {tournament.organizer_contact}
                  </div>
                )}
                {tournament.organizer_email && (
                  <div>
                    <span className="font-medium">Email:</span> {tournament.organizer_email}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {tournament.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{tournament.description}</p>
              </CardContent>
            </Card>
          )}

          {tournament.rules && (
            <Card>
              <CardHeader>
                <CardTitle>Tournament Rules</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-gray-700 whitespace-pre-wrap">{tournament.rules}</pre>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="teams">
          <Card>
            <CardHeader>
              <CardTitle>Registered Teams ({teams.length}/{tournament.max_teams})</CardTitle>
            </CardHeader>
            <CardContent>
              {teams.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No teams registered yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {teams.map((registration) => (
                    <Card key={registration.id} className="border">
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{registration.team.name}</h3>
                        {registration.team.city && (
                          <p className="text-sm text-gray-600">{registration.team.city}</p>
                        )}
                        <div className="flex justify-between items-center mt-2">
                          <Badge 
                            className={`${registration.payment_status === 'paid' ? 'bg-green-500' : 'bg-yellow-500'} text-white text-xs`}
                          >
                            {registration.payment_status.toUpperCase()}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(registration.registration_date).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="matches">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Matches</CardTitle>
            </CardHeader>
            <CardContent>
              {matches.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No matches scheduled yet</p>
              ) : (
                <div className="space-y-4">
                  {matches.map((match) => (
                    <Card key={match.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">
                              {match.match.team1?.name} vs {match.match.team2?.name}
                            </h3>
                            <p className="text-sm text-gray-600">{match.round_name}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline">Match #{match.match_number}</Badge>
                            {match.scheduled_date && (
                              <p className="text-sm text-gray-600 mt-1">
                                {new Date(match.scheduled_date).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sponsors">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Sponsors</CardTitle>
            </CardHeader>
            <CardContent>
              {sponsors.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No sponsors added yet</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sponsors.map((sponsor) => (
                    <Card key={sponsor.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          {sponsor.sponsor_logo_url && (
                            <img 
                              src={sponsor.sponsor_logo_url} 
                              alt={sponsor.sponsor_name}
                              className="w-12 h-12 object-contain rounded"
                            />
                          )}
                          <div className="flex-1">
                            <h3 className="font-semibold">{sponsor.sponsor_name}</h3>
                            {sponsor.sponsor_type && (
                              <Badge variant="outline" className="text-xs mt-1">
                                {sponsor.sponsor_type.toUpperCase()}
                              </Badge>
                            )}
                            {sponsor.sponsor_amount && (
                              <p className="text-sm text-green-600 font-medium mt-1">
                                ₹{sponsor.sponsor_amount.toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="officials">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Officials</CardTitle>
            </CardHeader>
            <CardContent>
              {officials.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No officials assigned yet</p>
              ) : (
                <div className="space-y-3">
                  {officials.map((official) => (
                    <Card key={official.id} className="border">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-semibold">{official.official_name}</h3>
                            <Badge variant="outline" className="text-xs mt-1">
                              {official.official_type.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-right">
                            {official.rate_per_match && (
                              <p className="text-sm text-green-600 font-medium">
                                ₹{official.rate_per_match}/match
                              </p>
                            )}
                            <p className="text-xs text-gray-500">
                              {official.matches_assigned || 0} matches assigned
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Tournament Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Status Management</h3>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    size="sm" 
                    variant={tournament.status === 'registration_open' ? 'default' : 'outline'}
                    onClick={() => updateTournamentStatus('registration_open')}
                  >
                    Open Registration
                  </Button>
                  <Button 
                    size="sm" 
                    variant={tournament.status === 'in_progress' ? 'default' : 'outline'}
                    onClick={() => updateTournamentStatus('in_progress')}
                  >
                    Start Tournament
                  </Button>
                  <Button 
                    size="sm" 
                    variant={tournament.status === 'completed' ? 'default' : 'outline'}
                    onClick={() => updateTournamentStatus('completed')}
                  >
                    Complete Tournament
                  </Button>
                  <Button 
                    size="sm" 
                    variant={tournament.status === 'cancelled' ? 'destructive' : 'outline'}
                    onClick={() => updateTournamentStatus('cancelled')}
                  >
                    Cancel Tournament
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h3 className="font-semibold mb-2 text-red-600">Danger Zone</h3>
                <p className="text-sm text-gray-600 mb-3">
                  Once you delete a tournament, there is no going back. Please be certain.
                </p>
                <Button 
                  variant="destructive" 
                  onClick={handleDeleteTournament}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Tournament
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TournamentDetails;
