
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Users, 
  Trophy, 
  Calendar,
  Clock,
  Target,
  TrendingUp,
  Activity
} from 'lucide-react';

const LiveDashboard = () => {
  // Mock data for live matches and statistics
  const liveMatches = [
    {
      id: 1,
      team1: { name: 'Mumbai Indians', code: 'MI', score: 180, wickets: 4, overs: 18.2 },
      team2: { name: 'Chennai Super Kings', code: 'CSK', score: 145, wickets: 6, overs: 16.0 },
      status: 'LIVE',
      venue: 'Wankhede Stadium',
      format: 'T20',
      currentBatsman: 'MS Dhoni',
      currentBowler: 'Jasprit Bumrah'
    },
    {
      id: 2,
      team1: { name: 'Royal Challengers', code: 'RCB', score: 165, wickets: 8, overs: 20.0 },
      team2: { name: 'Kolkata Knight Riders', code: 'KKR', score: 89, wickets: 3, overs: 12.1 },
      status: 'LIVE',
      venue: 'Eden Gardens',
      format: 'T20',
      currentBatsman: 'Andre Russell',
      currentBowler: 'Yuzvendra Chahal'
    }
  ];

  const recentMatches = [
    {
      id: 3,
      team1: { name: 'Delhi Capitals', code: 'DC', score: 195, wickets: 5 },
      team2: { name: 'Punjab Kings', code: 'PBKS', score: 178, wickets: 8 },
      winner: 'Delhi Capitals',
      venue: 'Arun Jaitley Stadium',
      date: '2024-01-07'
    },
    {
      id: 4,
      team1: { name: 'Rajasthan Royals', code: 'RR', score: 156, wickets: 7 },
      team2: { name: 'Sunrisers Hyderabad', code: 'SRH', score: 160, wickets: 4 },
      winner: 'Sunrisers Hyderabad',
      venue: 'Sawai Mansingh Stadium',
      date: '2024-01-06'
    }
  ];

  const stats = {
    totalMatches: 156,
    liveMatches: 2,
    completedToday: 3,
    upcomingToday: 4
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary neon-glow mb-2">Dashboard</h1>
        <p className="text-accent">Live cricket matches and statistics</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="neon-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-accent flex items-center gap-2">
              <Activity className="w-4 h-4 text-warning" />
              Live Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning neon-glow">{stats.liveMatches}</div>
          </CardContent>
        </Card>

        <Card className="neon-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-accent flex items-center gap-2">
              <Trophy className="w-4 h-4 text-success" />
              Completed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.completedToday}</div>
          </CardContent>
        </Card>

        <Card className="neon-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-accent flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              Upcoming Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.upcomingToday}</div>
          </CardContent>
        </Card>

        <Card className="neon-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-accent flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              Total Matches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{stats.totalMatches}</div>
          </CardContent>
        </Card>
      </div>

      {/* Live Matches */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-primary neon-glow mb-4 flex items-center gap-2">
          <Play className="w-5 h-5 text-warning" />
          Live Matches
        </h2>
        
        <div className="space-y-4">
          {liveMatches.map((match) => (
            <Card key={match.id} className="neon-card border-warning/30">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-warning text-warning-foreground neon-glow animate-pulse">
                      LIVE
                    </Badge>
                    <span className="text-sm text-accent">{match.venue} • {match.format}</span>
                  </div>
                  <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10">
                    Watch Live
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg text-foreground">{match.team1.code}</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary neon-glow">
                          {match.team1.score}/{match.team1.wickets}
                        </div>
                        <div className="text-sm text-accent">({match.team1.overs} overs)</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{match.team1.name}</div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-lg text-foreground">{match.team2.code}</span>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary neon-glow">
                          {match.team2.score}/{match.team2.wickets}
                        </div>
                        <div className="text-sm text-accent">({match.team2.overs} overs)</div>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">{match.team2.name}</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm text-accent">
                    <span>Batting: {match.currentBatsman}</span>
                    <span>Bowling: {match.currentBowler}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Matches */}
      <div>
        <h2 className="text-xl font-semibold text-primary neon-glow mb-4 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-success" />
          Recent Results
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentMatches.map((match) => (
            <Card key={match.id} className="neon-card">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <Badge variant="outline" className="text-success border-success">
                      Completed
                    </Badge>
                    <span className="text-sm text-accent">{match.date}</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{match.team1.code}</span>
                      <span className="font-bold text-primary">{match.team1.score}/{match.team1.wickets}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{match.team2.code}</span>
                      <span className="font-bold text-primary">{match.team2.score}/{match.team2.wickets}</span>
                    </div>
                  </div>

                  <div className="text-sm text-success font-medium">
                    Winner: {match.winner}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveDashboard;
