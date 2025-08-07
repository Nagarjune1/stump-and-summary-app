
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatOvers, calculateStrikeRate, calculateEconomy } from "@/utils/scoringUtils";

interface TeamInnings {
  teamId: string;
  teamName: string;
  totalRuns: number;
  totalWickets: number;
  overs: number;
  balls: number;
  extras: {
    wides: number;
    noballs: number;
    byes: number;
    legbyes: number;
  };
}

interface Match {
  id: string;
  team1_id: string;
  team2_id: string;
  team1_name: string;
  team2_name: string;
  match_date: string;
  venue: string;
  overs: number;
}

interface ScoreDisplayProps {
  teamInnings: TeamInnings[];
  currentInnings: number;
  currentOver: number;
  currentBallInOver: number;
  selectedMatch: Match | null;
  currentBatsmen: any[];
  currentBowler: any;
  strikeBatsmanIndex: number;
  matchSetup: any;
}

const ScoreDisplay = ({
  teamInnings,
  currentInnings,
  currentOver,
  currentBallInOver,
  selectedMatch,
  currentBatsmen,
  currentBowler,
  strikeBatsmanIndex,
  matchSetup
}: ScoreDisplayProps) => {
  const getCurrentTeamInnings = () => {
    return teamInnings[currentInnings - 1] || {
      teamName: 'Team',
      totalRuns: 0,
      totalWickets: 0,
      overs: 0,
      balls: 0
    };
  };

  const currentTeam = getCurrentTeamInnings();

  const calculateRunRate = () => {
    const totalBalls = currentTeam.overs * 6 + currentTeam.balls;
    if (totalBalls === 0) return 0;
    return (currentTeam.totalRuns / totalBalls) * 6;
  };

  const calculateRequiredRunRate = () => {
    if (currentInnings === 1 || !teamInnings[0]) return 0;
    
    const target = teamInnings[0].totalRuns + 1;
    const remaining = target - currentTeam.totalRuns;
    const ballsLeft = (matchSetup?.overs || 20) * 6 - (currentTeam.overs * 6 + currentTeam.balls);
    
    if (ballsLeft <= 0) return 0;
    return (remaining / ballsLeft) * 6;
  };

  const getValidBatsman = (index: number) => {
    return currentBatsmen[index] || { 
      name: 'Not Selected', 
      runs: 0, 
      balls: 0, 
      fours: 0, 
      sixes: 0 
    };
  };

  const striker = getValidBatsman(strikeBatsmanIndex);
  const nonStriker = getValidBatsman(strikeBatsmanIndex === 0 ? 1 : 0);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={currentInnings === 1 ? "ring-2 ring-blue-500" : ""}>
          <CardHeader>
            <CardTitle className="text-lg">
              {teamInnings[0]?.teamName || selectedMatch?.team1_name || 'Team 1'} - 1st Innings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {teamInnings[0]?.totalRuns || 0}/{teamInnings[0]?.totalWickets || 0}
            </div>
            <div className="text-gray-600">
              ({formatOvers(teamInnings[0]?.overs || 0, teamInnings[0]?.balls || 0)} overs)
            </div>
          </CardContent>
        </Card>

        <Card className={currentInnings === 2 ? "ring-2 ring-blue-500" : ""}>
          <CardHeader>
            <CardTitle className="text-lg">
              {teamInnings[1]?.teamName || selectedMatch?.team2_name || 'Team 2'} - 2nd Innings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {currentInnings === 2 ? 
                `${currentTeam.totalRuns}/${currentTeam.totalWickets}` : 
                `${teamInnings[1]?.totalRuns || 0}/${teamInnings[1]?.totalWickets || 0}`
              }
            </div>
            <div className="text-gray-600">
              ({currentInnings === 2 ? 
                formatOvers(currentOver, currentBallInOver) : 
                formatOvers(teamInnings[1]?.overs || 0, teamInnings[1]?.balls || 0)
              } overs)
            </div>
            {currentInnings === 2 && teamInnings[0] && (
              <div className="text-sm text-blue-600 mt-2">
                Need {teamInnings[0].totalRuns + 1 - currentTeam.totalRuns} runs to win
              </div>
            )}
            {currentInnings === 2 && (
              <div className="text-sm text-gray-500 mt-1">
                RR: {calculateRunRate().toFixed(2)} | RRR: {calculateRequiredRunRate().toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Match Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Current Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium">Over:</span> {currentOver + 1}.{currentBallInOver + 1}
            </div>
            <div>
              <span className="font-medium">Batsmen:</span> 
              {striker.name && nonStriker.name ? 
                ` ${striker.name}* (${striker.runs || 0}), ${nonStriker.name} (${nonStriker.runs || 0})` :
                ' Not selected'
              }
            </div>
            <div>
              <span className="font-medium">Bowler:</span> {currentBowler?.name || 'Not selected'}
            </div>
          </div>
          
          {/* Detailed batting stats */}
          {striker.name && striker.name !== 'Not Selected' && (
            <div className="mt-4 p-3 bg-green-50 rounded">
              <div className="text-sm font-medium text-green-800 mb-2">On Strike: {striker.name}</div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>Runs: {striker.runs || 0} ({striker.balls || 0} balls)</div>
                <div>Strike Rate: {calculateStrikeRate(striker.runs || 0, striker.balls || 0).toFixed(1)}</div>
                <div>Fours: {striker.fours || 0}</div>
                <div>Sixes: {striker.sixes || 0}</div>
              </div>
            </div>
          )}
          
          {/* Bowler stats */}
          {currentBowler?.name && (
            <div className="mt-4 p-3 bg-red-50 rounded">
              <div className="text-sm font-medium text-red-800 mb-2">Bowling: {currentBowler.name}</div>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>Overs: {(currentBowler.overs || 0).toFixed(1)}</div>
                <div>Runs: {currentBowler.runs || 0}</div>
                <div>Wickets: {currentBowler.wickets || 0}</div>
                <div>Economy: {calculateEconomy(currentBowler.runs || 0, currentBowler.overs || 1).toFixed(1)}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoreDisplay;
