
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, Users, MapPin, Trophy, Star, DollarSign } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import CreateTournament from "./CreateTournament";
import TournamentDetails from "./TournamentDetails";
import VenueManagement from "./VenueManagement";
import TournamentRegistration from "./TournamentRegistration";

const TournamentManagement = () => {
  const [tournaments, setTournaments] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .select(`
          *,
          venue:venues(*),
          tournament_teams(
            id,
            team:teams(name)
          ),
          tournament_sponsors(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTournaments(data || []);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast.error('Failed to load tournaments');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTournament = async (tournamentData) => {
    try {
      const { data, error } = await supabase
        .from('tournaments')
        .insert([tournamentData])
        .select()
        .single();

      if (error) throw error;

      toast.success('Tournament created successfully!');
      setShowCreateForm(false);
      fetchTournaments();
    } catch (error) {
      console.error('Error creating tournament:', error);
      toast.error('Failed to create tournament');
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
    return <div className="flex justify-center p-8 text-foreground">Loading tournaments...</div>;
  }

  if (showCreateForm) {
    return (
      <CreateTournament
        onSubmit={handleCreateTournament}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  if (selectedTournament) {
    return (
      <TournamentDetails
        tournament={selectedTournament}
        onBack={() => setSelectedTournament(null)}
        onUpdate={fetchTournaments}
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Tournament Management</h1>
          <p className="text-muted-foreground">Create and manage cricket tournaments</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-success hover:bg-success/90 text-success-foreground"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Tournament
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="venues">Venues</TabsTrigger>
          <TabsTrigger value="registration">Registration</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {tournaments.length === 0 ? (
            <Card className="neon-card">
              <CardContent className="text-center py-12">
                <Trophy className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No Tournaments Yet</h3>
                <p className="text-muted-foreground">Create your first tournament to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map((tournament) => (
                <Card 
                  key={tournament.id} 
                  className="neon-card cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedTournament(tournament)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2 text-foreground">{tournament.name}</CardTitle>
                        <Badge className={`${getStatusColor(tournament.status)} text-white text-xs`}>
                          {tournament.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      {tournament.logo_url && (
                        <img 
                          src={tournament.logo_url} 
                          alt="Tournament Logo" 
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(tournament.start_date).toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{tournament.venue?.name || 'Venue TBD'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{tournament.tournament_teams?.length || 0}/{tournament.max_teams} Teams</span>
                    </div>

                    <div className="flex justify-between items-center pt-2">
                      <div className="text-sm text-foreground">
                        <span className="font-medium">{getCategoryLabel(tournament.category)}</span>
                        <span className="text-muted-foreground ml-2">• {tournament.ball_type}</span>
                      </div>
                      {tournament.prize_money > 0 && (
                        <div className="flex items-center gap-1 text-success text-sm font-medium">
                          <DollarSign className="w-3 h-3" />
                          ₹{tournament.prize_money.toLocaleString()}
                        </div>
                      )}
                    </div>

                    {tournament.tournament_sponsors?.length > 0 && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="w-3 h-3" />
                        {tournament.tournament_sponsors.length} Sponsors
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="venues">
          <VenueManagement />
        </TabsContent>

        <TabsContent value="registration">
          <TournamentRegistration tournaments={tournaments} onUpdate={fetchTournaments} />
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="neon-card">
            <CardHeader>
              <CardTitle className="text-foreground">Tournament Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">{tournaments.length}</div>
                  <div className="text-sm text-muted-foreground">Total Tournaments</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-success">
                    {tournaments.filter(t => t.status === 'in_progress').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Active</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-warning">
                    {tournaments.filter(t => t.status === 'registration_open').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Registering</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-muted-foreground">
                    {tournaments.filter(t => t.status === 'completed').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TournamentManagement;
