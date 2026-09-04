'use client';

import * as React from 'react';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

export function usePresence() {
  const { profile } = useAuth();
  const [onlineUsers, setOnlineUsers] = React.useState<Set<string>>(new Set());
  const channelRef = React.useRef<ReturnType<typeof createClientSupabaseBrowser>['channel'] | null>(null);

  React.useEffect(() => {
    if (!profile?.id) return;

    const supabase = createClientSupabaseBrowser();
    const channel = supabase
      .channel(`presence-${profile.id}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const online = new Set<string>();
        Object.values(state).forEach((presences: any) => {
          presences.forEach((p: any) => {
            if (p.user_id && p.user_id !== profile.id) {
              online.add(p.user_id);
            }
          });
        });
        setOnlineUsers(online);
      })
      .subscribe(async (status: string) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: profile.id, online_at: new Date().toISOString() });
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        channelRef.current.untrack();
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [profile?.id]);

  const updateLastSeen = React.useCallback(async () => {
    if (!profile?.id) return;
    const supabase = createClientSupabaseBrowser();
    await supabase
      .from('profiles')
      .update({ last_seen: new Date().toISOString() })
      .eq('id', profile.id);
  }, [profile?.id]);

  React.useEffect(() => {
    const interval = setInterval(updateLastSeen, 30000);
    return () => clearInterval(interval);
  }, [updateLastSeen]);

  const isOnline = (userId: string) => onlineUsers.has(userId);

  return { isOnline, onlineUsers };
}
