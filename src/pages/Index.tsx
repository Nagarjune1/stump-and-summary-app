
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Users, Trophy, BarChart3, Settings, Target } from "lucide-react";
import Dashboard from "@/components/Dashboard";
import LiveScoring from "@/components/LiveScoring";
import PlayerManagement from "@/components/PlayerManagement";
import MatchSummary from "@/components/MatchSummary";
import TournamentManagement from "@/components/TournamentManagement";
import AdvancedStatistics from "@/components/AdvancedStatistics";
import Documentation from "@/components/Documentation";
import PlayerProfiles from "@/components/PlayerProfiles";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentMatch, setCurrentMatch] = useState(null);

  const handlePlayerAdded = (player: any) => {
    console.log('Player added:', player);
    // Handle player addition logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Cricket Scoring System
          </h1>
          <p className="text-gray-600">
            Professional cricket scoring and match management platform
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 lg:grid-cols-7 mb-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="scoring" className="flex items-center gap-2">
              <Target className="w-4 h-4" />
              <span className="hidden sm:inline">Live Score</span>
            </TabsTrigger>
            <TabsTrigger value="players" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Players</span>
            </TabsTrigger>
            <TabsTrigger value="summary" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Summary</span>
            </TabsTrigger>
            <TabsTrigger value="tournaments" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span className="hidden sm:inline">Tournaments</span>
            </TabsTrigger>
            <TabsTrigger value="statistics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Statistics</span>
            </TabsTrigger>
            <TabsTrigger value="help" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Help</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <Dashboard />
          </TabsContent>

          <TabsContent value="scoring" className="space-y-6">
            <LiveScoring />
          </TabsContent>

          <TabsContent value="players" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <PlayerManagement 
                  currentMatch={currentMatch}
                  onPlayerAdded={handlePlayerAdded}
                />
              </div>
              <div>
                <PlayerProfiles />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            <MatchSummary />
          </TabsContent>

          <TabsContent value="tournaments" className="space-y-6">
            <TournamentManagement />
          </TabsContent>

          <TabsContent value="statistics" className="space-y-6">
            <AdvancedStatistics />
          </TabsContent>

          <TabsContent value="help" className="space-y-6">
            <Documentation />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
