
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

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
  recentBalls = []
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

  return (
    <div className="space-y-4">
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

      {/* Current Match Status */}
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
        <CardContent className="space-y-4">
          {/* Current Batsmen */}
          <div>
            <h4 className="font-semibold mb-2">Current Batsmen</h4>
            <div className="space-y-2">
              {currentBatsmen.length === 0 ? (
                <p className="text-gray-500 text-sm">No batsmen selected</p>
              ) : (
                currentBatsmen.map((batsman, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {batsman.name} {index === 0 ? '*' : ''}
                      </span>
                      <span className="text-sm text-gray-600">
                        {index === 0 ? 'batting' : 'batting'}
                      </span>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <span>{batsman.runs || 0}</span>
                      <span>({batsman.balls || 0})</span>
                      <span>4s: {batsman.fours || 0}</span>
                      <span>6s: {batsman.sixes || 0}</span>
                      <span>SR: {(batsman.balls || 0) > 0 ? (((batsman.runs || 0) / (batsman.balls || 0)) * 100).toFixed(1) : '0.0'}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Partnership Info */}
          {currentBatsmen.length === 2 && (
            <div className="bg-blue-50 p-3 rounded">
              <p className="text-sm font-medium text-blue-800">
                Partnership: {partnership} ({(currentBatsmen[0].balls || 0) + (currentBatsmen[1].balls || 0)})
              </p>
            </div>
          )}

          {/* Current Bowler */}
          <div>
            <h4 className="font-semibold mb-2">Current Bowler</h4>
            {!currentBowler ? (
              <p className="text-gray-500 text-sm">No bowler selected</p>
            ) : (
              <div className="flex justify-between items-center p-2 bg-red-50 rounded">
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
                  <span key={index} className={`px-1 rounded ${
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

      {/* Previous Innings (if in 2nd innings) */}
      {currentInnings === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <span>{bowlingTeamName} Innings</span>
              <span className="text-xl font-bold text-blue-600">
                {innings1Score.runs}-{innings1Score.wickets} ({innings1Score.overs}.0 Ov)
              </span>
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* Match Stats */}
      <Card>
        <CardHeader>
          <CardTitle>Key Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-semibold">Current RR</div>
              <div className="text-lg">{currentRunRate}</div>
            </div>
            {currentInnings === 2 && (
              <div className="text-center">
                <div className="font-semibold">Required RR</div>
                <div className="text-lg">{requiredRunRate}</div>
              </div>
            )}
            <div className="text-center">
              <div className="font-semibold">Partnership</div>
              <div className="text-lg">{partnership}</div>
            </div>
            <div className="text-center">
              <div className="font-semibold">Overs Left</div>
              <div className="text-lg">{(matchData.overs || 20) - currentOver - (currentBall / 6).toFixed(1)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CricketScoreboard;
