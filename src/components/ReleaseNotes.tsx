
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertCircle, Zap, Shield, Trophy, Clock, Target, Users, BarChart3, Globe, Share2, MessageSquare, FileText, Bug } from "lucide-react";

const ReleaseNotes = () => {
  const releases = [
    {
      version: "1.4.0",
      date: "2025-01-06",
      type: "major",
      title: "Authentication & Core Scoring Fixes",
      description: "Major update with user authentication, fixed core scoring mechanics, and enhanced UI",
      features: [
        {
          icon: <Shield className="w-4 h-4" />,
          title: "User Authentication System",
          description: "Complete login/signup system with match permissions (owner, scorer, viewer)",
          type: "new"
        },
        {
          icon: <Clock className="w-4 h-4" />,
          title: "Fixed Core Scoring Logic",
          description: "Automatic innings break after specified overs, proper over completion detection",
          type: "fix"
        },
        {
          icon: <Target className="w-4 h-4" />,
          title: "Enhanced Wicket System",
          description: "Dismissal type selector with fielder selection, proper wicket recording",
          type: "new"
        },
        {
          icon: <Users className="w-4 h-4" />,
          title: "Bowler Rotation System",
          description: "Automatic bowler selection after each over, prevents consecutive overs",
          type: "new"
        },
        {
          icon: <BarChart3 className="w-4 h-4" />,
          title: "Real-time Player Statistics",
          description: "Live updating of batting and bowling figures in scoreboard",
          type: "fix"
        },
        {
          icon: <FileText className="w-4 h-4" />,
          title: "Professional Scorecards",
          description: "CricInfo-style scorecards with complete match details and statistics",
          type: "improvement"
        }
      ],
      bugFixes: [
        "Fixed player statistics not updating during live scoring",
        "Resolved innings break not triggering after specified overs",
        "Fixed strike rotation for odd runs",
        "Corrected partnership calculation display",
        "Fixed export functionality with complete scorecard data"
      ]
    },
    {
      version: "1.3.0",
      date: "2025-01-05",
      type: "major",
      title: "Advanced Features & Analytics",
      description: "Comprehensive feature set with analytics, multi-language support, and social integration",
      features: [
        {
          icon: <BarChart3 className="w-4 h-4" />,
          title: "Advanced Statistics Dashboard",
          description: "Comprehensive analytics with charts, graphs, and detailed insights",
          type: "new"
        },
        {
          icon: <Globe className="w-4 h-4" />,
          title: "Multi-Language Support",
          description: "Support for multiple languages including English and Hindi",
          type: "new"
        },
        {
          icon: <Share2 className="w-4 h-4" />,
          title: "Social Media Integration",
          description: "Share match updates and scorecards to social platforms",
          type: "new"
        },
        {
          icon: <MessageSquare className="w-4 h-4" />,
          title: "Enhanced Commentary System",
          description: "Ball-by-ball commentary with automatic generation",
          type: "new"
        }
      ]
    },
    {
      version: "1.2.0",
      date: "2025-01-04",
      type: "minor",
      title: "Tournament Management",
      description: "Complete tournament organization system with registration and bracket management",
      features: [
        {
          icon: <Trophy className="w-4 h-4" />,
          title: "Tournament Management",
          description: "Full tournament creation, team registration, and match scheduling",
          type: "new"
        },
        {
          icon: <Users className="w-4 h-4" />,
          title: "Enhanced Player Profiles",
          description: "Detailed player information with photos and statistics",
          type: "improvement"
        }
      ]
    },
    {
      version: "1.1.0",
      date: "2025-01-03",
      type: "minor",
      title: "Live Scoring Enhancements",
      description: "Improved live scoring interface with better UX and analytics",
      features: [
        {
          icon: <Zap className="w-4 h-4" />,
          title: "Real-time Scoring",
          description: "Enhanced ball-by-ball scoring with live updates",
          type: "improvement"
        },
        {
          icon: <BarChart3 className="w-4 h-4" />,
          title: "Match Analytics",
          description: "Basic analytics and statistics for matches",
          type: "new"
        }
      ]
    },
    {
      version: "1.0.0",
      date: "2025-01-01",
      type: "major",
      title: "Initial Release",
      description: "First stable release of Cricket Scorer Pro with core functionality",
      features: [
        {
          icon: <Trophy className="w-4 h-4" />,
          title: "Core Scoring System",
          description: "Basic cricket scoring with match management",
          type: "new"
        },
        {
          icon: <Users className="w-4 h-4" />,
          title: "Team & Player Management",
          description: "Create and manage teams and players",
          type: "new"
        },
        {
          icon: <FileText className="w-4 h-4" />,
          title: "Export Functionality",
          description: "Export match data and scorecards",
          type: "new"
        }
      ]
    }
  ];

  const getVersionBadgeColor = (type) => {
    switch (type) {
      case 'major': return 'bg-red-500';
      case 'minor': return 'bg-blue-500';
      case 'patch': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getFeatureIcon = (type) => {
    switch (type) {
      case 'new': return <CheckCircle className="w-3 h-3 text-green-500" />;
      case 'improvement': return <Zap className="w-3 h-3 text-blue-500" />;
      case 'fix': return <Bug className="w-3 h-3 text-orange-500" />;
      default: return <AlertCircle className="w-3 h-3 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Release Notes</h1>
              <p className="text-blue-100">What's new in Cricket Scorer Pro</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Badge className="bg-white/20 border-white/30">Latest: v1.4.0</Badge>
            <Badge className="bg-white/20 border-white/30">Production Ready</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {releases.map((release, index) => (
          <Card key={release.version} className={index === 0 ? "border-2 border-blue-500 shadow-lg" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={`${getVersionBadgeColor(release.type)} text-white`}>
                    v{release.version}
                  </Badge>
                  <div>
                    <CardTitle className="text-lg">{release.title}</CardTitle>
                    <p className="text-sm text-gray-600">{release.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{release.date}</p>
                  {index === 0 && (
                    <Badge variant="outline" className="text-xs mt-1">Latest</Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {release.features && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    New Features & Improvements
                  </h3>
                  <div className="space-y-3">
                    {release.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mt-0.5">
                          {feature.icon}
                          {getFeatureIcon(feature.type)}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{feature.title}</h4>
                          <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {feature.type}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {release.bugFixes && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <Bug className="w-4 h-4 text-orange-500" />
                      Bug Fixes
                    </h3>
                    <ul className="space-y-1">
                      {release.bugFixes.map((fix, fixIndex) => (
                        <li key={fixIndex} className="flex items-center gap-2 text-sm text-gray-700">
                          <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                          {fix}
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-blue-800">Upcoming Features</h3>
          </div>
          <div className="space-y-2 text-sm text-blue-700">
            <p>• REST API for third-party integrations</p>
            <p>• Mobile app for iOS and Android</p>
            <p>• Advanced video analysis integration</p>
            <p>• Machine learning powered insights</p>
            <p>• Blockchain-based player verification</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReleaseNotes;
