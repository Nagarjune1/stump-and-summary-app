
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, Target, Activity, Clock } from "lucide-react";

const MatchAnalytics = ({ 
  matchData, 
  innings1Score, 
  innings2Score, 
  currentBatsmen = [], 
  currentBowler = null 
}) => {
  // Calculate actual run rates
  const totalOvers1 = innings1Score ? innings1Score.overs + (innings1Score.balls || 0) / 6 : 0;
  const totalOvers2 = innings2Score ? innings2Score.overs + (innings2Score.balls || 0) / 6 : 0;
  
  const currentRunRate = totalOvers2 > 0 ? (innings2Score.runs / totalOvers2).toFixed(2) : '0.00';
  const requiredRunRate = innings1Score && innings2Score ? 
    ((innings1Score.runs + 1 - innings2Score.runs) / (20 - totalOvers2)).toFixed(2) : '0.00';
  
  const totalBoundaries = (currentBatsmen[0]?.fours || 0) + (currentBatsmen[1]?.fours || 0) + 
                          (currentBatsmen[0]?.sixes || 0) + (currentBatsmen[1]?.sixes || 0);
  const partnershipRuns = (currentBatsmen[0]?.runs || 0) + (currentBatsmen[1]?.runs || 0);
  const partnershipBalls = (currentBatsmen[0]?.balls || 0) + (currentBatsmen[1]?.balls || 0);

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
            <div className="text-sm text-muted-foreground">Total: {totalBoundaries}</div>
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
              {partnershipRuns} ({partnershipBalls})
            </div>
            <div className="text-sm text-muted-foreground">
              SR: {partnershipBalls > 0 ? ((partnershipRuns / partnershipBalls) * 100).toFixed(1) : '0.0'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Match Info */}
      <Card>
        <CardHeader>
          <CardTitle>Match Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Target</p>
              <p className="text-2xl font-bold">{innings1Score ? innings1Score.runs + 1 : 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Needed</p>
              <p className="text-2xl font-bold">{innings1Score && innings2Score ? Math.max(0, innings1Score.runs + 1 - innings2Score.runs) : 0}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Balls Left</p>
              <p className="text-2xl font-bold">{innings2Score ? (20 * 6) - (innings2Score.overs * 6 + (innings2Score.balls || 0)) : 120}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Run Rate Gap</p>
              <p className="text-2xl font-bold">{(parseFloat(requiredRunRate) - parseFloat(currentRunRate)).toFixed(2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player Performance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Current Batsmen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentBatsmen && currentBatsmen.length > 0 ? (
              currentBatsmen.map((batsman, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg border">
                  <div>
                    <p className="font-semibold">{batsman.name} {index === 0 ? '*' : ''}</p>
                    <p className="text-sm text-muted-foreground">
                      {batsman.runs || 0} ({batsman.balls || 0}) • SR: {batsman.balls > 0 ? (((batsman.runs || 0) / batsman.balls) * 100).toFixed(1) : '0.0'}
                    </p>
                  </div>
                  <div className="text-right flex gap-1">
                    <Badge variant="outline">{batsman.fours || 0}×4</Badge>
                    <Badge variant="outline">{batsman.sixes || 0}×6</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500">No batsmen selected</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Bowler</CardTitle>
          </CardHeader>
          <CardContent>
            {currentBowler ? (
              <div className="p-3 bg-muted/50 rounded-lg border">
                <p className="font-semibold">{currentBowler.name}</p>
                <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Overs:</span>
                    <p className="font-medium">{(currentBowler.overs || 0).toFixed(1)}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Runs:</span>
                    <p className="font-medium">{currentBowler.runs || 0}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Wickets:</span>
                    <p className="font-medium">{currentBowler.wickets || 0}</p>
                  </div>
                </div>
                <div className="text-sm mt-2">
                  <span className="text-muted-foreground">Economy:</span> 
                  <span className="font-medium ml-1">{currentBowler.overs > 0 ? (currentBowler.runs / currentBowler.overs).toFixed(2) : '0.00'}</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">No bowler selected</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MatchAnalytics;
