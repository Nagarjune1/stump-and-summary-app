import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trophy, Users, Activity, BookOpen, BarChart3, WifiOff, Rocket, LogOut, Play } from "lucide-react";
import { useAuth } from "@/components/AuthProvider";
import LiveScoring from "@/components/LiveScoring";
import PlayerProfiles from "@/components/PlayerProfiles";
import MatchSummary from "@/components/MatchSummary";
import CreateMatch from "@/components/CreateMatch";
import Documentation from "@/components/Documentation";
import AdvancedAnalytics from "@/components/AdvancedAnalytics";
import OfflineScoring from "@/components/OfflineScoring";
import ReleaseNotes from "@/components/ReleaseNotes";
import TournamentManagement from "@/components/TournamentManagement";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentMatch, setCurrentMatch] = useState(null);
  const [selectedLiveMatch, setSelectedLiveMatch] = useState(null);
  const [stats, setStats] = useState({
    totalMatches: 0,
    totalPlayers: 0,
    recentMatches: [],
    liveMatches: []
  });
  const [showDocumentation, setShowDocumentation] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
      return;
    }
    
    if (user) {
      fetchDashboardStats();
      fetchAppSettings();
    }
  }, [user, loading, navigate]);

  const fetchAppSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value')
        .eq('setting_key', 'show_documentation');

      if (error) throw error;

      if (data && data.length > 0) {
        setShowDocumentation(data[0].setting_value === 'true');
      }
    } catch (error) {
      console.error('Error fetching app settings:', error);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      const { count: matchCount } = await supabase
        .from('matches')
        .select('*', { count: 'exact', head: true });

      const { count: playerCount } = await supabase
        .from('players')
        .select('*', { count: 'exact', head: true });

      const { data: recentMatches, error } = await supabase
        .from('matches')
        .select(`
          id,
          status,
          result,
          match_date,
          venue,
          format,
          team1:teams!matches_team1_id_fkey(name),
          team2:teams!matches_team2_id_fkey(name)
        `)
        .order('match_date', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching recent matches:', error);
      }

      // Fetch live matches separately
      const { data: liveMatches } = await supabase
        .from('matches')
        .select(`
          id,
          status,
          venue,
          format,
          match_date,
          team1:teams!matches_team1_id_fkey(name),
          team2:teams!matches_team2_id_fkey(name)
        `)
        .eq('status', 'live')
        .order('match_date', { ascending: false });

      setStats({
        totalMatches: matchCount || 0,
        totalPlayers: playerCount || 0,
        recentMatches: recentMatches || [],
        liveMatches: liveMatches || []
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const handleMatchCreated = (match) => {
    setCurrentMatch(match);
  };

  const handleMatchStarted = (match) => {
    setCurrentMatch(match);
    setActiveTab("scoring");
  };

  const handleLiveMatchSelect = (match) => {
    setSelectedLiveMatch(match);
    setCurrentMatch(match);
    setActiveTab("scoring");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <Trophy className="w-16 h-16 mx-auto mb-4 text-green-600 animate-spin" />
          <p className="text-lg text-gray-600">Loading Cricket Scorer Pro...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // This will redirect to auth page via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold mb-2">Cricket Scorer Pro</h1>
              <p className="text-green-100">Professional Cricket Scoring & Analytics</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-green-100">Welcome back,</p>
                <p className="font-semibold">{user.email}</p>
              </div>
              <Button onClick={handleSignOut} variant="outline" className="text-green-600 border-white hover:bg-white">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
              <Badge className="bg-white/10 text-white border-white/20">
                v1.3.0
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid w-full ${showDocumentation ? 'grid-cols-10' : 'grid-cols-9'} mb-6`}>
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="tournaments" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Tournaments</span>
            </TabsTrigger>
            <TabsTrigger value="scoring" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Live Score</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="offline" className="flex items-center gap-2">
              <WifiOff className="w-4 h-4" />
              <span className="hidden sm:inline">Offline</span>
            </TabsTrigger>
            <TabsTrigger value="players" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Players</span>
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Matches</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Match</span>
            </TabsTrigger>
            <TabsTrigger value="releases" className="flex items-center gap-2">
              <Rocket className="w-4 h-4" />
              <span className="hidden sm:inline">Releases</span>
            </TabsTrigger>
            {showDocumentation && (
              <TabsTrigger value="docs" className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">Docs</span>
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Live Matches Section */}
            {stats.liveMatches.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Play className="w-5 h-5 text-red-500" />
                  Live Matches ({stats.liveMatches.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:graph-cols-3 gap-4">
                  {stats.liveMatches.map((match) => (
                    <Card 
                      key={match.id} 
                      className="cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-l-red-500"
                      onClick={() => handleLiveMatchSelect(match)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge className="bg-red-100 text-red-800 animate-pulse">
                            LIVE
                          </Badge>
                          <span className="text-sm text-gray-500">{match.format}</span>
                        </div>
                        <h4 className="font-semibold mb-1">
                          {match.team1?.name || 'Team 1'} vs {match.team2?.name || 'Team 2'}
                        </h4>
                        <p className="text-sm text-gray-600">{match.venue}</p>
                        <p className="text-xs text-gray-500">{new Date(match.match_date).toLocaleDateString()}</p>
                        <Button className="w-full mt-3" size="sm">
                          <Play className="w-4 h-4 mr-2" />
                          View Live Score
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalMatches}</div>
                  <p className="text-xs text-blue-100">All time</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Players</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPlayers}</div>
                  <p className="text-xs text-green-100">Registered</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Live Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.liveMatches.length}</div>
                  <p className="text-xs text-red-100">Currently active</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Completed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.recentMatches.filter(m => m.status === 'completed').length}
                  </div>
                  <p className="text-xs text-orange-100">Recent matches</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Recent Matches
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stats.recentMatches.length === 0 ? (
                    <p className="text-gray-500 text-center py-4">No matches yet. Create your first match!</p>
                  ) : (
                    stats.recentMatches.map((match, index) => (
                      <div key={match.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">
                            {match.team1?.name || 'Team 1'} vs {match.team2?.name || 'Team 2'}
                          </p>
                          <p className="text-xs text-gray-600">
                            {match.result || (match.status === 'live' ? 'In Progress' : 'Upcoming')}
                          </p>
                        </div>
                        <Badge variant={match.status === "live" ? "default" : match.status === "completed" ? "secondary" : "outline"}>
                          {new Date(match.match_date).toLocaleDateString()}
                        </Badge>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => setActiveTab("create")} 
                    className="w-full justify-start bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Match
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("analytics")} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("offline")} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <WifiOff className="w-4 h-4 mr-2" />
                    Offline Scoring
                  </Button>
                  <Button 
                    onClick={() => setActiveTab("players")} 
                    variant="outline" 
                    className="w-full justify-start"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Manage Players
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tournaments">
            <TournamentManagement />
          </TabsContent>

          <TabsContent value="scoring">
            <LiveScoring currentMatch={currentMatch} />
          </TabsContent>

          <TabsContent value="analytics">
            <AdvancedAnalytics />
          </TabsContent>

          <TabsContent value="offline">
            <OfflineScoring />
          </TabsContent>

          <TabsContent value="players">
            <PlayerProfiles />
          </TabsContent>

          <TabsContent value="matches">
            <MatchSummary />
          </TabsContent>

          <TabsContent value="create">
            <CreateMatch 
              onMatchCreated={handleMatchCreated} 
              onMatchStarted={handleMatchStarted}
            />
          </TabsContent>

          <TabsContent value="releases">
            <ReleaseNotes />
          </TabsContent>

          {showDocumentation && (
            <TabsContent value="docs">
              <Documentation />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
