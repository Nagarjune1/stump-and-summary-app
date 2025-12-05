
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatOvers, calculateStrikeRate, calculateEconomy } from "@/utils/scoringUtils";
import { Target, Users, Activity } from "lucide-react";

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

  // Calculate current overs display - uses completed overs + balls in current over
  const getCurrentOversDisplay = () => {
    return formatOvers(currentOver, currentBallInOver);
  };

  const calculateRunRate = () => {
    const totalBalls = currentOver * 6 + currentBallInOver;
    if (totalBalls === 0) return 0;
    return (currentTeam.totalRuns / totalBalls) * 6;
  };

  const calculateRequiredRunRate = () => {
    if (currentInnings === 1 || !teamInnings[0]) return 0;
    
    const target = teamInnings[0].totalRuns + 1;
    const remaining = target - currentTeam.totalRuns;
    const totalOvers = matchSetup?.overs || 20;
    const ballsLeft = totalOvers * 6 - (currentOver * 6 + currentBallInOver);
    
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
  const totalOvers = matchSetup?.overs || 20;
  const ballsRemaining = totalOvers * 6 - (currentOver * 6 + currentBallInOver);

  return (
    <div className="space-y-4">
      {/* Team Innings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className={`neon-card ${currentInnings === 1 ? "ring-2 ring-primary" : "opacity-80"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="text-foreground">
                {teamInnings[0]?.teamName || selectedMatch?.team1_name || 'Team 1'}
              </span>
              <Badge variant="outline" className="text-xs">1st Innings</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {teamInnings[0]?.totalRuns || 0}
              <span className="text-2xl text-muted-foreground">/{teamInnings[0]?.totalWickets || 0}</span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              ({currentInnings === 1 ? getCurrentOversDisplay() : formatOvers(teamInnings[0]?.overs || 0, teamInnings[0]?.balls || 0)} overs)
            </div>
            {currentInnings === 1 && (
              <div className="text-xs text-muted-foreground mt-2">
                Run Rate: {calculateRunRate().toFixed(2)}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className={`neon-card ${currentInnings === 2 ? "ring-2 ring-primary" : "opacity-80"}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center justify-between">
              <span className="text-foreground">
                {teamInnings[1]?.teamName || selectedMatch?.team2_name || 'Team 2'}
              </span>
              <Badge variant="outline" className="text-xs">2nd Innings</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">
              {currentInnings === 2 ? currentTeam.totalRuns : (teamInnings[1]?.totalRuns || 0)}
              <span className="text-2xl text-muted-foreground">
                /{currentInnings === 2 ? currentTeam.totalWickets : (teamInnings[1]?.totalWickets || 0)}
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              ({currentInnings === 2 ? 
                getCurrentOversDisplay() : 
                formatOvers(teamInnings[1]?.overs || 0, teamInnings[1]?.balls || 0)
              } overs)
            </div>
            {currentInnings === 2 && teamInnings[0] && (
              <>
                <div className="text-sm text-success font-medium mt-2">
                  Need {Math.max(0, teamInnings[0].totalRuns + 1 - currentTeam.totalRuns)} runs from {ballsRemaining} balls
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  RR: {calculateRunRate().toFixed(2)} | RRR: {calculateRequiredRunRate().toFixed(2)}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Current Match Status */}
      <Card className="neon-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Over Status */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1">Over</div>
              <div className="text-2xl font-bold text-primary">
                {getCurrentOversDisplay()}
              </div>
              <div className="text-xs text-muted-foreground">
                of {totalOvers} overs
              </div>
            </div>
            
            {/* Batsmen Status */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Batsmen
              </div>
              {striker.name && striker.name !== 'Not Selected' ? (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-foreground">
                    {striker.name}* <span className="text-primary">{striker.runs || 0}</span>
                    <span className="text-muted-foreground text-xs ml-1">({striker.balls || 0})</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {nonStriker.name} <span>{nonStriker.runs || 0}</span>
                    <span className="text-xs ml-1">({nonStriker.balls || 0})</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Not selected</div>
              )}
            </div>
            
            {/* Bowler Status */}
            <div className="p-3 bg-muted/30 rounded-lg">
              <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <Target className="w-3 h-3" />
                Bowler
              </div>
              {currentBowler?.name ? (
                <div className="space-y-1">
                  <div className="text-sm font-medium text-foreground">
                    {currentBowler.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {currentBowler.wickets || 0}-{currentBowler.runs || 0} ({(currentBowler.overs || 0).toFixed(1)} ov)
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Not selected</div>
              )}
            </div>
          </div>
          
          {/* Detailed batting stats */}
          {striker.name && striker.name !== 'Not Selected' && (
            <div className="mt-4 p-3 bg-success/10 border border-success/30 rounded-lg">
              <div className="text-sm font-medium text-success mb-2 flex items-center gap-2">
                On Strike: {striker.name}
                <Badge variant="outline" className="text-xs border-success text-success">*</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">Runs</div>
                  <div className="font-bold text-foreground">{striker.runs || 0}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Balls</div>
                  <div className="font-bold text-foreground">{striker.balls || 0}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">SR</div>
                  <div className="font-bold text-foreground">{calculateStrikeRate(striker.runs || 0, striker.balls || 0).toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">4s/6s</div>
                  <div className="font-bold text-foreground">{striker.fours || 0}/{striker.sixes || 0}</div>
                </div>
              </div>
            </div>
          )}
          
          {/* Bowler stats */}
          {currentBowler?.name && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/30 rounded-lg">
              <div className="text-sm font-medium text-destructive mb-2">
                Bowling: {currentBowler.name}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground text-xs">Overs</div>
                  <div className="font-bold text-foreground">{(currentBowler.overs || 0).toFixed(1)}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Runs</div>
                  <div className="font-bold text-foreground">{currentBowler.runs || 0}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Wickets</div>
                  <div className="font-bold text-foreground">{currentBowler.wickets || 0}</div>
                </div>
                <div>
                  <div className="text-muted-foreground text-xs">Economy</div>
                  <div className="font-bold text-foreground">{calculateEconomy(currentBowler.runs || 0, currentBowler.overs || 1).toFixed(2)}</div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoreDisplay;
