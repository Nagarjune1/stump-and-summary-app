
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const ShotSelector = ({ open, onClose, onShotSelect, runs }) => {
  const shots = [
    'Defensive',
    'Drive',
    'Cut',
    'Pull',
    'Hook',
    'Sweep',
    'Reverse Sweep',
    'Flick',
    'Glance',
    'Loft',
    'Slog',
    'Other'
  ];

  const handleShotSelect = (shot) => {
    onShotSelect(shot);
  };

  const handleSkip = () => {
    onShotSelect(null);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Shot Type ({runs} runs)</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Optional: Select the type of shot played</p>
          <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto">
            {shots.map((shot) => (
              <Button
                key={shot}
                variant="outline"
                onClick={() => handleShotSelect(shot)}
                className="text-sm"
              >
                {shot}
              </Button>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button 
              variant="outline" 
              onClick={handleSkip}
              className="text-gray-600"
            >
              Skip
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShotSelector;
