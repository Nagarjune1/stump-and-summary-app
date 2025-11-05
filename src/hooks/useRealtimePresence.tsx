import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface PresenceUser {
  user_id: string;
  user_name: string;
  role: 'scorer' | 'viewer';
  online_at: string;
}

export const useRealtimePresence = (matchId: string | null, currentUser: PresenceUser | null) => {
  const [presenceUsers, setPresenceUsers] = useState<PresenceUser[]>([]);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!matchId || !currentUser) return;

    const presenceChannel = supabase.channel(`match_presence_${matchId}`, {
      config: {
        presence: {
          key: currentUser.user_id,
        },
      },
    });

    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const users = Object.values(state)
          .flat()
          .map((presence: any) => presence as PresenceUser);
        setPresenceUsers(users);
        console.log('Presence synced:', users);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await presenceChannel.track(currentUser);
          console.log('Presence tracked:', currentUser);
        }
      });

    setChannel(presenceChannel);

    return () => {
      presenceChannel.unsubscribe();
    };
  }, [matchId, currentUser]);

  return { presenceUsers, channel };
};
