'use client';

import * as React from 'react';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { GalaxyButton } from '@/components/ui';
import { PageHeader } from '@/components/ui';
import { ErrorCard } from '@/components/ui';
import { SpaceBackground } from '@/components/ui';
import { Search, Plus, MessageCircle, Inbox } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { NewMessageDialog } from '@/components/messages/NewMessageDialog';

type ProfileMeta = { name: string; photo_path: string | null; photo_url: string | null };

type Conversation = {
  userId: string;
  name: string;
  photo_path: string | null;
  photo_url: string | null;
  lastMessage: string;
  lastMessageAt: string;
  lastSenderId: string;
  unread: boolean;
};

function formatRelative(ts: string) {
  const date = new Date(ts);
  const now = new Date();
  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();
  if (sameDay) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();
  if (isYesterday) return 'Yesterday';
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

function sortConversations(list: Conversation[]) {
  return [...list].sort(
    (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
  );
}

export default function MessagesPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [profileNames, setProfileNames] = React.useState<Record<string, ProfileMeta>>({});
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [realtimeStatus, setRealtimeStatus] = React.useState<'connecting' | 'connected' | 'failed'>('connecting');
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const channelRef = React.useRef<ReturnType<ReturnType<typeof createClientSupabaseBrowser>['channel']> | null>(null);

  const mergeProfileMeta = React.useCallback((meta: Record<string, ProfileMeta>) => {
    setProfileNames((prev) => {
      let changed = false;
      const next: Record<string, ProfileMeta> = { ...prev };
      for (const [id, m] of Object.entries(meta)) {
        const cur = next[id];
        if (!cur || cur.name !== m.name || cur.photo_path !== m.photo_path || cur.photo_url !== m.photo_url) {
          next[id] = m;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, []);

  const applyConversationsFromMessages = React.useCallback(
    (rows: Array<{ id: string; sender_id: string; receiver_id: string; message: string; created_at: string; deleted_at: string | null }>) => {
      if (!profile?.id) return;
      const map = new Map<string, Conversation>();
      const otherIds: string[] = [];
      for (const row of rows) {
        if (row.deleted_at) continue;
        const otherId = row.sender_id === profile.id ? row.receiver_id : row.sender_id;
        if (!map.has(otherId)) {
          otherIds.push(otherId);
          const meta = profileNames[otherId];
          map.set(otherId, {
            userId: otherId,
            name: meta?.name ?? 'Unknown member',
            photo_path: meta?.photo_path ?? null,
            photo_url: meta?.photo_url ?? null,
            lastMessage: row.message,
            lastMessageAt: row.created_at,
            lastSenderId: row.sender_id,
            unread: false,
          });
        }
      }
      return { map, otherIds };
    },
    [profile?.id, profileNames]
  );

  const fetchConversations = React.useCallback(
    async (opts: { silent?: boolean } = {}) => {
      if (!profile?.id) {
        setInitialLoading(false);
        return;
      }
      const silent = !!opts.silent;
      if (!silent) setInitialLoading(true);
      else setRefreshing(true);
      setError(null);

      const supabase = createClientSupabaseBrowser();
      const { data, error: fetchError } = await supabase
        .from('private_messages')
        .select('id, sender_id, receiver_id, message, created_at, deleted_at')
        .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(200);

      if (fetchError) {
        console.error('[MESSAGES INBOX FETCH ERROR]', {
          message: fetchError.message,
          code: fetchError.code,
          details: fetchError.details,
          hint: fetchError.hint,
        });
        setError(fetchError.message || 'Failed to load conversations.');
        setInitialLoading(false);
        setRefreshing(false);
        return;
      }

      const rows = (data ?? []) as Array<{
        id: string;
        sender_id: string;
        receiver_id: string;
        message: string;
        created_at: string;
        deleted_at: string | null;
      }>;

      const result = applyConversationsFromMessages(rows);
      if (!result) {
        setInitialLoading(false);
        setRefreshing(false);
        return;
      }
      const { map, otherIds } = result;

      if (otherIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, name, photo_path, photo_url')
          .in('id', otherIds);
        if (profilesData) {
          const newMeta: Record<string, ProfileMeta> = {};
          for (const p of profilesData as Array<{ id: string; name: string; photo_path: string | null; photo_url: string | null }>) {
            newMeta[p.id] = { name: p.name, photo_path: p.photo_path, photo_url: p.photo_url };
            const conv = map.get(p.id);
            if (conv) {
              conv.name = p.name;
              conv.photo_path = p.photo_path;
              conv.photo_url = p.photo_url;
            }
          }
          mergeProfileMeta(newMeta);
        }
      }

      setConversations((prev) => {
        const byId = new Map(prev.map((c) => [c.userId, c]));
        for (const [id, conv] of map.entries()) {
          const old = byId.get(id);
          byId.set(id, {
            ...conv,
            unread: old?.unread ?? conv.unread,
          });
        }
        return sortConversations(Array.from(byId.values()));
      });

      setInitialLoading(false);
      setRefreshing(false);
    },
    [profile?.id, applyConversationsFromMessages, mergeProfileMeta]
  );

  React.useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  const upsertConversation = React.useCallback(
    (row: { sender_id: string; receiver_id: string; message: string; created_at: string; id?: string; deleted_at?: string | null }) => {
      if (!profile?.id) return;
      if (row.deleted_at) return;
      const otherId = row.sender_id === profile.id ? row.receiver_id : row.sender_id;
      if (otherId === profile.id) return;
      const isFromOther = row.sender_id !== profile.id;
      setConversations((prev) => {
        const existing = prev.find((c) => c.userId === otherId);
        const meta = profileNames[otherId];
        const conv: Conversation = {
          userId: otherId,
          name: meta?.name ?? existing?.name ?? 'Unknown member',
          photo_path: meta?.photo_path ?? existing?.photo_path ?? null,
          photo_url: meta?.photo_url ?? existing?.photo_url ?? null,
          lastMessage: row.message,
          lastMessageAt: row.created_at,
          lastSenderId: row.sender_id,
          unread: isFromOther ? true : (existing?.unread ?? false),
        };
        const filtered = prev.filter((c) => c.userId !== otherId);
        return [conv, ...filtered];
      });
    },
    [profile?.id, profileNames]
  );

  React.useEffect(() => {
    if (!profile?.id) return;
    const supabase = createClientSupabaseBrowser();
    const channelName = `messages-inbox-${profile.id}`;
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    const channel = supabase
      .channel(channelName, { config: { broadcast: { self: false }, presence: { key: profile.id } } })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'private_messages' },
        async (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const newRow = payload.new as any;
            const otherId =
              newRow.sender_id === profile.id ? newRow.receiver_id : newRow.sender_id;
            if (otherId === profile.id) return;
            if (!profileNames[otherId]) {
              const { data: prof } = await supabase
                .from('profiles')
                .select('id, name, photo_path, photo_url')
                .eq('id', otherId)
                .maybeSingle();
              if (prof) {
                mergeProfileMeta({
                  [otherId]: { name: prof.name, photo_path: prof.photo_path, photo_url: prof.photo_url },
                });
              }
            }
            upsertConversation(newRow);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            if (updated.deleted_at) return;
            upsertConversation(updated);
          } else if (payload.eventType === 'DELETE') {
            fetchConversations({ silent: true });
          }
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') setRealtimeStatus('connected');
        else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') setRealtimeStatus('failed');
      });
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [profile?.id, profileNames, upsertConversation, fetchConversations, mergeProfileMeta]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.name.toLowerCase().includes(q));
  }, [conversations, search]);

  const openConversation = (id: string) => {
    setConversations((prev) => prev.map((c) => (c.userId === id ? { ...c, unread: false } : c)));
    router.push(`/messages/${id}`);
  };

  const showInitialSkeleton = initialLoading && conversations.length === 0;
  const showError = !initialLoading && !!error && conversations.length === 0;
  const showEmpty = !initialLoading && !error && conversations.length === 0;

  return (
    <main className="min-h-screen pb-24 md:pb-12">
      <SpaceBackground particleCount={40} enableParallax={false} />
      <Section className="relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-0">
          <PageHeader
            eyebrow="Private"
            title="Messages"
            description="Your private conversations."
            actions={
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-galaxy-600 to-purple-600 hover:from-galaxy-500 hover:to-purple-500 text-white text-sm font-medium shadow-lg transition-colors min-h-[44px] shrink-0"
                aria-label="Start a new conversation"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">New Message</span>
              </button>
            }
          />

          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-galaxy-500 min-h-[44px]"
            />
          </div>

          <div className="flex items-center gap-2 mb-3 text-xs text-slate-500" aria-live="polite">
            <span
              className={
                realtimeStatus === 'connected'
                  ? 'w-1.5 h-1.5 rounded-full bg-emerald-400'
                  : realtimeStatus === 'failed'
                  ? 'w-1.5 h-1.5 rounded-full bg-red-400'
                  : 'w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse'
              }
            />
            {realtimeStatus === 'connected'
              ? 'Live'
              : realtimeStatus === 'failed'
              ? 'Disconnected'
              : 'Connecting…'}
            {refreshing && <span className="text-slate-600">• refreshing</span>}
          </div>

          {showInitialSkeleton ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="glass rounded-2xl border border-white/10 p-3 sm:p-4 flex items-center gap-3 sm:gap-4 min-h-[64px] animate-pulse"
                >
                  <div className="w-12 h-12 rounded-full bg-slate-700/50 shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="h-3.5 bg-slate-700/50 rounded w-1/3" />
                    <div className="h-3 bg-slate-700/50 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : showError ? (
            <ErrorCard message={error} onRetry={() => fetchConversations()} />
          ) : showEmpty ? (
            <EmptyState
              icon={<Inbox className="w-6 h-6" />}
              title="No messages yet"
              description="Start your first private conversation with a class member."
              action={
                <GalaxyButton
                  icon={<MessageCircle className="w-4 h-4" />}
                  onClick={() => setPickerOpen(true)}
                >
                  Start a conversation
                </GalaxyButton>
              }
            />
          ) : (
            <div className="space-y-2">
              {filtered.map((conv) => {
                const initials = (conv.name?.[0] ?? '?').toUpperCase();
                const isFromOther = conv.lastSenderId !== profile?.id;
                return (
                  <button
                    key={conv.userId}
                    type="button"
                    onClick={() => openConversation(conv.userId)}
                    className="w-full text-left"
                  >
                    <GlassCard
                      hover
                      className={`p-3 sm:p-4 flex items-center gap-3 sm:gap-4 cursor-pointer min-h-[64px] ${
                        conv.unread ? 'bg-galaxy-500/[0.04] border-galaxy-500/20' : ''
                      }`}
                    >
                      <div className="relative shrink-0">
                        {conv.photo_url || conv.photo_path ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={conv.photo_url ?? ''}
                            alt={conv.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-galaxy-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                            {initials}
                          </div>
                        )}
                        {conv.unread && (
                          <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-galaxy-400 ring-2 ring-slate-900" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p
                            className={`truncate ${
                              conv.unread ? 'font-semibold text-white' : 'font-medium text-white'
                            }`}
                          >
                            {conv.name}
                          </p>
                          <span className="text-[11px] text-slate-500 shrink-0">
                            {formatRelative(conv.lastMessageAt)}
                          </span>
                        </div>
                        <p
                          className={`text-sm truncate ${
                            conv.unread ? 'text-slate-200' : 'text-slate-400'
                          }`}
                        >
                          {isFromOther ? '' : <span className="text-slate-500">You: </span>}
                          {conv.lastMessage}
                        </p>
                      </div>
                    </GlassCard>
                  </button>
                );
              })}
              {filtered.length === 0 && search.trim() && (
                <div className="text-center text-slate-500 text-sm py-8">
                  No conversations match &ldquo;{search}&rdquo;
                </div>
              )}
            </div>
          )}
        </div>
      </Section>

      <NewMessageDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        excludeUserId={profile?.id}
        onSelect={(userId) => {
          setPickerOpen(false);
          router.push(`/messages/${userId}`);
        }}
      />
    </main>
  );
}
