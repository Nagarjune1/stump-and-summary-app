
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, ResponsiveContainer, Area, AreaChart } from "recharts";

const RunRateChart = ({ oversData = [], currentRunRate, requiredRunRate, showWormChart = false }) => {
  const chartConfig = {
    runs: {
      label: "Runs",
      color: "#2563eb",
    },
    runRate: {
      label: "Run Rate",
      color: "#dc2626",
    },
    cumulative: {
      label: "Total Runs",
      color: "#16a34a",
    }
  };

  // Generate sample data if none provided
  const defaultData = Array.from({ length: 10 }, (_, i) => ({
    over: i + 1,
    runs: Math.floor(Math.random() * 15) + 3,
    runRate: (Math.random() * 8 + 6).toFixed(1),
    cumulative: 0
  }));

  const data = oversData.length > 0 ? oversData : defaultData;
  
  // Calculate cumulative runs for worm chart
  let cumulativeRuns = 0;
  const wormData = data.map(over => {
    cumulativeRuns += over.runs;
    return { ...over, cumulative: cumulativeRuns };
  });

  if (showWormChart) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Run Progression (Worm Chart)</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <AreaChart data={wormData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="over" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area 
                type="monotone" 
                dataKey="cumulative" 
                stroke="var(--color-cumulative)" 
                fill="var(--color-cumulative)" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Runs per Over */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Runs per Over</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-64">
            <BarChart data={data}>
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
            <LineChart data={wormData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="over" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="runRate" 
                stroke="var(--color-runRate)" 
                strokeWidth={2}
                name="Current RR"
              />
              {requiredRunRate && (
                <Line 
                  type="monotone" 
                  dataKey={() => parseFloat(requiredRunRate)}
                  stroke="#f59e0b" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Required RR"
                />
              )}
            </LineChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default RunRateChart;
