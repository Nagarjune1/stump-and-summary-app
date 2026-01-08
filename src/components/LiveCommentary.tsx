
import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BallData {
  id: string;
  over_number: number;
  ball_number: number;
  runs: number;
  extras: number;
  extra_type?: string;
  is_wicket: boolean;
  wicket_type?: string;
  batsman_name: string;
  bowler_name: string;
  shot_type?: string;
  commentary?: string;
  created_at: string;
}

interface LiveCommentaryProps {
  recentBalls?: string[];
  ballByBallData?: BallData[];
  currentOver?: number;
  currentBall?: number;
  score?: { runs: number; wickets: number };
}

// Helper function to generate commentary - defined outside component to avoid initialization issues
const generateCommentary = (ball: BallData): string => {
  const { runs, extras, extra_type, is_wicket, wicket_type, batsman_name, bowler_name, shot_type } = ball;
  
  if (is_wicket) {
    const wicketDescriptions: Record<string, string> = {
      'bowled': `OUT! ${bowler_name} strikes! ${batsman_name} is bowled, the stumps are shattered!`,
      'caught': `CAUGHT! ${batsman_name} holes out! Great catch off ${bowler_name}'s bowling.`,
      'lbw': `OUT LBW! ${bowler_name} traps ${batsman_name} right in front! The umpire raises the finger.`,
      'run_out': `RUN OUT! Direct hit! ${batsman_name} is short of the crease!`,
      'stumped': `STUMPED! Quick work behind the stumps! ${batsman_name} is out of the crease.`,
      'hit_wicket': `HIT WICKET! Unfortunate! ${batsman_name} has hit own stumps!`,
    };
    return wicketDescriptions[wicket_type || ''] || `WICKET! ${batsman_name} is out! ${bowler_name} gets the breakthrough.`;
  }

  if (extras > 0 && extra_type) {
    if (extra_type === 'wide') {
      return `Wide ball from ${bowler_name}. ${extras} extra${extras > 1 ? 's' : ''} added.`;
    }
    if (extra_type === 'no_ball') {
      return `No ball! Free hit coming up. ${bowler_name} overstepped.`;
    }
    if (extra_type === 'bye') {
      return `Bye! The ball goes past everyone. ${extras} run${extras > 1 ? 's' : ''} added.`;
    }
    if (extra_type === 'leg_bye') {
      return `Leg bye! Off the pads, they scamper through for ${extras}.`;
    }
  }

  if (runs === 6) {
    const sixDescriptions = [
      `SIX! Massive hit by ${batsman_name}! That's gone all the way into the stands!`,
      `MAXIMUM! ${batsman_name} clears the boundary with ease! Brilliant shot!`,
      `SIX! ${batsman_name} dispatches ${bowler_name} into the crowd! What a strike!`,
    ];
    return sixDescriptions[Math.floor(Math.random() * sixDescriptions.length)];
  }

  if (runs === 4) {
    const shotDesc = shot_type ? ` with a beautiful ${shot_type}` : '';
    const fourDescriptions = [
      `FOUR! ${batsman_name} finds the gap${shotDesc}! Races away to the boundary.`,
      `Boundary! ${batsman_name} times it perfectly${shotDesc}! Four more to the total.`,
      `FOUR! Exquisite shot by ${batsman_name}! The fielders can only watch.`,
    ];
    return fourDescriptions[Math.floor(Math.random() * fourDescriptions.length)];
  }

  if (runs === 0) {
    const dotDescriptions = [
      `Dot ball. ${bowler_name} keeps it tight, ${batsman_name} defends solidly.`,
      `No run. Good line and length from ${bowler_name}.`,
      `Beaten! ${batsman_name} plays and misses. Pressure building.`,
    ];
    return dotDescriptions[Math.floor(Math.random() * dotDescriptions.length)];
  }

  if (runs === 1) {
    return `Single taken. ${batsman_name} rotates the strike off ${bowler_name}.`;
  }

  if (runs === 2) {
    return `Two runs! Good running between the wickets by ${batsman_name}.`;
  }

  if (runs === 3) {
    return `Three runs! Excellent placement and quick running by ${batsman_name}!`;
  }

  return `${runs} run${runs > 1 ? 's' : ''} scored by ${batsman_name} off ${bowler_name}.`;
};

const LiveCommentary = ({ 
  recentBalls = [], 
  ballByBallData = [],
  currentOver = 0, 
  currentBall = 0, 
  score = { runs: 0, wickets: 0 }
}: LiveCommentaryProps) => {
  
  // Generate commentary from ball-by-ball data
  const commentary = useMemo(() => {
    if (ballByBallData.length === 0) {
      return [];
    }

    // Calculate running score for each ball
    let runningScore = 0;
    let runningWickets = 0;
    
    return ballByBallData.map((ball, index) => {
      runningScore += ball.runs + ball.extras;
      if (ball.is_wicket) runningWickets++;

      const overBall = `${ball.over_number}.${ball.ball_number}`;
      let comment = ball.commentary || generateCommentary(ball);
      
      return {
        id: ball.id || `ball-${index}`,
        over: overBall,
        ball: ball.is_wicket ? 'W' : ball.runs === 4 ? '4' : ball.runs === 6 ? '6' : String(ball.runs),
        comment,
        score: `${runningScore}/${runningWickets}`,
        timestamp: ball.created_at ? new Date(ball.created_at).toLocaleTimeString() : '',
        isHighlight: ball.is_wicket || ball.runs === 4 || ball.runs === 6,
        batsman: ball.batsman_name,
        bowler: ball.bowler_name
      };
    }).reverse(); // Most recent first
  }, [ballByBallData]);

  return (
    <Card className="h-96">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          Live Commentary
          <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-72 px-4">
          <div className="space-y-3 pb-4">
            {commentary.length > 0 ? (
              commentary.map((comment) => (
                <div 
                  key={comment.id} 
                  className={`p-3 rounded-lg border-l-4 transition-all ${
                    comment.isHighlight 
                      ? 'bg-warning/10 border-l-warning dark:bg-warning/5' 
                      : 'bg-muted/50 border-l-border'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={comment.ball === 'W' ? 'destructive' : comment.ball === '6' || comment.ball === '4' ? 'default' : 'outline'} 
                        className="text-xs font-mono"
                      >
                        {comment.over}
                      </Badge>
                      <span className="font-bold text-sm text-foreground">{comment.score}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{comment.timestamp}</span>
                  </div>
                  <p className="text-sm text-foreground/90 leading-relaxed">{comment.comment}</p>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {comment.bowler} to {comment.batsman}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Commentary will appear here as the match progresses
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LiveCommentary;
