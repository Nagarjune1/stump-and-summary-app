
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { BookOpen, Users, Trophy, BarChart3, Settings, Shield, Zap, Globe, Share2, MessageSquare, PieChart, FileText, Award, Clock, Target } from "lucide-react";

const Documentation = () => {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Cricket Scorer Pro Documentation</h1>
              <p className="text-blue-100">Complete guide to professional cricket scoring</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-white/20 border-white/30">v1.4.0</Badge>
            <Badge className="bg-white/20 border-white/30">Professional</Badge>
            <Badge className="bg-white/20 border-white/30">Full-Featured</Badge>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="authentication">Auth</TabsTrigger>
          <TabsTrigger value="scoring">Live Scoring</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Welcome to Cricket Scorer Pro
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                Cricket Scorer Pro is a comprehensive cricket scoring application designed for professional match management, 
                live scoring, detailed analytics, and tournament administration.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    Core Features
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Real-time live scoring with ball-by-ball tracking</li>
                    <li>• User authentication and match permissions</li>
                    <li>• Professional scorecards and analytics</li>
                    <li>• Tournament management system</li>
                    <li>• Multi-language support</li>
                    <li>• Social media integration</li>
                    <li>• Advanced statistics and insights</li>
                    <li>• Commentary system</li>
                  </ul>
                </div>
                
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-500" />
                    Target Users
                  </h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Cricket clubs and academies</li>
                    <li>• Tournament organizers</li>
                    <li>• Professional scorers</li>
                    <li>• Match officials and umpires</li>
                    <li>• Cricket enthusiasts</li>
                    <li>• Sports journalists</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Start Guide</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div>
                    <h4 className="font-medium">Create Account & Login</h4>
                    <p className="text-sm text-gray-600">Sign up for a new account or login with existing credentials</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                  <div>
                    <h4 className="font-medium">Create Teams & Players</h4>
                    <p className="text-sm text-gray-600">Set up teams and add player profiles with detailed information</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                  <div>
                    <h4 className="font-medium">Schedule Match</h4>
                    <p className="text-sm text-gray-600">Create a new match with teams, venue, and format details</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
                  <div>
                    <h4 className="font-medium">Start Live Scoring</h4>
                    <p className="text-sm text-gray-600">Begin ball-by-ball scoring with real-time updates</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="authentication" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Authentication System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">User Roles & Permissions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-blue-50">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-blue-800">Match Owner</h4>
                        <p className="text-sm text-blue-600 mt-1">
                          Full control over match settings, can assign scorers and manage permissions
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-green-50">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-green-800">Scorer</h4>
                        <p className="text-sm text-green-600 mt-1">
                          Can perform live scoring, update match events and player statistics
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <h4 className="font-medium text-gray-800">Viewer</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Read-only access to view live scores and match statistics
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-2">Security Features</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Row-Level Security (RLS) for data protection
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      JWT-based authentication with Supabase
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Automatic match ownership assignment
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      Permission-based access control
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Live Scoring System
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Core Scoring Features</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Ball-by-ball scoring with run tracking</li>
                    <li>• Automatic over completion detection</li>
                    <li>• Innings break management (6 overs = innings break)</li>
                    <li>• Wicket selector with dismissal types</li>
                    <li>• Bowler rotation after each over</li>
                    <li>• Real-time strike rotation</li>
                    <li>• Partnership tracking</li>
                    <li>• Fall of wickets recording</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Match Flow</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 rounded">
                      <h4 className="font-medium text-blue-800">1. Toss</h4>
                      <p className="text-sm text-blue-600">Winner decides to bat or bowl first</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded">
                      <h4 className="font-medium text-green-800">2. Player Selection</h4>
                      <p className="text-sm text-green-600">Choose opening batsmen and bowler</p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded">
                      <h4 className="font-medium text-purple-800">3. Live Scoring</h4>
                      <p className="text-sm text-purple-600">Ball-by-ball scoring with automatic tracking</p>
                    </div>
                    <div className="p-3 bg-orange-50 rounded">
                      <h4 className="font-medium text-orange-800">4. Match Completion</h4>
                      <p className="text-sm text-orange-600">Automatic result calculation and awards</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Scoring Rules & Automation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Automatic Features</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• <strong>Over Completion:</strong> After 6 balls, automatically moves to next over</li>
                    <li>• <strong>Innings Break:</strong> After specified overs (default: 6), triggers innings break</li>
                    <li>• <strong>Strike Rotation:</strong> Odd runs automatically change strike</li>
                    <li>• <strong>Bowler Selection:</strong> Prompts for new bowler after each over</li>
                    <li>• <strong>Match End:</strong> Automatic when target achieved or overs completed</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Dismissal Types</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Bowled</li>
                    <li>• Caught (with fielder selection)</li>
                    <li>• LBW</li>
                    <li>• Run Out (with fielder selection)</li>
                    <li>• Stumped (with keeper selection)</li>
                    <li>• Hit Wicket</li>
                    <li>• Retired Hurt</li>
                    <li>• Obstructing the Field</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Feature Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
                  <CardContent className="p-4">
                    <Trophy className="w-8 h-8 text-blue-600 mb-2" />
                    <h3 className="font-semibold mb-2">Tournament Management</h3>
                    <p className="text-sm text-gray-600">
                      Complete tournament organization with team registration, scheduling, and bracket management.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100">
                  <CardContent className="p-4">
                    <Users className="w-8 h-8 text-green-600 mb-2" />
                    <h3 className="font-semibold mb-2">Player Management</h3>
                    <p className="text-sm text-gray-600">
                      Comprehensive player profiles with statistics, photos, and performance tracking.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
                  <CardContent className="p-4">
                    <BarChart3 className="w-8 h-8 text-purple-600 mb-2" />
                    <h3 className="font-semibold mb-2">Advanced Analytics</h3>
                    <p className="text-sm text-gray-600">
                      Deep insights with charts, graphs, and statistical analysis of matches and players.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100">
                  <CardContent className="p-4">
                    <Globe className="w-8 h-8 text-red-600 mb-2" />
                    <h3 className="font-semibold mb-2">Multi-Language</h3>
                    <p className="text-sm text-gray-600">
                      Support for multiple languages with easy switching between English, Hindi, and others.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
                  <CardContent className="p-4">
                    <Share2 className="w-8 h-8 text-yellow-600 mb-2" />
                    <h3 className="font-semibold mb-2">Social Integration</h3>
                    <p className="text-sm text-gray-600">
                      Share match updates and scorecards directly to social media platforms.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100">
                  <CardContent className="p-4">
                    <MessageSquare className="w-8 h-8 text-indigo-600 mb-2" />
                    <h3 className="font-semibold mb-2">Live Commentary</h3>
                    <p className="text-sm text-gray-600">
                      Ball-by-ball commentary with automatic generation and manual override options.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="w-5 h-5" />
                Analytics & Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Match Analytics</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Run rate progression charts</li>
                    <li>• Wicket fall patterns</li>
                    <li>• Partnership analysis</li>
                    <li>• Bowling analysis by overs</li>
                    <li>• Shot selection heatmaps</li>
                    <li>• Momentum charts</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Player Statistics</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Batting averages and strike rates</li>
                    <li>• Bowling figures and economy rates</li>
                    <li>• Fielding statistics</li>
                    <li>• Performance trends</li>
                    <li>• Head-to-head comparisons</li>
                    <li>• Career milestones</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Advanced Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-blue-50">
                    <CardContent className="p-3">
                      <h4 className="font-medium text-blue-800">Predictive Analytics</h4>
                      <p className="text-xs text-blue-600 mt-1">Win probability and score predictions</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50">
                    <CardContent className="p-3">
                      <h4 className="font-medium text-green-800">Performance Insights</h4>
                      <p className="text-xs text-green-600 mt-1">Player form and team trends</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-purple-50">
                    <CardContent className="p-3">
                      <h4 className="font-medium text-purple-800">Comparative Analysis</h4>
                      <p className="text-xs text-purple-600 mt-1">Match and player comparisons</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Export & Reporting
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3">Export Formats</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• <strong>PDF Scorecards:</strong> Professional match reports</li>
                    <li>• <strong>Excel Statistics:</strong> Detailed player and match data</li>
                    <li>• <strong>JSON Data:</strong> Raw data for further analysis</li>
                    <li>• <strong>Image Cards:</strong> Social media ready graphics</li>
                    <li>• <strong>CSV Reports:</strong> Compatible with external tools</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3">Report Contents</h3>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li>• Complete scorecard with all statistics</li>
                    <li>• Ball-by-ball commentary</li>
                    <li>• Fall of wickets details</li>
                    <li>• Partnership information</li>
                    <li>• Best performers and awards</li>
                    <li>• Match summary and result</li>
                  </ul>
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-3">Professional Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-blue-50">
                    <CardContent className="p-4">
                      <Award className="w-6 h-6 text-blue-600 mb-2" />
                      <h4 className="font-medium text-blue-800">Branded Reports</h4>
                      <p className="text-sm text-blue-600">
                        Customize reports with team logos, tournament branding, and sponsor information.
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-green-50">
                    <CardContent className="p-4">
                      <Share2 className="w-6 h-6 text-green-600 mb-2" />
                      <h4 className="font-medium text-green-800">Instant Sharing</h4>
                      <p className="text-sm text-green-600">
                        One-click sharing to social media, email, or cloud storage platforms.
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">Match Settings</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="font-medium">Format Options</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• T20 (20 overs)</li>
                        <li>• One Day (50 overs)</li>
                        <li>• Test Match</li>
                        <li>• Custom overs</li>
                      </ul>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium">Scoring Rules</h4>
                      <ul className="text-sm text-gray-700 space-y-1">
                        <li>• DLS method support</li>
                        <li>• Super Over rules</li>
                        <li>• Powerplay tracking</li>
                        <li>• Free hit rules</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">System Integration</h3>
                  <div className="space-y-3">
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Database</h4>
                        <p className="text-sm text-gray-600">
                          Built on Supabase with PostgreSQL for reliable data storage and real-time updates.
                        </p>
                      </CardContent>
                    </Card>
                    
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">Authentication</h4>
                        <p className="text-sm text-gray-600">
                          Secure JWT-based authentication with role-based access control and session management.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>API Reference</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Coming Soon</h3>
                <p className="text-sm text-gray-600">
                  REST API documentation and GraphQL endpoints for third-party integrations will be available in the next release.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documentation;
