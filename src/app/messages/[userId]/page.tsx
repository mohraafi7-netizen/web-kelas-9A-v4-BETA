'use client';

import * as React from 'react';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { GalaxyButton } from '@/components/ui';
import { SpaceBackground } from '@/components/ui';
import { Send, ArrowLeft, Reply, Edit3, Trash2, Smile, ChevronDown } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui';
import { ChatReactions } from '@/components/chat/ChatReactions';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { PrivateMessage, Reaction } from '@/types';
import { isValidUuid, isTemporaryMessage } from '@/lib/utils/uuid';

type PrivateMessageWithMeta = {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  message_type: string;
  reply_to_id: string | null;
  edited_at: string | null;
  deleted_at: string | null;
  created_at: string;
  reactions?: Reaction[];
  reply_to?: { username: string; message: string } | null;
};

export default function PrivateChatPage({ params }: { params: Promise<{ userId: string }> }) {
  const { profile } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const [messages, setMessages] = React.useState<PrivateMessageWithMeta[]>([]);
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [sending, setSending] = React.useState(false);
  const [otherUserId, setOtherUserId] = React.useState('');
  const [otherUserName, setOtherUserName] = React.useState('');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ open: boolean; id: string; loading: boolean }>({ open: false, id: '', loading: false });
