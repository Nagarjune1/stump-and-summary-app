
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit3, Save, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const ScoreCorrection = ({ currentScore, onScoreUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [editedScore, setEditedScore] = useState({
    runs: currentScore.runs,
    wickets: currentScore.wickets,
    overs: currentScore.overs
  });

  const handleSave = () => {
    const updatedScore = {
      ...editedScore,
      runs: parseInt(editedScore.runs) || 0,
      wickets: parseInt(editedScore.wickets) || 0,
      overs: parseFloat(editedScore.overs) || 0
    };

    onScoreUpdate(updatedScore);
    setIsOpen(false);
    
    toast({
      title: "Score Updated",
      description: `Score corrected to ${updatedScore.runs}/${updatedScore.wickets} (${updatedScore.overs} overs)`,
    });
  };

  const handleCancel = () => {
    setEditedScore({
      runs: currentScore.runs,
      wickets: currentScore.wickets,
      overs: currentScore.overs
    });
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Edit3 className="w-4 h-4" />
          Correct Score
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Correct Score</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="runs">Runs</Label>
              <Input
                id="runs"
                type="number"
                value={editedScore.runs}
                onChange={(e) => setEditedScore({...editedScore, runs: e.target.value})}
                min="0"
              />
            </div>
            <div>
              <Label htmlFor="wickets">Wickets</Label>
              <Input
                id="wickets"
                type="number"
                value={editedScore.wickets}
                onChange={(e) => setEditedScore({...editedScore, wickets: e.target.value})}
                min="0"
                max="10"
              />
            </div>
            <div>
              <Label htmlFor="overs">Overs</Label>
              <Input
                id="overs"
                type="number"
                step="0.1"
                value={editedScore.overs}
                onChange={(e) => setEditedScore({...editedScore, overs: e.target.value})}
                min="0"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ScoreCorrection;
