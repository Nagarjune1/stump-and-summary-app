import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, MessageSquare, Trophy, ChevronDown, ChevronUp } from "lucide-react";
import CricketScoreboard from "./CricketScoreboard";
import MatchHeader from "./MatchHeader";
import TopPerformers from "./TopPerformers";
import FallOfWickets from "./FallOfWickets";
import LiveCommentary from "./LiveCommentary";
import RunRateChart from "./RunRateChart";
import { useRealtimeMatch } from "@/hooks/useRealtimeMatch";
import { useRealtimePresence } from "@/hooks/useRealtimePresence";
import { toast } from "@/hooks/use-toast";

const EnhancedCricketScoreboard = ({ 
  matchData, 
  score, 
  currentBatsmen, 
  currentBowler, 
  innings1Score, 
  currentInnings,
  currentOver,
  currentBall,
  battingTeam,
  target,
  requiredRunRate,
  currentRunRate,
  recentBalls = [],
  ballByBallData = [],
  team1Players = [],
  team2Players = [],
  fallOfWickets = [],
  bowlers = [],
  wickets = [],
  oversData = []
}) => {
  const [activeTab, setActiveTab] = useState("scorecard");
  const [expandedSections, setExpandedSections] = useState({
    performers: true,
    charts: false,
    commentary: false
  });

  // Realtime subscription for live score updates
  useRealtimeMatch(matchData?.id || null, (update) => {
    console.log('Scoreboard realtime update:', update);
    if (update.type === 'ball' || update.type === 'stats') {
      toast({
        title: "Live Update",
        description: "Score updated in real-time",
        duration: 2000,
      });
    }
  });

  // Show active viewers/scorers
  const { presenceUsers } = useRealtimePresence(
    matchData?.id || null,
    matchData ? {
      user_id: 'viewer_' + Math.random(),
      user_name: 'Viewer',
      role: 'viewer',
      online_at: new Date().toISOString()
    } : null
  );

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const battingTeamName = battingTeam === 1 ? matchData.team1?.name : matchData.team2?.name;
  const tossInfo = `${matchData.team1?.name} won the toss and elected to ${battingTeam === 1 ? 'bat' : 'bowl'} first`;

  return (
    <div className="space-y-4 max-w-7xl mx-auto">
      {/* Match Header */}
      <MatchHeader 
        matchData={matchData} 
        tossInfo={tossInfo}
      />

      {/* Active Users Indicator */}
      {presenceUsers.length > 0 && (
        <Card className="border-primary/20">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                {presenceUsers.length} {presenceUsers.length === 1 ? 'viewer' : 'viewers'} watching
              </Badge>
              <span className="text-xs text-muted-foreground">Live updates enabled</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mobile Tabs */}
      <div className="block md:hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scorecard" className="text-xs">Score</TabsTrigger>
            <TabsTrigger value="charts" className="text-xs">Charts</TabsTrigger>
            <TabsTrigger value="commentary" className="text-xs">Live</TabsTrigger>
            <TabsTrigger value="stats" className="text-xs">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="scorecard" className="space-y-4">
            <CricketScoreboard
              matchData={matchData}
              score={score}
              currentBatsmen={currentBatsmen}
              currentBowler={currentBowler}
              innings1Score={innings1Score}
              currentInnings={currentInnings}
              currentOver={currentOver}
              currentBall={currentBall}
              battingTeam={battingTeam}
              target={target}
              requiredRunRate={requiredRunRate}
              currentRunRate={currentRunRate}
              recentBalls={recentBalls}
              team1Players={team1Players}
              team2Players={team2Players}
            />
          </TabsContent>

          <TabsContent value="charts" className="space-y-4">
            <RunRateChart 
              oversData={oversData}
              currentRunRate={currentRunRate}
              requiredRunRate={requiredRunRate}
            />
            <RunRateChart 
              oversData={oversData}
              currentRunRate={currentRunRate}
              requiredRunRate={requiredRunRate}
              showWormChart={true}
            />
          </TabsContent>

          <TabsContent value="commentary" className="space-y-4">
            <LiveCommentary 
              recentBalls={recentBalls}
              ballByBallData={ballByBallData}
              currentOver={currentOver}
              currentBall={currentBall}
              score={score}
            />
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <TopPerformers 
              currentBatsmen={currentBatsmen}
              bowlers={bowlers}
              innings1Score={innings1Score}
              currentInnings={currentInnings}
            />
            <FallOfWickets 
              wickets={fallOfWickets}
              battingTeamName={battingTeamName}
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Scoreboard - Left Column */}
          <div className="lg:col-span-2 space-y-4">
            <CricketScoreboard
              matchData={matchData}
              score={score}
              currentBatsmen={currentBatsmen}
              currentBowler={currentBowler}
              innings1Score={innings1Score}
              currentInnings={currentInnings}
              currentOver={currentOver}
              currentBall={currentBall}
              battingTeam={battingTeam}
              target={target}
              requiredRunRate={requiredRunRate}
              currentRunRate={currentRunRate}
              recentBalls={recentBalls}
              team1Players={team1Players}
              team2Players={team2Players}
            />

            {/* Collapsible Sections */}
            <div className="space-y-4">
              {/* Top Performers */}
              <Card>
                <CardHeader className="pb-3">
                  <Button
                    variant="ghost"
                    className="flex items-center justify-between w-full p-0"
                    onClick={() => toggleSection('performers')}
                  >
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Trophy className="w-5 h-5" />
                      Match Highlights
                    </CardTitle>
                    {expandedSections.performers ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CardHeader>
                {expandedSections.performers && (
                  <CardContent>
                    <TopPerformers 
                      currentBatsmen={currentBatsmen}
                      bowlers={bowlers}
                      innings1Score={innings1Score}
                      currentInnings={currentInnings}
                    />
                  </CardContent>
                )}
              </Card>

              {/* Charts */}
              <Card>
                <CardHeader className="pb-3">
                  <Button
                    variant="ghost"
                    className="flex items-center justify-between w-full p-0"
                    onClick={() => toggleSection('charts')}
                  >
                    <CardTitle className="text-lg flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Run Analysis
                    </CardTitle>
                    {expandedSections.charts ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CardHeader>
                {expandedSections.charts && (
                  <CardContent>
                    <RunRateChart 
                      oversData={oversData}
                      currentRunRate={currentRunRate}
                      requiredRunRate={requiredRunRate}
                    />
                    <div className="mt-4">
                      <RunRateChart 
                        oversData={oversData}
                        currentRunRate={currentRunRate}
                        requiredRunRate={requiredRunRate}
                        showWormChart={true}
                      />
                    </div>
                  </CardContent>
                )}
              </Card>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-4">
            <LiveCommentary 
              recentBalls={recentBalls}
              ballByBallData={ballByBallData}
              currentOver={currentOver}
              currentBall={currentBall}
              score={score}
            />
            
            <FallOfWickets 
              wickets={fallOfWickets}
              battingTeamName={battingTeamName}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedCricketScoreboard;
