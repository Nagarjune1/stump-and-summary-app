
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trophy, Target, Clock } from "lucide-react";

const CompleteMatchScorecard = ({ 
  matchData, 
  innings1Data, 
  innings2Data, 
  team1Players,
  team2Players,
  result,
  tossInfo
}) => {
  const formatBattingStats = (players) => {
    return players.filter(p => p.runs !== undefined).map(player => ({
      name: player.name,
      runs: player.runs || 0,
      balls: player.balls || 0,
      fours: player.fours || 0,
      sixes: player.sixes || 0,
      strikeRate: player.balls > 0 ? ((player.runs / player.balls) * 100).toFixed(1) : '0.0',
      isOut: player.isOut || false,
      dismissalType: player.dismissalType || 'not out'
    }));
  };

  const formatBowlingStats = (players) => {
    return players.filter(p => p.overs !== undefined && p.overs > 0).map(player => ({
      name: player.name,
      overs: player.overs || 0,
      maidens: player.maidens || 0,
      runs: player.runs || 0,
      wickets: player.wickets || 0,
      economy: player.overs > 0 ? (player.runs / player.overs).toFixed(1) : '0.0'
    }));
  };

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <Card className="bg-gradient-to-r from-blue-900 to-green-900 text-white">
        <CardHeader>
          <div className="text-center">
            <CardTitle className="text-2xl mb-2">
              {matchData.team1?.name} vs {matchData.team2?.name}
            </CardTitle>
            <p className="text-sm opacity-90">
              {matchData.venue} • {new Date(matchData.match_date).toLocaleDateString()}
            </p>
            {tossInfo && (
              <p className="text-sm mt-2 opacity-90">{tossInfo}</p>
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Match Result */}
      {result && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Trophy className="w-6 h-6 text-yellow-600" />
                <h3 className="text-xl font-bold text-yellow-800">Match Result</h3>
              </div>
              <p className="text-lg font-semibold text-yellow-700">{result}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Innings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* First Innings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{matchData.team1?.name} Innings</span>
              <span className="text-blue-600">
                {innings1Data.runs}/{innings1Data.wickets} ({innings1Data.overs}.0)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Batting Stats */}
            <div>
              <h4 className="font-semibold mb-3">Batting</h4>
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-2 text-xs font-medium text-gray-600 border-b pb-1">
                  <span className="col-span-2">Batsman</span>
                  <span>R</span>
                  <span>B</span>
                  <span>4s</span>
                  <span>6s</span>
                  <span>SR</span>
                </div>
                {formatBattingStats(team1Players).map((player, idx) => (
                  <div key={idx} className="grid grid-cols-7 gap-2 text-sm py-1">
                    <span className="col-span-2 font-medium truncate">{player.name}</span>
                    <span>{player.runs}</span>
                    <span>{player.balls}</span>
                    <span>{player.fours}</span>
                    <span>{player.sixes}</span>
                    <span>{player.strikeRate}</span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Bowling Stats */}
            <div>
              <h4 className="font-semibold mb-3">Bowling</h4>
              <div className="space-y-2">
                <div className="grid grid-cols-6 gap-2 text-xs font-medium text-gray-600 border-b pb-1">
                  <span className="col-span-2">Bowler</span>
                  <span>O</span>
                  <span>R</span>
                  <span>W</span>
                  <span>Econ</span>
                </div>
                {formatBowlingStats(team2Players).map((player, idx) => (
                  <div key={idx} className="grid grid-cols-6 gap-2 text-sm py-1">
                    <span className="col-span-2 font-medium truncate">{player.name}</span>
                    <span>{player.overs}</span>
                    <span>{player.runs}</span>
                    <span>{player.wickets}</span>
                    <span>{player.economy}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Second Innings */}
        {innings2Data && (
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{matchData.team2?.name} Innings</span>
                <span className="text-green-600">
                  {innings2Data.runs}/{innings2Data.wickets} ({innings2Data.overs}.{innings2Data.balls || 0})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Batting Stats */}
              <div>
                <h4 className="font-semibold mb-3">Batting</h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-7 gap-2 text-xs font-medium text-gray-600 border-b pb-1">
                    <span className="col-span-2">Batsman</span>
                    <span>R</span>
                    <span>B</span>
                    <span>4s</span>
                    <span>6s</span>
                    <span>SR</span>
                  </div>
                  {formatBattingStats(team2Players).map((player, idx) => (
                    <div key={idx} className="grid grid-cols-7 gap-2 text-sm py-1">
                      <span className="col-span-2 font-medium truncate">{player.name}</span>
                      <span>{player.runs}</span>
                      <span>{player.balls}</span>
                      <span>{player.fours}</span>
                      <span>{player.sixes}</span>
                      <span>{player.strikeRate}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Bowling Stats */}
              <div>
                <h4 className="font-semibold mb-3">Bowling</h4>
                <div className="space-y-2">
                  <div className="grid grid-cols-6 gap-2 text-xs font-medium text-gray-600 border-b pb-1">
                    <span className="col-span-2">Bowler</span>
                    <span>O</span>
                    <span>R</span>
                    <span>W</span>
                    <span>Econ</span>
                  </div>
                  {formatBowlingStats(team1Players).map((player, idx) => (
                    <div key={idx} className="grid grid-cols-6 gap-2 text-sm py-1">
                      <span className="col-span-2 font-medium truncate">{player.name}</span>
                      <span>{player.overs}</span>
                      <span>{player.runs}</span>
                      <span>{player.wickets}</span>
                      <span>{player.economy}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CompleteMatchScorecard;
