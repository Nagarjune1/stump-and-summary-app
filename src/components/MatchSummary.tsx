
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, Users, Award, Calendar, MapPin } from "lucide-react";

const MatchSummary = () => {
  const [matches] = useState([
    {
      id: 1,
      date: "2024-01-15",
      venue: "Wankhede Stadium, Mumbai",
      team1: { name: "Mumbai Warriors", score: "187/4", overs: "20.0" },
      team2: { name: "Delhi Dynamos", score: "156/8", overs: "20.0" },
      result: "Mumbai Warriors won by 31 runs",
      mom: "Virat Sharma",
      status: "completed"
    },
    {
      id: 2,
      date: "2024-01-14",
      venue: "Eden Gardens, Kolkata",
      team1: { name: "Chennai Champions", score: "165/6", overs: "18.4" },
      team2: { name: "Kolkata Knights", score: "164/9", overs: "20.0" },
      result: "Chennai Champions won by 4 wickets",
      mom: "MS Patel",
      status: "completed"
    },
    {
      id: 3,
      date: "2024-01-13",
      venue: "M. Chinnaswamy Stadium, Bangalore",
      team1: { name: "Bangalore Bulls", score: "178/5", overs: "20.0" },
      team2: { name: "Hyderabad Hawks", score: "133/8", overs: "20.0" },
      result: "Bangalore Bulls won by 45 runs",
      mom: "Rohit Kumar",
      status: "completed"
    }
  ]);

  const [selectedMatch, setSelectedMatch] = useState(matches[0]);

  const matchDetails = {
    batting1: [
      { name: "Rohit Sharma", runs: 67, balls: 45, fours: 8, sixes: 2, sr: 148.9, out: "c Patel b Kumar" },
      { name: "Shikhar Dhawan", runs: 34, balls: 28, fours: 4, sixes: 1, sr: 121.4, out: "b Singh" },
      { name: "Virat Kohli", runs: 45, balls: 32, fours: 5, sixes: 1, sr: 140.6, out: "not out" },
      { name: "Hardik Pandya", runs: 23, balls: 12, fours: 2, sixes: 1, sr: 191.7, out: "c & b Yadav" },
      { name: "Rishabh Pant", runs: 18, balls: 8, fours: 1, sixes: 1, sr: 225.0, out: "not out" }
    ],
    bowling1: [
      { name: "Jasprit Bumrah", overs: 4, runs: 28, wickets: 2, economy: 7.0, wd: 1, nb: 0 },
      { name: "Kagiso Rabada", overs: 4, runs: 35, wickets: 1, economy: 8.75, wd: 2, nb: 1 },
      { name: "Rashid Khan", overs: 4, runs: 24, wickets: 1, economy: 6.0, wd: 0, nb: 0 },
      { name: "Axar Patel", overs: 4, runs: 32, wickets: 0, economy: 8.0, wd: 1, nb: 0 }
    ],
    batting2: [
      { name: "Prithvi Shaw", runs: 45, balls: 34, fours: 6, sixes: 1, sr: 132.4, out: "c Kohli b Bumrah" },
      { name: "David Warner", runs: 28, balls: 22, fours: 3, sixes: 0, sr: 127.3, out: "lbw b Chahal" },
      { name: "Shreyas Iyer", runs: 34, balls: 28, fours: 4, sixes: 0, sr: 121.4, out: "c Pant b Pandya" },
      { name: "Rishabh Pant", runs: 23, balls: 18, fours: 2, sixes: 1, sr: 127.8, out: "run out" },
      { name: "Axar Patel", runs: 16, balls: 14, fours: 1, sixes: 0, sr: 114.3, out: "c Sharma b Bumrah" }
    ],
    bowling2: [
      { name: "Yuzvendra Chahal", overs: 4, runs: 31, wickets: 2, economy: 7.75, wd: 0, nb: 0 },
      { name: "Jasprit Bumrah", overs: 4, runs: 22, wickets: 2, economy: 5.5, wd: 1, nb: 0 },
      { name: "Hardik Pandya", overs: 3, runs: 28, wickets: 1, economy: 9.33, wd: 2, nb: 1 },
      { name: "Krunal Pandya", overs: 4, runs: 35, wickets: 0, economy: 8.75, wd: 0, nb: 0 }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Match Summaries</h2>
        <Button variant="outline">Export Report</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Recent Matches</h3>
          {matches.map((match) => (
            <Card 
              key={match.id} 
              className={`cursor-pointer transition-all hover:shadow-lg ${selectedMatch.id === match.id ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setSelectedMatch(match)}
            >
              <CardContent className="p-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={match.status === 'completed' ? 'secondary' : 'default'}>
                      {match.status === 'completed' ? 'Completed' : 'Live'}
                    </Badge>
                    <span className="text-xs text-gray-500 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(match.date).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="text-sm">
                    <div className="font-medium">{match.team1.name}</div>
                    <div className="text-gray-600">{match.team1.score} ({match.team1.overs})</div>
                  </div>
                  
                  <div className="text-sm">
                    <div className="font-medium">{match.team2.name}</div>
                    <div className="text-gray-600">{match.team2.score} ({match.team2.overs})</div>
                  </div>
                  
                  <div className="text-xs text-green-600 font-medium">{match.result}</div>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Award className="w-3 h-3" />
                    MOM: {match.mom}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Match Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{selectedMatch.team1.name} vs {selectedMatch.team2.name}</CardTitle>
                  <Badge className="bg-green-500">{selectedMatch.status}</Badge>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(selectedMatch.date).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {selectedMatch.venue}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="scorecard" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="scorecard">Scorecard</TabsTrigger>
                  <TabsTrigger value="summary">Summary</TabsTrigger>
                  <TabsTrigger value="stats">Statistics</TabsTrigger>
                </TabsList>
                
                <TabsContent value="scorecard" className="space-y-6">
                  {/* Team 1 Batting */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      {selectedMatch.team1.name} Batting
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Batsman</th>
                            <th className="text-center p-2">R</th>
                            <th className="text-center p-2">B</th>
                            <th className="text-center p-2">4s</th>
                            <th className="text-center p-2">6s</th>
                            <th className="text-center p-2">SR</th>
                            <th className="text-left p-2">Dismissal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matchDetails.batting1.map((player, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2 font-medium">{player.name}</td>
                              <td className="text-center p-2">{player.runs}</td>
                              <td className="text-center p-2">{player.balls}</td>
                              <td className="text-center p-2">{player.fours}</td>
                              <td className="text-center p-2">{player.sixes}</td>
                              <td className="text-center p-2">{player.sr}</td>
                              <td className="p-2 text-xs text-gray-600">{player.out}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Team 1 Bowling */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      {selectedMatch.team2.name} Bowling
                    </h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Bowler</th>
                            <th className="text-center p-2">O</th>
                            <th className="text-center p-2">R</th>
                            <th className="text-center p-2">W</th>
                            <th className="text-center p-2">Econ</th>
                            <th className="text-center p-2">WD</th>
                            <th className="text-center p-2">NB</th>
                          </tr>
                        </thead>
                        <tbody>
                          {matchDetails.bowling1.map((player, index) => (
                            <tr key={index} className="border-b">
                              <td className="p-2 font-medium">{player.name}</td>
                              <td className="text-center p-2">{player.overs}</td>
                              <td className="text-center p-2">{player.runs}</td>
                              <td className="text-center p-2">{player.wickets}</td>
                              <td className="text-center p-2">{player.economy}</td>
                              <td className="text-center p-2">{player.wd}</td>
                              <td className="text-center p-2">{player.nb}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="summary" className="space-y-4">
                  <Card className="bg-gradient-to-r from-green-50 to-blue-50">
                    <CardContent className="p-4">
                      <div className="text-center">
                        <h3 className="text-lg font-bold text-green-700 mb-2">{selectedMatch.result}</h3>
                        <div className="flex items-center justify-center gap-2">
                          <Trophy className="w-5 h-5 text-yellow-500" />
                          <span className="text-sm">Man of the Match: <strong>{selectedMatch.mom}</strong></span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">{selectedMatch.team1.name}</h4>
                        <div className="text-2xl font-bold">{selectedMatch.team1.score}</div>
                        <div className="text-sm text-gray-600">({selectedMatch.team1.overs} overs)</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <h4 className="font-semibold mb-2">{selectedMatch.team2.name}</h4>
                        <div className="text-2xl font-bold">{selectedMatch.team2.score}</div>
                        <div className="text-sm text-gray-600">({selectedMatch.team2.overs} overs)</div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="stats">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Key Statistics</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Highest Partnership:</span>
                          <span>89 runs (2nd wicket)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Most Dots:</span>
                          <span>Jasprit Bumrah (16)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Most Expensive Over:</span>
                          <span>18 runs (Rabada - 15th over)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Powerplay Score:</span>
                          <span>52/1 (6 overs)</span>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Performance Highlights</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Fastest Fifty:</span>
                          <span>Virat Kohli (28 balls)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Best Economy:</span>
                          <span>Bumrah (5.50)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Most Boundaries:</span>
                          <span>Rohit Sharma (10)</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Catches Dropped:</span>
                          <span>2</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MatchSummary;
