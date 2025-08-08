
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

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch live matches
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-primary neon-glow">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary neon-glow mb-2">Dashboard</h1>
        <p className="text-accent">Live cricket matches and statistics</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="neon-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-accent flex items-center gap-2">
              <Activity className="w-4 h-4 text-warning" />
              Live Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning neon-glow">{stats.liveMatches}</div>
          </CardContent>
        </Card>

        <Card className="neon-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-accent flex items-center gap-2">
              <Trophy className="w-4 h-4 text-success" />
              Completed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.completedToday}</div>
          </CardContent>
        </Card>

        <Card className="neon-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-accent flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Upcoming Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.upcomingToday}</div>
          </CardContent>
        </Card>

        <Card className="neon-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-accent flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              Total Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalMatches}</div>
          </CardContent>
        </Card>
      </div>

      {/* Live Matches */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-primary neon-glow mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-warning" />
          Live Matches
        </h2>
        
        <div className="space-y-4">
          {liveMatches.length === 0 ? (
            <Card className="neon-card">
              <CardContent className="p-6 text-center">
                <Play className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-primary mb-2">No Live Matches</h3>
                <p className="text-muted-foreground">There are currently no live matches in progress.</p>
              </CardContent>
            </Card>
          ) : (
            liveMatches.map((match) => (
              <Card key={match.id} className="neon-card border-warning/30">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <Badge className="cricket-warning neon-glow animate-pulse">
                        LIVE
                      </Badge>
                      <span className="text-sm text-accent">{match.venue} • {match.format}</span>
                    </div>
                    <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                      Watch Live
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg text-foreground">{match.team1?.name || 'Team 1'}</span>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary neon-glow">
                            {match.team1_score || '0/0'}
                          </div>
                          <div className="text-sm text-accent">({match.team1_overs || '0.0'} overs)</div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-lg text-foreground">{match.team2?.name || 'Team 2'}</span>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary neon-glow">
                            {match.team2_score || '0/0'}
                          </div>
                          <div className="text-sm text-accent">({match.team2_overs || '0.0'} overs)</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border">
                    <div className="flex justify-between text-sm text-accent">
                      <span>Match: {match.format} • {match.venue}</span>
                      <span>Tournament: {match.tournament || 'Friendly'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Recent Matches */}
      <div>
        <h2 className="text-xl font-semibold text-primary neon-glow mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-success" />
          Recent Results
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentMatches.length === 0 ? (
            <Card className="neon-card">
              <CardContent className="p-6 text-center">
                <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold text-primary mb-2">No Recent Matches</h3>
                <p className="text-muted-foreground">No completed matches to display.</p>
              </CardContent>
            </Card>
          ) : (
            recentMatches.map((match) => (
              <Card key={match.id} className="neon-card">
                <CardContent className="p-4">
                  <div className="space-y-3">
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
                      <div className="text-sm text-success font-medium">
                        Result: {match.result}
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
