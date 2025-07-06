
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Trophy, Users, Target, BarChart3 } from "lucide-react";

const CompleteMatchScorecard = ({ 
  matchData, 
  innings1Score, 
  innings2Score, 
  currentBatsmen = [], 
  currentBowler = null,
  topPerformers = [],
  fallOfWickets = [],
  bowlingFigures = [],
  matchResult = ""
}) => {
  const formatScore = (score) => {
    if (!score) return "Yet to bat";
    return `${score.runs}/${score.wickets} (${score.overs}.${score.balls || 0} ov)`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Match Header */}
      <Card className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
        <CardContent className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-2">
              {matchData?.team1?.name || 'Team 1'} vs {matchData?.team2?.name || 'Team 2'}
            </h1>
            <p className="text-green-100 mb-2">{matchData?.venue} • {matchData?.format}</p>
            <p className="text-green-100">{new Date(matchData?.match_date).toLocaleDateString()}</p>
            {matchResult && (
              <div className="mt-3">
                <Badge className="bg-yellow-500 text-yellow-900 text-lg px-4 py-1">
                  {matchResult}
                </Badge>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Toss Information */}
      {matchData?.toss_winner && (
        <Card>
          <CardContent className="p-4">
            <p className="text-center text-gray-600">
              <strong>{matchData.toss_winner}</strong> won the toss and elected to <strong>{matchData.toss_decision}</strong>
            </p>
          </CardContent>
        </Card>
      )}

      {/* Match Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {matchData?.team1?.name || 'Team 1'} - 1st Innings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {formatScore(innings1Score)}
            </div>
            {innings1Score && (
              <div className="text-sm text-gray-600">
                Run Rate: {innings1Score.overs > 0 ? (innings1Score.runs / innings1Score.overs).toFixed(2) : '0.00'}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              {matchData?.team2?.name || 'Team 2'} - 2nd Innings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatScore(innings2Score)}
            </div>
            {innings2Score && (
              <div className="text-sm text-gray-600">
                Run Rate: {innings2Score.overs > 0 ? (innings2Score.runs / innings2Score.overs).toFixed(2) : '0.00'}
                {innings1Score && innings2Score.runs < innings1Score.runs && (
                  <div>Required Rate: {((innings1Score.runs - innings2Score.runs + 1) / (20 - innings2Score.overs)).toFixed(2)}</div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Players */}
      {currentBatsmen.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Current Partnership
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Batsmen</h4>
                {currentBatsmen.map((batsman, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded-lg mb-2">
                    <div className="font-medium">{batsman.name} {index === 0 ? '*' : ''}</div>
                    <div className="text-sm text-gray-600">
                      {batsman.runs || 0} ({batsman.balls || 0}) • SR: {batsman.balls > 0 ? ((batsman.runs || 0) / batsman.balls * 100).toFixed(1) : '0.0'}
                    </div>
                  </div>
                ))}
              </div>
              
              {currentBowler && (
                <div>
                  <h4 className="font-semibold mb-2">Current Bowler</h4>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="font-medium">{currentBowler.name}</div>
                    <div className="text-sm text-gray-600">
                      {currentBowler.overs || 0}-{currentBowler.runs || 0}-{currentBowler.wickets || 0}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h4 className="font-semibold mb-2">Partnership</h4>
                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="font-medium">
                    {(currentBatsmen[0]?.runs || 0) + (currentBatsmen[1]?.runs || 0)} runs
                  </div>
                  <div className="text-sm text-gray-600">
                    {(currentBatsmen[0]?.balls || 0) + (currentBatsmen[1]?.balls || 0)} balls
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performers */}
      {topPerformers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Top Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Top Batsmen</h4>
                {topPerformers.filter(p => p.type === 'batsman').slice(0, 3).map((player, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded mb-2">
                    <span className="font-medium">{player.name}</span>
                    <span className="text-blue-600 font-bold">{player.runs} ({player.balls})</span>
                  </div>
                ))}
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Top Bowlers</h4>
                {topPerformers.filter(p => p.type === 'bowler').slice(0, 3).map((player, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded mb-2">
                    <span className="font-medium">{player.name}</span>
                    <span className="text-red-600 font-bold">{player.wickets}/{player.runs} ({player.overs})</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Fall of Wickets */}
      {fallOfWickets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Fall of Wickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {fallOfWickets.map((wicket, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded border-l-4 border-red-500">
                  <div>
                    <span className="font-medium">{wicket.runs}-{wicket.wicketNumber}</span>
                    <span className="text-gray-600 ml-2">({wicket.overs} ov)</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{wicket.player}</div>
                    <div className="text-sm text-red-600">{wicket.dismissal}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Match Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Match Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded">
              <div className="text-xl font-bold text-blue-600">{innings1Score?.runs || 0}</div>
              <div className="text-sm text-gray-600">Runs Scored</div>
            </div>
            <div className="p-3 bg-red-50 rounded">
              <div className="text-xl font-bold text-red-600">{innings1Score?.wickets || 0}</div>
              <div className="text-sm text-gray-600">Wickets Lost</div>
            </div>
            <div className="p-3 bg-green-50 rounded">
              <div className="text-xl font-bold text-green-600">{innings1Score?.overs || 0}</div>
              <div className="text-sm text-gray-600">Overs Bowled</div>
            </div>
            <div className="p-3 bg-purple-50 rounded">
              <div className="text-xl font-bold text-purple-600">
                {innings1Score?.overs > 0 ? (innings1Score.runs / innings1Score.overs).toFixed(2) : '0.00'}
              </div>
              <div className="text-sm text-gray-600">Run Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompleteMatchScorecard;
