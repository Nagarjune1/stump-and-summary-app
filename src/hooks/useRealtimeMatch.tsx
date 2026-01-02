import { useEffect, useState, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeMatchUpdate {
  type: 'match' | 'ball' | 'stats' | 'partnership';
  data: any;
}

export const useRealtimeMatch = (matchId: string | null, onUpdate?: (update: RealtimeMatchUpdate) => void) => {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const onUpdateRef = useRef(onUpdate);

  // Keep the ref updated with the latest callback
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!matchId) return;

    // Create a channel for this specific match
    const matchChannel = supabase.channel(`match_${matchId}`);

    // Subscribe to match updates
    matchChannel
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`
        },
        (payload) => {
          console.log('Match updated:', payload);
          onUpdateRef.current?.({
            type: 'match',
            data: payload.new
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ball_by_ball',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          console.log('New ball:', payload);
          onUpdateRef.current?.({
            type: 'ball',
            data: payload.new
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'match_stats',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          console.log('Stats updated:', payload);
          onUpdateRef.current?.({
            type: 'stats',
            data: payload.new
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'partnerships',
          filter: `match_id=eq.${matchId}`
        },
        (payload) => {
          console.log('Partnership updated:', payload);
          onUpdateRef.current?.({
            type: 'partnership',
            data: payload.new
          });
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    setChannel(matchChannel);

    return () => {
      console.log('Cleaning up realtime subscription');
      matchChannel.unsubscribe();
    };
  }, [matchId]); // Only depend on matchId, not onUpdate

  return { channel };
};
