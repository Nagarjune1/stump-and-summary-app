
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Trophy, Users, Activity } from "lucide-react";
import LiveScoring from "@/components/LiveScoring";
import PlayerProfiles from "@/components/PlayerProfiles";
import MatchSummary from "@/components/MatchSummary";
import CreateMatch from "@/components/CreateMatch";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentMatch, setCurrentMatch] = useState(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-4 shadow-lg">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">Cricket Scorer Pro</h1>
          <p className="text-green-100">Professional Cricket Scoring & Analytics</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="scoring" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Live Score</span>
            </TabsTrigger>
            <TabsTrigger value="players" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Players</span>
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Matches</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Match</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-blue-100">+3 this week</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Active Players</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">156</div>
                  <p className="text-xs text-green-100">+12 new players</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Tournaments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-purple-100">2 ongoing</p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">This Month</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">47</div>
                  <p className="text-xs text-orange-100">matches scored</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Recent Matches
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { team1: "Mumbai Warriors", team2: "Delhi Dynamos", status: "Won by 6 wickets", time: "2 hours ago" },
                    { team1: "Chennai Champions", team2: "Kolkata Knights", status: "In Progress", time: "Live" },
                    { team1: "Bangalore Bulls", team2: "Hyderabad Hawks", status: "Won by 45 runs", time: "Yesterday" }
                  ].map((match, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{match.team1} vs {match.team2}</p>
                        <p className="text-xs text-gray-600">{match.status}</p>
                      </div>
                      <Badge variant={match.status === "In Progress" ? "default" : "secondary"}>
                        {match.time}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    Top Performers
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { name: "Virat Sharma", stat: "156* (89 balls)", type: "Highest Score" },
                    { name: "Jasprit Kumar", stat: "5/23 (4 overs)", type: "Best Bowling" },
                    { name: "MS Patel", stat: "6 catches", type: "Best Fielding" }
                  ].map((player, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-sm">{player.name}</p>
                        <p className="text-xs text-gray-600">{player.type}</p>
                      </div>
                      <Badge variant="outline">{player.stat}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="scoring">
            <LiveScoring currentMatch={currentMatch} />
          </TabsContent>

          <TabsContent value="players">
            <PlayerProfiles />
          </TabsContent>

          <TabsContent value="matches">
            <MatchSummary />
          </TabsContent>

          <TabsContent value="create">
            <CreateMatch onMatchCreated={setCurrentMatch} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
