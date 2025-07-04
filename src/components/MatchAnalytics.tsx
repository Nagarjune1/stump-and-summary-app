
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, Target, Activity, Clock } from "lucide-react";

const MatchAnalytics = ({ 
  matchData, 
  innings1Score, 
  innings2Score, 
  currentBatsmen, 
  currentBowler 
}) => {
  // Sample data for demonstration - in real app this would come from ball-by-ball data
  const runRateData = [
    { over: 1, runRate: 6.0, requiredRate: 8.5 },
    { over: 2, runRate: 7.5, requiredRate: 8.2 },
    { over: 3, runRate: 8.0, requiredRate: 8.0 },
    { over: 4, runRate: 6.5, requiredRate: 8.3 },
    { over: 5, runRate: 9.0, requiredRate: 7.8 },
  ];

  const wormData = [
    { over: 1, runs: 6 },
    { over: 2, runs: 21 },
    { over: 3, runs: 35 },
    { over: 4, runs: 48 },
    { over: 5, runs: 65 },
  ];

  const currentRunRate = innings2Score?.overs > 0 ? (innings2Score.runs / innings2Score.overs).toFixed(2) : '0.00';
  const requiredRunRate = innings1Score ? 
    ((innings1Score.runs + 1 - (innings2Score?.runs || 0)) / (20 - (innings2Score?.overs || 0))).toFixed(2) : '0.00';

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Current RR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentRunRate}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4" />
              Required RR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requiredRunRate}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Boundaries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(currentBatsmen[0]?.fours || 0) + (currentBatsmen[1]?.fours || 0)}×4, {(currentBatsmen[0]?.sixes || 0) + (currentBatsmen[1]?.sixes || 0)}×6
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Partnership
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {((currentBatsmen[0]?.runs || 0) + (currentBatsmen[1]?.runs || 0))} ({((currentBatsmen[0]?.balls || 0) + (currentBatsmen[1]?.balls || 0))})
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Run Rate Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Run Rate Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={runRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="over" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="runRate" stroke="#8884d8" name="Current RR" />
                <Line type="monotone" dataKey="requiredRate" stroke="#82ca9d" name="Required RR" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Score Progression */}
        <Card>
          <CardHeader>
            <CardTitle>Score Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={wormData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="over" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="runs" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Player Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Current Batsmen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentBatsmen.map((batsman, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-semibold">{batsman.name} {index === 0 ? '*' : ''}</p>
                  <p className="text-sm text-gray-600">
                    {batsman.runs} ({batsman.balls}b) • SR: {batsman.balls > 0 ? ((batsman.runs / batsman.balls) * 100).toFixed(1) : '0.0'}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{batsman.fours}×4</Badge>
                  <Badge variant="outline" className="ml-1">{batsman.sixes}×6</Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Bowler</CardTitle>
          </CardHeader>
          <CardContent>
            {currentBowler ? (
              <div className="p-3 bg-gray-50 rounded">
                <p className="font-semibold">{currentBowler.name}</p>
                <p className="text-sm text-gray-600">
                  {currentBowler.overs}-{currentBowler.runs}-{currentBowler.wickets} • 
                  Econ: {currentBowler.overs > 0 ? (currentBowler.runs / currentBowler.overs).toFixed(2) : '0.00'}
                </p>
              </div>
            ) : (
              <p className="text-gray-500">No bowler selected</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MatchAnalytics;
