import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Target, Users, Award, Calendar, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AnalyticsData {
  totalMatches: number;
  totalRuns: number;
  totalWickets: number;
  averageScore: number;
  highestScore: number;
  lowestScore: number;
  winPercentage: number;
  recentForm: string[];
  topScorers: Array<{
    name: string;
    runs: number;
    matches: number;
    average: number;
  }>;
  topBowlers: Array<{
    name: string;
    wickets: number;
    matches: number;
    average: number;
  }>;
  venueStats: Array<{
    venue: string;
    matches: number;
    wins: number;
    winRate: number;
  }>;
  monthlyPerformance: Array<{
    month: string;
    matches: number;
    wins: number;
    runs: number;
  }>;
}

const AdvancedAnalytics = () => {
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [teams, setTeams] = useState<any[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<string>("all");

  useEffect(() => {
    fetchTeams();
  }, []);

  useEffect(() => {
    if (selectedTeam) {
      fetchAnalyticsData();
    }
  }, [selectedTeam, timeRange]);

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

  const fetchAnalyticsData = async () => {
    if (!selectedTeam) return;

    setLoading(true);
    try {
      // Fetch matches for the selected team
      let matchQuery = supabase
        .from('matches')
        .select(`
          *,
          team1:teams!matches_team1_id_fkey(name),
          team2:teams!matches_team2_id_fkey(name)
        `)
        .or(`team1_id.eq.${selectedTeam},team2_id.eq.${selectedTeam}`)
        .eq('status', 'completed');

      // Apply time range filter
      if (timeRange !== 'all') {
        const date = new Date();
        switch (timeRange) {
          case '30d':
            date.setDate(date.getDate() - 30);
            break;
          case '90d':
            date.setDate(date.getDate() - 90);
            break;
          case '1y':
            date.setFullYear(date.getFullYear() - 1);
            break;
        }
        matchQuery = matchQuery.gte('match_date', date.toISOString());
      }

      const { data: matches, error: matchError } = await matchQuery;
      if (matchError) throw matchError;

      // Fetch player statistics from match_stats table
      const { data: playerStats, error: playerError } = await supabase
        .from('match_stats')
        .select(`
          *,
          player:players(name, team_id),
          match:matches(team1_id, team2_id, winner_team_id)
        `)
        .in('match_id', matches?.map(m => m.id) || []);

      if (playerError) throw playerError;

      // Process the data
      const analytics = processAnalyticsData(matches || [], playerStats || [], selectedTeam);
      setAnalyticsData(analytics);

    } catch (error) {
      console.error('Error fetching analytics data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const processAnalyticsData = (matches: any[], playerStats: any[], teamId: string): AnalyticsData => {
    const teamMatches = matches.filter(m => 
      m.team1_id === teamId || m.team2_id === teamId
    );

    const wins = teamMatches.filter(m => m.winner_team_id === teamId).length;
    const totalMatches = teamMatches.length;
    
    // Calculate team scores - parse the score strings
    const teamScores = teamMatches.map(match => {
      const isTeam1 = match.team1_id === teamId;
      const scoreStr = isTeam1 ? match.team1_score : match.team2_score;
      if (!scoreStr) return 0;
      
      // Extract runs from score string like "150/5" or "150"
      const runs = parseInt(scoreStr.split('/')[0]) || 0;
      return runs;
    }).filter(score => score > 0);

    const totalRuns = teamScores.reduce((sum, score) => sum + score, 0);
    const averageScore = teamScores.length > 0 ? totalRuns / teamScores.length : 0;
    const highestScore = teamScores.length > 0 ? Math.max(...teamScores) : 0;
    const lowestScore = teamScores.length > 0 ? Math.min(...teamScores) : 0;

    // Process player statistics
    const teamPlayerStats = playerStats.filter(stat => 
      stat.player?.team_id === teamId
    );

    // Top scorers
    const scorerMap = new Map();
    teamPlayerStats.forEach(stat => {
      const playerId = stat.player_id;
      const playerName = stat.player?.name || 'Unknown';
      
      if (!scorerMap.has(playerId)) {
        scorerMap.set(playerId, {
          name: playerName,
          runs: 0,
          matches: 0,
          totalBalls: 0
        });
      }
      
      const player = scorerMap.get(playerId);
      player.runs += stat.runs_scored || 0;
      player.matches += 1;
      player.totalBalls += stat.balls_faced || 0;
    });

    const topScorers = Array.from(scorerMap.values())
      .map(player => ({
        ...player,
        average: player.matches > 0 ? player.runs / player.matches : 0
      }))
      .sort((a, b) => b.runs - a.runs)
      .slice(0, 5);

    // Top bowlers
    const bowlerMap = new Map();
    teamPlayerStats.forEach(stat => {
      const playerId = stat.player_id;
      const playerName = stat.player?.name || 'Unknown';
      
      if (!bowlerMap.has(playerId)) {
        bowlerMap.set(playerId, {
          name: playerName,
          wickets: 0,
          matches: 0,
          runsConceded: 0
        });
      }
      
      const bowler = bowlerMap.get(playerId);
      bowler.wickets += stat.wickets_taken || 0;
      bowler.matches += stat.overs_bowled > 0 ? 1 : 0;
      bowler.runsConceded += stat.runs_conceded || 0;
    });

    const topBowlers = Array.from(bowlerMap.values())
      .filter(bowler => bowler.matches > 0)
      .map(bowler => ({
        ...bowler,
        average: bowler.wickets > 0 ? bowler.runsConceded / bowler.wickets : 0
      }))
      .sort((a, b) => b.wickets - a.wickets)
      .slice(0, 5);

    // Venue statistics
    const venueMap = new Map();
    teamMatches.forEach(match => {
      const venue = match.venue || 'Unknown';
      if (!venueMap.has(venue)) {
        venueMap.set(venue, { matches: 0, wins: 0 });
      }
      const venueData = venueMap.get(venue);
      venueData.matches += 1;
      if (match.winner_team_id === teamId) {
        venueData.wins += 1;
      }
    });

    const venueStats = Array.from(venueMap.entries())
      .map(([venue, data]) => ({
        venue,
        matches: data.matches,
        wins: data.wins,
        winRate: (data.wins / data.matches) * 100
      }))
      .sort((a, b) => b.matches - a.matches);

    // Monthly performance
    const monthlyMap = new Map();
    teamMatches.forEach(match => {
      const date = new Date(match.match_date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, { matches: 0, wins: 0, runs: 0 });
      }
      
      const monthData = monthlyMap.get(monthKey);
      monthData.matches += 1;
      if (match.winner_team_id === teamId) {
        monthData.wins += 1;
      }
      
      const isTeam1 = match.team1_id === teamId;
      const scoreStr = isTeam1 ? match.team1_score : match.team2_score;
      const runs = scoreStr ? parseInt(scoreStr.split('/')[0]) || 0 : 0;
      monthData.runs += runs;
    });

    const monthlyPerformance = Array.from(monthlyMap.entries())
      .map(([month, data]) => ({
        month,
        matches: data.matches,
        wins: data.wins,
        runs: data.runs
      }))
      .sort((a, b) => a.month.localeCompare(b.month))
      .slice(-12); // Last 12 months

    // Recent form (last 10 matches)
    const recentMatches = teamMatches
      .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
      .slice(0, 10);
    
    const recentForm = recentMatches.map(match => 
      match.winner_team_id === teamId ? 'W' : 'L'
    );

    return {
      totalMatches,
      totalRuns,
      totalWickets: 0, // Would need bowling stats
      averageScore,
      highestScore,
      lowestScore,
      winPercentage: totalMatches > 0 ? (wins / totalMatches) * 100 : 0,
      recentForm,
      topScorers,
      topBowlers,
      venueStats,
      monthlyPerformance
    };
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (!selectedTeam) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="w-6 h-6" />
              Advanced Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">Select a Team</h3>
              <p className="text-gray-600 mb-6">Choose a team to view detailed analytics and performance insights</p>
              
              <div className="max-w-md mx-auto">
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const selectedTeamData = teams.find(t => t.id === selectedTeam);

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                {selectedTeamData?.name} Analytics
              </CardTitle>
              <p className="text-gray-600 mt-1">Comprehensive performance insights and statistics</p>
            </div>
            
            <div className="flex gap-2">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {loading ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading analytics data...</p>
            </div>
          </CardContent>
        </Card>
      ) : analyticsData ? (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Matches</p>
                    <p className="text-2xl font-bold">{analyticsData.totalMatches}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Win Percentage</p>
                    <p className="text-2xl font-bold">{analyticsData.winPercentage.toFixed(1)}%</p>
                  </div>
                  <Award className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold">{analyticsData.averageScore.toFixed(0)}</p>
                  </div>
                  <Target className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Highest Score</p>
                    <p className="text-2xl font-bold">{analyticsData.highestScore}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Form */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Form (Last 10 Matches)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {analyticsData.recentForm.map((result, index) => (
                  <Badge
                    key={index}
                    variant={result === 'W' ? 'default' : 'destructive'}
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      result === 'W' ? 'bg-green-600' : 'bg-red-600'
                    }`}
                  >
                    {result}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Scorers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Scorers</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.topScorers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="runs" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top Bowlers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Bowlers</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.topBowlers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="wickets" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Monthly Performance Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={analyticsData.monthlyPerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="matches" fill="#8884d8" name="Matches" />
                  <Line yAxisId="right" type="monotone" dataKey="wins" stroke="#82ca9d" name="Wins" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Venue Statistics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Venue Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.venueStats.slice(0, 5).map((venue, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{venue.venue}</p>
                      <p className="text-sm text-gray-600">{venue.matches} matches</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{venue.winRate.toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">{venue.wins} wins</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <p className="text-gray-500">No data available for the selected team and time range.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdvancedAnalytics;
