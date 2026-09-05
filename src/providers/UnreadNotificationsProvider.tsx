'use client';

import * as React from 'react';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';

type UnreadContextValue = {
  privateUnread: number;
  publicUnread: number;
  totalUnread: number;
  /** Per-conversation unread counts for the inbox UI */
  privateUnreadByUser: Record<string, number>;
  ready: boolean;
  /** Mark all messages from `otherUserId` to current user as read. */
  markConversationRead: (otherUserId: string) => Promise<void>;
  /** Reset the public-chat unread counter (called when /chat opens). */
  markPublicChatRead: () => Promise<void>;
  /**
   * Mark the public chat page as currently active. While active, incoming
   * public messages from other users do NOT increment the badge, and the
   * provider refreshes `user_chat_state.last_seen_at` (debounced) so the
   * counter is consistent if the user navigates away.
   */
  setPublicChatActive: (active: boolean) => void;
};

const UnreadContext = React.createContext<UnreadContextValue | null>(null);

type UnreadNotificationsProviderProps = {
  children: React.ReactNode;
};

export function UnreadNotificationsProvider({ children }: UnreadNotificationsProviderProps) {
  const { profile, user } = useAuth();
  const userId = profile?.id ?? user?.id ?? null;

  const [privateUnread, setPrivateUnread] = React.useState(0);
  const [publicUnread, setPublicUnread] = React.useState(0);
  const [privateUnreadByUser, setPrivateUnreadByUser] = React.useState<Record<string, number>>({});
  const [ready, setReady] = React.useState(false);
  const lastSeenAtRef = React.useRef<string>('1970-01-01T00:00:00Z');
  const channelRef = React.useRef<ReturnType<ReturnType<typeof createClientSupabaseBrowser>['channel']> | null>(null);
  const supabaseRef = React.useRef<ReturnType<typeof createClientSupabaseBrowser> | null>(null);
  const userIdRef = React.useRef<string | null>(null);
  const publicChatActiveRef = React.useRef<boolean>(false);
  const lastSeenUpsertTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastSeenUpsertInFlightRef = React.useRef<boolean>(false);
  // Sliding set of recently-reconciled private_messages row ids (UPDATE / read).
  // We never depend on payload.old.* — Supabase Realtime does not guarantee
  // old-record completeness without REPLICA IDENTITY FULL, which we deliberately
  // do not enable. The set is bounded to avoid unbounded growth.
  const reconciledIdsRef = React.useRef<Set<string>>(new Set());
  const RECONCILED_IDS_MAX = 2000;

  const safeSetPrivate = React.useCallback((updater: (prev: number) => number) => {
    setPrivateUnread((prev) => Math.max(0, updater(prev)));
  }, []);

  const safeSetPublic = React.useCallback((updater: (prev: number) => number) => {
    setPublicUnread((prev) => Math.max(0, updater(prev)));
  }, []);

  const recomputePrivateUnread = React.useCallback(
    async (uid: string) => {
      try {
        const supabase = createClientSupabaseBrowser();
        // Single grouped count. We also select `id` so we can pre-seed the
        // reconciled-ids sliding set, which makes the realtime UPDATE handler
        // idempotent without ever depending on payload.old.
        const { data, error, count } = await supabase
          .from('private_messages')
          .select('id, sender_id', { count: 'exact', head: false })
          .eq('receiver_id', uid)
          .is('read_at', null)
          .is('deleted_at', null)
          .limit(500);
        if (error) return;
        const byUser: Record<string, number> = {};
        let total = 0;
        const set = reconciledIdsRef.current;
        for (const row of (data ?? []) as Array<{ id?: string; sender_id?: string }>) {
          if (row?.id) set.add(row.id);
          if (!row?.sender_id) continue;
          byUser[row.sender_id] = (byUser[row.sender_id] ?? 0) + 1;
          total += 1;
        }
        if (set.size > RECONCILED_IDS_MAX) {
          const arr = Array.from(set);
          const keep = arr.slice(arr.length - Math.floor(RECONCILED_IDS_MAX / 2));
          reconciledIdsRef.current = new Set(keep);
        }
        setPrivateUnreadByUser(byUser);
        setPrivateUnread(typeof count === 'number' ? Math.max(count, total) : total);
      } catch (err) {
        console.warn('[Unread] private recompute failed (non-fatal):', err);
      }
    },
    []
  );

  const recomputePublicUnread = React.useCallback(
    async (uid: string, lastSeenAt: string) => {
      try {
        const supabase = createClientSupabaseBrowser();
        const { count, error } = await supabase
          .from('chat_messages')
          .select('id', { count: 'exact', head: true })
          .gt('created_at', lastSeenAt)
          .neq('user_id', uid)
          .is('deleted_at', null);
        if (error) return;
        setPublicUnread(count ?? 0);
      } catch (err) {
        console.warn('[Unread] public recompute failed (non-fatal):', err);
      }
    },
    []
  );

  React.useEffect(() => {
    if (!userId) {
      setReady(true);
      return;
    }
    userIdRef.current = userId;
    let cancelled = false;
    setReady(false);

    const supabase = createClientSupabaseBrowser();
    supabaseRef.current = supabase;

    (async () => {
      // 1. Read per-user chat state
      try {
        const { data: state } = await supabase
          .from('user_chat_state')
          .select('last_seen_at')
          .eq('user_id', userId)
          .maybeSingle();
        const last = (state as { last_seen_at?: string } | null)?.last_seen_at ?? '1970-01-01T00:00:00Z';
        if (!cancelled) {
          lastSeenAtRef.current = last;
          await recomputePublicUnread(userId, last);
        }
      } catch (err) {
        console.warn('[Unread] read chat state failed (non-fatal):', err);
      }

      // 2. Initial private unread count
      await recomputePrivateUnread(userId);

      if (cancelled) return;

      // 3. Single shared channel: private_messages + chat_messages
      const channelName = `unread-${userId}`;
      if (channelRef.current) {
        try { await supabase.removeChannel(channelRef.current); } catch {}
        channelRef.current = null;
      }

      const channel = supabase
        .channel(channelName, {
          config: { broadcast: { self: false }, presence: { key: userId } },
        })
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'private_messages' },
          (payload: any) => {
            if (cancelled) return;
            const myId = userIdRef.current;
            if (!myId) return;
            if (payload.eventType === 'INSERT') {
              const row = payload.new as { id?: string; sender_id: string; receiver_id: string; read_at: string | null; deleted_at: string | null };
              if (row.receiver_id !== myId) return;
              if (row.read_at) return;
              if (row.deleted_at) return;
              if (row.id) reconciledIdsRef.current.add(row.id);
              setPrivateUnreadByUser((prev) => ({
                ...prev,
                [row.sender_id]: (prev[row.sender_id] ?? 0) + 1,
              }));
              safeSetPrivate((prev) => prev + 1);
            } else if (payload.eventType === 'UPDATE') {
              const row = payload.new as { id?: string; sender_id?: string; receiver_id?: string; read_at?: string | null; deleted_at?: string | null };
              if (row.receiver_id !== myId) return;
              // We deliberately do NOT inspect payload.old: its completeness
              // depends on REPLICA IDENTITY FULL, which is intentionally not
              // enabled. Instead, reconcile idempotently:
              //  - dedupe by row id (sliding set)
              //  - only act when read_at is non-null and deleted_at is null
              //  - only act if the local sender bucket is > 0
              if (!row.id) return;
              if (!row.read_at) return; // not a read transition
              if (row.deleted_at) return;
              if (reconciledIdsRef.current.has(row.id)) return;
              reconciledIdsRef.current.add(row.id);
              if (reconciledIdsRef.current.size > RECONCILED_IDS_MAX) {
                // Slide the window: drop the oldest half.
                const arr = Array.from(reconciledIdsRef.current);
                const keep = arr.slice(arr.length - Math.floor(RECONCILED_IDS_MAX / 2));
                reconciledIdsRef.current = new Set(keep);
              }
              const senderId = row.sender_id;
              if (!senderId) return;
              setPrivateUnreadByUser((prev) => {
                const cur = prev[senderId];
                if (!cur || cur <= 0) return prev;
                const next = Math.max(0, cur - 1);
                const out = { ...prev };
                if (next === 0) delete out[senderId];
                else out[senderId] = next;
                return out;
              });
              safeSetPrivate((prev) => (prev > 0 ? prev - 1 : 0));
            } else if (payload.eventType === 'DELETE') {
              recomputePrivateUnread(myId);
            }
          }
        )
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'chat_messages' },
          (payload: any) => {
            if (cancelled) return;
            const myId = userIdRef.current;
            if (!myId) return;
            const row = payload.new as { user_id: string; created_at: string; deleted_at: string | null };
            if (row.user_id === myId) return; // own messages never count
            if (row.deleted_at) return;
            if (new Date(row.created_at).getTime() <= new Date(lastSeenAtRef.current).getTime()) return;
            if (publicChatActiveRef.current) {
              // User is currently viewing /chat: count as seen and refresh
              // the per-user last_seen cursor (debounced) so the count stays 0
              // even if they navigate away and a new INSERT arrives later.
              scheduleLastSeenUpsert();
              return;
            }
            safeSetPublic((prev) => prev + 1);
          }
        )
        .on(
          'postgres_changes',
          { event: 'UPDATE', schema: 'public', table: 'chat_messages' },
          (payload: any) => {
            if (cancelled) return;
            const myId = userIdRef.current;
            if (!myId) return;
            const row = payload.new as { user_id: string; created_at: string; deleted_at: string | null };
            if (row.deleted_at) {
              // Recompute to stay correct after admin soft-deletes
              recomputePublicUnread(myId, lastSeenAtRef.current);
            }
          }
        )
        .subscribe((status: string) => {
          if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
            console.warn('[Unread] channel error (non-fatal):', status);
          }
        });
      channelRef.current = channel;

      setReady(true);
    })();

    return () => {
      cancelled = true;
      try {
        if (lastSeenUpsertTimerRef.current) {
          clearTimeout(lastSeenUpsertTimerRef.current);
          lastSeenUpsertTimerRef.current = null;
        }
      } catch {}
      publicChatActiveRef.current = false;
      try {
        if (channelRef.current && supabaseRef.current) {
          supabaseRef.current.removeChannel(channelRef.current);
        }
      } catch {}
      channelRef.current = null;
      supabaseRef.current = null;
    };
  }, [userId, recomputePrivateUnread, recomputePublicUnread, safeSetPrivate, safeSetPublic]);

  const markConversationRead = React.useCallback(
    async (otherUserId: string) => {
      const myId = userIdRef.current;
      if (!myId) return;
      try {
        const supabase = createClientSupabaseBrowser();
        const now = new Date().toISOString();
        const { error, data } = await supabase
          .from('private_messages')
          .update({ read_at: now })
          .eq('receiver_id', myId)
          .eq('sender_id', otherUserId)
          .is('read_at', null)
          .is('deleted_at', null)
          .select('id');
        if (error) {
          console.warn('[Unread] markConversationRead failed (non-fatal):', error.message);
          return;
        }
        // Record the row ids we just marked so the realtime UPDATE echo
        // is deduped and does not double-decrement.
        const ids = (data ?? []).map((r: { id: string }) => r.id).filter(Boolean);
        if (ids.length > 0) {
          const set = reconciledIdsRef.current;
          for (const id of ids) set.add(id);
          if (set.size > RECONCILED_IDS_MAX) {
            const arr = Array.from(set);
            const keep = arr.slice(arr.length - Math.floor(RECONCILED_IDS_MAX / 2));
            reconciledIdsRef.current = new Set(keep);
          }
        }
        // Decrement the local bucket by the number of rows we just marked.
        // This is the source of truth; any future realtime UPDATE echoes
        // are idempotent (no-op) because their row ids are already in the
        // reconciled set.
        const removed = ids.length;
        setPrivateUnreadByUser((prev) => {
          if (!prev[otherUserId]) return prev;
          const out = { ...prev };
          delete out[otherUserId];
          return out;
        });
        setPrivateUnread((prev) => (prev > removed ? prev - removed : 0));
      } catch (err) {
        console.warn('[Unread] markConversationRead exception (non-fatal):', err);
      }
    },
    []
  );

  const markPublicChatRead = React.useCallback(async () => {
    const myId = userIdRef.current;
    if (!myId) return;
    try {
      const supabase = createClientSupabaseBrowser();
      const now = new Date().toISOString();
      // upsert
      const { error } = await supabase
        .from('user_chat_state')
        .upsert({ user_id: myId, last_seen_at: now, updated_at: now }, { onConflict: 'user_id' });
      if (error) {
        console.warn('[Unread] markPublicChatRead failed (non-fatal):', error.message);
        return;
      }
      lastSeenAtRef.current = now;
      setPublicUnread(0);
    } catch (err) {
      console.warn('[Unread] markPublicChatRead exception (non-fatal):', err);
    }
  }, []);

  const scheduleLastSeenUpsert = React.useCallback(() => {
    const myId = userIdRef.current;
    if (!myId) return;
    // Debounce: while /chat is open and messages keep arriving, only do
    // at most one upsert every 2 seconds. This avoids hammering the DB.
    if (lastSeenUpsertTimerRef.current) return;
    if (lastSeenUpsertInFlightRef.current) return;
    lastSeenUpsertTimerRef.current = setTimeout(async () => {
      lastSeenUpsertTimerRef.current = null;
      const uid = userIdRef.current;
      if (!uid) return;
      lastSeenUpsertInFlightRef.current = true;
      try {
        const supabase = createClientSupabaseBrowser();
        const now = new Date().toISOString();
        const { error } = await supabase
          .from('user_chat_state')
          .upsert({ user_id: uid, last_seen_at: now, updated_at: now }, { onConflict: 'user_id' });
        if (!error) {
          // Move the local cursor forward so any subsequent message also seen
          // is excluded from the badge.
          lastSeenAtRef.current = now;
        } else {
          console.warn('[Unread] last_seen upsert failed (non-fatal):', error.message);
        }
      } catch (err) {
        console.warn('[Unread] last_seen upsert exception (non-fatal):', err);
      } finally {
        lastSeenUpsertInFlightRef.current = false;
      }
    }, 2000);
  }, []);

  const setPublicChatActive = React.useCallback(
    (active: boolean) => {
      const wasActive = publicChatActiveRef.current;
      publicChatActiveRef.current = active;
      if (active && !wasActive) {
        // Becoming active: clear the badge immediately and bring the cursor
        // up to "now" so any messages already in-flight are excluded.
        const now = new Date().toISOString();
        lastSeenAtRef.current = now;
        setPublicUnread(0);
        // Persist so other devices also see this user as caught up.
        scheduleLastSeenUpsert();
      }
      if (!active && wasActive) {
        // Becoming inactive: flush any pending debounced upsert so we don't
        // leak state. The next incoming message will increment from the
        // last persisted cursor.
        if (lastSeenUpsertTimerRef.current) {
          clearTimeout(lastSeenUpsertTimerRef.current);
          lastSeenUpsertTimerRef.current = null;
        }
        const supabase = createClientSupabaseBrowser();
        const now = new Date().toISOString();
        supabase
          .from('user_chat_state')
          .upsert({ user_id: userIdRef.current, last_seen_at: now, updated_at: now }, { onConflict: 'user_id' })
          .then(({ error }: { error: { message: string } | null }) => {
            if (error) {
              console.warn('[Unread] flush last_seen failed (non-fatal):', error.message);
              return;
            }
            lastSeenAtRef.current = now;
          })
          .catch((err: unknown) => console.warn('[Unread] flush last_seen exception (non-fatal):', err));
      }
    },
    [scheduleLastSeenUpsert]
  );

  const value = React.useMemo<UnreadContextValue>(
    () => ({
      privateUnread,
      publicUnread,
      totalUnread: privateUnread + publicUnread,
      privateUnreadByUser,
      ready,
      markConversationRead,
      markPublicChatRead,
      setPublicChatActive,
    }),
    [privateUnread, publicUnread, privateUnreadByUser, ready, markConversationRead, markPublicChatRead, setPublicChatActive]
  );

  return <UnreadContext.Provider value={value}>{children}</UnreadContext.Provider>;
}

export function useUnread(): UnreadContextValue {
  const ctx = React.useContext(UnreadContext);
  if (ctx) return ctx;
  return {
    privateUnread: 0,
    publicUnread: 0,
    totalUnread: 0,
    privateUnreadByUser: {},
    ready: false,
    markConversationRead: async () => {},
    markPublicChatRead: async () => {},
    setPublicChatActive: () => {},
  };
}
