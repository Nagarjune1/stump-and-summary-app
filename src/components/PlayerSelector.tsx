
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, UserCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const PlayerSelector = ({ 
  battingPlayers, 
  bowlingPlayers, 
  onBatsmenSelect, 
  onBowlerSelect,
  currentBatsmen,
  currentBowler 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBatsman1, setSelectedBatsman1] = useState("");
  const [selectedBatsman2, setSelectedBatsman2] = useState("");
  const [selectedBowler, setSelectedBowler] = useState("");
  const [striker, setStriker] = useState("batsman1");

  useEffect(() => {
    if (currentBatsmen.length > 0) {
      setSelectedBatsman1(currentBatsmen[0]?.id || "");
      setSelectedBatsman2(currentBatsmen[1]?.id || "");
    }
  }, [currentBatsmen]);

  useEffect(() => {
    if (currentBowler) {
      setSelectedBowler(currentBowler.id || "");
    }
  }, [currentBowler]);

  const handleConfirmSelection = () => {
    const batsman1 = battingPlayers.find(p => p.id === selectedBatsman1);
    const batsman2 = battingPlayers.find(p => p.id === selectedBatsman2);
    const bowler = bowlingPlayers.find(p => p.id === selectedBowler);

    if (!batsman1 || !batsman2) {
      toast({
        title: "Error",
        description: "Please select both batsmen",
        variant: "destructive"
      });
      return;
    }

    if (!bowler) {
      toast({
        title: "Error",
        description: "Please select a bowler",
        variant: "destructive"
      });
      return;
    }

    if (selectedBatsman1 === selectedBatsman2) {
      toast({
        title: "Error",
        description: "Please select different batsmen",
        variant: "destructive"
      });
      return;
    }

    // Initialize batsmen stats
    const batsmenWithStats = [
      {
        ...batsman1,
        runs: currentBatsmen[0]?.runs || 0,
        balls: currentBatsmen[0]?.balls || 0,
        fours: currentBatsmen[0]?.fours || 0,
        sixes: currentBatsmen[0]?.sixes || 0
      },
      {
        ...batsman2,
        runs: currentBatsmen[1]?.runs || 0,
        balls: currentBatsmen[1]?.balls || 0,
        fours: currentBatsmen[1]?.fours || 0,
        sixes: currentBatsmen[1]?.sixes || 0
      }
    ];

    // Arrange batsmen based on striker selection
    const finalBatsmen = striker === "batsman1" ? batsmenWithStats : [batsmenWithStats[1], batsmenWithStats[0]];

    // Initialize bowler stats
    const bowlerWithStats = {
      ...bowler,
      overs: currentBowler?.overs || 0,
      runs: currentBowler?.runs || 0,
      wickets: currentBowler?.wickets || 0
    };

    onBatsmenSelect(finalBatsmen);
    onBowlerSelect(bowlerWithStats);
    setIsOpen(false);

    toast({
      title: "Players Selected!",
      description: `${batsman1.name} & ${batsman2.name} are batting, ${bowler.name} is bowling`,
    });
  };

  const resetSelections = () => {
    setSelectedBatsman1("");
    setSelectedBatsman2("");
    setSelectedBowler("");
    setStriker("batsman1");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Player Selection
          </CardTitle>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <UserCheck className="w-4 h-4 mr-2" />
                {currentBatsmen.length > 0 ? 'Change Players' : 'Select Players'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Select Playing XI</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Batsman 1</label>
                  <Select value={selectedBatsman1} onValueChange={setSelectedBatsman1}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select first batsman" />
                    </SelectTrigger>
                    <SelectContent>
                      {battingPlayers.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name} ({player.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Batsman 2</label>
                  <Select value={selectedBatsman2} onValueChange={setSelectedBatsman2}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select second batsman" />
                    </SelectTrigger>
                    <SelectContent>
                      {battingPlayers.filter(p => p.id !== selectedBatsman1).map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name} ({player.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Strike Batsman</label>
                  <Select value={striker} onValueChange={setStriker}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select striker" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="batsman1">
                        {selectedBatsman1 ? battingPlayers.find(p => p.id === selectedBatsman1)?.name : 'Batsman 1'}
                      </SelectItem>
                      <SelectItem value="batsman2">
                        {selectedBatsman2 ? battingPlayers.find(p => p.id === selectedBatsman2)?.name : 'Batsman 2'}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bowler</label>
                  <Select value={selectedBowler} onValueChange={setSelectedBowler}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select bowler" />
                    </SelectTrigger>
                    <SelectContent>
                      {bowlingPlayers.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name} ({player.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={resetSelections}>
                    Reset
                  </Button>
                  <Button 
                    onClick={handleConfirmSelection}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Confirm Selection
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {currentBatsmen.length === 0 && !currentBowler ? (
          <p className="text-gray-500 text-center py-4">
            Select batsmen and bowler to start scoring
          </p>
        ) : (
          <div className="text-sm text-gray-600">
            <p>
              <span className="font-medium">Batting:</span> {currentBatsmen.map(b => b.name).join(', ')}
            </p>
            <p>
              <span className="font-medium">Bowling:</span> {currentBowler?.name || 'Not selected'}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerSelector;
