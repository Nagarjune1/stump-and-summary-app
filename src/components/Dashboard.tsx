
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  Menu,
  Play,
  Plus,
  Trophy,
  TrendingUp,
  User,
  Download,
  BookOpen,
  MapPin,
  Users,
  Award,
  Bell
} from 'lucide-react';
import LiveScoring from './LiveScoring';
import CreateMatch from './CreateMatch';
import EnhancedCricketScoreboard from './EnhancedCricketScoreboard';
import AdvancedAnalytics from './AdvancedAnalytics';
import EnhancedExportReport from './EnhancedExportReport';
import Documentation from './Documentation';
import VenueManagement from './VenueManagement';
import TournamentManagement from './TournamentManagement';
import Teams from "./Teams";
import PlayerProfiles from "./PlayerProfiles";
import NotificationSettings from "./NotificationSettings";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('live-scoring');
  const [isMobileView, setIsMobileView] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  const renderContent = () => {
    switch (activeTab) {
      case 'live-scoring':
        return <LiveScoring />;
      case 'matches':
        return <CreateMatch />;
      case 'scoreboard':
        return (
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
        );
      case 'analytics':
        return <AdvancedAnalytics />;
      case 'tournaments':
        return <TournamentManagement />;
      case 'teams':
        return <Teams />;
      case 'players':
        return <PlayerProfiles />;
      case 'venues':
        return <VenueManagement />;
      case 'export':
        return (
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
        );
      case 'notifications':
        return <NotificationSettings />;
      case 'documentation':
        return <Documentation />;
      default:
        return <LiveScoring />;
    }
  };

  const handleMenuClick = (tabId: string) => {
    setActiveTab(tabId);
    if (isMobileView) {
      setIsSheetOpen(false);
    }
  };

  const sidebarItems = [
    { id: 'live-scoring', label: 'Live Scoring', icon: Play },
    { id: 'matches', label: 'Create Match', icon: Plus },
    { id: 'scoreboard', label: 'Scoreboard', icon: Trophy },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'tournaments', label: 'Tournaments', icon: Award },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'players', label: 'Players', icon: User },
    { id: 'venues', label: 'Venues', icon: MapPin },
    { id: 'export', label: 'Export', icon: Download },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'documentation', label: 'Documentation', icon: BookOpen },
  ];

  const SidebarContent = () => (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Cricket Dashboard</h2>
      </div>
      <nav className="flex-1 p-2">
        <div className="space-y-1">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? "default" : "ghost"}
                className="w-full justify-start gap-3"
                onClick={() => handleMenuClick(item.id)}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </nav>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      {!isMobileView && (
        <div className="w-64 border-r bg-card">
          <SidebarContent />
        </div>
      )}

      {/* Mobile Sheet */}
      {isMobileView && (
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fixed top-4 left-4 z-50">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b bg-card px-4 flex items-center">
          {isMobileView && <div className="w-12" />} {/* Spacer for mobile menu button */}
          <h1 className="text-xl font-semibold flex-1">
            {sidebarItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
          </h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