type PrivateReplyTo = { id: string; sender_id: string; username: string; message: string } | null;
  const [replyTo, setReplyTo] = React.useState<PrivateReplyTo>(null);
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
          .select('id, sender_id, receiver_id, message, message_type, reply_to_id, edited_at, deleted_at, created_at')
          .or(`and(sender_id.eq.${profile.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${profile.id})`)
          .is('deleted_at', null)
          .order('created_at', { ascending: true })
          .limit(100);

        if (data) {
          const mapped: PrivateMessageWithMeta[] = (data as any[]).map((msg) => ({
            ...msg,
            reactions: [],
          }));
          setMessages(mapped);
          mapped.forEach((m) => processedRef.current.add(m.id));
        }
      } catch (error) {
        console.error('[Private Chat Fetch Error]', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchOtherUser = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('name')
          .eq('id', otherUserId)
          .single();
        if (data) setOtherUserName(data.name);
      } catch (error) {
        console.error('[Private Chat User Fetch Error]', error);
      }
    };

    fetchMessages();
    fetchOtherUser();

    const channel = supabase
      .channel(`private-chat-${otherUserId}-upgraded`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `or(and(sender_id.eq.${profile.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${profile.id}))`,
        },
        async (payload: { new: any }) => {
          const newMsg = payload.new as any;
          if (processedRef.current.has(newMsg.id)) return;
          if (newMsg.deleted_at) return;

          processedRef.current.add(newMsg.id);
          setMessages((prev) => {
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return [...prev, { ...newMsg, reactions: [] }];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'private_messages',
        },
        (payload: { new: any }) => {
          const updated = payload.new as any;
          if (updated.deleted_at) {
            setMessages((prev) => prev.map((m) => m.id === updated.id ? { ...m, deleted_at: updated.deleted_at } : m));
            return;
          }
          setMessages((prev) => prev.map((m) => m.id === updated.id ? { ...m, ...updated } : m));
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          realtimeStatusRef.current = 'connected';
        } else if (status === 'CHANNEL_ERROR') {
          realtimeStatusRef.current = 'failed';
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
    if ((!input.trim() && !replyTo) || !profile || !otherUserId || sending) return;

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
          .from('private_messages')
          .update({ message: input.trim(), edited_at: new Date().toISOString() })
          .eq('id', editingId)
          .eq('sender_id', profile.id);

        if (error) throw error;
        setMessages((prev) => prev.map((m) => m.id === editingId ? { ...m, message: input.trim(), edited_at: new Date().toISOString() } : m));
        setEditingId(null);
        setInput('');
        setReplyTo(null);
        return;
      }

      const tempId = `temp-${Date.now()}`;
      const safeReplyId = replyTo && isValidUuid(replyTo.id) ? replyTo.id : null;
      const optimisticMessage: PrivateMessageWithMeta = {
        id: tempId,
        sender_id: profile.id,
        receiver_id: otherUserId,
        message: input.trim(),
        message_type: 'text',
        reply_to_id: safeReplyId,
        edited_at: null,
        deleted_at: null,
        created_at: new Date().toISOString(),
        reactions: [],
        reply_to: replyTo ? { username: replyTo.sender_id === profile.id ? 'You' : otherUserName, message: replyTo.message } : null,
      };

      setMessages((prev) => [...prev, optimisticMessage]);
      processedRef.current.add(tempId);
      setInput('');
      setReplyTo(null);

      const { data: inserted, error } = await supabase
        .from('private_messages')
        .insert({
          sender_id: profile.id,
          receiver_id: otherUserId,
          message: optimisticMessage.message,
          message_type: 'text',
          reply_to_id: safeReplyId,
        })
        .select()
        .single();

      if (error) {
        console.error('[Private Chat Send Error]', {
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
      console.error('[Private Chat Send Exception]', err);
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
    const canDelete = msg ? (msg.sender_id === profile?.id || isAdmin) : false;

    if (!canDelete) {
      showToast('error', 'You can only delete your own messages');
      setDeleteConfirm({ open: false, id: '', loading: false });
      return;
    }

    const { error } = await supabase
      .from('private_messages')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('[PRIVATE CHAT DELETE ERROR]', {
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

  const handleEdit = (msg: PrivateMessageWithMeta) => {
    if (isTemporaryMessage(msg.id)) {
      showToast('error', 'Please wait for the message to save before editing');
      return;
    }
    setEditingId(msg.id);
    setInput(msg.message);
    setReplyTo(msg.reply_to ? { id: msg.id, sender_id: msg.sender_id, username: msg.reply_to.username, message: msg.reply_to.message } : null);
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

  return (
    <main className="min-h-screen">
      <SpaceBackground particleCount={40} enableParallax={false } />
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
                  const isAdmin = profile?.role === 'admin' || profile?.role === 'main_admin';
                  const canDelete = isAdmin || msg.sender_id === profile?.id;
                  const isDeleted = !!msg.deleted_at;
                  const isPending = isTemporaryMessage(msg.id);

                  return (
                    <div key={msg.id} className={`group flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-galaxy-600 to-purple-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                        {(isOwn ? profile?.name : otherUserName)[0]?.toUpperCase()}
                      </div>
                      <div className={`flex-1 min-w-0 ${isOwn ? 'text-right' : ''}`}>
                        <div className={`inline-block max-w-[85%] ${isOwn ? 'bg-galaxy-600/20 border-galaxy-500/30' : 'bg-white/5 border-white/10'} border rounded-2xl px-4 py-2.5`}>
                          {msg.reply_to && !isDeleted && !isPending && (
                            <div className="text-xs text-slate-400 mb-1 px-2 py-1 rounded-lg bg-white/5 border border-white/5">
                              <span className="text-slate-300">{msg.reply_to.username}</span>: {msg.reply_to.message}
                            </div>
                          )}
                          {isDeleted ? (
                            <p className="text-sm text-slate-500 italic">Pesan telah dihapus</p>
                          ) : (
                            <>
                              <p className="text-sm text-slate-200 break-words">{msg.message}</p>
                              {msg.reactions && msg.reactions.length > 0 && (
                                <ChatReactions messageId={msg.id} reactions={msg.reactions} onToggleReaction={handleToggleReaction} />
                              )}
                            </>
                          )}
                        </div>
                        {!isDeleted && !isPending && (
                          <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''} opacity-0 group-hover:opacity-100 transition-opacity`}>
                            <button onClick={() => setReplyTo({ id: msg.id, sender_id: msg.sender_id, username: msg.sender_id === profile!.id ? 'You' : otherUserName, message: msg.message })} className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-white" title="Reply">
                              <Reply className="w-3 h-3" />
                            </button>
                            {isOwn && (
                              <>
                                <button onClick={() => handleEdit(msg)} className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-white" title="Edit">
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button onClick={() => requestDelete(msg.id)} className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-red-400" title="Delete">
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </>
                            )}
                            {canDelete && !isOwn && (
                              <button onClick={() => requestDelete(msg.id)} className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-red-400" title="Delete message">
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                            <button onClick={() => handleToggleReaction(msg.id, '👍')} className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-white" title="React">
                              <Smile className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                        {isPending && (
                          <span className="text-[10px] text-slate-500 mt-1 block italic">Sending...</span>
                        )}
                        <span className="text-[10px] text-slate-500 mt-1 block">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {msg.edited_at && ' (edited)'}
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
