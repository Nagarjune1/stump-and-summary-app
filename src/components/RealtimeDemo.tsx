import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, Users, Wifi } from "lucide-react";
import { useRealtimeMatch } from "@/hooks/useRealtimeMatch";
import { useRealtimePresence } from "@/hooks/useRealtimePresence";

interface RealtimeDemoProps {
  matchId: string;
}

const RealtimeDemo = ({ matchId }: RealtimeDemoProps) => {
  const [updates, setUpdates] = useState<any[]>([]);

  // Subscribe to match updates
  useRealtimeMatch(matchId, (update) => {
    setUpdates(prev => [{
      ...update,
      timestamp: new Date().toISOString()
    }, ...prev].slice(0, 10)); // Keep last 10 updates
  });

  // Track presence
  const { presenceUsers } = useRealtimePresence(
    matchId,
    {
      user_id: 'demo_user',
      user_name: 'Demo User',
      role: 'viewer',
      online_at: new Date().toISOString()
    }
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wifi className="h-5 w-5 text-green-500" />
            Real-time Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Connection</span>
              <Badge variant="outline" className="bg-green-500/10 text-green-600">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                Connected
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Users</span>
              <Badge variant="outline" className="bg-primary/10">
                <Users className="h-3 w-3 mr-1" />
                {presenceUsers.length}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Live Updates
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {updates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                Waiting for updates...
              </p>
            ) : (
              updates.map((update, index) => (
                <div 
                  key={index} 
                  className="p-3 border rounded-lg bg-accent/50 animate-in fade-in slide-in-from-top-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <Badge variant="secondary" className="mb-1">
                        {update.type}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(update.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle className="text-sm">Active Viewers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {presenceUsers.map((user, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="font-medium">{user.user_name}</span>
                <Badge variant="outline" className="text-xs">
                  {user.role}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RealtimeDemo;
