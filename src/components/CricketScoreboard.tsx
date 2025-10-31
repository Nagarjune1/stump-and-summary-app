import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Play, Eye } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const CricketScoreboard = ({ 
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
  team1Players = [],
  team2Players = [],
  fallOfWickets = []
}) => {
  const [liveMatches, setLiveMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchLiveMatches();
    // Set up real-time updates
    const channel = supabase
      .channel('scoreboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches'
        },
        () => fetchLiveMatches()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchLiveMatches = async () => {
    try {
      const { data: matches, error } = await supabase
        .from('matches')
        .select(`
          *,
          team1:teams!matches_team1_id_fkey(name),
          team2:teams!matches_team2_id_fkey(name)
        `)
        .eq('status', 'live')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLiveMatches(matches || []);
    } catch (error) {
      console.error('Error fetching live matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatOvers = (overs, balls) => `${overs}.${balls}`;
  
  const battingTeamName = battingTeam === 1 ? matchData?.team1?.name : matchData?.team2?.name;
  const bowlingTeamName = battingTeam === 1 ? matchData?.team2?.name : matchData?.team1?.name;
  
  const partnership = currentBatsmen?.length === 2 ? 
    (currentBatsmen[0]?.runs || 0) + (currentBatsmen[1]?.runs || 0) : 
    (currentBatsmen[0]?.runs || 0);

  const ballsRemaining = currentInnings === 2 ? 
    ((matchData?.overs || 20) * 6) - (currentOver * 6 + currentBall) : 0;

  const runsNeeded = currentInnings === 2 ? 
    Math.max(0, target - score?.runs) : 0;

  const oversLeft = () => {
    const totalOvers = Number(matchData?.overs || 20);
    const currentOversDecimal = Number(currentOver) + (Number(currentBall) / 6);
    return (totalOvers - currentOversDecimal).toFixed(1);
  };

  const handleWatchLive = (matchId) => {
    navigate(`/live-scoring?match=${matchId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-primary animate-pulse">Loading scoreboards...</div>
        </div>
      </div>
    );
  }

  // If showing live matches list
  if (!matchData && liveMatches.length > 0) {
    return (
      <div className="min-h-screen bg-background p-6 space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Live Cricket Scoreboards</h1>
          <p className="text-accent">Real-time match scoreboards and statistics</p>
        </div>

        <div className="space-y-6">
          {liveMatches.map((match) => (
            <Card key={match.id} className="border-warning/50">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Badge className="bg-warning/20 text-warning border-warning animate-pulse">
                      <Play className="w-3 h-3 mr-1" />
                      LIVE
                    </Badge>
                    <CardTitle className="text-xl text-foreground">
                      {match.team1?.name} vs {match.team2?.name}
                    </CardTitle>
                  </div>
                  <Button 
                    onClick={() => handleWatchLive(match.id)}
                    className="bg-primary hover:bg-primary/90"
                    size="sm"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Watch Live
                  </Button>
                </div>
                <p className="text-sm text-accent">
                  {match.format} • {match.venue} • {match.overs} overs
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-card/50 rounded-lg border border-primary/20">
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{match.team1?.name}</h3>
                        <p className="text-sm text-accent">Innings 1</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {match.team1_score || '0/0'}
                        </div>
                        <div className="text-sm text-accent">({match.team1_overs || '0.0'} ov)</div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-4 bg-card/50 rounded-lg border border-primary/20">
                      <div>
                        <h3 className="font-bold text-lg text-foreground">{match.team2?.name}</h3>
                        <p className="text-sm text-accent">Innings 2</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">
                          {match.team2_score || '0/0'}
                        </div>
                        <div className="text-sm text-accent">({match.team2_overs || '0.0'} ov)</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between items-center text-sm text-accent">
                    <span>Tournament: {match.tournament || 'Friendly Match'}</span>
                    <span>Status: Live</span>
                  </div>
                  {match.result && (
                    <div className="mt-2 text-sm font-medium text-success">
                      Result: {match.result}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // If no live matches
  if (!matchData && liveMatches.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Live Cricket Scoreboards</h1>
          <p className="text-accent">Real-time match scoreboards and statistics</p>
        </div>
        
        <Card>
          <CardContent className="p-8 text-center">
            <Play className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-primary mb-2">No Live Matches</h3>
            <p className="text-muted-foreground mb-4">There are currently no live matches to display.</p>
            <Button 
              onClick={() => navigate('/create-match')}
              className="bg-primary hover:bg-primary/90"
            >
              Create New Match
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Individual match scoreboard (existing functionality)
  return (
    <div className="min-h-screen bg-background p-6 space-y-6">
      {/* Match Header */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl text-primary">
                {matchData?.team1?.name} vs {matchData?.team2?.name}
              </CardTitle>
              <p className="text-sm text-accent">
                {matchData?.format} • {matchData?.venue} • Innings {currentInnings}
              </p>
            </div>
            <Badge className="bg-warning/20 text-warning border-warning animate-pulse">LIVE</Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Target Info */}
      {currentInnings === 2 && target > 0 && (
        <Card className="border-warning/30 bg-warning/5">
          <CardContent className="pt-4">
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">
                {battingTeamName} need {runsNeeded} runs in {ballsRemaining} balls
              </p>
              <div className="flex justify-center gap-6 mt-2 text-sm text-accent">
                <span>CRR: {currentRunRate}</span>
                <span>REQ: {requiredRunRate}</span>
                <span>Overs Left: {oversLeft()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Innings Score */}
      <Card className="border-success/30">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span className="text-foreground">{battingTeamName} Innings</span>
            <span className="text-3xl font-bold text-primary">
              {score?.runs}-{score?.wickets} ({formatOvers(currentOver, currentBall)} Ov)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Batsmen */}
          <div>
            <h4 className="font-semibold mb-3 text-accent">Current Partnership</h4>
            {!currentBatsmen || currentBatsmen.length === 0 ? (
              <p className="text-muted-foreground text-sm">No batsmen selected</p>
            ) : (
              <div className="space-y-2">
                {currentBatsmen.map((batsman, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-card/50 rounded border border-primary/20">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {batsman.name} {index === 0 ? '*' : ''}
                      </span>
                      {batsman.isOut && (
                        <Badge variant="destructive" className="text-xs">
                          {batsman.dismissalType || 'out'}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-4 text-sm text-accent">
                      <span className="font-semibold text-primary">{batsman.runs || 0}</span>
                      <span>({batsman.balls || 0})</span>
                      <span>4s: {batsman.fours || 0}</span>
                      <span>6s: {batsman.sixes || 0}</span>
                      <span>SR: {(batsman.balls || 0) > 0 ? (((batsman.runs || 0) / (batsman.balls || 0)) * 100).toFixed(1) : '0.0'}</span>
                    </div>
                  </div>
                ))}
                {currentBatsmen.length === 2 && !currentBatsmen.some(b => b.isOut) && (
                  <div className="bg-success/10 border border-success/30 p-2 rounded text-sm">
                    <span className="font-medium text-success">
                      Partnership: {partnership} runs ({(currentBatsmen[0].balls || 0) + (currentBatsmen[1].balls || 0)} balls)
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          <Separator className="border-border" />

          {/* Current Bowler */}
          <div>
            <h4 className="font-semibold mb-3 text-accent">Current Bowler</h4>
            {!currentBowler ? (
              <p className="text-muted-foreground text-sm">No bowler selected</p>
            ) : (
              <div className="flex justify-between items-center p-3 bg-destructive/10 border border-destructive/30 rounded">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground">{currentBowler.name} *</span>
                  <span className="text-sm text-accent">bowling</span>
                </div>
                <div className="flex gap-4 text-sm text-accent">
                  <span>{(currentBowler.overs || 0).toFixed(1)} Ov</span>
                  <span>{currentBowler.runs || 0} R</span>
                  <span className="text-destructive font-semibold">{currentBowler.wickets || 0} W</span>
                  <span>ECO: {(currentBowler.overs || 0) > 0 ? ((currentBowler.runs || 0) / (currentBowler.overs || 0)).toFixed(1) : '0.0'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Recent Balls */}
          {recentBalls.length > 0 && (
            <div>
              <h4 className="font-semibold mb-2 text-accent">Recent Balls</h4>
              <div className="flex gap-1 text-sm">
                <span className="text-muted-foreground">Recent:</span>
                {recentBalls.slice(-10).map((ball, index) => (
                  <span key={index} className={`px-2 py-1 rounded font-semibold ${
                    ball === 'W' ? 'bg-destructive/20 text-destructive border border-destructive/30' :
                    ball === '4' ? 'bg-success/20 text-success border border-success/30' :
                    ball === '6' ? 'bg-warning/20 text-warning border border-warning/30' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {ball}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full Batting Card */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-foreground">{battingTeamName} Batting</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Batsman</TableHead>
                <TableHead className="text-center">R</TableHead>
                <TableHead className="text-center">B</TableHead>
                <TableHead className="text-center">4s</TableHead>
                <TableHead className="text-center">6s</TableHead>
                <TableHead className="text-center">SR</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team1Players?.map((player, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{player.name}</span>
                      {player.isOut && (
                        <span className="text-xs text-destructive">{player.dismissalType || 'out'}</span>
                      )}
                      {currentBatsmen?.some(b => b.id === player.id && !b.isOut) && (
                        <span className="text-xs text-success">batting</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-semibold">{player.runs || 0}</TableCell>
                  <TableCell className="text-center">{player.balls || 0}</TableCell>
                  <TableCell className="text-center">{player.fours || 0}</TableCell>
                  <TableCell className="text-center">{player.sixes || 0}</TableCell>
                  <TableCell className="text-center">
                    {(player.balls || 0) > 0 ? (((player.runs || 0) / (player.balls || 0)) * 100).toFixed(1) : '0.0'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Full Bowling Card */}
      <Card className="border-primary/30">
        <CardHeader>
          <CardTitle className="text-foreground">{bowlingTeamName} Bowling</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Bowler</TableHead>
                <TableHead className="text-center">O</TableHead>
                <TableHead className="text-center">M</TableHead>
                <TableHead className="text-center">R</TableHead>
                <TableHead className="text-center">W</TableHead>
                <TableHead className="text-center">ECO</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {team2Players?.map((player, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{player.name}</span>
                      {player.id === currentBowler?.id && (
                        <span className="text-xs text-success">bowling</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{(player.overs || 0).toFixed(1)}</TableCell>
                  <TableCell className="text-center">{player.maidens || 0}</TableCell>
                  <TableCell className="text-center">{player.runs || 0}</TableCell>
                  <TableCell className="text-center font-semibold">{player.wickets || 0}</TableCell>
                  <TableCell className="text-center">
                    {(player.overs || 0) > 0 ? ((player.runs || 0) / (player.overs || 0)).toFixed(1) : '0.0'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CricketScoreboard;
