
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Zap } from "lucide-react";

const TopPerformers = ({ currentBatsmen = [], bowlers = [], innings1Score, currentInnings }) => {
  // Find top performers
  const topBatsman = currentBatsmen.reduce((top, batsman) => 
    (batsman.runs || 0) > (top.runs || 0) ? batsman : top, currentBatsmen[0] || {});
  
  const topBowler = bowlers.reduce((top, bowler) => 
    (bowler.wickets || 0) > (top.wickets || 0) ? bowler : top, bowlers[0] || {});

  const highestStrikeRate = currentBatsmen
    .filter(b => (b.balls || 0) >= 10) // Minimum 10 balls faced
    .reduce((top, batsman) => {
      const sr = (batsman.balls || 0) > 0 ? ((batsman.runs || 0) / (batsman.balls || 0)) * 100 : 0;
      const topSr = (top.balls || 0) > 0 ? ((top.runs || 0) / (top.balls || 0)) * 100 : 0;
      return sr > topSr ? batsman : top;
    }, {});

  const bestEconomy = bowlers
    .filter(b => (b.overs || 0) >= 2) // Minimum 2 overs
    .reduce((top, bowler) => {
      const eco = (bowler.overs || 0) > 0 ? (bowler.runs || 0) / (bowler.overs || 0) : 999;
      const topEco = (top.overs || 0) > 0 ? (top.runs || 0) / (top.overs || 0) : 999;
      return eco < topEco ? bowler : top;
    }, {});

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          Top Performers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Top Scorer */}
          {topBatsman.name && (
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-4 h-4 text-blue-600" />
                <span className="font-semibold text-blue-800">Top Scorer</span>
              </div>
              <p className="font-bold text-lg">{topBatsman.name}</p>
              <p className="text-2xl font-bold text-blue-600">{topBatsman.runs || 0}</p>
              <p className="text-xs text-gray-600">
                ({topBatsman.balls || 0} balls, {topBatsman.fours || 0}×4, {topBatsman.sixes || 0}×6)
              </p>
            </div>
          )}

          {/* Best Strike Rate */}
          {highestStrikeRate.name && (
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Zap className="w-4 h-4 text-green-600" />
                <span className="font-semibold text-green-800">Best SR</span>
              </div>
              <p className="font-bold text-lg">{highestStrikeRate.name}</p>
              <p className="text-2xl font-bold text-green-600">
                {((highestStrikeRate.runs || 0) / (highestStrikeRate.balls || 1) * 100).toFixed(1)}
              </p>
              <p className="text-xs text-gray-600">
                {highestStrikeRate.runs || 0} runs ({highestStrikeRate.balls || 0} balls)
              </p>
            </div>
          )}

          {/* Best Bowler */}
          {topBowler.name && (
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Trophy className="w-4 h-4 text-red-600" />
                <span className="font-semibold text-red-800">Best Bowler</span>
              </div>
              <p className="font-bold text-lg">{topBowler.name}</p>
              <p className="text-2xl font-bold text-red-600">{topBowler.wickets || 0}/{topBowler.runs || 0}</p>
              <p className="text-xs text-gray-600">
                {topBowler.overs || 0} overs, ECO: {((topBowler.runs || 0) / (topBowler.overs || 1)).toFixed(1)}
              </p>
            </div>
          )}

          {/* Best Economy */}
          {bestEconomy.name && (
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="font-semibold text-purple-800">Best Economy</span>
              </div>
              <p className="font-bold text-lg">{bestEconomy.name}</p>
              <p className="text-2xl font-bold text-purple-600">
                {((bestEconomy.runs || 0) / (bestEconomy.overs || 1)).toFixed(1)}
              </p>
              <p className="text-xs text-gray-600">
                {bestEconomy.wickets || 0} wickets, {bestEconomy.overs || 0} overs
              </p>
            </div>
          )}
        </div>

        {currentInnings === 2 && innings1Score && (
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-semibold text-yellow-800 mb-2">Innings Comparison</h4>
            <div className="text-sm text-yellow-700">
              Previous innings: {innings1Score.runs}/{innings1Score.wickets} ({innings1Score.overs}.0 overs)
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TopPerformers;
