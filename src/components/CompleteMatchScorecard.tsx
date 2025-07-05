
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trophy, Target, Clock } from "lucide-react";

const CompleteMatchScorecard = ({ 
  matchData, 
  innings1Data, 
  innings2Data, 
  team1Players = [],
  team2Players = [],
  result,
  tossInfo,
  fallOfWickets1 = [],
  fallOfWickets2 = []
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

      {/* Innings Scorecards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* First Innings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{matchData.team1?.name} Innings</span>
              <span className="text-blue-600">
                {innings1Data?.runs || 0}/{innings1Data?.wickets || 0} ({innings1Data?.overs || 0}.0)
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Batting */}
            <div>
              <h4 className="font-semibold mb-3">Batting</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Batsman</TableHead>
                    <TableHead className="text-center w-12">R</TableHead>
                    <TableHead className="text-center w-12">B</TableHead>
                    <TableHead className="text-center w-12">4s</TableHead>
                    <TableHead className="text-center w-12">6s</TableHead>
                    <TableHead className="text-center w-16">SR</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formatBattingStats(team1Players).map((player, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-sm">{player.name}</span>
                          {player.isOut && (
                            <span className="text-xs text-red-600">{player.dismissalType}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center font-semibold">{player.runs}</TableCell>
                      <TableCell className="text-center">{player.balls}</TableCell>
                      <TableCell className="text-center">{player.fours}</TableCell>
                      <TableCell className="text-center">{player.sixes}</TableCell>
                      <TableCell className="text-center">{player.strikeRate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <Separator />

            {/* Fall of Wickets */}
            {fallOfWickets1.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Fall of Wickets</h4>
                <div className="text-sm space-y-1">
                  {fallOfWickets1.map((wicket, idx) => (
                    <div key={idx} className="text-gray-700">
                      {wicket.runs}-{wicket.wicketNumber} ({wicket.player}, {wicket.overs} ov)
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Bowling */}
            <div>
              <h4 className="font-semibold mb-3">Bowling</h4>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[150px]">Bowler</TableHead>
                    <TableHead className="text-center w-12">O</TableHead>
                    <TableHead className="text-center w-12">M</TableHead>
                    <TableHead className="text-center w-12">R</TableHead>
                    <TableHead className="text-center w-12">W</TableHead>
                    <TableHead className="text-center w-16">Econ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formatBowlingStats(team2Players).map((player, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium text-sm">{player.name}</TableCell>
                      <TableCell className="text-center">{player.overs}</TableCell>
                      <TableCell className="text-center">{player.maidens}</TableCell>
                      <TableCell className="text-center">{player.runs}</TableCell>
                      <TableCell className="text-center font-semibold">{player.wickets}</TableCell>
                      <TableCell className="text-center">{player.economy}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
              {/* Batting */}
              <div>
                <h4 className="font-semibold mb-3">Batting</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Batsman</TableHead>
                      <TableHead className="text-center w-12">R</TableHead>
                      <TableHead className="text-center w-12">B</TableHead>
                      <TableHead className="text-center w-12">4s</TableHead>
                      <TableHead className="text-center w-12">6s</TableHead>
                      <TableHead className="text-center w-16">SR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formatBattingStats(team2Players).map((player, idx) => (
                      <TableRow key={idx}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm">{player.name}</span>
                            {player.isOut && (
                              <span className="text-xs text-red-600">{player.dismissalType}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-center font-semibold">{player.runs}</TableCell>
                        <TableCell className="text-center">{player.balls}</TableCell>
                        <TableCell className="text-center">{player.fours}</TableCell>
                        <TableCell className="text-center">{player.sixes}</TableCell>
                        <TableCell className="text-center">{player.strikeRate}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Separator />

              {/* Fall of Wickets */}
              {fallOfWickets2.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Fall of Wickets</h4>
                  <div className="text-sm space-y-1">
                    {fallOfWickets2.map((wicket, idx) => (
                      <div key={idx} className="text-gray-700">
                        {wicket.runs}-{wicket.wicketNumber} ({wicket.player}, {wicket.overs} ov)
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* Bowling */}
              <div>
                <h4 className="font-semibold mb-3">Bowling</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[150px]">Bowler</TableHead>
                      <TableHead className="text-center w-12">O</TableHead>
                      <TableHead className="text-center w-12">M</TableHead>
                      <TableHead className="text-center w-12">R</TableHead>
                      <TableHead className="text-center w-12">W</TableHead>
                      <TableHead className="text-center w-16">Econ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formatBowlingStats(team1Players).map((player, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="font-medium text-sm">{player.name}</TableCell>
                        <TableCell className="text-center">{player.overs}</TableCell>
                        <TableCell className="text-center">{player.maidens}</TableCell>
                        <TableCell className="text-center">{player.runs}</TableCell>
                        <TableCell className="text-center font-semibold">{player.wickets}</TableCell>
                        <TableCell className="text-center">{player.economy}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CompleteMatchScorecard;
