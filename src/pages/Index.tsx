
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';

// Import all page components
import LiveDashboard from '@/components/LiveDashboard';
import LiveScoring from '@/components/LiveScoring';
import MatchSummary from '@/components/MatchSummary';
import TournamentManagement from '@/components/TournamentManagement';
import AdvancedStatistics from '@/components/AdvancedStatistics';
import AdvancedAnalytics from '@/components/AdvancedAnalytics';
import Documentation from '@/components/Documentation';
import EnhancedPlayerManagement from '@/components/EnhancedPlayerManagement';
import CreateMatch from '@/components/CreateMatch';
import Teams from '@/components/Teams';
import VenueManagement from '@/components/VenueManagement';
import EnhancedExportReport from '@/components/EnhancedExportReport';
import EnhancedCricketScoreboard from '@/components/EnhancedCricketScoreboard';

const Index = () => {
  const location = useLocation();

  // Get page title based on current route
  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/': return 'Dashboard';
      case '/create': return 'Create Match';
      case '/scoring': return 'Live Scoring';
      case '/scoreboard': return 'Scoreboard';
      case '/analytics': return 'Analytics';
      case '/players': return 'Players';
      case '/teams': return 'Teams';
      case '/tournaments': return 'Tournaments';
      case '/venues': return 'Venues';
      case '/summary': return 'Match Summary';
      case '/statistics': return 'Statistics';
      case '/export': return 'Export Reports';
      case '/help': return 'Documentation';
      default: return 'Wickets';
    }
  };

  // Mock data for components that require props
  const mockMatchData = {
    team1: { name: 'Team A' },
    team2: { name: 'Team B' },
    venue: 'Cricket Stadium',
    match_date: new Date().toISOString(),
    format: 'T20'
  };

  const mockScoreData = {
    runs: 0,
    wickets: 0,
    overs: 0
  };

  return (
    <div className="min-h-screen bg-background">
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          
          <SidebarInset className="flex-1">
            {/* Header */}
            <header className="cricket-header h-14 px-4 flex items-center gap-4 border-b border-sidebar-border neon-border">
              <SidebarTrigger className="text-primary hover:bg-header/80 hover:text-primary neon-glow" />
              <div className="flex-1">
                <h1 className="text-lg font-bold text-primary neon-glow">
                  {getPageTitle(location.pathname)}
                </h1>
              </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<LiveDashboard />} />
                <Route path="/create" element={<CreateMatch />} />
                <Route path="/scoring" element={<LiveScoring />} />
                <Route 
                  path="/scoreboard" 
                  element={
                    <EnhancedCricketScoreboard
                      matchData={mockMatchData}
                      score={mockScoreData}
                      currentBatsmen={[]}
                      currentBowler={null}
                      innings1Score={null}
                      currentInnings={1}
                      currentOver={0}
                      currentBall={0}
                      battingTeam={1}
                      target={0}
                      requiredRunRate={0}
                      currentRunRate={0}
                      recentBalls={[]}
                      team1Players={[]}
                      team2Players={[]}
                      fallOfWickets={[]}
                      bowlers={[]}
                      wickets={[]}
                      oversData={[]}
                    />
                  } 
                />
                <Route path="/analytics" element={<AdvancedAnalytics />} />
                <Route path="/players" element={<EnhancedPlayerManagement />} />
                <Route path="/teams" element={<Teams />} />
                <Route path="/tournaments" element={<TournamentManagement />} />
                <Route path="/venues" element={<VenueManagement />} />
                <Route path="/summary" element={<MatchSummary />} />
                <Route path="/statistics" element={<AdvancedStatistics />} />
                <Route 
                  path="/export" 
                  element={
                    <EnhancedExportReport
                      matchData={mockMatchData}
                      scoreData={mockScoreData}
                      currentBatsmen={[]}
                      currentBowler={null}
                      innings1Score={null}
                      innings2Score={null}
                      currentInnings={1}
                      winner={null}
                      recentBalls={[]}
                      topPerformers={[]}
                      fallOfWickets={[]}
                      bowlingFigures={[]}
                    />
                  } 
                />
                <Route path="/help" element={<Documentation />} />
              </Routes>
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default Index;
