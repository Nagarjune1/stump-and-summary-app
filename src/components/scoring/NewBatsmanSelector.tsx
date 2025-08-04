
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import SafeSelectItem from "@/components/ui/SafeSelectItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { ensureValidSelectItemValue } from "@/utils/selectUtils";

interface NewBatsmanSelectorProps {
  open: boolean;
  onClose: () => void;
  onBatsmanSelect: (batsmanId: string) => void;
  availablePlayers: any[];
  outBatsmanName?: string;
}

const NewBatsmanSelector = ({ 
  open, 
  onClose, 
  onBatsmanSelect,
  availablePlayers = [],
  outBatsmanName = "Batsman"
}: NewBatsmanSelectorProps) => {
  const [selectedBatsman, setSelectedBatsman] = useState("");

  const handleConfirm = () => {
    if (!selectedBatsman) {
      toast({
        title: "Error",
        description: "Please select a batsman",
        variant: "destructive"
      });
      return;
    }

    onBatsmanSelect(selectedBatsman);
    handleClose();
  };

  const handleClose = () => {
    setSelectedBatsman("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            New Batsman Required
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {outBatsmanName} is out. Select the next batsman.
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Next Batsman</label>
                <Select value={selectedBatsman} onValueChange={setSelectedBatsman}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select next batsman" />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePlayers.map((player) => (
                      <SafeSelectItem key={player.id} value={ensureValidSelectItemValue(player.id)}>
                        {player.name}
                      </SafeSelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700">
              <Users className="w-4 h-4 mr-2" />
              Confirm Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewBatsmanSelector;
