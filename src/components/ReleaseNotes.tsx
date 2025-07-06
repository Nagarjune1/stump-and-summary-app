
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Rocket, Bug, Zap, Plus, Calendar, Star, CheckCircle, AlertTriangle } from "lucide-react";

const ReleaseNotes = () => {
  const [currentVersion, setCurrentVersion] = useState("1.3.0");

  const releases = [
    {
      version: "1.3.0",
      date: "2025-01-06",
      type: "major",
      title: "Multi-Language Support & Social Integration",
      description: "Major update introducing multi-language support, social media integration, and enhanced commentary features",
      features: [
        {
          type: "feature",
          title: "Multi-Language Support",
          description: "Added support for English, Hindi, and Spanish with real-time language switching and cricket-specific terminology",
          icon: <Plus className="w-4 h-4" />
        },
        {
          type: "feature", 
          title: "Social Media Integration",
          description: "Share match updates, scorecards, and highlights directly to Twitter, Facebook, and WhatsApp with custom templates",
          icon: <Plus className="w-4 h-4" />
        },
        {
          type: "feature",
          title: "Advanced Statistics Dashboard",
          description: "Comprehensive player and team analytics with AI-powered insights and performance predictions",
          icon: <Star className="w-4 h-4" />
        },
        {
          type: "feature",
          title: "Enhanced Commentary System",
          description: "Live commentary feed with voice input, AI-assisted generation, and professional templates",
          icon: <Plus className="w-4 h-4" />
        },
        {
          type: "enhancement",
          title: "Professional Scoreboard",
          description: "Complete cricket scoreboard with batting/bowling stats, fall of wickets, and dismissal tracking",
          icon: <CheckCircle className="w-4 h-4" />
        }
      ],
      bugFixes: [
        "Fixed wicket dismissal tracking and display issues",
        "Resolved scoreboard layout problems on mobile devices",
        "Improved data synchronization for offline scoring",
        "Fixed export functionality for match reports"
      ],
      technicalChanges: [
        "Implemented internationalization (i18n) framework",
        "Added social sharing APIs and image generation",
        "Enhanced analytics data processing algorithms",
        "Improved component architecture for better maintainability"
      ]
    },
    {
      version: "1.2.0",
      date: "2025-01-05",
      type: "major",
      title: "Advanced Analytics & Offline Scoring",
      description: "Major update introducing advanced analytics dashboard and offline scoring capabilities",
      features: [
        {
          type: "feature",
          title: "Advanced Analytics Dashboard",
          description: "Deep insights into player and team performance with interactive charts and AI-powered recommendations",
          icon: <Zap className="w-4 h-4" />
        },
        {
          type: "feature", 
          title: "Offline Scoring Mode",
          description: "Score matches without internet connection with automatic synchronization when online",
          icon: <Plus className="w-4 h-4" />
        },
        {
          type: "feature",
          title: "Performance Comparison Tools",
          description: "Compare player statistics across matches and seasons with detailed metrics",
          icon: <Star className="w-4 h-4" />
        },
        {
          type: "enhancement",
          title: "Enhanced Mobile Experience",
          description: "Improved responsive design and mobile app optimization for better on-field scoring",
          icon: <CheckCircle className="w-4 h-4" />
        },
        {
          type: "enhancement",
          title: "Toss Management System",
          description: "Streamlined toss selection and match start process with better error handling",
          icon: <CheckCircle className="w-4 h-4" />
        }
      ],
      bugFixes: [
        "Fixed toss completion error that prevented match starts",
        "Resolved database column mapping issues in match statistics",
        "Improved error handling in tournament management",
        "Fixed responsive layout issues on small screens"
      ],
      technicalChanges: [
        "Added toss_winner and toss_decision columns to matches table",
        "Implemented local storage for offline data management",
        "Enhanced analytics data processing algorithms", 
        "Improved database query optimization for large datasets"
      ]
    },
    {
      version: "1.1.0",
      date: "2024-12-28",
      type: "minor",
      title: "Tournament Management & Documentation",
      description: "Added comprehensive tournament management system and improved documentation",
      features: [
        {
          type: "feature",
          title: "Tournament Management System",
          description: "Create and manage cricket tournaments with team registration, fixtures, and officials",
          icon: <Plus className="w-4 h-4" />
        },
        {
          type: "feature",
          title: "Venue Management",
          description: "Comprehensive venue database with facilities, ratings, and cost management",
          icon: <Plus className="w-4 h-4" />
        },
        {
          type: "enhancement",
          title: "Enhanced Documentation",
          description: "Complete project documentation with roadmap, features overview, and technical details",
          icon: <CheckCircle className="w-4 h-4" />
        }
      ],
      bugFixes: [
        "Fixed player statistics calculation errors",
        "Resolved match creation validation issues",
        "Improved data export functionality"
      ],
      technicalChanges: [
        "Added tournaments, venues, and related tables",
        "Implemented comprehensive RLS policies",
        "Enhanced TypeScript type definitions"
      ]
    },
    {
      version: "1.0.0", 
      date: "2024-12-15",
      type: "major",
      title: "Initial Release - Core Cricket Scoring",
      description: "First stable release with complete cricket scoring functionality",
      features: [
        {
          type: "feature",
          title: "Live Ball-by-Ball Scoring",
          description: "Real-time cricket scoring with comprehensive ball tracking and statistics",
          icon: <Plus className="w-4 h-4" />
        },
        {
          type: "feature",
          title: "Player & Team Management",
          description: "Complete player profiles with statistics and team organization",
          icon: <Plus className="w-4 h-4" />
        },
        {
          type: "feature",
          title: "Match Analytics",
          description: "Detailed match reports with charts, partnerships, and fall of wickets",
          icon: <Plus className="w-4 h-4" />
        },
        {
          type: "feature",
          title: "Multi-format Export",
          description: "Export scorecards in PDF, PNG, JSON, CSV, and TXT formats",
          icon: <Plus className="w-4 h-4" />
        },
        {
          type: "feature",
          title: "Real-time Sync",
          description: "Supabase-powered real-time data synchronization across devices",
          icon: <Plus className="w-4 h-4" />
        }
      ],
      bugFixes: [],
      technicalChanges: [
        "Initial database schema with RLS policies",
        "Complete React + TypeScript application structure",
        "Supabase integration for backend services"
      ]
    }
  ];

  const getVersionBadgeColor = (type) => {
    switch (type) {
      case "major": return "bg-red-100 text-red-800";
      case "minor": return "bg-blue-100 text-blue-800";
      case "patch": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getFeatureIcon = (type) => {
    switch (type) {
      case "feature": return <Plus className="w-4 h-4 text-green-600" />;
      case "enhancement": return <Zap className="w-4 h-4 text-blue-600" />;
      case "fix": return <Bug className="w-4 h-4 text-orange-600" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Rocket className="w-6 h-6" />
            Release Notes
          </h2>
          <p className="text-gray-600">Latest updates and improvements to Cricket Scorer Pro</p>
        </div>
        <Badge className="bg-blue-100 text-blue-800 text-sm px-3 py-1">
          Current: v{currentVersion}
        </Badge>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all">All Releases</TabsTrigger>
          <TabsTrigger value="major">Major Updates</TabsTrigger>
          <TabsTrigger value="features">New Features</TabsTrigger>
          <TabsTrigger value="fixes">Bug Fixes</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-6">
          {releases.map((release, index) => (
            <Card key={release.version} className={index === 0 ? "border-blue-200 bg-blue-50/30" : ""}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold">v{release.version}</h3>
                      <Badge className={getVersionBadgeColor(release.type)}>
                        {release.type.toUpperCase()}
                      </Badge>
                      {index === 0 && (
                        <Badge className="bg-green-100 text-green-800">
                          LATEST
                        </Badge>
                      )}
                    </div>
                    <h4 className="text-lg font-semibold text-gray-800">{release.title}</h4>
                    <p className="text-gray-600">{release.description}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {new Date(release.date).toLocaleDateString()}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* New Features */}
                {release.features && release.features.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4" />
                      New Features & Enhancements
                    </h5>
                    <div className="space-y-3">
                      {release.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                          {getFeatureIcon(feature.type)}
                          <div>
                            <h6 className="font-medium">{feature.title}</h6>
                            <p className="text-sm text-gray-600">{feature.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bug Fixes */}
                {release.bugFixes && release.bugFixes.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                      <Bug className="w-4 h-4" />
                      Bug Fixes
                    </h5>
                    <ul className="space-y-2">
                      {release.bugFixes.map((fix, fixIndex) => (
                        <li key={fixIndex} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                          <span>{fix}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Technical Changes */}
                {release.technicalChanges && release.technicalChanges.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" />
                      Technical Changes
                    </h5>
                    <ul className="space-y-2">
                      {release.technicalChanges.map((change, changeIndex) => (
                        <li key={changeIndex} className="flex items-start gap-2 text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                          <span>{change}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
              {index < releases.length - 1 && <Separator className="mt-6" />}
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="major" className="space-y-6">
          {releases.filter(r => r.type === 'major').map((release, index) => (
            <Card key={release.version}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-bold">v{release.version}</h3>
                  <Badge className="bg-red-100 text-red-800">MAJOR</Badge>
                  <span className="text-sm text-gray-500">{new Date(release.date).toLocaleDateString()}</span>
                </div>
                <h4 className="text-lg font-semibold">{release.title}</h4>
                <p className="text-gray-600">{release.description}</p>
              </CardHeader>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          {releases.flatMap(release => 
            (release.features || []).map((feature, index) => (
              <Card key={`${release.version}-${index}`} className="p-4">
                <div className="flex items-start gap-3">
                  {getFeatureIcon(feature.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{feature.title}</h4>
                      <Badge variant="outline" className="text-xs">v{release.version}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="fixes" className="space-y-4">
          {releases.flatMap(release => 
            (release.bugFixes || []).map((fix, index) => (
              <Card key={`${release.version}-fix-${index}`} className="p-4">
                <div className="flex items-start gap-3">
                  <Bug className="w-4 h-4 text-orange-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">v{release.version}</Badge>
                    </div>
                    <p className="text-sm">{fix}</p>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReleaseNotes;
