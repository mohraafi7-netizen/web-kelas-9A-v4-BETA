'use client';

import * as React from 'react';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { GalaxyButton } from '@/components/ui';
import { SpaceBackground } from '@/components/ui';
import { Mail, Search, Plus, MessageCircle } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { NewMessageDialog } from '@/components/messages/NewMessageDialog';

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

export default function MessagesPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [realtimeStatus, setRealtimeStatus] = React.useState<'connecting' | 'connected' | 'failed'>('connecting');
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [profileNames, setProfileNames] = React.useState<Record<string, { name: string; photo_path: string | null; photo_url: string | null }>>({});
  const channelRef = React.useRef<ReturnType<ReturnType<typeof createClientSupabaseBrowser>['channel']> | null>(null);

  const upsertConversation = React.useCallback(
    (row: { sender_id: string; receiver_id: string; message: string; created_at: string; id?: string; deleted_at?: string | null }) => {
      if (!profile?.id) return;
      if (row.sender_id !== profile.id && row.receiver_id !== profile.id) return;
      if (row.deleted_at) return;
      const otherId = row.sender_id === profile.id ? row.receiver_id : row.sender_id;
      const isFromOther = row.sender_id !== profile.id;

      setConversations((prev) => {
        const existing = prev.find((c) => c.userId === otherId);
        const meta = profileNames[otherId];
        const conv: Conversation = {
          userId: otherId,
          name: meta?.name ?? existing?.name ?? 'Loading…',
          photo_path: meta?.photo_path ?? existing?.photo_path ?? null,
          photo_url: meta?.photo_url ?? existing?.photo_url ?? null,
          lastMessage: row.message,
          lastMessageAt: row.created_at,
          lastSenderId: row.sender_id,
          unread: isFromOther ? true : (existing?.unread ?? false),
        };
        const filtered = prev.filter((c) => c.userId !== otherId);
        return [conv, ...filtered].sort(
          (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        );
      });
    },
    [profile?.id, profileNames]
  );

  const fetchConversations = React.useCallback(async () => {
    if (!profile?.id) return;
    const supabase = createClientSupabaseBrowser();
    const { data, error } = await supabase
      .from('private_messages')
      .select('id, sender_id, receiver_id, message, created_at, deleted_at')
      .or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`)
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      console.error('[MESSAGES INBOX FETCH ERROR]', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      setLoading(false);
      return;
    }

    const map = new Map<string, Conversation>();
    const otherIds: string[] = [];
    for (const row of (data ?? []) as Array<{
      id: string;
      sender_id: string;
      receiver_id: string;
      message: string;
      created_at: string;
      deleted_at: string | null;
    }>) {
      if (row.deleted_at) continue;
      const otherId = row.sender_id === profile.id ? row.receiver_id : row.sender_id;
      if (!map.has(otherId)) {
        otherIds.push(otherId);
        map.set(otherId, {
          userId: otherId,
          name: profileNames[otherId]?.name ?? 'Loading…',
          photo_path: profileNames[otherId]?.photo_path ?? null,
          photo_url: profileNames[otherId]?.photo_url ?? null,
          lastMessage: row.message,
          lastMessageAt: row.created_at,
          lastSenderId: row.sender_id,
          unread: false,
        });
      }
    }

    if (otherIds.length > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name, photo_path, photo_url')
        .in('id', otherIds);
      if (profilesData) {
        const newNames: Record<string, { name: string; photo_path: string | null; photo_url: string | null }> = { ...profileNames };
        for (const p of profilesData as Array<{ id: string; name: string; photo_path: string | null; photo_url: string | null }>) {
          newNames[p.id] = { name: p.name, photo_path: p.photo_path, photo_url: p.photo_url };
          const conv = map.get(p.id);
          if (conv) {
            conv.name = p.name;
            conv.photo_path = p.photo_path;
            conv.photo_url = p.photo_url;
          }
        }
        setProfileNames(newNames);
      }
    }

    setConversations(Array.from(map.values()).sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
    ));
    setLoading(false);
  }, [profile?.id, profileNames]);

  React.useEffect(() => {
    if (!profile?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetchConversations();
  }, [profile?.id, fetchConversations]);

  React.useEffect(() => {
    if (!profile?.id) return;
    const supabase = createClientSupabaseBrowser();
    const channelName = `messages-inbox-${profile.id}`;
    const channel = supabase
      .channel(channelName, { config: { broadcast: { self: false }, presence: { key: profile.id } } })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'private_messages' },
        async (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const newRow = payload.new as any;
            const isMine = newRow.sender_id === profile.id && newRow.receiver_id === profile.id;
            if (isMine) return;
            const otherId = newRow.sender_id === profile.id ? newRow.receiver_id : newRow.sender_id;
            if (!profileNames[otherId]) {
              const { data: prof } = await supabase
                .from('profiles')
                .select('id, name, photo_path, photo_url')
                .eq('id', otherId)
                .maybeSingle();
              if (prof) {
                setProfileNames((prev) => ({ ...prev, [otherId]: { name: prof.name, photo_path: prof.photo_path, photo_url: prof.photo_url } }));
              }
            }
            upsertConversation(newRow);
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            if (updated.deleted_at) return;
            upsertConversation(updated);
          } else if (payload.eventType === 'DELETE') {
            fetchConversations();
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
  }, [profile?.id, profileNames, upsertConversation, fetchConversations]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.name.toLowerCase().includes(q));
  }, [conversations, search]);

  const openConversation = (id: string) => {
    setConversations((prev) => prev.map((c) => (c.userId === id ? { ...c, unread: false } : c)));
    router.push(`/messages/${id}`);
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <SpaceBackground particleCount={40} enableParallax={false} />
        <Section title="Messages" subtitle="Your private conversations." className="relative z-10">
          <div className="max-w-3xl mx-auto space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <GlassCard key={i} className="p-4">
                <div className="animate-pulse flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-700/50" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-700/50 rounded w-1/3" />
                    <div className="h-3 bg-slate-700/50 rounded w-1/2" />
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        </Section>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <SpaceBackground particleCount={40} enableParallax={false} />
      <Section title="Messages" subtitle="Your private conversations." className="relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-galaxy-500 min-h-[44px]"
              />
            </div>
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-galaxy-600 to-purple-600 hover:from-galaxy-500 hover:to-purple-500 text-white text-sm font-medium shadow-lg transition-colors min-h-[44px] shrink-0"
              aria-label="Start a new conversation"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Message</span>
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
            <span
              className={
                realtimeStatus === 'connected'
                  ? 'w-1.5 h-1.5 rounded-full bg-emerald-400'
                  : realtimeStatus === 'failed'
                  ? 'w-1.5 h-1.5 rounded-full bg-red-400'
                  : 'w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse'
              }
            />
            {realtimeStatus === 'connected' ? 'Live' : realtimeStatus === 'failed' ? 'Disconnected' : 'Connecting…'}
          </div>

          {filtered.length === 0 ? (
            <EmptyState
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
                    <GlassCard hover className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 cursor-pointer min-h-[64px]">
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
                          <span className="absolute top-0 right-0 w-3 h-3 rounded-full bg-galaxy-400 ring-2 ring-slate-900" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className={`truncate ${conv.unread ? 'font-semibold text-white' : 'font-medium text-white'}`}>
                            {conv.name}
                          </p>
                          <span className="text-[11px] text-slate-500 shrink-0">{formatRelative(conv.lastMessageAt)}</span>
                        </div>
                        <p className={`text-sm truncate ${conv.unread ? 'text-slate-200' : 'text-slate-400'}`}>
                          {isFromOther ? '' : <span className="text-slate-500">You: </span>}
                          {conv.lastMessage}
                        </p>
                      </div>
                    </GlassCard>
                  </button>
                );
              })}
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
