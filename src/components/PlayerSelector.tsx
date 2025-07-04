
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, UserCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const PlayerSelector = ({ 
  match,
  onPlayersSelected
}: {
  match: any;
  onPlayersSelected: (batsmen: any[], bowler: any) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedBatsman1, setSelectedBatsman1] = useState("");
  const [selectedBatsman2, setSelectedBatsman2] = useState("");
  const [selectedBowler, setSelectedBowler] = useState("");
  const [striker, setStriker] = useState("batsman1");
  const [battingPlayers, setBattingPlayers] = useState([]);
  const [bowlingPlayers, setBowlingPlayers] = useState([]);
  const [currentBatsmen, setCurrentBatsmen] = useState([]);
  const [currentBowler, setCurrentBowler] = useState(null);

  useEffect(() => {
    if (match) {
      loadPlayers();
    }
  }, [match]);

  const loadPlayers = async () => {
    try {
      // Load batting team players (team that won toss and chose to bat, or lost toss and opponent chose to bowl)
      const battingTeamId = getBattingTeamId();
      const bowlingTeamId = getBowlingTeamId();

      const { data: battingPlayersData } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', battingTeamId);

      const { data: bowlingPlayersData } = await supabase
        .from('players')
        .select('*')
        .eq('team_id', bowlingTeamId);

      setBattingPlayers(battingPlayersData || []);
      setBowlingPlayers(bowlingPlayersData || []);
    } catch (error) {
      console.error('Error loading players:', error);
    }
  };

  const getBattingTeamId = () => {
    if (!match.toss_winner || !match.toss_decision) return match.team1_id;
    
    if (match.toss_decision === 'bat') {
      return match.toss_winner === (match.team1?.name || 'Team 1') ? match.team1_id : match.team2_id;
    } else {
      return match.toss_winner === (match.team1?.name || 'Team 1') ? match.team2_id : match.team1_id;
    }
  };

  const getBowlingTeamId = () => {
    if (!match.toss_winner || !match.toss_decision) return match.team2_id;
    
    if (match.toss_decision === 'bowl') {
      return match.toss_winner === (match.team1?.name || 'Team 1') ? match.team1_id : match.team2_id;
    } else {
      return match.toss_winner === (match.team1?.name || 'Team 1') ? match.team2_id : match.team1_id;
    }
  };

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
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0
      },
      {
        ...batsman2,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0
      }
    ];

    // Arrange batsmen based on striker selection
    const finalBatsmen = striker === "batsman1" ? batsmenWithStats : [batsmenWithStats[1], batsmenWithStats[0]];

    // Initialize bowler stats
    const bowlerWithStats = {
      ...bowler,
      overs: 0,
      runs: 0,
      wickets: 0
    };

    setCurrentBatsmen(finalBatsmen);
    setCurrentBowler(bowlerWithStats);
    onPlayersSelected(finalBatsmen, bowlerWithStats);
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
