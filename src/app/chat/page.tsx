'use client';

import * as React from 'react';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { GalaxyButton } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { PageHeader } from '@/components/ui';
import { MessageCircle, Send, Users, Smile, Reply, Edit3, Trash2, Pin, ChevronDown } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { useToast } from '@/components/ui';
import { ChatReactions } from '@/components/chat/ChatReactions';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatMessage, Reaction } from '@/types';
import { isValidUuid, isTemporaryMessage } from '@/lib/utils/uuid';
import { useUnread } from '@/providers/UnreadNotificationsProvider';

type MessageWithMeta = {
  id: string;
  user_id: string;
  username: string;
  message: string;
  message_type: string;
  reply_to_id: string | null;
  edited_at: string | null;
  pinned: boolean;
  deleted_at: string | null;
  created_at: string;
  reactions?: Reaction[];
  reply_to?: { username: string; message: string } | null;
};

type DateGroup = {
  date: string;
  messages: MessageWithMeta[];
};

function DateSeparator({ date }: { date: string }) {
  const d = new Date(date + 'T00:00:00');
  const label = d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="flex-1 h-px bg-white/5" />
      <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-px bg-white/5" />
    </div>
  );
}

function ChatMessageComponent({ msg, isOwn, canDelete, onReply, onEdit, onDelete, onToggleReaction }: { msg: MessageWithMeta; isOwn: boolean; canDelete: boolean; onReply: () => void; onEdit: () => void; onDelete: () => void; onToggleReaction: (messageId: string, emoji: string) => void }) {
  const [showActions, setShowActions] = React.useState(false);

  const isDeleted = !!msg.deleted_at;

  return (
    <div className={`group flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-galaxy-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
        {msg.username[0]?.toUpperCase()}
      </div>
      <div className={`flex-1 min-w-0 ${isOwn ? 'text-right' : ''}`}>
        <div className={`inline-block max-w-[85%] ${isOwn ? 'bg-galaxy-600/20 border-galaxy-500/30' : 'bg-white/5 border-white/10'} border rounded-2xl px-4 py-2.5`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-white truncate">{msg.username}</span>
            <span className="text-[10px] text-slate-500">
              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              {msg.edited_at && ' (edited)'}
            </span>
            {msg.pinned && <Pin className="w-3 h-3 text-galaxy-400" />}
          </div>
          {msg.reply_to && !isDeleted && (
            <div className="text-xs text-slate-400 mb-1 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
              <span className="text-slate-300">{msg.reply_to.username}</span>: {msg.reply_to.message}
            </div>
          )}
          {isDeleted ? (
            <p className="text-sm text-slate-500 italic">Pesan telah dihapus</p>
          ) : (
            <p className="text-sm text-slate-200 break-words">{msg.message}</p>
          )}
          {!isDeleted && msg.reactions && msg.reactions.length > 0 && (
            <ChatReactions messageId={msg.id} reactions={msg.reactions} onToggleReaction={onToggleReaction} />
          )}
        </div>
        {!isDeleted && (
          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''} opacity-0 group-hover:opacity-100 transition-opacity`}>
            <button onClick={onReply} className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-white" title="Reply">
              <Reply className="w-3 h-3" />
            </button>
            {isOwn && (
              <>
                <button onClick={onEdit} className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-white" title="Edit">
                  <Edit3 className="w-3 h-3" />
                </button>
                <button onClick={onDelete} className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-red-400" title="Delete">
                  <Trash2 className="w-3 h-3" />
                </button>
              </>
            )}
            {canDelete && !isOwn && (
              <button onClick={onDelete} className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-red-400" title="Delete message">
                <Trash2 className="w-3 h-3" />
              </button>
            )}
            <button onClick={() => onToggleReaction(msg.id, '👍')} className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-white" title="React">
              <Smile className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const { markPublicChatRead, setPublicChatActive } = useUnread();
  React.useEffect(() => {
    if (profile?.id) {
      markPublicChatRead();
    }
  }, [profile?.id, markPublicChatRead]);
  React.useEffect(() => {
    if (!profile?.id) return;
    setPublicChatActive(true);
    return () => setPublicChatActive(false);
  }, [profile?.id, setPublicChatActive]);
  const [messages, setMessages] = React.useState<MessageWithMeta[]>([]);
  const [input, setInput] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ open: boolean; id: string; loading: boolean }>({ open: false, id: '', loading: false });
type ReplyTo = { id: string; username: string; message: string } | null;
  const [replyTo, setReplyTo] = React.useState<ReplyTo>(null);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const processedRef = React.useRef<Set<string>>(new Set());
  const [realtimeStatus, setRealtimeStatus] = React.useState<'connecting' | 'connected' | 'failed'>('connecting');
  const fallbackIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const currentMessageIdsRef = React.useRef<Set<string>>(new Set());
  const scrollRafRef = React.useRef<number | null>(null);
  const channelRef = React.useRef<ReturnType<ReturnType<typeof createClientSupabaseBrowser>['channel']> | null>(null);
  const [showScrollButton, setShowScrollButton] = React.useState(false);
  const chatContainerRef = React.useRef<HTMLDivElement>(null);

  const scrollToBottom = React.useCallback((behavior: 'smooth' | 'auto' = 'smooth') => {
    if (scrollRafRef.current) return;
    scrollRafRef.current = requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior });
      scrollRafRef.current = null;
    });
  }, []);

  React.useEffect(() => {
    scrollToBottom('auto');
  }, []);

  React.useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length, scrollToBottom]);

  const handleScroll = React.useCallback(() => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    setShowScrollButton(scrollHeight - scrollTop - clientHeight > 200);
  }, []);

  const loadMessages = React.useCallback(async () => {
    if (!profile) return;
    const supabase = createClientSupabaseBrowser();
    // Fetch the newest messages first so the most recent send is always
    // included after navigation. The merge below re-sorts ascending for
    // rendering.
    const { data } = await supabase
      .from('chat_messages')
      .select('id, user_id, username, message, message_type, reply_to_id, edited_at, pinned, deleted_at, created_at')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(50);

    if (data) {
      setMessages((prev) => {
        const byId = new Map<string, MessageWithMeta>();
        for (const m of prev) byId.set(m.id, m);
        for (const msg of data as any[]) {
          const existing = byId.get(msg.id);
          byId.set(msg.id, {
            id: msg.id,
            user_id: msg.user_id,
            username: msg.username,
            message: msg.message,
            message_type: msg.message_type,
            reply_to_id: msg.reply_to_id,
            edited_at: msg.edited_at,
            pinned: msg.pinned,
            deleted_at: msg.deleted_at,
            created_at: msg.created_at,
            reactions: existing?.reactions ?? [],
            reply_to: msg.reply_to_id
              ? (existing?.reply_to ?? { username: msg.username, message: msg.message })
              : null,
          });
        }
        const merged = Array.from(byId.values()).sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
        for (const m of merged) processedRef.current.add(m.id);
        currentMessageIdsRef.current = new Set(merged.map((m) => m.id));
        return merged;
      });
    }
  }, [profile]);

  React.useEffect(() => {
    if (!profile) return;
    loadMessages();

    const supabase = createClientSupabaseBrowser();
    const channelName = `chat-messages-${profile.id}`;
    const channel = supabase
      .channel(channelName, { config: { broadcast: { self: false }, presence: { key: profile.id } } })
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
        },
        async (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const newMsg = payload.new as any;
            if (processedRef.current.has(newMsg.id)) return;
            if (newMsg.deleted_at) return;

            processedRef.current.add(newMsg.id);
            currentMessageIdsRef.current.add(newMsg.id);

            const { data: reactions } = await supabase
              .from('reactions')
              .select('*')
              .eq('message_id', newMsg.id);

            setMessages((prev) => {
              if (prev.some((m) => m.id === newMsg.id)) return prev;
              const replyTo = newMsg.reply_to_id
                ? prev.find((m) => m.id === newMsg.reply_to_id)
                : null;
              return [...prev, {
                id: newMsg.id,
                user_id: newMsg.user_id,
                username: newMsg.username,
                message: newMsg.message,
                message_type: newMsg.message_type,
                reply_to_id: newMsg.reply_to_id,
                edited_at: newMsg.edited_at,
                pinned: newMsg.pinned,
                deleted_at: newMsg.deleted_at,
                created_at: newMsg.created_at,
                reactions: reactions ?? [],
                reply_to: replyTo
                  ? { id: replyTo.id, username: replyTo.username, message: replyTo.message }
                  : null,
              }];
            });
          } else if (payload.eventType === 'UPDATE') {
            const updated = payload.new as any;
            const { data: reactions } = await supabase
              .from('reactions')
              .select('*')
              .eq('message_id', updated.id);

            setMessages((prev) => prev.map((m) => m.id === updated.id ? {
              ...m,
              message: updated.message ?? m.message,
              edited_at: updated.edited_at ?? m.edited_at,
              pinned: updated.pinned ?? m.pinned,
              deleted_at: updated.deleted_at ?? m.deleted_at,
              reactions: reactions ?? m.reactions,
            } : m));
          } else if (payload.eventType === 'DELETE') {
            const oldMsg = payload.old as any;
            if (!oldMsg?.id) return;
            setMessages((prev) => prev.filter((m) => m.id !== oldMsg.id));
            processedRef.current.delete(oldMsg.id);
            currentMessageIdsRef.current.delete(oldMsg.id);
          }
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeStatus('connected');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setRealtimeStatus('failed');
        }
      });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      setRealtimeStatus('connecting');
    };
  }, [loadMessages, profile]);

  React.useEffect(() => {
    if (realtimeStatus !== 'failed') {
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }
      return;
    }
    fallbackIntervalRef.current = setInterval(() => {
      loadMessages();
    }, 15000);
    return () => {
      if (fallbackIntervalRef.current) {
        clearInterval(fallbackIntervalRef.current);
        fallbackIntervalRef.current = null;
      }
    };
  }, [realtimeStatus, loadMessages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && !replyTo) || !profile || sending) return;

    setSending(true);
    const supabase = createClientSupabaseBrowser();

    try {
      if (editingId) {
        if (isTemporaryMessage(editingId)) {
          showToast('error', 'Please wait for the message to save');
          setSending(false);
          return;
        }

        const { error } = await supabase
          .from('chat_messages')
          .update({ message: input.trim(), edited_at: new Date().toISOString() })
          .eq('id', editingId)
          .eq('user_id', profile.id);

        if (error) throw error;
        setEditingId(null);
        setInput('');
        setReplyTo(null);
        return;
      }

      const tempId = `temp-${Date.now()}`;
      const optimisticMessage: MessageWithMeta = {
        id: tempId,
        user_id: profile.id,
        username: profile.name,
        message: input.trim(),
        message_type: 'text',
        reply_to_id: replyTo ? (isTemporaryMessage(replyTo.id) ? null : replyTo.id) : null,
        edited_at: null,
        pinned: false,
        deleted_at: null,
        created_at: new Date().toISOString(),
        reactions: [],
        reply_to: replyTo ? { username: replyTo.username, message: replyTo.message } : null,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      processedRef.current.add(tempId);
      setInput('');
      setReplyTo(null);

      const { data: inserted, error } = await supabase
        .from('chat_messages')
        .insert({
          user_id: profile.id,
          username: profile.name,
          message: optimisticMessage.message,
          message_type: 'text',
          reply_to_id: optimisticMessage.reply_to_id,
        })
        .select()
        .single();

      if (error) {
        console.error('[CHAT SEND ERROR]', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        showToast('error', 'Failed to send message');
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
        processedRef.current.delete(tempId);
        return;
      }

      if (inserted && isValidUuid(inserted.id)) {
        processedRef.current.delete(tempId);
        setMessages((prev) => prev.map((m) => m.id === tempId ? { ...optimisticMessage, ...(inserted as any), id: (inserted as any).id } : m));
      }
    } catch (err) {
      console.error('[CHAT SEND EXCEPTION]', err);
      showToast('error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const requestDelete = (id: string) => {
    if (isTemporaryMessage(id)) {
      showToast('error', 'Please wait for the message to save before deleting');
      return;
    }
    setDeleteConfirm({ open: true, id, loading: false });
  };

  const cancelDelete = () => {
    if (deleteConfirm.loading) return;
    setDeleteConfirm({ open: false, id: '', loading: false });
  };

  const confirmDelete = async () => {
    const { id } = deleteConfirm;
    setDeleteConfirm((prev) => ({ ...prev, loading: true }));
    const supabase = createClientSupabaseBrowser();
    const msg = messages.find((m) => m.id === id);
    const isAdmin = profile?.role === 'admin' || profile?.role === 'main_admin';
    const canDelete = msg ? (msg.user_id === profile?.id || isAdmin) : false;

    if (!canDelete) {
      showToast('error', 'You can only delete your own messages');
      setDeleteConfirm({ open: false, id: '', loading: false });
      return;
    }

    const { error } = await supabase
      .from('chat_messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[CHAT DELETE ERROR]', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      showToast('error', 'Gagal menghapus pesan');
    } else {
      setMessages((prev) => prev.map((m) => m.id === id ? { ...m, deleted_at: new Date().toISOString() } : m));
      showToast('success', 'Pesan berhasil dihapus');
    }
    setDeleteConfirm({ open: false, id: '', loading: false });
  };

  const handleEdit = (msg: MessageWithMeta) => {
    if (isTemporaryMessage(msg.id)) {
      showToast('error', 'Please wait for the message to save before editing');
      return;
    }
    setEditingId(msg.id);
    setInput(msg.message);
    setReplyTo(msg.reply_to ? { ...msg.reply_to, id: msg.id } : null);
  };

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    if (isTemporaryMessage(messageId)) {
      showToast('error', 'Please wait for the message to save before reacting');
      return;
    }
    if (!profile) return;
    const supabase = createClientSupabaseBrowser();

    const { data: existing } = await supabase
      .from('reactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', profile.id)
      .eq('emoji', emoji)
      .maybeSingle();

    if (existing) {
      await supabase.from('reactions').delete().eq('id', existing.id);
    } else {
      await supabase.from('reactions').insert({ message_id: messageId, user_id: profile.id, emoji });
    }
  };

  const handleReply = (msg: MessageWithMeta) => {
    setReplyTo({ id: msg.id, username: msg.username, message: msg.message });
    setEditingId(null);
  };

  const groupedMessages = React.useMemo<DateGroup[]>(() => {
    const groups: DateGroup[] = [];
    messages.forEach((msg) => {
      const date = new Date(msg.created_at).toISOString().split('T')[0];
      const existing = groups.find((g) => g.date === date);
      if (existing) {
        existing.messages.push(msg);
      } else {
        groups.push({ date, messages: [msg] });
      }
    });
    return groups;
  }, [messages]);

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <Section className="relative z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-0">
          <PageHeader
            eyebrow="Public"
            title="Class Chat"
            description="Chat and discussions with your class."
          />
          <GlassCard className="p-4 sm:p-6 flex flex-col h-[70dvh] sm:h-[70vh]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="text-xs text-slate-400 inline-flex items-center gap-1.5">
                  <span
                    className={
                      realtimeStatus === 'connected'
                        ? 'w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse'
                        : realtimeStatus === 'failed'
                        ? 'w-1.5 h-1.5 rounded-full bg-red-400'
                        : 'w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse'
                    }
                  />
                  {realtimeStatus === 'connected' ? 'Live' : realtimeStatus === 'failed' ? 'Disconnected' : 'Connecting...'}
                </span>
              </div>
              {replyTo && (
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Reply className="w-3 h-3" />
                  Replying to {replyTo.username}
                  <button onClick={() => setReplyTo(null)} className="text-slate-500 hover:text-white">
                    <ChevronDown className="w-3 h-3 rotate-180" />
                  </button>
                </div>
              )}
            </div>

            <div ref={chatContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <EmptyState
                    title="No messages yet"
                    description="Start the conversation!"
                    action={<MessageCircle className="w-12 h-12 text-galaxy-400" />}
                  />
                </div>
              ) : (
                groupedMessages.map((group) => (
                  <div key={group.date}>
                    <DateSeparator date={group.date} />
                    {group.messages.map((msg) => {
                      const isAdmin = profile?.role === 'admin' || profile?.role === 'main_admin';
                      const canDelete = isAdmin || msg.user_id === profile?.id;
                      return (
                        <ChatMessageComponent
                          key={msg.id}
                          msg={msg}
                          isOwn={profile ? msg.username === profile.name : false}
                          canDelete={canDelete}
                          onReply={() => handleReply(msg)}
                          onEdit={() => handleEdit(msg)}
                          onDelete={() => requestDelete(msg.id)}
                          onToggleReaction={handleToggleReaction}
                        />
                      );
                    })}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {showScrollButton && (
              <button
                onClick={() => scrollToBottom()}
                className="absolute bottom-24 right-8 p-2 rounded-full glass border border-white/10 text-slate-400 hover:text-white shadow-lg"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            )}

            <form onSubmit={handleSend} className="flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-galaxy-500"
              />
              <GalaxyButton type="submit" disabled={!input.trim() && !replyTo} icon={<Send className="w-4 h-4" />}>
                {sending ? 'Sending...' : editingId ? 'Update' : 'Send'}
              </GalaxyButton>
            </form>
          </GlassCard>
        </div>
      </Section>

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Hapus Pesan?"
        description="Pesan ini akan dihapus dari percakapan."
        confirmLabel="Hapus Pesan"
        cancelLabel="Batal"
        loading={deleteConfirm.loading}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </main>
  );
}
