
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScoreDisplayProps {
  currentInnings: number;
  team1Name: string;
  team2Name: string;
  team1Score: {
    runs: number;
    wickets: number;
    overs: number;
  };
  team2Score: {
    runs: number;
    wickets: number;
    overs: number;
  };
  currentOver: number;
  currentBall: number;
  totalScore: number;
  totalWickets: number;
  runRate: number;
  requiredRunRate: number;
  target?: number | null;
}

const ScoreDisplay = ({
  currentInnings,
  team1Name,
  team2Name,
  team1Score,
  team2Score,
  currentOver,
  currentBall,
  totalScore,
  totalWickets,
  runRate,
  requiredRunRate,
  target
}: ScoreDisplayProps) => {
  const formatOvers = (overs: number) => {
    const completeOvers = Math.floor(overs);
    const balls = Math.round((overs - completeOvers) * 6);
    return `${completeOvers}.${balls}`;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className={currentInnings === 1 ? "ring-2 ring-blue-500" : ""}>
        <CardHeader>
          <CardTitle className="text-lg">{team1Name} - 1st Innings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {team1Score.runs}/{team1Score.wickets}
          </div>
          <div className="text-gray-600">
            ({formatOvers(team1Score.overs)} overs)
          </div>
        </CardContent>
      </Card>

      <Card className={currentInnings === 2 ? "ring-2 ring-blue-500" : ""}>
        <CardHeader>
          <CardTitle className="text-lg">{team2Name} - 2nd Innings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {currentInnings === 2 ? `${totalScore}/${totalWickets}` : `${team2Score.runs}/${team2Score.wickets}`}
          </div>
          <div className="text-gray-600">
            ({currentInnings === 2 ? formatOvers(currentOver - 1 + (currentBall - 1) / 6) : formatOvers(team2Score.overs)} overs)
          </div>
          {currentInnings === 2 && target && (
            <div className="text-sm text-blue-600 mt-2">
              Need {target - totalScore} runs to win
            </div>
          )}
          {currentInnings === 2 && (
            <div className="text-sm text-gray-500 mt-1">
              RR: {runRate.toFixed(2)} | RRR: {requiredRunRate.toFixed(2)}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoreDisplay;
