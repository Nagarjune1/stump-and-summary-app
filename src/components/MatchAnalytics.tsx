
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const MatchAnalytics = ({ matchData, innings1Score, innings2Score, currentBatsmen, currentBowler }) => {
  // Sample data for charts - in a real app, this would come from detailed ball-by-ball data
  const oversData = [
    { over: 1, runs: 8 },
    { over: 2, runs: 12 },
    { over: 3, runs: 6 },
    { over: 4, runs: 15 },
    { over: 5, runs: 9 },
    { over: 6, runs: 11 }
  ];

  const runRateData = [
    { over: 1, rate: 8.0 },
    { over: 2, rate: 10.0 },
    { over: 3, rate: 8.7 },
    { over: 4, rate: 10.3 },
    { over: 5, rate: 10.0 },
    { over: 6, rate: 10.2 }
  ];

  const batsmenData = currentBatsmen.map(batsman => ({
    name: batsman.name,
    runs: batsman.runs || 0,
    balls: batsman.balls || 0,
    strikeRate: batsman.balls ? ((batsman.runs / batsman.balls) * 100).toFixed(1) : 0
  }));

  const wagonWheelData = [
    { name: 'Leg Side', value: 35, fill: '#8884d8' },
    { name: 'Off Side', value: 45, fill: '#82ca9d' },
    { name: 'Straight', value: 20, fill: '#ffc658' }
  ];

  const chartConfig = {
    runs: {
      label: "Runs",
      color: "#2563eb",
    },
    rate: {
      label: "Run Rate",
      color: "#dc2626",
    },
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Runs per Over */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Runs per Over</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <BarChart data={oversData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="over" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="runs" fill="var(--color-runs)" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Run Rate */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Run Rate Progression</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <LineChart data={runRateData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="over" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="rate" stroke="var(--color-rate)" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Batsmen Comparison */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Current Batsmen Stats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {batsmenData.map((batsman, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">{batsman.name}</p>
                    <p className="text-sm text-gray-600">{batsman.runs} runs ({batsman.balls} balls)</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{batsman.strikeRate}</p>
                    <p className="text-xs text-gray-500">Strike Rate</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Wagon Wheel (Sample) */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Shot Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <PieChart>
                <Pie
                  data={wagonWheelData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {wagonWheelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Match Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Match Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{innings1Score.runs}</p>
              <p className="text-sm text-gray-600">Innings 1 Runs</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{innings2Score.runs}</p>
              <p className="text-sm text-gray-600">Innings 2 Runs</p>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <p className="text-2xl font-bold text-yellow-600">{innings1Score.wickets + innings2Score.wickets}</p>
              <p className="text-sm text-gray-600">Total Wickets</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {currentBatsmen.reduce((acc, b) => acc + (b.fours || 0) + (b.sixes || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Boundaries</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchAnalytics;
