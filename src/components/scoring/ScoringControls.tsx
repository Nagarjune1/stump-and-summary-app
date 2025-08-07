
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Play } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ScoringControlsProps {
  onScore: (runs: number) => void;
  onWicket: (dismissalType: string) => void;
  onExtra: (extraType: string, runs?: number) => void;
  onBoundary: (boundaryType: 'four' | 'six') => void;
  onUndoLastBall: () => void;
  isValidToScore: boolean;
  currentOver?: number;
  currentBall?: number;
  totalOvers?: number;
  powerplayOvers?: number;
  isPowerplay?: boolean;
  isFreehit?: boolean;
}

const ScoringControls = ({ 
  onScore,
  onWicket,
  onExtra,
  onBoundary,
  onUndoLastBall,
  isValidToScore,
  currentOver = 0,
  currentBall = 0,
  totalOvers = 20,
  powerplayOvers = 6,
  isPowerplay = false,
  isFreehit = false
}: ScoringControlsProps) => {
  
  const handleRunsClick = (runs: number) => {
    if (!isValidToScore) {
      toast({
        title: "Cannot Score",
        description: "Please select both batsmen and a bowler first",
        variant: "destructive"
      });
      return;
    }
    
    console.log(`Scoring ${runs} runs`);
    
    if (runs === 4) {
      onBoundary('four');
    } else if (runs === 6) {
      onBoundary('six');
    } else {
      onScore(runs);
    }
  };

  const handleExtraClick = (extraType: string, extraRuns: number = 1) => {
    if (!isValidToScore) {
      toast({
        title: "Cannot Score",
        description: "Please select both batsmen and a bowler first",
        variant: "destructive"
      });
      return;
    }
    
    console.log(`Adding extra: ${extraType}`);
    onExtra(extraType, extraRuns);
  };

  const handleWicketClick = (wicketType: string) => {
    if (!isValidToScore) {
      toast({
        title: "Cannot Score",
        description: "Please select both batsmen and a bowler first",
        variant: "destructive"
      });
      return;
    }
    
    console.log(`Taking wicket: ${wicketType}`);
    onWicket(wicketType);
  };

  const isLastOver = currentOver >= totalOvers - 1;
  const isLastBallOfOver = currentBall >= 5;

  if (!isValidToScore) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            Score Ball
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <p className="text-gray-700 font-medium mb-2">Ready to Start Scoring</p>
            <p className="text-gray-500 text-sm">Please select both batsmen and a bowler to begin</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5" />
            <span>Score Ball</span>
          </div>
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
        <div className="grid grid-cols-3 gap-2">
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
              size="lg"
              disabled={!isValidToScore}
            >
              {runs}
            </Button>
          ))}
        </div>

        {/* Extra Buttons */}
        <div className="grid grid-cols-4 gap-2">
          <Button
            onClick={() => handleExtraClick('wides')}
            variant="outline"
            className="text-orange-600 border-orange-300 hover:bg-orange-50 text-xs"
            disabled={!isValidToScore}
          >
            Wide
          </Button>
          <Button
            onClick={() => handleExtraClick('noballs')}
            variant="outline"
            className="text-red-600 border-red-300 hover:bg-red-50 text-xs"
            disabled={!isValidToScore}
          >
            No Ball
          </Button>
          <Button
            onClick={() => handleExtraClick('byes')}
            variant="outline"
            className="text-blue-600 border-blue-300 hover:bg-blue-50 text-xs"
            disabled={!isValidToScore}
          >
            Bye
          </Button>
          <Button
            onClick={() => handleExtraClick('legbyes')}
            variant="outline"
            className="text-green-600 border-green-300 hover:bg-green-50 text-xs"
            disabled={!isValidToScore}
          >
            Leg Bye
          </Button>
        </div>

        {/* Wicket Buttons */}
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => handleWicketClick('bowled')}
              variant="destructive"
              disabled={isFreehit || !isValidToScore}
              className="text-sm"
            >
              Bowled
              {isFreehit && <AlertTriangle className="w-3 h-3 ml-1" />}
            </Button>
            <Button
              onClick={() => handleWicketClick('caught')}
              variant="destructive"
              disabled={isFreehit || !isValidToScore}
              className="text-sm"
            >
              Caught
              {isFreehit && <AlertTriangle className="w-3 h-3 ml-1" />}
            </Button>
            <Button
              onClick={() => handleWicketClick('lbw')}
              variant="destructive"
              disabled={isFreehit || !isValidToScore}
              className="text-sm"
            >
              LBW
              {isFreehit && <AlertTriangle className="w-3 h-3 ml-1" />}
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <Button
              onClick={() => handleWicketClick('run out')}
              variant="destructive"
              className="text-sm"
              disabled={!isValidToScore}
            >
              Run Out
            </Button>
            <Button
              onClick={() => handleWicketClick('stumped')}
              variant="destructive"
              disabled={isFreehit || !isValidToScore}
              className="text-sm"
            >
              Stumped
              {isFreehit && <AlertTriangle className="w-3 h-3 ml-1" />}
            </Button>
            <Button
              onClick={() => handleWicketClick('hit wicket')}
              variant="destructive"
              className="text-sm"
              disabled={!isValidToScore}
            >
              Hit Wicket
            </Button>
          </div>
        </div>

        {/* Over Status Indicators */}
        {isLastBallOfOver && isValidToScore && (
          <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-center">
            <p className="text-sm font-medium text-yellow-800">
              Last ball of over {currentOver + 1}
            </p>
            <p className="text-xs text-yellow-600 mt-1">
              Bowler may need to be changed after this ball
            </p>
          </div>
        )}

        {/* Free Hit Info */}
        {isFreehit && isValidToScore && (
          <div className="bg-orange-50 border border-orange-200 rounded p-3">
            <p className="text-xs text-orange-800">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              FREE HIT: Batsman cannot be out bowled, caught, LBW, or stumped
            </p>
          </div>
        )}

        {/* Undo Button */}
        <div className="pt-2 border-t">
          <Button
            onClick={onUndoLastBall}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={!isValidToScore}
          >
            Undo Last Ball
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoringControls;
