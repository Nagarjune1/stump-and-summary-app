
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScoringControlsProps {
  onRecordBall: (runs: number, extras?: number, extraType?: string, isWicket?: boolean, wicketType?: string) => void;
  isDisabled?: boolean;
}

const ScoringControls = ({ onRecordBall, isDisabled = false }: ScoringControlsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Score Ball</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-4 gap-2 mb-4">
          {[0, 1, 2, 3, 4, 6].map((runs) => (
            <Button
              key={runs}
              onClick={() => onRecordBall(runs)}
              variant={runs === 0 ? "outline" : "default"}
              className={runs === 4 ? "bg-green-600 hover:bg-green-700" : runs === 6 ? "bg-purple-600 hover:bg-purple-700" : ""}
              disabled={isDisabled}
            >
              {runs}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <Button
            onClick={() => onRecordBall(0, 1, 'wide')}
            variant="outline"
            className="text-orange-600"
            disabled={isDisabled}
          >
            Wide
          </Button>
          <Button
            onClick={() => onRecordBall(0, 1, 'no-ball')}
            variant="outline"
            className="text-red-600"
            disabled={isDisabled}
          >
            No Ball
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button
            onClick={() => onRecordBall(0, 0, '', true, 'bowled')}
            variant="destructive"
            disabled={isDisabled}
          >
            Bowled
          </Button>
          <Button
            onClick={() => onRecordBall(0, 0, '', true, 'caught')}
            variant="destructive"
            disabled={isDisabled}
          >
            Caught
          </Button>
          <Button
            onClick={() => onRecordBall(0, 0, '', true, 'lbw')}
            variant="destructive"
            disabled={isDisabled}
          >
            LBW
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScoringControls;
