
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const LiveCommentary = ({ recentBalls = [], currentOver, currentBall, score }) => {
  const [commentary, setCommentary] = useState([]);

  useEffect(() => {
    // Add new commentary when score updates
    if (recentBalls.length > 0) {
      const lastBall = recentBalls[recentBalls.length - 1];
      const newComment = generateCommentary(lastBall, currentOver, currentBall, score);
      setCommentary(prev => [newComment, ...prev.slice(0, 9)]); // Keep last 10 comments
    }
  }, [recentBalls, currentOver, currentBall, score]);

  const generateCommentary = (ball, over, ballNum, score) => {
    const overBall = `${over}.${ballNum}`;
    let comment = "";
    
    if (ball === 'W') {
      comment = "WICKET! Another one bites the dust!";
    } else if (ball === '6') {
      comment = "SIX! What a massive hit! That's gone all the way!";
    } else if (ball === '4') {
      comment = "FOUR! Beautiful shot, finds the boundary with ease!";
    } else if (ball === '0') {
      comment = "Dot ball. Good bowling, tight line and length.";
    } else {
      comment = `${ball} run${ball > 1 ? 's' : ''} taken. Good running between the wickets.`;
    }

    return {
      id: Date.now(),
      over: overBall,
      ball: ball,
      comment: comment,
      score: `${score.runs}/${score.wickets}`,
      timestamp: new Date().toLocaleTimeString(),
      isHighlight: ball === 'W' || ball === '6' || ball === '4'
    };
  };

  return (
    <Card className="h-96">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          Live Commentary
          <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-80">
          <div className="space-y-3">
            {commentary.map((comment) => (
              <div 
                key={comment.id} 
                className={`p-3 rounded-lg border-l-4 ${
                  comment.isHighlight ? 'bg-yellow-50 border-l-yellow-500' : 'bg-gray-50 border-l-gray-300'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {comment.over}
                    </Badge>
                    <span className="font-bold text-sm">{comment.score}</span>
                  </div>
                  <span className="text-xs text-gray-500">{comment.timestamp}</span>
                </div>
                <p className="text-sm text-gray-800">{comment.comment}</p>
              </div>
            ))}
            {commentary.length === 0 && (
              <div className="text-center text-gray-500 py-8">
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
