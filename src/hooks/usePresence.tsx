'use client';

import * as React from 'react';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';

type PresenceMap = Record<string, { online_at: string }>;

type PresenceContextValue = {
  onlineUsers: Set<string>;
  isOnline: (userId: string) => boolean;
};

const PresenceContext = React.createContext<PresenceContextValue | null>(null);

type PresenceProviderProps = {
  children: React.ReactNode;
};

export function PresenceProvider({ children }: PresenceProviderProps) {
  const [onlineUsers, setOnlineUsers] = React.useState<Set<string>>(() => new Set());
  const channelRef = React.useRef<ReturnType<ReturnType<typeof createClientSupabaseBrowser>['channel']> | null>(null);
  const supabaseRef = React.useRef<ReturnType<typeof createClientSupabaseBrowser> | null>(null);
  const [ready, setReady] = React.useState(false);
  const userIdRef = React.useRef<string | null>(null);
  const setupErrorRef = React.useRef<boolean>(false);

  const handleSync = React.useCallback((channel: ReturnType<ReturnType<typeof createClientSupabaseBrowser>['channel']>) => {
    try {
      const state = channel.presenceState() as Record<string, PresenceMap[]>;
      const next = new Set<string>();
      for (const presences of Object.values(state)) {
        for (const p of presences) {
          const uid = (p as any)?.user_id;
          if (uid && uid !== userIdRef.current) {
            next.add(uid);
          }
        }
      }
      setOnlineUsers(next);
    } catch (err) {
      console.warn('[Presence] sync handler failed:', err);
    }
  }, []);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const init = async () => {
      try {
        const supabase = createClientSupabaseBrowser();
        supabaseRef.current = supabase;
        const { data: userData } = await supabase.auth.getUser();
        const userId = userData?.user?.id ?? null;
        if (!userId) {
          setReady(true);
          return;
        }
        userIdRef.current = userId;

        const channelName = `presence-${userId}`;
        const channel = supabase.channel(channelName, {
          config: { presence: { key: userId } },
        });

        channel
          .on('presence', { event: 'sync' }, () => handleSync(channel))
          .on('presence', { event: 'join' }, () => handleSync(channel))
          .on('presence', { event: 'leave' }, () => handleSync(channel))
          .subscribe(async (status: string) => {
            if (status === 'SUBSCRIBED') {
              try {
                await channel.track({
                  user_id: userId,
                  online_at: new Date().toISOString(),
                });
              } catch (err) {
                console.warn('[Presence] track failed:', err);
              }
            }
          });

        channelRef.current = channel;
        setReady(true);
      } catch (err) {
        console.warn('[Presence] setup failed (non-fatal):', err);
        setupErrorRef.current = true;
        setReady(true);
      }
    };

    init();

    return () => {
      try {
        if (channelRef.current && supabaseRef.current) {
          try { channelRef.current.untrack(); } catch {}
          supabaseRef.current.removeChannel(channelRef.current);
        }
      } catch (err) {
        console.warn('[Presence] cleanup error (non-fatal):', err);
      } finally {
        channelRef.current = null;
        supabaseRef.current = null;
        userIdRef.current = null;
      }
    };
  }, [handleSync]);

  const isOnline = React.useCallback((userId: string) => onlineUsers.has(userId), [onlineUsers]);

  const value = React.useMemo<PresenceContextValue>(
    () => ({ onlineUsers, isOnline }),
    [onlineUsers, isOnline]
  );

  return <PresenceContext.Provider value={value}>{children}</PresenceContext.Provider>;
}

export function usePresence(): PresenceContextValue {
  const ctx = React.useContext(PresenceContext);
  const fallbackOnline = React.useMemo(() => new Set<string>(), []);
  if (ctx) return ctx;
  return { onlineUsers: fallbackOnline, isOnline: () => false };
}
