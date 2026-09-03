'use client';

import * as React from 'react';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { GalaxyButton } from '@/components/ui';
import { SpaceBackground } from '@/components/ui';
import { Mail, Search } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
}

export default function MessagesPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    const supabase = createClientSupabaseBrowser();
    const fetchConversations = async () => {
      try {
        const { data } = await supabase
          .from('private_messages')
          .select('sender_id, receiver_id, message, created_at')
          .or(`sender_id.eq.${profile?.id},receiver_id.eq.${profile?.id}`)
          .order('created_at', { ascending: false });

        if (!data) {
          setConversations([]);
          return;
        }

        const convMap = new Map<string, { id: string; name: string; lastMessage: string; time: string }>();

        for (const msg of data) {
          const otherId = msg.sender_id === profile?.id ? msg.receiver_id : msg.sender_id;
          if (!convMap.has(otherId)) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', otherId)
              .single();

            convMap.set(otherId, {
              id: otherId,
              name: profileData?.name ?? 'Unknown',
              lastMessage: msg.message,
              time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            });
          }
        }

        setConversations(Array.from(convMap.values()));
      } catch (error) {
        console.error('[Messages List Error]', error);
      } finally {
        setLoading(false);
      }
    };

    if (profile?.id) {
      fetchConversations();
    }
  }, [profile?.id]);

  const filtered = conversations.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <main className="min-h-screen">
        <Section title="Messages" subtitle="Your private conversations.">
          <div className="max-w-3xl mx-auto space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <GlassCard key={i} className="p-4">
                <div className="animate-pulse flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-700/50" />
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
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-galaxy-500"
            />
          </div>

          {filtered.length === 0 ? (
            <EmptyState
              title="No messages yet"
              description="Start a conversation from the Members page."
              action={<Mail className="w-12 h-12 text-galaxy-400" />}
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((conv) => (
                <Link key={conv.id} href={`/messages/${conv.id}`}>
                  <GlassCard hover className="p-4 flex items-center gap-4 cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-galaxy-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                      {conv.name[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{conv.name}</p>
                      <p className="text-sm text-slate-400 truncate">{conv.lastMessage}</p>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">{conv.time}</span>
                  </GlassCard>
                </Link>
              ))}
            </div>
          )}
        </div>
      </Section>
    </main>
  );
}
