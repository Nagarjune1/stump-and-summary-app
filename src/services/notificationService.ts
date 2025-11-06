import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { toast } from '@/hooks/use-toast';

export interface Milestone {
  type: 'century' | 'half_century' | 'hat_trick' | 'five_wickets' | 'match_result' | 'boundary_storm';
  player: string;
  details: string;
  matchId: string;
}

class NotificationService {
  private isInitialized = false;
  private isNative = Capacitor.isNativePlatform();

  async initialize() {
    if (this.isInitialized) return;

    if (this.isNative) {
      await this.initializeNative();
    } else {
      await this.initializeWeb();
    }

    this.isInitialized = true;
  }

  private async initializeNative() {
    try {
      // Request permission
      let permStatus = await PushNotifications.checkPermissions();

      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        return;
      }

      // Register with push notification services
      await PushNotifications.register();

      // Listen for registration
      await PushNotifications.addListener('registration', (token) => {
        // TODO: Store token in backend with proper user authentication
        // Create device_tokens table with RLS policies
        // Call edge function to securely store token
      });

      // Listen for registration errors (only log in development)
      await PushNotifications.addListener('registrationError', (error) => {
        if (import.meta.env.DEV) {
          console.error('Push registration error:', error);
        }
      });

      // Show notifications when app is open
      await PushNotifications.addListener('pushNotificationReceived', (notification) => {
        toast({
          title: notification.title || 'Match Update',
          description: notification.body || '',
          duration: 5000,
        });
      });

      // Handle notification tap
      await PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        const matchId = notification.notification.data?.matchId;
        if (matchId) {
          window.location.hash = `#/scoring?match=${matchId}`;
        }
      });

    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error initializing native push notifications:', error);
      }
    }
  }

  private async initializeWeb() {
    try {
      // Check if browser supports notifications
      if (!('Notification' in window)) {
        return;
      }

      // Request permission
      if (Notification.permission === 'default') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          return;
        }
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error initializing web notifications:', error);
      }
    }
  }

  async sendLocalNotification(milestone: Milestone) {
    const title = this.getMilestoneTitle(milestone);
    const body = `${milestone.player} - ${milestone.details}`;

    if (this.isNative) {
      // For native, use local notifications
      await PushNotifications.createChannel({
        id: 'cricket_milestones',
        name: 'Cricket Milestones',
        description: 'Notifications for cricket match milestones',
        importance: 5,
        visibility: 1,
        sound: 'default',
        vibration: true,
      });

      // Note: Local notifications require additional setup
      // You might want to use @capacitor/local-notifications plugin
      toast({
        title,
        description: body,
        duration: 5000,
      });
    } else {
      // For web, use browser notifications
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: milestone.matchId,
          requireInteraction: true,
          data: {
            matchId: milestone.matchId,
          },
        });
      }

      // Also show toast in app
      toast({
        title,
        description: body,
        duration: 5000,
      });
    }
  }

  private getMilestoneTitle(milestone: Milestone): string {
    switch (milestone.type) {
      case 'century':
        return '🏏 CENTURY! 💯';
      case 'half_century':
        return '🏏 Half Century! 50';
      case 'hat_trick':
        return '🎩 HAT-TRICK! 🎯';
      case 'five_wickets':
        return '🎯 5 Wickets! 🔥';
      case 'match_result':
        return '🏆 Match Result';
      case 'boundary_storm':
        return '💥 Boundary Storm!';
      default:
        return '🏏 Match Update';
    }
  }

  detectMilestone(
    player: any,
    matchId: string,
    previousScore?: any
  ): Milestone | null {
    // Detect century
    if (player.runs >= 100 && (!previousScore || previousScore.runs < 100)) {
      return {
        type: 'century',
        player: player.name,
        details: `Scored a magnificent century! ${player.runs}(${player.balls})`,
        matchId,
      };
    }

    // Detect half-century
    if (player.runs >= 50 && player.runs < 100 && (!previousScore || previousScore.runs < 50)) {
      return {
        type: 'half_century',
        player: player.name,
        details: `Reached half-century! ${player.runs}(${player.balls})`,
        matchId,
      };
    }

    // Detect 5 wickets
    if (player.wickets >= 5 && (!previousScore || previousScore.wickets < 5)) {
      return {
        type: 'five_wickets',
        player: player.name,
        details: `5-wicket haul! ${player.wickets}/${player.runs_conceded}`,
        matchId,
      };
    }

    return null;
  }

  detectHatTrick(recentWickets: any[]): Milestone | null {
    // Check if last 3 consecutive balls were wickets by same bowler
    if (recentWickets.length >= 3) {
      const lastThree = recentWickets.slice(-3);
      const sameBowler = lastThree.every(w => w.bowler_id === lastThree[0].bowler_id);
      const consecutive = this.areConsecutiveBalls(lastThree);

      if (sameBowler && consecutive) {
        return {
          type: 'hat_trick',
          player: lastThree[0].bowler_name,
          details: 'Hat-trick! 3 wickets in 3 consecutive balls!',
          matchId: lastThree[0].match_id,
        };
      }
    }

    return null;
  }

  private areConsecutiveBalls(wickets: any[]): boolean {
    // Check if balls are consecutive (considering overs)
    for (let i = 1; i < wickets.length; i++) {
      const prev = wickets[i - 1];
      const curr = wickets[i];

      if (curr.over_number === prev.over_number) {
        if (curr.ball_number !== prev.ball_number + 1) return false;
      } else if (curr.over_number === prev.over_number + 1) {
        if (prev.ball_number !== 5 || curr.ball_number !== 0) return false;
      } else {
        return false;
      }
    }
    return true;
  }

  async requestPermission(): Promise<boolean> {
    if (this.isNative) {
      const permStatus = await PushNotifications.requestPermissions();
      return permStatus.receive === 'granted';
    } else {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      }
      return false;
    }
  }

  getPermissionStatus(): string {
    if (this.isNative) {
      return 'unknown'; // Check async
    } else {
      return Notification?.permission || 'unsupported';
    }
  }
}

export const notificationService = new NotificationService();
