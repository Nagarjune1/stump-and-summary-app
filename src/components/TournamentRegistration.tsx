
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, Calendar, MapPin, Trophy, IndianRupee, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const TournamentRegistration = ({ tournaments, onUpdate }) => {
  const [teams, setTeams] = useState([]);
  const [selectedTournament, setSelectedTournament] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [registrations, setRegistrations] = useState([]);
  const [showRegistrationDialog, setShowRegistrationDialog] = useState(false);
  const [loading, setLoading] = useState(false);

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
      toast.error('Please select both tournament and team');
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
          toast.error('Team is already registered for this tournament');
        } else {
          throw error;
        }
        return;
      }

      toast.success('Team registered successfully!');
      setShowRegistrationDialog(false);
      setSelectedTournament('');
      setSelectedTeam('');
      fetchRegistrations();
      onUpdate();
    } catch (error) {
      console.error('Error registering team:', error);
      toast.error('Failed to register team');
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

      toast.success(`Payment status updated to ${status}`);
      fetchRegistrations();
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'refunded': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const openTournaments = tournaments.filter(t => 
    t.status === 'registration_open' || t.status === 'upcoming'
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Tournament Registration</h2>
          <p className="text-gray-600">Manage team registrations for tournaments</p>
        </div>
        
        <Dialog open={showRegistrationDialog} onOpenChange={setShowRegistrationDialog}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Plus className="w-4 h-4 mr-2" />
              Register Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Register Team for Tournament</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="tournament">Select Tournament</Label>
                <Select value={selectedTournament} onValueChange={setSelectedTournament}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose tournament" />
                  </SelectTrigger>
                  <SelectContent>
                    {openTournaments.map((tournament) => (
                      <SelectItem key={tournament.id} value={tournament.id}>
                        {tournament.name}
                        {tournament.registration_fee > 0 && (
                          <span className="text-sm text-gray-500 ml-2">
                            (₹{tournament.registration_fee})
                          </span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="team">Select Team</Label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                        {team.city && <span className="text-sm text-gray-500 ml-2">({team.city})</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowRegistrationDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleRegisterTeam} disabled={loading}>
                  {loading ? 'Registering...' : 'Register Team'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Open Tournaments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Open for Registration
          </CardTitle>
        </CardHeader>
        <CardContent>
          {openTournaments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No tournaments open for registration</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {openTournaments.map((tournament) => (
                <Card key={tournament.id} className="border-green-200">
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <h3 className="font-semibold">{tournament.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(tournament.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Users className="w-4 h-4" />
                        <span>{tournament.tournament_teams?.length || 0}/{tournament.max_teams} teams</span>
                      </div>
                      {tournament.registration_fee > 0 && (
                        <div className="flex items-center gap-2 text-sm text-green-600">
                          <IndianRupee className="w-4 h-4" />
                          <span>₹{tournament.registration_fee} registration fee</span>
                        </div>
                      )}
                      <Badge className="bg-green-500 text-white">
                        {tournament.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Registrations */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Registrations</CardTitle>
        </CardHeader>
        <CardContent>
          {registrations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No registrations yet</p>
          ) : (
            <div className="space-y-3">
              {registrations.slice(0, 10).map((registration) => (
                <div key={registration.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{registration.team?.name}</div>
                    <div className="text-sm text-gray-600">{registration.tournament?.name}</div>
                    <div className="text-xs text-gray-500">
                      Registered: {new Date(registration.registration_date).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`${getPaymentStatusColor(registration.payment_status)} text-white text-xs`}>
                      {registration.payment_status.toUpperCase()}
                    </Badge>
                    
                    {registration.payment_status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={() => updatePaymentStatus(registration.id, 'paid')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Mark Paid
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

export default TournamentRegistration;
