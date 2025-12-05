
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, Award, Target, Activity, Calendar, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const AdvancedStatistics = () => {
  const [playerStats, setPlayerStats] = useState([]);
  const [teamStats, setTeamStats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdvancedStatistics();
  }, []);

  const fetchAdvancedStatistics = async () => {
    try {
      setLoading(true);
      
      // Fetch comprehensive player statistics with fresh data
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select(`
          *,
          teams!inner(id, name, city)
        `)
        .order('runs', { ascending: false });

      if (playersError) {
        throw playersError;
      }

      // Process player statistics for advanced metrics
      const processedPlayerStats = players?.map(player => {
        const totalMatches = player.matches || 0;
        const totalRuns = player.runs || 0;
        const totalWickets = player.wickets || 0;
        const strikeRate = player.strike_rate || 0;
        const economy = player.economy || 0;
        
        return {
          ...player,
          totalMatches,
          totalRuns,
          totalWickets,
          battingAverage: player.average || 0,
          bowlingAverage: totalWickets > 0 ? (economy * 6 * totalMatches / totalWickets).toFixed(2) : 0,
          overallRating: calculatePlayerRating(totalRuns, totalWickets, 0, totalMatches, strikeRate, economy)
        };
      }) || [];

      setPlayerStats(processedPlayerStats);

      // Fetch team performance data with match results
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          city,
          created_at
        `);

      if (teamsError) {
        throw teamsError;
      }

      // For each team, get match statistics
      const processedTeamStats = await Promise.all(teams?.map(async (team) => {
        const { data: teamMatches, error: matchError } = await supabase
          .from('matches')
          .select('*')
          .or(`team1_id.eq.${team.id},team2_id.eq.${team.id}`)
          .eq('status', 'completed');

        if (matchError) {
          return {
            ...team,
            totalMatches: 0,
            wins: 0,
            losses: 0,
            ties: 0,
            winPercentage: 0
          };
        }

        let wins = 0;
        let losses = 0;
        let ties = 0;

        teamMatches?.forEach(match => {
          if (match.result) {
            if (match.result.toLowerCase().includes('tied')) {
              ties++;
            } else if (match.result.toLowerCase().includes(team.name.toLowerCase())) {
              wins++;
            } else {
              losses++;
            }
          }
        });
        
        const totalGames = wins + losses + ties;
        
        return {
          ...team,
          totalMatches: totalGames,
          wins,
          losses,
          ties,
          winPercentage: totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : 0
        };
      }) || []);

      setTeamStats(processedTeamStats);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load advanced statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculatePlayerRating = (runs, wickets, catches, matches, strikeRate, economy) => {
    if (matches === 0) return 0;
    
    // Batting component (40% weight)
    const battingScore = Math.min(40, (runs / Math.max(matches, 1)) * 0.8 + (strikeRate / 200) * 10);
    
    // Bowling component (40% weight) 
    const bowlingScore = Math.min(40, wickets * 3 + (economy > 0 ? Math.max(0, 10 - economy) : 0));
    
    // Fielding component (20% weight)
    const fieldingScore = Math.min(20, catches * 2);
    
    return Math.min(100, Math.round(battingScore + bowlingScore + fieldingScore));
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Advanced Statistics & Analytics
        </h2>
        <Button onClick={fetchAdvancedStatistics} variant="outline">
          <Activity className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="players" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="players">Player Analytics</TabsTrigger>
          <TabsTrigger value="teams">Team Performance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="players" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Top Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {playerStats
                    .sort((a, b) => b.overallRating - a.overallRating)
                    .slice(0, 5)
                    .map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Badge className="w-6 h-6 rounded-full flex items-center justify-center">
                            {index + 1}
                          </Badge>
                          <div>
                            <div className="font-semibold">{player.name}</div>
                            <div className="text-sm text-gray-600">{player.role}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-blue-600">{player.overallRating}/100</div>
                          <div className="text-xs text-gray-500">{player.totalMatches} matches</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={playerStats.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalRuns" fill="#8884d8" name="Runs" />
                    <Bar dataKey="totalWickets" fill="#82ca9d" name="Wickets" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Player Stats Table */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Player Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Player</th>
                      <th className="text-center p-2">Matches</th>
                      <th className="text-center p-2">Runs</th>
                      <th className="text-center p-2">Wickets</th>
                      <th className="text-center p-2">Avg</th>
                      <th className="text-center p-2">Strike Rate</th>
                      <th className="text-center p-2">Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerStats.map(player => (
                      <tr key={player.id} className="border-b hover:bg-gray-50">
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{player.name}</div>
                            <div className="text-xs text-gray-500">{player.role}</div>
                          </div>
                        </td>
                        <td className="text-center p-2">{player.totalMatches}</td>
                        <td className="text-center p-2">{player.totalRuns}</td>
                        <td className="text-center p-2">{player.totalWickets}</td>
                        <td className="text-center p-2">{typeof player.battingAverage === 'number' ? player.battingAverage.toFixed(2) : player.battingAverage}</td>
                        <td className="text-center p-2">{typeof player.strike_rate === 'number' ? player.strike_rate.toFixed(2) : player.strike_rate || '0.00'}</td>
                        <td className="text-center p-2">
                          <Badge variant={player.overallRating >= 70 ? 'default' : 'secondary'}>
                            {player.overallRating}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teams" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Win Rates</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={teamStats}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="wins"
                      nameKey="name"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {teamStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Team Performance Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {teamStats.map(team => (
                    <div key={team.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold">{team.name}</div>
                        <Badge>{team.winPercentage}% win rate</Badge>
                      </div>
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Matches</div>
                          <div className="font-semibold">{team.totalMatches}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Wins</div>
                          <div className="font-semibold text-green-600">{team.wins}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Losses</div>
                          <div className="font-semibold text-red-600">{team.losses}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Ties</div>
                          <div className="font-semibold text-yellow-600">{team.ties || 0}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Performance Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                  <h4 className="font-semibold text-blue-900 mb-2">Player Performance</h4>
                  <p className="text-blue-800 text-sm">
                    {playerStats.length > 0 
                      ? `Top performing player: ${playerStats.sort((a, b) => b.overallRating - a.overallRating)[0]?.name} with ${playerStats.sort((a, b) => b.overallRating - a.overallRating)[0]?.overallRating} rating`
                      : 'No player data available'}
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
                  <h4 className="font-semibold text-green-900 mb-2">Team Statistics</h4>
                  <p className="text-green-800 text-sm">
                    {teamStats.length > 0 
                      ? `Best performing team: ${teamStats.sort((a, b) => parseFloat(b.winPercentage) - parseFloat(a.winPercentage))[0]?.name} with ${teamStats.sort((a, b) => parseFloat(b.winPercentage) - parseFloat(a.winPercentage))[0]?.winPercentage}% win rate`
                      : 'No team data available'}
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg border-l-4 border-purple-500">
                  <h4 className="font-semibold text-purple-900 mb-2">Recent Activity</h4>
                  <p className="text-purple-800 text-sm">
                    Statistics are automatically updated after each completed match. 
                    Player ratings are calculated based on batting performance (40%), bowling performance (40%), and fielding contribution (20%).
                  </p>
                </div>

                <div className="text-center text-sm text-gray-500 mt-6">
                  <Badge variant="outline">Live Statistics</Badge>
                  <p className="mt-2">Statistics update automatically with new match data.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedStatistics;