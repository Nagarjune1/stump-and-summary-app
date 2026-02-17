
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Play } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatOvers } from "@/utils/scoringUtils";
import { useScoringSound } from "@/hooks/useScoringSound";

interface ScoringControlsProps {
  onScore: (runs: number) => void;
  onWicket: (dismissalType: string) => void;
  onExtra: (extraType: string, runs?: number) => void;
  onBoundary: (boundaryType: 'four' | 'six') => void;
  onUndoLastBall: () => void;
  isValidToScore: boolean;
  canUndo?: boolean;
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
  canUndo = false,
  currentOver = 0,
  currentBall = 0,
  totalOvers = 20,
  powerplayOvers = 6,
  isPowerplay = false,
  isFreehit = false
}: ScoringControlsProps) => {
  const { playSound } = useScoringSound();

  const handleRunsClick = (runs: number) => {
    if (!isValidToScore) {
      toast({
        title: "Cannot Score",
        description: "Please select both batsmen and a bowler first",
        variant: "destructive"
      });
      return;
    }
    
    if (runs === 4) {
      playSound('four');
      onBoundary('four');
    } else if (runs === 6) {
      playSound('six');
      onBoundary('six');
    } else {
      playSound('run');
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
    
    playSound('wicket');
    onWicket(wicketType);
  };

  const isLastOver = currentOver >= totalOvers - 1;
  const isLastBallOfOver = currentBall >= 5;
  const currentOversDisplay = formatOvers(currentOver, currentBall);

  if (!isValidToScore) {
    return (
      <Card className="neon-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Play className="w-5 h-5 text-primary" />
            Score Ball
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
            <p className="text-foreground font-medium mb-2">Ready to Start Scoring</p>
            <p className="text-muted-foreground text-sm">Please select both batsmen and a bowler to begin</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="neon-card">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-foreground">
            <Play className="w-5 h-5 text-primary" />
            <span>Score Ball</span>
          </div>
          <div className="flex gap-2">
            {isPowerplay && (
              <Badge className="bg-primary text-primary-foreground text-xs">
                POWERPLAY
              </Badge>
            )}
            {isFreehit && (
              <Badge className="bg-warning text-warning-foreground text-xs animate-pulse">
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
        <div className="text-sm text-muted-foreground">
          Over {currentOversDisplay} of {totalOvers} 
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
                ${runs === 4 ? "bg-success hover:bg-success/90 text-success-foreground" : ""}
                ${runs === 6 ? "bg-primary hover:bg-primary/90 text-primary-foreground" : ""}
                ${runs === 0 ? "border-muted-foreground/30" : ""}
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
            className="text-warning border-warning/30 hover:bg-warning/10 text-xs"
            disabled={!isValidToScore}
          >
            Wide
          </Button>
          <Button
            onClick={() => handleExtraClick('noballs')}
            variant="outline"
            className="text-destructive border-destructive/30 hover:bg-destructive/10 text-xs"
            disabled={!isValidToScore}
          >
            No Ball
          </Button>
          <Button
            onClick={() => handleExtraClick('byes')}
            variant="outline"
            className="text-primary border-primary/30 hover:bg-primary/10 text-xs"
            disabled={!isValidToScore}
          >
            Bye
          </Button>
          <Button
            onClick={() => handleExtraClick('legbyes')}
            variant="outline"
            className="text-success border-success/30 hover:bg-success/10 text-xs"
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
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3 text-center">
            <p className="text-sm font-medium text-warning">
              Last ball of over {currentOver + 1}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Bowler may need to be changed after this ball
            </p>
          </div>
        )}

        {/* Free Hit Info */}
        {isFreehit && isValidToScore && (
          <div className="bg-warning/10 border border-warning/30 rounded-lg p-3">
            <p className="text-xs text-warning">
              <AlertTriangle className="w-3 h-3 inline mr-1" />
              FREE HIT: Batsman cannot be out bowled, caught, LBW, or stumped
            </p>
          </div>
        )}

        {/* Undo Button */}
        <div className="pt-2 border-t border-border">
          <Button
            onClick={onUndoLastBall}
            variant="outline"
            size="sm"
            className="w-full"
            disabled={!canUndo}
          >
            Undo Last Ball
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoringControls;
