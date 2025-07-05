
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const CricketScoreboard = ({ 
  matchData, 
  score, 
  currentBatsmen, 
  currentBowler, 
  innings1Score, 
  currentInnings,
  currentOver,
  currentBall,
  battingTeam,
  target,
  requiredRunRate,
  currentRunRate,
  recentBalls = [],
  team1Players = [],
  team2Players = [],
  fallOfWickets = []
}) => {
  const formatOvers = (overs, balls) => `${overs}.${balls}`;
  
  const battingTeamName = battingTeam === 1 ? matchData.team1?.name : matchData.team2?.name;
  const bowlingTeamName = battingTeam === 1 ? matchData.team2?.name : matchData.team1?.name;
  
  const partnership = currentBatsmen.length === 2 ? 
    (currentBatsmen[0].runs || 0) + (currentBatsmen[1].runs || 0) : 
    (currentBatsmen[0]?.runs || 0);

  const ballsRemaining = currentInnings === 2 ? 
    ((matchData.overs || 20) * 6) - (currentOver * 6 + currentBall) : 0;

  const runsNeeded = currentInnings === 2 ? 
    Math.max(0, target - score.runs) : 0;

  const oversLeft = () => {
    const totalOvers = Number(matchData.overs || 20);
    const currentOversDecimal = Number(currentOver) + (Number(currentBall) / 6);
    return (totalOvers - currentOversDecimal).toFixed(1);
  };

  const getCurrentBattingStats = () => {
    const currentTeamPlayers = battingTeam === 1 ? team1Players : team2Players;
    return currentTeamPlayers.filter(player => player.batted || currentBatsmen.some(b => b.id === player.id));
  };

  const getCurrentBowlingStats = () => {
    const currentBowlingTeamPlayers = battingTeam === 1 ? team2Players : team1Players;
    return currentBowlingTeamPlayers.filter(player => player.bowled && (player.overs > 0 || player.runs > 0));
  };

  return (
    <div className="space-y-6">
      {/* Match Header */}
      <Card className="bg-gradient-to-r from-blue-900 to-green-900 text-white">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">
                {matchData.team1?.name} vs {matchData.team2?.name}
              </CardTitle>
              <p className="text-sm opacity-90">
                {matchData.format} • {matchData.venue} • Innings {currentInnings}
              </p>
            </div>
            <Badge className="bg-red-500 animate-pulse">LIVE</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Target Info */}
      {currentInnings === 2 && target > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-yellow-800">
                {battingTeamName} need {runsNeeded} runs in {ballsRemaining} balls
              </p>
              <div className="flex justify-center gap-4 mt-2 text-sm text-yellow-700">
                <span>CRR: {currentRunRate}</span>
                <span>REQ: {requiredRunRate}</span>
                <span>Overs Left: {oversLeft()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Innings Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{battingTeamName} Innings</span>
            <span className="text-2xl font-bold text-green-600">
              {score.runs}-{score.wickets} ({formatOvers(currentOver, currentBall)} Ov)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Batsmen */}
          <div>
            <h4 className="font-semibold mb-3">Current Partnership</h4>
            {currentBatsmen.length === 0 ? (
              <p className="text-gray-500 text-sm">No batsmen selected</p>
            ) : (
              <div className="space-y-2">
                {currentBatsmen.map((batsman, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {batsman.name} {index === 0 ? '*' : ''}
                      </span>
                      {batsman.isOut && (
                        <Badge variant="destructive" className="text-xs">
                          {batsman.dismissalType || 'out'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span className="font-semibold">{batsman.runs || 0}</span>
                      <span>({batsman.balls || 0})</span>
                      <span>4s: {batsman.fours || 0}</span>
                      <span>6s: {batsman.sixes || 0}</span>
                      <span>SR: {(batsman.balls || 0) > 0 ? (((batsman.runs || 0) / (batsman.balls || 0)) * 100).toFixed(1) : '0.0'}</span>
                    </div>
                  </div>
                ))}
                {currentBatsmen.length === 2 && !currentBatsmen.some(b => b.isOut) && (
                  <div className="bg-blue-50 p-2 rounded text-sm">
                    <span className="font-medium text-blue-800">
                      Partnership: {partnership} runs ({(currentBatsmen[0].balls || 0) + (currentBatsmen[1].balls || 0)} balls)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator />

          {/* Current Bowler */}
          <div>
            <h4 className="font-semibold mb-3">Current Bowler</h4>
            {!currentBowler ? (
              <p className="text-gray-500 text-sm">No bowler selected</p>
            ) : (
              <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{currentBowler.name} *</span>
                  <span className="text-sm text-gray-600">bowling</span>
                </div>
                <div className="flex gap-4 text-sm">
                  <span>{currentBowler.overs || 0} Ov</span>
                  <span>{currentBowler.runs || 0} R</span>
                  <span>{currentBowler.wickets || 0} W</span>
                  <span>ECO: {(currentBowler.overs || 0) > 0 ? ((currentBowler.runs || 0) / (currentBowler.overs || 0)).toFixed(1) : '0.0'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Recent Balls */}
          {recentBalls.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2">Recent Balls</h4>
              <div className="flex gap-1 text-sm">
                <span className="text-gray-600">Recent:</span>
                {recentBalls.slice(-10).map((ball, index) => (
                  <span key={index} className={`px-2 py-1 rounded ${
                    ball === 'W' ? 'bg-red-100 text-red-800' :
                    ball === '4' ? 'bg-blue-100 text-blue-800' :
                    ball === '6' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100'
                  }`}>
                    {ball}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Batting Card */}
      <Card>
        <CardHeader>
          <CardTitle>{battingTeamName} Batting</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Batsman</TableHead>
                <TableHead className="text-center">R</TableHead>
                <TableHead className="text-center">B</TableHead>
                <TableHead className="text-center">4s</TableHead>
                <TableHead className="text-center">6s</TableHead>
                <TableHead className="text-center">SR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getCurrentBattingStats().map((player, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{player.name}</span>
                      {player.isOut && (
                        <span className="text-xs text-red-600">{player.dismissalType || 'out'}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold">{player.runs || 0}</TableCell>
                  <TableCell className="text-center">{player.balls || 0}</TableCell>
                  <TableCell className="text-center">{player.fours || 0}</TableCell>
                  <TableCell className="text-center">{player.sixes || 0}</TableCell>
                  <TableCell className="text-center">
                    {(player.balls || 0) > 0 ? (((player.runs || 0) / (player.balls || 0)) * 100).toFixed(1) : '0.0'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Full Bowling Card */}
      <Card>
        <CardHeader>
          <CardTitle>{bowlingTeamName} Bowling</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Bowler</TableHead>
                <TableHead className="text-center">O</TableHead>
                <TableHead className="text-center">M</TableHead>
                <TableHead className="text-center">R</TableHead>
                <TableHead className="text-center">W</TableHead>
                <TableHead className="text-center">ECO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {getCurrentBowlingStats().map((player, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{player.name}</TableCell>
                  <TableCell className="text-center">{player.overs || 0}</TableCell>
                  <TableCell className="text-center">{player.maidens || 0}</TableCell>
                  <TableCell className="text-center">{player.runs || 0}</TableCell>
                  <TableCell className="text-center font-semibold">{player.wickets || 0}</TableCell>
                  <TableCell className="text-center">
                    {(player.overs || 0) > 0 ? ((player.runs || 0) / (player.overs || 0)).toFixed(1) : '0.0'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Fall of Wickets */}
      {fallOfWickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fall of Wickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {fallOfWickets.map((wicket, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-red-50 rounded text-sm">
                  <div className="flex-1">
                    <span className="font-medium">{wicket.runs}-{wicket.wicketNumber}</span>
                    <span className="text-gray-600 ml-2">({wicket.player}, {wicket.overs} ov)</span>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    {wicket.dismissal}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Previous Innings */}
      {currentInnings === 2 && innings1Score && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{bowlingTeamName} Innings (Completed)</span>
              <span className="text-xl font-bold text-blue-600">
                {innings1Score.runs}-{innings1Score.wickets} ({innings1Score.overs}.0 Ov)
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      )}
    </div>
  );
};

export default CricketScoreboard;
