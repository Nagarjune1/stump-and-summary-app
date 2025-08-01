
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Trophy, Target, Activity, TrendingUp } from "lucide-react";

const PlayerDetailView = ({ player, onBack }) => {
  if (!player) return null;

  const calculateStrikeRate = () => {
    return player.strike_rate || 0;
  };

  const calculateEconomyRate = () => {
    return player.economy || 0;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Players
        </Button>
        <h2 className="text-2xl font-bold">Player Details</h2>
      </div>

      {/* Player Header */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={player.photo_url} />
              <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-green-500 text-white">
                {player.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{player.name}</h1>
              <div className="flex gap-2 mb-3">
                <Badge variant="default">{player.role}</Badge>
                {player.teams && (
                  <Badge variant="secondary">{player.teams.name}</Badge>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-gray-600">Batting</div>
                  <div className="font-semibold">{player.batting_style || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-gray-600">Bowling</div>
                  <div className="font-semibold">{player.bowling_style || 'N/A'}</div>
                </div>
                <div>
                  <div className="text-gray-600">Matches</div>
                  <div className="font-semibold">{player.matches}</div>
                </div>
                <div>
                  <div className="text-gray-600">Team</div>
                  <div className="font-semibold">{player.teams?.city || 'N/A'}</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              Total Runs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{player.runs}</div>
            <p className="text-xs text-gray-600">Career total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-red-500" />
              Wickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{player.wickets}</div>
            <p className="text-xs text-gray-600">Career total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-green-500" />
              Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{player.average}</div>
            <p className="text-xs text-gray-600">Batting average</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              Strike Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{calculateStrikeRate()}</div>
            <p className="text-xs text-gray-600">Runs per 100 balls</p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Batting Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Batting Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded">
                <div className="text-2xl font-bold text-blue-600">{player.runs}</div>
                <div className="text-sm text-gray-600">Total Runs</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded">
                <div className="text-2xl font-bold text-green-600">{player.matches}</div>
                <div className="text-sm text-gray-600">Matches</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Batting Average:</span>
                <span className="font-semibold">{player.average}</span>
              </div>
              <div className="flex justify-between">
                <span>Strike Rate:</span>
                <span className="font-semibold">{calculateStrikeRate()}</span>
              </div>
              <div className="flex justify-between">
                <span>Best Score:</span>
                <span className="font-semibold">{player.best_score}</span>
              </div>
              <div className="flex justify-between">
                <span>Batting Style:</span>
                <span className="font-semibold">{player.batting_style || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bowling Statistics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Bowling Statistics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-red-50 rounded">
                <div className="text-2xl font-bold text-red-600">{player.wickets}</div>
                <div className="text-sm text-gray-600">Total Wickets</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded">
                <div className="text-2xl font-bold text-orange-600">{calculateEconomyRate()}</div>
                <div className="text-sm text-gray-600">Economy Rate</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Best Bowling:</span>
                <span className="font-semibold">{player.best_bowling}</span>
              </div>
              <div className="flex justify-between">
                <span>Economy Rate:</span>
                <span className="font-semibold">{calculateEconomyRate()}</span>
              </div>
              <div className="flex justify-between">
                <span>Bowling Style:</span>
                <span className="font-semibold">{player.bowling_style || 'N/A'}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlayerDetailView;
