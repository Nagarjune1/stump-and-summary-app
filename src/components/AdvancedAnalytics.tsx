import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import SafeSelectItem from "@/components/ui/SafeSelectItem";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { TrendingUp, Target, Award, Users, Activity, Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { ensureValidSelectItemValue } from "@/utils/selectUtils";

interface Match {
  id: string;
  match_date: string;
  team1?: { name: string };
  team2?: { name: string };
  status: string;
}

interface Player {
  id: string;
  name: string;
  role: string;
  team_id: string;
  teams?: { name: string };
}

interface MatchStat {
  runs_scored?: number;
  wickets_taken?: number;
  strike_rate?: number;
  economy_rate?: number;
  players?: { name: string; role: string };
  matches?: {
    match_date: string;
    team1?: { name: string };
    team2?: { name: string };
  };
}

interface PerformanceMetric {
  player: string;
  runs: number;
  wickets: number;
  strikeRate: number;
  economy: number;
  match: string;
}

interface TrendData {
  date: string;
  runs: number;
  wickets: number;
  matches: number;
}

interface PlayerComparison {
  name: string;
  totalRuns: number;
  totalWickets: number;
  matches: number;
  role: string;
}

const AdvancedAnalytics = () => {
  const [selectedMatch, setSelectedMatch] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [analytics, setAnalytics] = useState({
    performanceMetrics: [] as PerformanceMetric[],
    trendAnalysis: [] as TrendData[],
    playerComparison: [] as PlayerComparison[],
    teamPerformance: []
  });

  useEffect(() => {
    fetchMatches();
    fetchPlayers();
  }, []);

  useEffect(() => {
    if (selectedMatch || selectedPlayer) {
      generateAnalytics();
    }
  }, [selectedMatch, selectedPlayer]);

  const fetchMatches = async () => {
    try {
      const { data, error } = await supabase
        .from('matches')
        .select(`
          id,
          match_date,
          team1:teams!matches_team1_id_fkey(name),
          team2:teams!matches_team2_id_fkey(name),
          status
        `)
        .eq('status', 'completed')
        .order('match_date', { ascending: false });

      if (error) {
        console.error('Error fetching matches:', error);
        return;
      }
      
      setMatches(data || []);
    } catch (error) {
      console.error('Error fetching matches:', error);
    }
  };

  const fetchPlayers = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('id, name, role, team_id, teams(name)')
        .order('name');

      if (error) {
        console.error('Error fetching players:', error);
        return;
      }
      
      setPlayers(data || []);
    } catch (error) {
      console.error('Error fetching players:', error);
    }
  };

  const generateAnalytics = async () => {
    try {
      let query = supabase
        .from('match_stats')
        .select(`
          *,
          players(name, role),
          matches(match_date, team1:teams!matches_team1_id_fkey(name), team2:teams!matches_team2_id_fkey(name))
        `);

      if (selectedMatch) {
        query = query.eq('match_id', selectedMatch);
      }
      if (selectedPlayer) {
        query = query.eq('player_id', selectedPlayer);
      }

      const { data: statsData, error } = await query;
      if (error) {
        console.error('Error generating analytics:', error);
        return;
      }

      const performanceMetrics = processPerformanceMetrics(statsData);
      const trendAnalysis = processTrendAnalysis(statsData);
      const playerComparison = processPlayerComparison(statsData);
      const teamPerformance = processTeamPerformance(statsData);

      setAnalytics({
        performanceMetrics,
        trendAnalysis,
        playerComparison,
        teamPerformance
      });
    } catch (error) {
      console.error('Error generating analytics:', error);
      toast({
        title: "Error",
        description: "Failed to generate analytics",
        variant: "destructive"
      });
    }
  };

  const processPerformanceMetrics = (data: MatchStat[]): PerformanceMetric[] => {
    if (!data?.length) return [];
    
    return data.map(stat => ({
      player: stat.players?.name || 'Unknown',
      runs: stat.runs_scored || 0,
      wickets: stat.wickets_taken || 0,
      strikeRate: stat.strike_rate || 0,
      economy: stat.economy_rate || 0,
      match: `${stat.matches?.team1?.name || 'Team1'} vs ${stat.matches?.team2?.name || 'Team2'}`
    }));
  };

  const processTrendAnalysis = (data: MatchStat[]): TrendData[] => {
    if (!data?.length) return [];
    
    const trends: { [key: string]: TrendData } = {};
    data.forEach(stat => {
      const date = stat.matches?.match_date;
      if (!date) return;
      
      if (!trends[date]) {
        trends[date] = { date, runs: 0, wickets: 0, matches: 0 };
      }
      trends[date].runs += stat.runs_scored || 0;
      trends[date].wickets += stat.wickets_taken || 0;
      trends[date].matches += 1;
    });
    
    return Object.values(trends).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const processPlayerComparison = (data: MatchStat[]): PlayerComparison[] => {
    if (!data?.length) return [];
    
    const playerStats: { [key: string]: PlayerComparison } = {};
    data.forEach(stat => {
      const player = stat.players?.name || 'Unknown';
      if (!playerStats[player]) {
        playerStats[player] = {
          name: player,
          totalRuns: 0,
          totalWickets: 0,
          matches: 0,
          role: stat.players?.role || 'Unknown'
        };
      }
      playerStats[player].totalRuns += stat.runs_scored || 0;
      playerStats[player].totalWickets += stat.wickets_taken || 0;
      playerStats[player].matches += 1;
    });
    
    return Object.values(playerStats);
  };

  const processTeamPerformance = (data: MatchStat[]) => {
    return [];
  };

  const exportAnalytics = () => {
    const analyticsData = {
      generatedAt: new Date().toISOString(),
      filters: { selectedMatch, selectedPlayer },
      analytics
    };
    
    const blob = new Blob([JSON.stringify(analyticsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cricket-analytics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Analytics Exported",
      description: "Analytics data has been downloaded as JSON file",
    });
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Advanced Analytics</h2>
          <p className="text-gray-600">Deep insights into player and team performance</p>
        </div>
        <Button onClick={exportAnalytics} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Data
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Filters & Options
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Select Match</label>
            <Select value={selectedMatch} onValueChange={setSelectedMatch}>
              <SelectTrigger>
                <SelectValue placeholder="All matches" />
              </SelectTrigger>
              <SelectContent>
                <SafeSelectItem value="">All matches</SafeSelectItem>
                {matches.map((match) => (
                  <SafeSelectItem key={match.id} value={ensureValidSelectItemValue(match.id)}>
                    {match.team1?.name} vs {match.team2?.name} ({new Date(match.match_date).toLocaleDateString()})
                  </SafeSelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Select Player</label>
            <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
              <SelectTrigger>
                <SelectValue placeholder="All players" />
              </SelectTrigger>
              <SelectContent>
                <SafeSelectItem value="">All players</SafeSelectItem>
                {players.map((player) => (
                  <SafeSelectItem key={player.id} value={ensureValidSelectItemValue(player.id)}>
                    {player.name} ({player.role})
                  </SafeSelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="performance" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
          <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
          <TabsTrigger value="comparison">Player Comparison</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Performance Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.performanceMetrics.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={analytics.performanceMetrics}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="player" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="runs" fill="#8884d8" name="Runs" />
                    <Bar dataKey="wickets" fill="#82ca9d" name="Wickets" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No performance data available. Select filters to view analytics.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Performance Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.trendAnalysis.length > 0 ? (
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={analytics.trendAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="runs" stroke="#8884d8" name="Total Runs" />
                    <Line type="monotone" dataKey="wickets" stroke="#82ca9d" name="Total Wickets" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No trend data available. Play more matches to see trends.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Player Performance Comparison
              </CardTitle>
            </CardHeader>
            <CardContent>
              {analytics.playerComparison.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {analytics.playerComparison.map((player, index) => (
                    <Card key={player.name} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">{player.name}</h3>
                        <Badge variant="outline">{player.role}</Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Runs:</span>
                          <span className="font-medium">{player.totalRuns}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Wickets:</span>
                          <span className="font-medium">{player.totalWickets}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Matches:</span>
                          <span className="font-medium">{player.matches}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Avg per Match:</span>
                          <span className="font-medium">
                            {player.matches > 0 ? (player.totalRuns / player.matches).toFixed(1) : '0.0'} runs
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No comparison data available. Play matches to compare players.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                AI-Powered Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">Performance Insights</h3>
                  <p className="text-blue-700 text-sm">
                    Based on current data, we're analyzing player performance patterns. 
                    More insights will be available as you play more matches and collect more data.
                  </p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Recommendations</h3>
                  <ul className="text-green-700 text-sm space-y-1">
                    <li>• Play more matches to unlock detailed AI insights</li>
                    <li>• Track player performance across different match formats</li>
                    <li>• Monitor team composition effectiveness</li>
                    <li>• Analyze batting and bowling partnerships</li>
                  </ul>
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2">Coming Soon</h3>
                  <p className="text-orange-700 text-sm">
                    Advanced AI features including predictive analytics, match outcome predictions, 
                    and personalized coaching recommendations will be available in future updates.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedAnalytics;
