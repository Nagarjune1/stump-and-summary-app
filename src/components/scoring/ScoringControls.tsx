import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle } from "lucide-react";

interface ScoringControlsProps {
  onRecordBall: (runs: number, extras?: number, extraType?: string, isWicket?: boolean, wicketType?: string) => void;
  isDisabled?: boolean;
  currentOver?: number;
  currentBall?: number;
  totalOvers?: number;
  powerplayOvers?: number;
  isPowerplay?: boolean;
  isFreehit?: boolean;
}

const ScoringControls = ({ 
  onRecordBall, 
  isDisabled = false,
  currentOver = 0,
  currentBall = 0,
  totalOvers = 20,
  powerplayOvers = 6,
  isPowerplay = false,
  isFreehit = false
}: ScoringControlsProps) => {
  
  const handleRunsClick = (runs: number) => {
    onRecordBall(runs);
  };

  const handleExtraClick = (extraType: string, extraRuns: number = 1) => {
    onRecordBall(0, extraRuns, extraType);
  };

  const handleWicketClick = (wicketType: string) => {
    onRecordBall(0, 0, '', true, wicketType);
  };

  const isLastOver = currentOver === totalOvers - 1;
  const isLastBallOfOver = currentBall === 5;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Score Ball</span>
          <div className="flex gap-2">
            {isPowerplay && (
              <Badge className="bg-blue-600 text-white text-xs">
                POWERPLAY
              </Badge>
            )}
            {isFreehit && (
              <Badge className="bg-orange-600 text-white text-xs animate-pulse">
                FREE HIT
              </Badge>
            )}
            {isLastOver && (
              <Badge variant="destructive" className="text-xs">
                LAST OVER
              </Badge>
            )}
          </div>
        </CardTitle>
        <div className="text-sm text-gray-600">
          Over {currentOver + 1}.{currentBall + 1} of {totalOvers} 
          {isPowerplay && ` • Powerplay (1-${powerplayOvers})`}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Run Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[0, 1, 2, 3, 4, 6].map((runs) => (
            <Button
              key={runs}
              onClick={() => handleRunsClick(runs)}
              variant={runs === 0 ? "outline" : "default"}
              className={`
                ${runs === 4 ? "bg-green-600 hover:bg-green-700 text-white" : ""}
                ${runs === 6 ? "bg-purple-600 hover:bg-purple-700 text-white" : ""}
                ${runs === 0 ? "text-gray-600" : ""}
              `}
              disabled={isDisabled}
              size="lg"
            >
              {runs}
            </Button>
          ))}
        </div>

        {/* Extra Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={() => handleExtraClick('wide')}
            variant="outline"
            className="text-orange-600 border-orange-300 hover:bg-orange-50"
            disabled={isDisabled}
          >
            Wide Ball
          </Button>
          <Button
            onClick={() => handleExtraClick('no-ball')}
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50"
            disabled={isDisabled}
          >
            No Ball
          </Button>
        </div>

        {/* Wicket Buttons - Disabled on Free Hit for bowled, LBW, caught */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => handleWicketClick('bowled')}
            variant="destructive"
            disabled={isDisabled || isFreehit}
            className="text-sm"
          >
            Bowled
            {isFreehit && <AlertTriangle className="w-3 h-3 ml-1" />}
          </Button>
          <Button
            onClick={() => handleWicketClick('caught')}
            variant="destructive"
            disabled={isDisabled || isFreehit}
            className="text-sm"
          >
            Caught
            {isFreehit && <AlertTriangle className="w-3 h-3 ml-1" />}
          </Button>
          <Button
            onClick={() => handleWicketClick('lbw')}
            variant="destructive"
            disabled={isDisabled || isFreehit}
            className="text-sm"
          >
            LBW
            {isFreehit && <AlertTriangle className="w-3 h-3 ml-1" />}
          </Button>
        </div>

        {/* Always allowed wickets */}
        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => handleWicketClick('run out')}
            variant="destructive"
            disabled={isDisabled}
            className="text-sm"
          >
            Run Out
          </Button>
          <Button
            onClick={() => handleWicketClick('stumped')}
            variant="destructive"
            disabled={isDisabled || isFreehit}
            className="text-sm"
          >
            Stumped
            {isFreehit && <AlertTriangle className="w-3 h-3 ml-1" />}
          </Button>
          <Button
            onClick={() => handleWicketClick('hit wicket')}
            variant="destructive"
            disabled={isDisabled}
            className="text-sm"
          >
            Hit Wicket
          </Button>
        </div>

        {/* Over Status */}
        {isLastBallOfOver && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-center">
            <p className="text-sm font-medium text-yellow-800">
              Last ball of over {currentOver + 1}
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Bowler will be asked to change after this ball
            </p>
          </div>
        )}

        {/* Free Hit Info */}
        {isFreehit && (
          <div className="bg-orange-50 border border-orange-200 rounded p-3">
            <p className="text-xs text-orange-800">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              FREE HIT: Batsman cannot be out bowled, caught, LBW, or stumped
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ScoringControls;
