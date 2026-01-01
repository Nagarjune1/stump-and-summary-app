import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Bell, BellOff, Check, Volume2, VolumeX } from 'lucide-react';
import { notificationService } from '@/services/notificationService';
import { toast } from '@/hooks/use-toast';
import { useScoringSound } from '@/hooks/useScoringSound';

const NotificationSettings = () => {
  const [permission, setPermission] = useState<string>('default');
  const [settings, setSettings] = useState({
    century: true,
    halfCentury: true,
    hatTrick: true,
    fiveWickets: true,
    matchResult: true,
    boundaryStorm: false,
  });
  const [soundSettings, setSoundSettings] = useState({
    enabled: true,
    wicket: true,
    boundary: true,
    runs: true,
  });
  
  const { playSound } = useScoringSound();

  useEffect(() => {
    checkPermission();
    loadSettings();
    loadSoundSettings();
  }, []);

  const checkPermission = () => {
    const status = notificationService.getPermissionStatus();
    setPermission(status);
  };

  const loadSettings = () => {
    const saved = localStorage.getItem('notification_settings');
    if (saved) {
      setSettings(JSON.parse(saved));
    }
  };

  const loadSoundSettings = () => {
    const saved = localStorage.getItem('sound_settings');
    if (saved) {
      setSoundSettings(JSON.parse(saved));
    }
  };

  const saveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings);
    localStorage.setItem('notification_settings', JSON.stringify(newSettings));
    toast({
      title: 'Settings Saved',
      description: 'Notification preferences updated successfully',
    });
  };

  const handleRequestPermission = async () => {
    await notificationService.initialize();
    const granted = await notificationService.requestPermission();
    
    if (granted) {
      setPermission('granted');
      toast({
        title: 'Notifications Enabled',
        description: 'You will now receive milestone notifications',
      });
    } else {
      toast({
        title: 'Permission Denied',
        description: 'You can enable notifications in your browser settings',
        variant: 'destructive',
      });
    }
  };

  const handleTestNotification = async () => {
    await notificationService.sendLocalNotification({
      type: 'century',
      player: 'Test Player',
      details: 'This is a test notification',
      matchId: 'test',
    });
  };

  const updateSetting = (key: keyof typeof settings) => {
    saveSettings({ ...settings, [key]: !settings[key] });
  };

  const saveSoundSettings = (newSettings: typeof soundSettings) => {
    setSoundSettings(newSettings);
    localStorage.setItem('sound_settings', JSON.stringify(newSettings));
    toast({
      title: 'Settings Saved',
      description: 'Sound preferences updated successfully',
    });
  };

  const updateSoundSetting = (key: keyof typeof soundSettings) => {
    saveSoundSettings({ ...soundSettings, [key]: !soundSettings[key] });
  };

  const handleTestSound = (type: 'wicket' | 'four' | 'six') => {
    playSound(type);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Push Notifications
            </CardTitle>
            <CardDescription>
              Get notified about important match milestones
            </CardDescription>
          </div>
          <Badge variant={permission === 'granted' ? 'default' : 'secondary'}>
            {permission === 'granted' ? (
              <>
                <Check className="h-3 w-3 mr-1" />
                Enabled
              </>
            ) : (
              <>
                <BellOff className="h-3 w-3 mr-1" />
                Disabled
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {permission !== 'granted' && (
          <div className="bg-muted p-4 rounded-lg space-y-3">
            <p className="text-sm text-muted-foreground">
              Enable notifications to receive alerts for centuries, hat-tricks, and match results.
            </p>
            <Button onClick={handleRequestPermission} className="w-full">
              <Bell className="h-4 w-4 mr-2" />
              Enable Notifications
            </Button>
          </div>
        )}

        {permission === 'granted' && (
          <>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Notification Types</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="century" className="flex flex-col gap-1">
                    <span>Century (100 runs)</span>
                    <span className="text-xs text-muted-foreground">
                      When a batsman scores 100 runs
                    </span>
                  </Label>
                  <Switch
                    id="century"
                    checked={settings.century}
                    onCheckedChange={() => updateSetting('century')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="halfCentury" className="flex flex-col gap-1">
                    <span>Half Century (50 runs)</span>
                    <span className="text-xs text-muted-foreground">
                      When a batsman scores 50 runs
                    </span>
                  </Label>
                  <Switch
                    id="halfCentury"
                    checked={settings.halfCentury}
                    onCheckedChange={() => updateSetting('halfCentury')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="hatTrick" className="flex flex-col gap-1">
                    <span>Hat-trick</span>
                    <span className="text-xs text-muted-foreground">
                      3 wickets in 3 consecutive balls
                    </span>
                  </Label>
                  <Switch
                    id="hatTrick"
                    checked={settings.hatTrick}
                    onCheckedChange={() => updateSetting('hatTrick')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="fiveWickets" className="flex flex-col gap-1">
                    <span>5 Wickets</span>
                    <span className="text-xs text-muted-foreground">
                      When a bowler takes 5 wickets
                    </span>
                  </Label>
                  <Switch
                    id="fiveWickets"
                    checked={settings.fiveWickets}
                    onCheckedChange={() => updateSetting('fiveWickets')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="matchResult" className="flex flex-col gap-1">
                    <span>Match Results</span>
                    <span className="text-xs text-muted-foreground">
                      When a match is completed
                    </span>
                  </Label>
                  <Switch
                    id="matchResult"
                    checked={settings.matchResult}
                    onCheckedChange={() => updateSetting('matchResult')}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="boundaryStorm" className="flex flex-col gap-1">
                    <span>Boundary Storm</span>
                    <span className="text-xs text-muted-foreground">
                      4 or more boundaries in an over
                    </span>
                  </Label>
                  <Switch
                    id="boundaryStorm"
                    checked={settings.boundaryStorm}
                    onCheckedChange={() => updateSetting('boundaryStorm')}
                  />
                </div>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleTestNotification}
            >
              Send Test Notification
            </Button>
          </>
        )}

        <Separator />

        {/* Sound Settings Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium flex items-center gap-2">
                {soundSettings.enabled ? (
                  <Volume2 className="h-4 w-4 text-primary" />
                ) : (
                  <VolumeX className="h-4 w-4 text-muted-foreground" />
                )}
                Scoring Sounds
              </h3>
              <p className="text-xs text-muted-foreground">
                Audio feedback during live scoring
              </p>
            </div>
            <Switch
              id="soundEnabled"
              checked={soundSettings.enabled}
              onCheckedChange={() => updateSoundSetting('enabled')}
            />
          </div>

          {soundSettings.enabled && (
            <div className="space-y-3 pl-6 border-l-2 border-muted">
              <div className="flex items-center justify-between">
                <Label htmlFor="wicketSound" className="flex flex-col gap-1">
                  <span>Wicket Sound</span>
                  <span className="text-xs text-muted-foreground">
                    Dramatic sound when a wicket falls
                  </span>
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTestSound('wicket')}
                    className="h-7 px-2 text-xs"
                  >
                    Test
                  </Button>
                  <Switch
                    id="wicketSound"
                    checked={soundSettings.wicket}
                    onCheckedChange={() => updateSoundSetting('wicket')}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="boundarySound" className="flex flex-col gap-1">
                  <span>Boundary Sound</span>
                  <span className="text-xs text-muted-foreground">
                    Chime for fours and sixes
                  </span>
                </Label>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleTestSound('six')}
                    className="h-7 px-2 text-xs"
                  >
                    Test
                  </Button>
                  <Switch
                    id="boundarySound"
                    checked={soundSettings.boundary}
                    onCheckedChange={() => updateSoundSetting('boundary')}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="runSound" className="flex flex-col gap-1">
                  <span>Run Sound</span>
                  <span className="text-xs text-muted-foreground">
                    Subtle click for regular runs
                  </span>
                </Label>
                <Switch
                  id="runSound"
                  checked={soundSettings.runs}
                  onCheckedChange={() => updateSoundSetting('runs')}
                />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationSettings;
