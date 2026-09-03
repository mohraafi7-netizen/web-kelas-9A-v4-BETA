'use client';

import * as React from 'react';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { GalaxyButton } from '@/components/ui';
import { SpaceBackground } from '@/components/ui';
import { Send, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface PrivateMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

export default function PrivateChatPage({ params }: { params: Promise<{ userId: string }> }) {
  const { profile } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = React.useState<PrivateMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [otherUserId, setOtherUserId] = React.useState('');
  const [otherUserName, setOtherUserName] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const processedRef = React.useRef<Set<string>>(new Set());
  const realtimeStatusRef = React.useRef<'connecting' | 'connected' | 'failed'>('connecting');

  React.useEffect(() => {
    params.then((resolved) => {
      setOtherUserId(resolved.userId);
    });
  }, [params]);

  React.useEffect(() => {
    if (!otherUserId || !profile?.id) return;

    const supabase = createClientSupabaseBrowser();

    const fetchMessages = async () => {
      try {
        const { data } = await supabase
          .from('private_messages')
          .select('id, sender_id, receiver_id, message, created_at')
          .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${profile.id})`)
          .order('created_at', { ascending: true })
          .limit(100);

        if (data) {
          setMessages(data as PrivateMessage[]);
          (data as PrivateMessage[]).forEach((m) => processedRef.current.add(m.id));
        }
      } catch (error) {
        console.error('[Private Chat Fetch Error]', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchOtherUser = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', otherUserId)
        .single();
      if (data) setOtherUserName(data.name);
    };

    fetchMessages();
    fetchOtherUser();

    const channel = supabase
      .channel(`private-chat-${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `or(and(sender_id.eq.${profile.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${profile.id}))`,
        },
        (payload: { new: PrivateMessage }) => {
          const newMsg = payload.new as PrivateMessage;
          if (processedRef.current.has(newMsg.id)) return;
          processedRef.current.add(newMsg.id);
          setMessages((prev) => [...prev, newMsg]);
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          realtimeStatusRef.current = 'connected';
        } else if (status === 'CHANNEL_ERROR') {
          realtimeStatusRef.current = 'failed';
          console.error('[Private Chat Realtime Error] Subscription failed');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [otherUserId, profile?.id]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !profile || !otherUserId) return;

    const supabase = createClientSupabaseBrowser();
    const { error } = await supabase.from('private_messages').insert({
      sender_id: profile.id,
      receiver_id: otherUserId,
      message: input.trim(),
    });

    if (error) {
      console.error('[Private Chat Send Error]', error);
      return;
    }

    setInput('');
  };

  return (
    <main className="min-h-screen">
      <SpaceBackground particleCount={40} enableParallax={false} />
      <Section title="" subtitle="" className="relative z-10">
        <div className="max-w-3xl mx-auto">
          <GlassCard className="p-6 flex flex-col h-[70vh]">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
              <button
                onClick={() => router.back()}
                className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-galaxy-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white">
                {otherUserName[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-white">{otherUserName || 'Loading...'}</p>
                <p className="text-xs text-slate-400">
                  {realtimeStatusRef.current === 'connected' ? 'Online' : 'Connecting...'}
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse space-y-3 w-full">
                    {Array.from({ length: 2 }).map((_, i) => (
                      <div key={i} className="h-12 bg-slate-700/50 rounded-xl w-3/4" />
                    ))}
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-slate-400">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwn = msg.sender_id === profile?.id;
                  return (
                    <div key={msg.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-galaxy-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {(isOwn ? profile?.name : otherUserName)[0]?.toUpperCase()}
                      </div>
                      <div className={`flex-1 min-w-0 ${isOwn ? 'text-right' : ''}`}>
                        <div className={`inline-block max-w-[80%] ${isOwn ? 'bg-galaxy-600/20 border-galaxy-500/30' : 'bg-white/5 border-white/10'} border rounded-2xl px-4 py-2.5`}>
                          <p className="text-sm text-slate-200 break-words">{msg.message}</p>
                        </div>
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-galaxy-500"
              />
              <GalaxyButton type="submit" disabled={!input.trim()} icon={<Send className="w-4 h-4" />}>
                Send
              </GalaxyButton>
            </form>
          </GlassCard>
        </div>
      </Section>
    </main>
  );
}
