import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Settings, Clock, Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MatchSetupProps {
  matchData: any;
  onMatchSetupComplete: (setupData: any) => void;
  onBack: () => void;
}

const MatchSetup = ({ matchData, onMatchSetupComplete, onBack }: MatchSetupProps) => {
  const [overs, setOvers] = useState(matchData?.overs || 20);
  const [ballsPerOver, setBallsPerOver] = useState(6);
  const [powerplayOvers, setPowerplayOvers] = useState(0);
  const [drsReviews, setDrsReviews] = useState(0);
  const [followOn, setFollowOn] = useState(false);
  const [boundarySize, setBoundarySize] = useState("");
  
  useEffect(() => {
    // Set default values based on match format
    if (matchData?.format) {
      switch (matchData.format) {
        case 'T20':
          setOvers(20);
          setPowerplayOvers(6);
          setDrsReviews(1);
          break;
        case 'ODI':
          setOvers(50);
          setPowerplayOvers(10);
          setDrsReviews(2);
          break;
        case 'T10':
          setOvers(10);
          setPowerplayOvers(3);
          setDrsReviews(1);
          break;
        case 'Test':
          setOvers(0); // Unlimited overs
          setPowerplayOvers(0);
          setDrsReviews(3);
          setFollowOn(true);
          break;
        default:
          setOvers(matchData.overs || 20);
          setPowerplayOvers(Math.min(6, Math.floor((matchData.overs || 20) * 0.3)));
          break;
      }
    }
  }, [matchData]);

  const handleSetupComplete = () => {
    if (matchData.format !== 'Test' && overs <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid number of overs",
        variant: "destructive"
      });
      return;
    }

    if (powerplayOvers > overs && matchData.format !== 'Test') {
      toast({
        title: "Error", 
        description: "Powerplay overs cannot exceed total overs",
        variant: "destructive"
      });
      return;
    }

    const setupData = {
      overs,
      ballsPerOver,
      powerplayOvers,
      drsReviews,
      followOn: matchData.format === 'Test' ? followOn : false,
      boundarySize,
      matchRules: {
        autoChangeBowlerAfterOver: true,
        askDismissalOnWicket: true,
        autoEndInningsOnAllOut: true,
        enablePowerplay: powerplayOvers > 0,
        enableDRS: drsReviews > 0,
        wideBallExtraRun: true,
        noBallExtraRun: true,
        noBallFreehit: true
      }
    };

    toast({
      title: "Match Setup Complete!",
      description: "All scoring rules configured successfully",
    });

    onMatchSetupComplete(setupData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Match Configuration
          </CardTitle>
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Configure scoring rules for {matchData?.team1_name} vs {matchData?.team2_name}
            </p>
            <Button variant="outline" onClick={onBack}>
              Back to Match Selection
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Match Format Summary */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="font-medium text-blue-900">Format: {matchData?.format || 'Custom'}</span>
            </div>
            <div className="text-sm text-blue-700">
              Venue: {matchData?.venue} • Date: {new Date(matchData?.match_date).toLocaleDateString()}
            </div>
          </div>

          {/* Overs Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="overs" className="text-base font-medium">
                Total Overs per Innings
              </Label>
              <Input
                id="overs"
                type="number"
                value={overs}
                onChange={(e) => setOvers(parseInt(e.target.value) || 0)}
                min="1"
                max="50"
                disabled={matchData?.format === 'Test'}
                className="mt-2"
              />
              {matchData?.format === 'Test' && (
                <p className="text-xs text-gray-500 mt-1">Unlimited overs for Test matches</p>
              )}
            </div>

            <div>
              <Label htmlFor="ballsPerOver" className="text-base font-medium">
                Balls per Over
              </Label>
              <Input
                id="ballsPerOver"
                type="number"
                value={ballsPerOver}
                onChange={(e) => setBallsPerOver(parseInt(e.target.value) || 6)}
                min="4"
                max="8"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Standard: 6 balls per over</p>
            </div>
          </div>

          {/* Powerplay and Reviews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="powerplay" className="text-base font-medium">
                Powerplay Overs
              </Label>
              <Input
                id="powerplay"
                type="number"
                value={powerplayOvers}
                onChange={(e) => setPowerplayOvers(parseInt(e.target.value) || 0)}
                min="0"
                max={Math.floor(overs * 0.5)}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                Maximum fielders outside 30-yard circle: 2
              </p>
            </div>

            <div>
              <Label htmlFor="drs" className="text-base font-medium">
                DRS Reviews per Team
              </Label>
              <Input
                id="drs"
                type="number"
                value={drsReviews}
                onChange={(e) => setDrsReviews(parseInt(e.target.value) || 0)}
                min="0"
                max="3"
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">Decision Review System</p>
            </div>
          </div>

          {/* Additional Settings */}
          <div>
            <Label htmlFor="boundary" className="text-base font-medium">
              Boundary Size (optional)
            </Label>
            <Input
              id="boundary"
              value={boundarySize}
              onChange={(e) => setBoundarySize(e.target.value)}
              placeholder="e.g., 65 meters"
              className="mt-2"
            />
          </div>

          {/* Match Rules Summary */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Automatic Scoring Rules Enabled
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">✓</Badge>
                <span>Auto bowler change after each over</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">✓</Badge>
                <span>Wicket dismissal type selector</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">✓</Badge>
                <span>Auto innings end when all out</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">✓</Badge>
                <span>Wide & No-ball extra runs</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">✓</Badge>
                <span>Free hit on no-ball</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">✓</Badge>
                <span>Shot type tracking (optional)</span>
              </div>
            </div>
          </div>

          {/* Start Match Button */}
          <div className="flex justify-center pt-4">
            <Button
              onClick={handleSetupComplete}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            >
              Complete Setup & Start Scoring
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MatchSetup;
