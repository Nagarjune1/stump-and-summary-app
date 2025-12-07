import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  id: string;
  profile_id: string;
  full_name: string | null;
  avatar_url: string | null;
  email: string | null;
}

interface PlayerStats {
  totalRuns: number;
  totalWickets: number;
  battingAverage: number;
  bowlingAverage: number;
  highScore: string;
  bestBowling: string;
  catches: number;
  stumpings: number;
  runouts: number;
}

interface YearlyStats {
  thisYear: {
    batting: { runs: number; average: number; highScore: string };
    bowling: { wickets: number; average: number; bestBowling: string };
    fielding: { catches: number; stumpings: number; runouts: number };
  };
  lastYear: {
    batting: { runs: number; average: number; highScore: string };
    bowling: { wickets: number; average: number; bestBowling: string };
    fielding: { catches: number; stumpings: number; runouts: number };
  };
}

interface TeamStats {
  teamName: string;
  runs?: number;
  innings?: number;
  strikeRate?: number;
  wickets?: number;
  economy?: number;
  catches?: number;
  stumpings?: number;
  runouts?: number;
}

const ProfilePage = () => {
  const { profileId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);
  const [yearlyStats, setYearlyStats] = useState<YearlyStats | null>(null);
  const [bestAgainstTeam, setBestAgainstTeam] = useState<{
    batting: TeamStats[];
    bowling: TeamStats[];
    fielding: TeamStats[];
  }>({ batting: [], bowling: [], fielding: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profileId) {
      fetchProfileData();
    }
  }, [profileId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("profile_id", profileId)
        .single();

      if (profileError) throw profileError;
      setProfile(profileData);

      // Fetch player stats using profile_id link
      const { data: playerData, error: playerError } = await supabase
        .from("players")
        .select("*")
        .eq("profile_id", profileId)
        .maybeSingle();

      if (!playerError && playerData) {
        // Fetch all match stats for this player
        const { data: matchStats, error: statsError } = await supabase
          .from("match_stats")
          .select(`
            *,
            matches!inner(
              match_date,
              team1_id,
              team2_id
            )
          `)
          .eq("player_id", playerData.id);

        if (!statsError && matchStats) {
          calculateStats(matchStats, playerData);
        }
      } else {
        // Set default stats if no player record
        setPlayerStats({
          totalRuns: 0,
          totalWickets: 0,
          battingAverage: 0,
          bowlingAverage: 0,
          highScore: "0",
          bestBowling: "0/0",
          catches: 0,
          stumpings: 0,
          runouts: 0,
        });
        setYearlyStats({
          thisYear: {
            batting: { runs: 0, average: 0, highScore: "0" },
            bowling: { wickets: 0, average: 0, bestBowling: "0/0" },
            fielding: { catches: 0, stumpings: 0, runouts: 0 },
          },
          lastYear: {
            batting: { runs: 0, average: 0, highScore: "0" },
            bowling: { wickets: 0, average: 0, bestBowling: "0/0" },
            fielding: { catches: 0, stumpings: 0, runouts: 0 },
          },
        });
        setBestAgainstTeam({ batting: [], bowling: [], fielding: [] });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (matchStats: any[], playerData: any) => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    // Overall stats
    const totalRuns = matchStats.reduce((sum, stat) => sum + (stat.runs_scored || 0), 0);
    const totalBalls = matchStats.reduce((sum, stat) => sum + (stat.balls_faced || 0), 0);
    const totalWickets = matchStats.reduce((sum, stat) => sum + (stat.wickets_taken || 0), 0);
    const totalCatches = matchStats.reduce((sum, stat) => sum + (stat.catches || 0), 0);
    const totalStumpings = 0; // Not tracked in current schema
    const totalRunouts = matchStats.reduce((sum, stat) => sum + (stat.run_outs || 0), 0);

    setPlayerStats({
      totalRuns,
      totalWickets,
      battingAverage: totalBalls > 0 ? +(totalRuns / matchStats.length).toFixed(2) : 0,
      bowlingAverage: totalWickets > 0 ? +(totalRuns / totalWickets).toFixed(2) : 0,
      highScore: playerData.best_score || "0",
      bestBowling: playerData.best_bowling || "0/0",
      catches: totalCatches,
      stumpings: totalStumpings,
      runouts: totalRunouts,
    });

    // This year stats
    const thisYearStats = matchStats.filter((stat) => {
      const matchDate = new Date(stat.matches.match_date);
      return matchDate.getFullYear() === currentYear;
    });

    const thisYearRuns = thisYearStats.reduce((sum, stat) => sum + (stat.runs_scored || 0), 0);
    const thisYearWickets = thisYearStats.reduce((sum, stat) => sum + (stat.wickets_taken || 0), 0);
    const thisYearCatches = thisYearStats.reduce((sum, stat) => sum + (stat.catches || 0), 0);
    const thisYearRunouts = thisYearStats.reduce((sum, stat) => sum + (stat.run_outs || 0), 0);

    // Last year stats
    const lastYearStats = matchStats.filter((stat) => {
      const matchDate = new Date(stat.matches.match_date);
      return matchDate.getFullYear() === lastYear;
    });

    const lastYearRuns = lastYearStats.reduce((sum, stat) => sum + (stat.runs_scored || 0), 0);
    const lastYearWickets = lastYearStats.reduce((sum, stat) => sum + (stat.wickets_taken || 0), 0);
    const lastYearCatches = lastYearStats.reduce((sum, stat) => sum + (stat.catches || 0), 0);
    const lastYearRunouts = lastYearStats.reduce((sum, stat) => sum + (stat.run_outs || 0), 0);

    setYearlyStats({
      thisYear: {
        batting: {
          runs: thisYearRuns,
          average: thisYearStats.length > 0 ? +(thisYearRuns / thisYearStats.length).toFixed(2) : 0,
          highScore: playerData.best_score || "0",
        },
        bowling: {
          wickets: thisYearWickets,
          average: thisYearWickets > 0 ? +(thisYearRuns / thisYearWickets).toFixed(2) : 0,
          bestBowling: playerData.best_bowling || "0/0",
        },
        fielding: {
          catches: thisYearCatches,
          stumpings: 0,
          runouts: thisYearRunouts,
        },
      },
      lastYear: {
        batting: {
          runs: lastYearRuns,
          average: lastYearStats.length > 0 ? +(lastYearRuns / lastYearStats.length).toFixed(2) : 0,
          highScore: playerData.best_score || "0",
        },
        bowling: {
          wickets: lastYearWickets,
          average: lastYearWickets > 0 ? +(lastYearRuns / lastYearWickets).toFixed(2) : 0,
          bestBowling: playerData.best_bowling || "0/0",
        },
        fielding: {
          catches: lastYearCatches,
          stumpings: 0,
          runouts: lastYearRunouts,
        },
      },
    });

    // Best against teams - simplified for now
    setBestAgainstTeam({
      batting: [
        { teamName: "Team A", runs: 85, innings: 5, strikeRate: 142.5 },
        { teamName: "Team B", runs: 72, innings: 4, strikeRate: 135.8 },
      ],
      bowling: [
        { teamName: "Team C", wickets: 8, innings: 5, economy: 6.4 },
        { teamName: "Team D", wickets: 6, innings: 4, economy: 7.2 },
      ],
      fielding: [
        { teamName: "Team E", catches: 5, stumpings: 0, runouts: 2 },
        { teamName: "Team F", catches: 4, stumpings: 0, runouts: 1 },
      ],
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)} className="text-foreground">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Player Overview */}
      <Card className="neon-card">
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl bg-primary/20 text-primary">
                {profile.full_name?.charAt(0) || profile.email?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2 text-foreground">{profile.full_name || "Unknown Player"}</h1>
              <p className="text-muted-foreground mb-4">
                All Rounder | Right Hand Bat | Right Arm Leg Break
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Profile ID:</span>
                <code className="px-2 py-1 bg-muted rounded text-sm font-mono text-primary">{profile.profile_id}</code>
              </div>
            </div>
          </div>

          {/* Career Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div>
              <h3 className="font-semibold mb-2 text-primary">Batting</h3>
              <div className="space-y-1 text-sm text-foreground">
                <p>Total Runs: <span className="font-medium">{playerStats?.totalRuns || 0}</span></p>
                <p>Average: <span className="font-medium">{playerStats?.battingAverage || 0}</span></p>
                <p>High Score: <span className="font-medium">{playerStats?.highScore || "0"}</span></p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-primary">Bowling</h3>
              <div className="space-y-1 text-sm text-foreground">
                <p>Total Wickets: <span className="font-medium">{playerStats?.totalWickets || 0}</span></p>
                <p>Average: <span className="font-medium">{playerStats?.bowlingAverage || 0}</span></p>
                <p>Best Bowling: <span className="font-medium">{playerStats?.bestBowling || "0/0"}</span></p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2 text-primary">Fielding</h3>
              <div className="space-y-1 text-sm text-foreground">
                <p>Catches: <span className="font-medium">{playerStats?.catches || 0}</span></p>
                <p>Stumpings: <span className="font-medium">{playerStats?.stumpings || 0}</span></p>
                <p>Run Outs: <span className="font-medium">{playerStats?.runouts || 0}</span></p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Yearly Overview */}
      <Card className="neon-card">
        <CardHeader>
          <CardTitle className="text-foreground">Yearly Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="batting">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="batting">Batting</TabsTrigger>
              <TabsTrigger value="bowling">Bowling</TabsTrigger>
              <TabsTrigger value="fielding">Fielding</TabsTrigger>
            </TabsList>
            <TabsContent value="batting" className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">This Year So Far</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Runs</p>
                    <p className="text-2xl font-bold">{yearlyStats?.thisYear.batting.runs || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-2xl font-bold">{yearlyStats?.thisYear.batting.average || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">High Score</p>
                    <p className="text-2xl font-bold">{yearlyStats?.thisYear.batting.highScore || "0"}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Last Year</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Runs</p>
                    <p className="text-2xl font-bold">{yearlyStats?.lastYear.batting.runs || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-2xl font-bold">{yearlyStats?.lastYear.batting.average || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">High Score</p>
                    <p className="text-2xl font-bold">{yearlyStats?.lastYear.batting.highScore || "0"}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="bowling" className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">This Year So Far</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Wickets</p>
                    <p className="text-2xl font-bold">{yearlyStats?.thisYear.bowling.wickets || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-2xl font-bold">{yearlyStats?.thisYear.bowling.average || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Best Bowling</p>
                    <p className="text-2xl font-bold">{yearlyStats?.thisYear.bowling.bestBowling || "0/0"}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Last Year</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Total Wickets</p>
                    <p className="text-2xl font-bold">{yearlyStats?.lastYear.bowling.wickets || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Average</p>
                    <p className="text-2xl font-bold">{yearlyStats?.lastYear.bowling.average || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Best Bowling</p>
                    <p className="text-2xl font-bold">{yearlyStats?.lastYear.bowling.bestBowling || "0/0"}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="fielding" className="space-y-4">
              <div>
                <h4 className="font-semibold mb-3">This Year So Far</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Catches</p>
                    <p className="text-2xl font-bold">{yearlyStats?.thisYear.fielding.catches || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Stumpings</p>
                    <p className="text-2xl font-bold">{yearlyStats?.thisYear.fielding.stumpings || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Run Outs</p>
                    <p className="text-2xl font-bold">{yearlyStats?.thisYear.fielding.runouts || 0}</p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Last Year</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Catches</p>
                    <p className="text-2xl font-bold">{yearlyStats?.lastYear.fielding.catches || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Stumpings</p>
                    <p className="text-2xl font-bold">{yearlyStats?.lastYear.fielding.stumpings || 0}</p>
                  </div>
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground">Run Outs</p>
                    <p className="text-2xl font-bold">{yearlyStats?.lastYear.fielding.runouts || 0}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Best Against Team */}
      <Card>
        <CardHeader>
          <CardTitle>Best Against Team</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="batting">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="batting">Batting</TabsTrigger>
              <TabsTrigger value="bowling">Bowling</TabsTrigger>
              <TabsTrigger value="fielding">Fielding</TabsTrigger>
            </TabsList>
            <TabsContent value="batting">
              <div className="space-y-3">
                {bestAgainstTeam.batting.map((team, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{team.teamName}</span>
                    <div className="flex gap-6 text-sm">
                      <span>{team.runs} runs</span>
                      <span>{team.innings} inns</span>
                      <span>SR: {team.strikeRate}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="bowling">
              <div className="space-y-3">
                {bestAgainstTeam.bowling.map((team, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{team.teamName}</span>
                    <div className="flex gap-6 text-sm">
                      <span>{team.wickets} wickets</span>
                      <span>{team.innings} inns</span>
                      <span>Eco: {team.economy}</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="fielding">
              <div className="space-y-3">
                {bestAgainstTeam.fielding.map((team, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">{team.teamName}</span>
                    <div className="flex gap-6 text-sm">
                      <span>{team.catches} catches</span>
                      <span>{team.stumpings} stumpings</span>
                      <span>{team.runouts} runouts</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
