'use client';

import * as React from 'react';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { GalaxyButton } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { MessageCircle, Send, Users } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { useToast } from '@/components/ui';

function ChatMessage({ username, message, time, isOwn }: { username: string; message: string; time: string; isOwn: boolean }) {
  return (
    <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-galaxy-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
        {username[0]?.toUpperCase()}
      </div>
      <div className={`flex-1 min-w-0 ${isOwn ? 'text-right' : ''}`}>
        <div className={`inline-block max-w-[80%] ${isOwn ? 'bg-galaxy-600/20 border-galaxy-500/30' : 'bg-white/5 border-white/10'} border rounded-2xl px-4 py-2.5`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-white truncate">{username}</span>
            <span className="text-[10px] text-slate-500">{time}</span>
          </div>
          <p className="text-sm text-slate-200 break-words">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [messages, setMessages] = React.useState<Array<{ id: string; username: string; message: string; time: string }>>([]);
  const [input, setInput] = React.useState('');
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const processedRef = React.useRef<Set<string>>(new Set());
  const realtimeStatusRef = React.useRef<'connecting' | 'connected' | 'failed'>('connecting');
  const fallbackIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  React.useEffect(() => {
    const supabase = createClientSupabaseBrowser();

    const fetchMessages = async () => {
      try {
        const { data } = await supabase
          .from('chat_messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(100);

        if (data) {
          const mapped = data.map((msg) => ({
            id: msg.id,
            username: msg.username,
            message: msg.message,
            time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));
          setMessages(mapped);
          mapped.forEach((m) => processedRef.current.add(m.id));
        }
      } catch (error) {
        console.error('[CHAT FETCH ERROR]', error);
      }
    };

    fetchMessages();

    const channel = supabase
      .channel('chat-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
        },
        (payload) => {
          const newMsg = payload.new as { id: string; username: string; message: string; created_at: string };
          if (processedRef.current.has(newMsg.id)) return;

          processedRef.current.add(newMsg.id);
          setMessages((prev) => [
            ...prev,
            {
              id: newMsg.id,
              username: newMsg.username,
              message: newMsg.message,
              time: new Date(newMsg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ]);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          realtimeStatusRef.current = 'connected';
        } else if (status === 'CHANNEL_ERROR') {
          realtimeStatusRef.current = 'failed';
          console.error('[CHAT REALTIME ERROR] Subscription failed');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  React.useEffect(() => {
    if (realtimeStatusRef.current === 'failed') {
      fallbackIntervalRef.current = setInterval(() => {
        const supabase = createClientSupabaseBrowser();
        supabase
          .from('chat_messages')
          .select('*')
          .order('created_at', { ascending: true })
          .limit(100)
          .then(({ data }) => {
            if (data) {
              const mapped = data.map((msg) => ({
                id: msg.id,
                username: msg.username,
                message: msg.message,
                time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }));
              const currentIds = new Set(messages.map((m) => m.id));
              const newMessages = mapped.filter((m) => !currentIds.has(m.id));
              if (newMessages.length > 0) {
                setMessages((prev) => {
                  const updated = [...prev, ...newMessages];
                  newMessages.forEach((m) => processedRef.current.add(m.id));
                  return updated;
                });
              }
            }
          });
      }, 3000);
    }

    return () => {
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }
    };
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !profile) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage = {
      id: tempId,
      username: profile.name,
      message: input.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInput('');

    const supabase = createClientSupabaseBrowser();
    const { error } = await supabase.from('chat_messages').insert({
      user_id: profile.id,
      username: profile.name,
      message: optimisticMessage.message,
    });

    if (error) {
      console.error('[CHAT SEND ERROR]', error);
      showToast('error', 'Failed to send message');
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    }
  };

  return (
    <main className="min-h-screen">
      <Section title="CLASS CHAT" subtitle="Chat and discussions with your class.">
        <div className="max-w-3xl mx-auto">
          <GlassCard className="p-6 flex flex-col h-[60vh]">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-400">
                Realtime: {realtimeStatusRef.current === 'connected' ? 'Connected' : realtimeStatusRef.current === 'failed' ? 'Disconnected (fallback active)' : 'Connecting...'}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <EmptyState
                    title="No messages yet"
                    description="Start the conversation!"
                    action={<MessageCircle className="w-12 h-12 text-galaxy-400" />}
                  />
                </div>
              ) : (
                messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    {...msg}
                    isOwn={profile ? msg.username === profile.name : false}
                  />
                ))
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
