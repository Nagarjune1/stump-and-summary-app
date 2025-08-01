
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Trophy, Users, BarChart, FileText, Settings, Play, Home } from "lucide-react";
import CreateMatch from "@/components/CreateMatch";
import PlayerManagement from "@/components/PlayerManagement";
import LiveScoring from "@/components/LiveScoring";
import MatchSummary from "@/components/MatchSummary";
import AdvancedStatistics from "@/components/AdvancedStatistics";
import EnhancedExportReport from "@/components/EnhancedExportReport";
import TournamentManagement from "@/components/TournamentManagement";
import VenueManagement from "@/components/VenueManagement";
import Documentation from "@/components/Documentation";
import Dashboard from "@/components/Dashboard";
import { AuthProvider } from "@/components/AuthProvider";

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [currentMatch, setCurrentMatch] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [scoreData, setScoreData] = useState({ runs: 0, wickets: 0, overs: 0 });

  const handleMatchCreated = (match: any) => {
    setCurrentMatch(match);
    setMatchData(match);
    console.log('Match created:', match);
  };

  const handleMatchStarted = (match: any) => {
    setCurrentMatch(match);
    setMatchData(match);
    console.log('Match started:', match);
  };

  const handlePlayerAdded = (player: any) => {
    console.log('Player added:', player);
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        <header className="bg-white shadow-md py-4">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold flex items-center">
                <Trophy className="mr-2 w-6 h-6 text-yellow-500" />
                Cricket Management System
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary">Version 1.0</Badge>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 lg:grid-cols-9 mb-8">
              <TabsTrigger value="dashboard" className="flex flex-col items-center justify-center space-y-1">
                <Home className="w-5 h-5" />
                Dashboard
              </TabsTrigger>
              <TabsTrigger value="live" className="flex flex-col items-center justify-center space-y-1">
                <Play className="w-5 h-5" />
                Live Scoring
              </TabsTrigger>
              <TabsTrigger value="matches" className="flex flex-col items-center justify-center space-y-1">
                <Calendar className="w-5 h-5" />
                Matches
              </TabsTrigger>
              <TabsTrigger value="players" className="flex flex-col items-center justify-center space-y-1">
                <Users className="w-5 h-5" />
                Players
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex flex-col items-center justify-center space-y-1">
                <BarChart className="w-5 h-5" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex flex-col items-center justify-center space-y-1">
                <FileText className="w-5 h-5" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="reports" className="flex flex-col items-center justify-center space-y-1">
                <FileText className="w-5 h-5" />
                Reports
              </TabsTrigger>
              <TabsTrigger value="tournaments" className="flex flex-col items-center justify-center space-y-1">
                <Trophy className="w-5 h-5" />
                Tournaments
              </TabsTrigger>
              <TabsTrigger value="venues" className="flex flex-col items-center justify-center space-y-1">
                <Settings className="w-5 h-5" />
                Venues
              </TabsTrigger>
              <TabsTrigger value="docs" className="flex flex-col items-center justify-center space-y-1">
                <Settings className="w-5 h-5" />
                Docs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              <Dashboard />
            </TabsContent>

            <TabsContent value="matches" className="space-y-6">
              <CreateMatch 
                onMatchCreated={handleMatchCreated}
                onMatchStarted={handleMatchStarted}
              />
            </TabsContent>

            <TabsContent value="live" className="space-y-6">
              <LiveScoring />
            </TabsContent>

            <TabsContent value="players" className="space-y-6">
              <PlayerManagement 
                currentMatch={currentMatch}
                onPlayerAdded={handlePlayerAdded}
              />
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              <AdvancedStatistics />
            </TabsContent>

            <TabsContent value="summary" className="space-y-6">
              <MatchSummary />
            </TabsContent>

            <TabsContent value="reports" className="space-y-6">
              <EnhancedExportReport />
            </TabsContent>

            <TabsContent value="tournaments" className="space-y-6">
              <TournamentManagement />
            </TabsContent>

            <TabsContent value="venues" className="space-y-6">
              <VenueManagement />
            </TabsContent>

            <TabsContent value="docs" className="space-y-6">
              <Documentation />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AuthProvider>
  );
};

export default Index;
