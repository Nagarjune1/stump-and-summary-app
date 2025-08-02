
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScoreDisplayProps {
  team1Name: string;
  team2Name: string;
  innings1Score: {
    runs: number;
    wickets: number;
    overs: number;
    balls: number;
  };
  innings2Score: {
    runs: number;
    wickets: number;
    overs: number;
    balls: number;
  };
  currentInnings: number;
  totalOvers: number;
}

const ScoreDisplay = ({
  team1Name,
  team2Name,
  innings1Score,
  innings2Score,
  currentInnings,
  totalOvers
}: ScoreDisplayProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{team1Name} - 1st Innings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {innings1Score.runs}/{innings1Score.wickets}
          </div>
          <div className="text-gray-600">
            ({innings1Score.overs}.{innings1Score.balls} overs)
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{team2Name} - 2nd Innings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {innings2Score.runs}/{innings2Score.wickets}
          </div>
          <div className="text-gray-600">
            ({innings2Score.overs}.{innings2Score.balls} overs)
          </div>
          {currentInnings === 2 && innings1Score.runs > 0 && (
            <div className="text-sm text-blue-600 mt-2">
              Need {innings1Score.runs + 1 - innings2Score.runs} runs from {(totalOvers * 6) - (innings2Score.overs * 6 + innings2Score.balls)} balls
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScoreDisplay;
