
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Mic, Play, Pause, Volume2, Send, Clock, User } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CommentarySystem = () => {
  const [commentary, setCommentary] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [commentaryMode, setCommentaryMode] = useState("manual"); // manual, auto, voice

  // Sample commentary data
  useEffect(() => {
    setCommentary([
      {
        id: 1,
        over: "1.1",
        ball: 1,
        comment: "What a start! Perfect line and length from the opening bowler. The batsman carefully defends.",
        timestamp: "2025-01-06T10:00:00Z",
        commentator: "AI Assistant",
        type: "ball"
      },
      {
        id: 2,
        over: "1.2",
        ball: 2,
        comment: "Short of length delivery, the batsman rocks back and pulls it for a magnificent four! Great shot selection.",
        timestamp: "2025-01-06T10:01:30Z",
        commentator: "Live Commentator",
        type: "boundary"
      },
      {
        id: 3,
        over: "1.3",
        ball: 3,
        comment: "The bowler adjusts his line, bowling outside off stump. The batsman leaves it alone wisely.",
        timestamp: "2025-01-06T10:02:45Z",
        commentator: "AI Assistant",
        type: "ball"
      }
    ]);
  }, []);

  const addCommentary = () => {
    if (!newComment.trim()) {
      toast({
        title: "Error",
        description: "Please enter commentary text",
        variant: "destructive"
      });
      return;
    }

    const newEntry = {
      id: commentary.length + 1,
      over: "1.4", // This would come from current match state
      ball: commentary.length + 1,
      comment: newComment,
      timestamp: new Date().toISOString(),
      commentator: "Live Commentator",
      type: "manual"
    };

    setCommentary(prev => [newEntry, ...prev]);
    setNewComment("");
    
    toast({
      title: "Commentary Added",
      description: "Your commentary has been added to the live feed",
    });
  };

  const generateAutoCommentary = (ballData) => {
    // AI-powered commentary generation based on ball data
    const templates = {
      0: [
        "Dot ball! Excellent bowling keeping the pressure on.",
        "The batsman plays it straight back to the bowler.",
        "Tight bowling, no runs scored on this delivery."
      ],
      1: [
        "Quick single taken! Good running between the wickets.",
        "The batsman works it to the leg side for a single.",
        "Easy single to keep the scoreboard ticking."
      ],
      4: [
        "FOUR! What a shot! The ball races to the boundary.",
        "Magnificent stroke! The ball finds the gap perfectly.",
        "Beautiful timing! The ball beats the fielder to the fence."
      ],
      6: [
        "SIX! That's out of the park! Incredible power hitting!",
        "Maximum! The ball sails over the boundary for six runs!",
        "What a strike! The crowd is on their feet!"
      ],
      wicket: [
        "WICKET! The bowler strikes! What a delivery!",
        "Gone! The batsman's innings comes to an end!",
        "The partnership is broken! Excellent bowling!"
      ]
    };

    const runs = ballData.runs || 0;
    const isWicket = ballData.isWicket || false;
    
    let commentaryOptions;
    if (isWicket) {
      commentaryOptions = templates.wicket;
    } else {
      commentaryOptions = templates[runs] || templates[0];
    }

    return commentaryOptions[Math.floor(Math.random() * commentaryOptions.length)];
  };

  const startVoiceRecording = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        title: "Not Supported",
        description: "Voice recording is not supported in your browser",
        variant: "destructive"
      });
      return;
    }

    setIsRecording(true);
    toast({
      title: "Recording Started",
      description: "Voice commentary recording is now active",
    });

    // Simulate recording for demo
    setTimeout(() => {
      setIsRecording(false);
      toast({
        title: "Recording Stopped",
        description: "Voice commentary has been processed and added",
      });
    }, 5000);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCommentaryIcon = (type) => {
    switch (type) {
      case 'boundary': return '🏏';
      case 'wicket': return '🎯';
      case 'six': return '🚀';
      default: return '📝';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6" />
          Live Commentary System
        </h2>
        <Badge className="bg-orange-100 text-orange-800">
          Enhanced Feature
        </Badge>
      </div>

      <Tabs defaultValue="live" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="live">Live Commentary</TabsTrigger>
          <TabsTrigger value="add">Add Commentary</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Live Commentary Feed</span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="animate-pulse">
                    🔴 LIVE
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Volume2 className="w-4 h-4 mr-2" />
                    Audio
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {commentary.map((entry) => (
                    <div key={entry.id} className="p-3 bg-gray-50 rounded-lg border-l-4 border-blue-500">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {entry.over}
                          </Badge>
                          <span className="text-lg">{getCommentaryIcon(entry.type)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          {formatTime(entry.timestamp)}
                        </div>
                      </div>
                      
                      <p className="text-gray-800 mb-2">{entry.comment}</p>
                      
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <User className="w-3 h-3" />
                        {entry.commentator}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Manual Commentary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Enter your live commentary for this ball/moment..."
                  rows={4}
                />
                <Button onClick={addCommentary} className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Add Commentary
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Voice Commentary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-6">
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                    isRecording ? 'bg-red-100 animate-pulse' : 'bg-gray-100'
                  }`}>
                    <Mic className={`w-8 h-8 ${isRecording ? 'text-red-600' : 'text-gray-600'}`} />
                  </div>
                  
                  <Button 
                    onClick={startVoiceRecording}
                    disabled={isRecording}
                    variant={isRecording ? "destructive" : "default"}
                    className="w-full"
                  >
                    {isRecording ? (
                      <>
                        <Pause className="w-4 h-4 mr-2" />
                        Recording... (Click to stop)
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Start Voice Commentary
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="text-xs text-gray-500 text-center">
                  Voice commentary will be automatically transcribed and added to the live feed
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Quick Commentary Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  "Great shot for four!",
                  "Excellent bowling!",
                  "Close call by the umpire",
                  "Superb fielding effort",
                  "The crowd is loving it!",
                  "Pressure building here",
                  "What a catch!",
                  "Perfect timing!"
                ].map((template, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setNewComment(template)}
                    className="text-xs"
                  >
                    {template}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Commentary Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Commentary Mode</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: 'manual', label: 'Manual Only' },
                    { value: 'auto', label: 'AI Assisted' },
                    { value: 'voice', label: 'Voice + AI' }
                  ].map((mode) => (
                    <Button
                      key={mode.value}
                      variant={commentaryMode === mode.value ? "default" : "outline"}
                      onClick={() => setCommentaryMode(mode.value)}
                      className="text-sm"
                    >
                      {mode.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold">Auto-Commentary Features</h4>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Generate commentary for boundaries</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Generate commentary for wickets</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" />
                    <span className="text-sm">Generate commentary for dot balls</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked />
                    <span className="text-sm">Add milestone notifications</span>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">Professional Commentary Tips</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Describe the action as it happens</li>
                  <li>• Mention field placements and strategies</li>
                  <li>• Add context about player performance</li>
                  <li>• Keep the energy and excitement alive</li>
                  <li>• Use cricket terminology appropriately</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommentarySystem;
