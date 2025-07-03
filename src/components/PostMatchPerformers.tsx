
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Zap, Shield, Star } from "lucide-react";

const PostMatchPerformers = ({ 
  allPlayers, 
  matchData,
  manOfMatch,
  bestBowler 
}) => {
  // Get top batsmen (minimum 10 balls faced)
  const topBatsmen = allPlayers
    .filter(p => (p.balls || 0) >= 10)
    .sort((a, b) => (b.runs || 0) - (a.runs || 0))
    .slice(0, 3);

  // Get top bowlers (minimum 1 over bowled)
  const topBowlers = allPlayers
    .filter(p => (p.overs || 0) >= 1)
    .sort((a, b) => {
      // Sort by wickets first, then by economy
      if ((b.wickets || 0) !== (a.wickets || 0)) {
        return (b.wickets || 0) - (a.wickets || 0);
      }
      const aEcon = (a.overs || 0) > 0 ? (a.runs || 0) / (a.overs || 0) : 999;
      const bEcon = (b.overs || 0) > 0 ? (b.runs || 0) / (b.overs || 0) : 999;
      return aEcon - bEcon;
    })
    .slice(0, 3);

  // Best strike rate (minimum 15 balls)
  const bestStrikeRate = allPlayers
    .filter(p => (p.balls || 0) >= 15)
    .reduce((best, player) => {
      const sr = (player.balls || 0) > 0 ? ((player.runs || 0) / (player.balls || 0)) * 100 : 0;
      const bestSr = (best.balls || 0) > 0 ? ((best.runs || 0) / (best.balls || 0)) * 100 : 0;
      return sr > bestSr ? player : best;
    }, {});

  // Most economical bowler (minimum 2 overs)
  const mostEconomical = allPlayers
    .filter(p => (p.overs || 0) >= 2)
    .reduce((best, player) => {
      const eco = (player.overs || 0) > 0 ? (player.runs || 0) / (player.overs || 0) : 999;
      const bestEco = (best.overs || 0) > 0 ? (best.runs || 0) / (best.overs || 0) : 999;
      return eco < bestEco ? player : best;
    }, {});

  return (
    <div className="space-y-6">
      {/* Player of the Match */}
      {manOfMatch && (
        <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center justify-center">
              <Star className="w-6 h-6" />
              Player of the Match
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <h3 className="text-2xl font-bold mb-2">{manOfMatch.name}</h3>
            <p className="text-lg">
              {manOfMatch.runs > 0 && `${manOfMatch.runs} runs off ${manOfMatch.balls} balls`}
              {manOfMatch.wickets > 0 && ` • ${manOfMatch.wickets}/${manOfMatch.runs} in ${manOfMatch.overs} overs`}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Performance Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Top Batsmen */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5 text-yellow-500" />
              Top Scorers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topBatsmen.map((player, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                <div>
                  <p className="font-semibold text-sm">{player.name}</p>
                  <p className="text-xs text-gray-600">
                    {player.runs} ({player.balls}b, {player.fours}×4, {player.sixes}×6)
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  #{idx + 1}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Bowlers */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="w-5 h-5 text-red-500" />
              Top Bowlers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topBowlers.map((player, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-red-50 rounded">
                <div>
                  <p className="font-semibold text-sm">{player.name}</p>
                  <p className="text-xs text-gray-600">
                    {player.wickets}/{player.runs} ({player.overs} ov)
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  #{idx + 1}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Best Strike Rate */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="w-5 h-5 text-blue-500" />
              Best Strike Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bestStrikeRate.name ? (
              <div className="p-2 bg-blue-50 rounded">
                <p className="font-semibold text-sm">{bestStrikeRate.name}</p>
                <p className="text-xs text-gray-600">
                  SR: {((bestStrikeRate.runs / bestStrikeRate.balls) * 100).toFixed(1)}
                </p>
                <p className="text-xs text-gray-600">
                  {bestStrikeRate.runs} runs ({bestStrikeRate.balls}b)
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No qualifying batsman</p>
            )}
          </CardContent>
        </Card>

        {/* Most Economical */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Shield className="w-5 h-5 text-green-500" />
              Most Economical
            </CardTitle>
          </CardHeader>
          <CardContent>
            {mostEconomical.name ? (
              <div className="p-2 bg-green-50 rounded">
                <p className="font-semibold text-sm">{mostEconomical.name}</p>
                <p className="text-xs text-gray-600">
                  Economy: {((mostEconomical.runs / mostEconomical.overs)).toFixed(1)}
                </p>
                <p className="text-xs text-gray-600">
                  {mostEconomical.wickets}/{mostEconomical.runs} ({mostEconomical.overs} ov)
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No qualifying bowler</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PostMatchPerformers;
