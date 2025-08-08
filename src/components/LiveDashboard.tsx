
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Users, 
  Trophy, 
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Activity
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const LiveDashboard = () => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [recentMatches, setRecentMatches] = useState([]);
  const [stats, setStats] = useState({
    totalMatches: 0,
    liveMatches: 0,
    completedToday: 0,
    upcomingToday: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchDashboardData();
    // Set up real-time subscription for live matches
    const channel = supabase
      .channel('dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        () => fetchDashboardData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch live matches with team details
      const { data: liveData, error: liveError } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!matches_team1_id_fkey(name),
          team2:teams!matches_team2_id_fkey(name)
        `)
        .eq('status', 'live')
        .order('created_at', { ascending: false });

      if (liveError) throw liveError;

      // Fetch recent completed matches
      const { data: recentData, error: recentError } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!matches_team1_id_fkey(name),
          team2:teams!matches_team2_id_fkey(name)
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(6);

      if (recentError) throw recentError;

      // Fetch statistics
      const today = new Date().toISOString().split('T')[0];
      
      const { count: totalCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true });

      const { count: liveCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'live');

      const { count: completedTodayCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'completed')
        .eq('match_date', today);

      const { count: upcomingTodayCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'upcoming')
        .eq('match_date', today);

      setLiveMatches(liveData || []);
      setRecentMatches(recentData || []);
      setStats({
        totalMatches: totalCount || 0,
        liveMatches: liveCount || 0,
        completedToday: completedTodayCount || 0,
        upcomingToday: upcomingTodayCount || 0
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWatchLive = (matchId) => {
    navigate(`/live-scoring?match=${matchId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-primary neon-glow animate-pulse">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-primary neon-glow mb-2">Live Cricket Dashboard</h1>
        <p className="text-accent text-lg">Real-time match updates and statistics</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="neon-card border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-accent flex items-center gap-2">
              <Activity className="w-5 h-5 text-warning" />
              Live Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-warning neon-glow">{stats.liveMatches}</div>
            <p className="text-xs text-muted-foreground mt-1">Currently in progress</p>
          </CardContent>
        </Card>

        <Card className="neon-card border-success/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-accent flex items-center gap-2">
              <Trophy className="w-5 h-5 text-success" />
              Completed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-success neon-glow">{stats.completedToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Finished matches</p>
          </CardContent>
        </Card>

        <Card className="neon-card border-primary/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-accent flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Upcoming Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary neon-glow">{stats.upcomingToday}</div>
            <p className="text-xs text-muted-foreground mt-1">Scheduled matches</p>
          </CardContent>
        </Card>

        <Card className="neon-card border-accent/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-accent flex items-center gap-2">
              <Calendar className="w-5 h-5 text-accent" />
              Total Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground neon-glow">{stats.totalMatches}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Live Matches Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-primary neon-glow mb-6 flex items-center gap-3">
          <Play className="w-6 h-6 text-warning" />
          Live Matches ({stats.liveMatches})
        </h2>
        
        <div className="space-y-6">
          {liveMatches.length === 0 ? (
            <Card className="neon-card">
              <CardContent className="p-8 text-center">
                <Play className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">No Live Matches</h3>
                <p className="text-muted-foreground">There are currently no matches in progress.</p>
                <Button 
                  onClick={() => navigate('/create-match')}
                  className="mt-4 bg-primary hover:bg-primary/90 neon-glow"
                >
                  Create New Match
                </Button>
              </CardContent>
            </Card>
          ) : (
            liveMatches.map((match) => (
              <Card key={match.id} className="neon-card border-warning/50 shadow-lg shadow-warning/20">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                      <Badge className="bg-warning/20 text-warning border-warning neon-glow animate-pulse px-3 py-1">
                        <Activity className="w-3 h-3 mr-1" />
                        LIVE
                      </Badge>
                      <div className="text-sm text-accent">
                        {match.venue} • {match.format} • {match.overs} overs
                      </div>
                    </div>
                    <Button 
                      onClick={() => handleWatchLive(match.id)}
                      className="bg-primary hover:bg-primary/90 neon-glow"
                      size="sm"
                    >
                      Watch Live
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xl text-foreground">{match.team1?.name || 'Team 1'}</span>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-primary neon-glow">
                            {match.team1_score || '0/0'}
                          </div>
                          <div className="text-sm text-accent">({match.team1_overs || '0.0'} ov)</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xl text-foreground">{match.team2?.name || 'Team 2'}</span>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-primary neon-glow">
                            {match.team2_score || '0/0'}
                          </div>
                          <div className="text-sm text-accent">({match.team2_overs || '0.0'} ov)</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-border">
                    <div className="flex justify-between items-center text-sm text-accent">
                      <span>Format: {match.format} • Venue: {match.venue}</span>
                      <span>Tournament: {match.tournament || 'Friendly Match'}</span>
                    </div>
                    {match.result && (
                      <div className="mt-2 text-sm font-medium text-success">
                        Result: {match.result}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Recent Results */}
      <div>
        <h2 className="text-2xl font-bold text-primary neon-glow mb-6 flex items-center gap-3">
          <Trophy className="w-6 h-6 text-success" />
          Recent Results
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentMatches.length === 0 ? (
            <Card className="neon-card col-span-full">
              <CardContent className="p-8 text-center">
                <Trophy className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold text-primary mb-2">No Recent Matches</h3>
                <p className="text-muted-foreground">No completed matches to display.</p>
              </CardContent>
            </Card>
          ) : (
            recentMatches.map((match) => (
              <Card key={match.id} className="neon-card border-success/30">
                <CardContent className="p-4">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Badge variant="outline" className="text-success border-success">
                        Completed
                      </Badge>
                      <span className="text-sm text-accent">{new Date(match.match_date).toLocaleDateString()}</span>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">{match.team1?.name || 'Team 1'}</span>
                        <span className="font-bold text-primary">{match.team1_score || '0/0'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-foreground">{match.team2?.name || 'Team 2'}</span>
                        <span className="font-bold text-primary">{match.team2_score || '0/0'}</span>
                      </div>
                    </div>

                    {match.result && (
                      <div className="text-sm text-success font-medium border-t border-border pt-2">
                        {match.result}
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      {match.venue} • {match.format}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default LiveDashboard;
