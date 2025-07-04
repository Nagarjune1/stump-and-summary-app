
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BookOpen, MapPin, Settings, Check, Clock, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

const Documentation = () => {
  const [settings, setSettings] = useState({
    show_documentation: true,
    show_roadmap: true,
    app_version: '1.0.0'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('setting_key, setting_value');

      if (error) throw error;

      const settingsMap = {};
      data?.forEach(item => {
        settingsMap[item.setting_key] = item.setting_value === 'true' || item.setting_value;
      });
      
      setSettings(prev => ({ ...prev, ...settingsMap }));
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const updateSetting = async (key: string, value: string) => {
    try {
      const { error } = await supabase
        .from('app_settings')
        .update({ setting_value: value })
        .eq('setting_key', key);

      if (error) throw error;

      setSettings(prev => ({ ...prev, [key]: value === 'true' }));
      toast({
        title: "Settings Updated",
        description: `${key.replace('_', ' ')} setting updated successfully`,
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive"
      });
    }
  };

  const libraries = [
    { name: "React", version: "^18.3.1", description: "UI library" },
    { name: "TypeScript", version: "Latest", description: "Type safety" },
    { name: "Vite", version: "Latest", description: "Build tool" },
    { name: "Tailwind CSS", version: "Latest", description: "Styling" },
    { name: "Shadcn UI", version: "Latest", description: "Component library" },
    { name: "Supabase", version: "^2.50.2", description: "Backend & Database" },
    { name: "TanStack Query", version: "^5.56.2", description: "Data fetching" },
    { name: "React Router", version: "^6.26.2", description: "Routing" },
    { name: "Recharts", version: "^2.12.7", description: "Data visualization" },
    { name: "Lucide React", version: "^0.462.0", description: "Icons" },
    { name: "React Hook Form", version: "^7.53.0", description: "Form management" },
    { name: "Zod", version: "^3.23.8", description: "Schema validation" },
    { name: "Date-fns", version: "^3.6.0", description: "Date utilities" },
    { name: "html2canvas", version: "^1.4.1", description: "Export to image" },
    { name: "jsPDF", version: "^3.0.1", description: "PDF generation" }
  ];

  const roadmapItems = [
    {
      phase: "Phase 1 - Core Features",
      status: "completed",
      items: [
        "Live scoring functionality",
        "Player and team management",
        "Match creation and management",
        "Real-time scoring updates",
        "Basic reporting and exports"
      ]
    },
    {
      phase: "Phase 2 - Enhanced Analytics",
      status: "in-progress",
      items: [
        "Advanced analytics dashboard",
        "Performance comparison tools",
        "Tournament management",
        "Mobile app optimization",
        "Offline scoring capability"
      ]
    },
    {
      phase: "Phase 3 - Advanced Features",
      status: "planned",
      items: [
        "Video highlights integration",
        "Social media integration",
        "Multi-language support",
        "Advanced statistics (Wagon wheel, Heat maps)",
        "Commentary system",
        "Live streaming integration"
      ]
    },
    {
      phase: "Phase 4 - AI & Professional",
      status: "future",
      items: [
        "AI-powered insights",
        "Fantasy cricket integration",
        "Betting odds integration",
        "Professional league support",
        "Advanced user roles and permissions"
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="w-4 h-4 text-green-600" />;
      case 'in-progress': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'planned': return <MapPin className="w-4 h-4 text-orange-600" />;
      default: return <Zap className="w-4 h-4 text-purple-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'planned': return 'bg-orange-100 text-orange-800';
      default: return 'bg-purple-100 text-purple-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Settings Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Documentation Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Show Documentation</label>
              <p className="text-sm text-gray-600">Display documentation section in the app</p>
            </div>
            <Switch
              checked={settings.show_documentation}
              onCheckedChange={(checked) => updateSetting('show_documentation', checked.toString())}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">Show Roadmap</label>
              <p className="text-sm text-gray-600">Display roadmap section in the app</p>
            </div>
            <Switch
              checked={settings.show_roadmap}
              onCheckedChange={(checked) => updateSetting('show_roadmap', checked.toString())}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <label className="font-medium">App Version</label>
              <p className="text-sm text-gray-600">Current version: {settings.app_version}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="libraries">Libraries</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Cricket Scorer Pro - Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-700">
                A comprehensive cricket live scoring application built with modern web technologies. 
                This app provides real-time scoring, player management, match analytics, and detailed reporting.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Live Scoring</h3>
                  <p className="text-sm text-blue-700">Real-time ball-by-ball scoring with comprehensive statistics</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900">Analytics</h3>
                  <p className="text-sm text-green-700">Advanced match analytics with charts and performance metrics</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-900">Export & Share</h3>
                  <p className="text-sm text-purple-700">Multiple export formats and social sharing capabilities</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="libraries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Technology Stack & Libraries</CardTitle>
              <p className="text-gray-600">Complete list of libraries and technologies used in this application</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {libraries.map((lib, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{lib.name}</h3>
                      <Badge variant="outline">{lib.version}</Badge>
                    </div>
                    <p className="text-sm text-gray-600">{lib.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Current Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold mb-3 text-blue-900">Match Management</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Create and manage cricket matches</li>
                    <li>• Support for multiple formats (T20, ODI, Test)</li>
                    <li>• Live match status tracking</li>
                    <li>• Toss management with team selection</li>
                    <li>• Innings management with automatic transitions</li>
                  </ul>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-3 text-green-900">Live Scoring</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Real-time ball-by-ball scoring</li>
                    <li>• Quick scoring buttons (0, 1, 2, 3, 4, 6)</li>
                    <li>• Wicket tracking with detailed dismissal types</li>
                    <li>• Extras handling (Wides, No Balls, Byes, Leg Byes)</li>
                    <li>• Strike rotation management</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-purple-900">Player Management</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Comprehensive player profiles with photos</li>
                    <li>• Team-wise player organization</li>
                    <li>• Player statistics tracking (batting & bowling)</li>
                    <li>• Career statistics calculation</li>
                    <li>• Player performance analytics</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-3 text-orange-900">Analytics & Reporting</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• Match analytics with charts and graphs</li>
                    <li>• Run rate calculations</li>
                    <li>• Partnership tracking</li>
                    <li>• Fall of wickets visualization</li>
                    <li>• Multiple export formats (PDF, PNG, JSON, CSV, TXT)</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roadmap" className="space-y-4">
          {settings.show_roadmap && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Development Roadmap
                </CardTitle>
                <p className="text-gray-600">Our planned features and enhancements</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {roadmapItems.map((phase, index) => (
                    <div key={index} className="border-l-4 border-gray-200 pl-4">
                      <div className="flex items-center gap-3 mb-3">
                        {getStatusIcon(phase.status)}
                        <h3 className="font-semibold text-lg">{phase.phase}</h3>
                        <Badge className={getStatusColor(phase.status)}>
                          {phase.status.replace('-', ' ')}
                        </Badge>
                      </div>
                      <ul className="space-y-1">
                        {phase.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="text-sm text-gray-700 ml-4">
                            • {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documentation;
