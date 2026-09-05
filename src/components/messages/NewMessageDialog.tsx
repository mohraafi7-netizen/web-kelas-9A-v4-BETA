'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Shield, User as UserIcon } from 'lucide-react';
import type { Profile } from '@/types';
import { cn } from '@/lib/utils';

type MemberLite = { id: string; name: string; role?: string | null; photo_path?: string | null; photo_url?: string | null };

type NewMessageDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (userId: string) => void;
  excludeUserId?: string;
};

function roleBadge(role?: string | null) {
  if (role === 'main_admin') return { label: 'Main Admin', className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' };
  if (role === 'admin') return { label: 'Admin', className: 'bg-galaxy-500/15 text-galaxy-300 border-galaxy-500/30' };
  return null;
}

export function NewMessageDialog({ open, onClose, onSelect, excludeUserId }: NewMessageDialogProps) {
  const [mounted, setMounted] = React.useState(false);
  const [members, setMembers] = React.useState<MemberLite[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);
  const channelRef = React.useRef<ReturnType<ReturnType<typeof import('@/lib/supabase/client').createClientSupabaseBrowser>['channel']> | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!open) {
      setQuery('');
      return;
    }
    const id = window.setTimeout(() => inputRef.current?.focus(), 80);
    return () => window.clearTimeout(id);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);

    const fetchMembers = async () => {
      const { createClientSupabaseBrowser } = await import('@/lib/supabase/client');
      const supabase = createClientSupabaseBrowser();
      const { data } = await supabase
        .from('profiles')
        .select('id, name, role, photo_path, photo_url')
        .order('name', { ascending: true })
        .limit(200);
      if (cancelled) return;
      const filtered = ((data ?? []) as MemberLite[]).filter((m) => m.id !== excludeUserId);
      setMembers(filtered);
      setLoading(false);
    };

    fetchMembers();

    return () => {
      cancelled = true;
    };
  }, [open, excludeUserId]);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    (async () => {
      const { createClientSupabaseBrowser } = await import('@/lib/supabase/client');
      const supabase = createClientSupabaseBrowser();
      if (channelRef.current) {
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
      const channel = supabase
        .channel(`new-message-picker-${excludeUserId ?? 'anon'}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'profiles' },
          () => {
            if (cancelled) return;
            supabase
              .from('profiles')
              .select('id, name, role, photo_path, photo_url')
              .order('name', { ascending: true })
              .limit(200)
              .then(({ data }: { data: MemberLite[] | null }) => {
                if (cancelled) return;
                const filtered = (data ?? []).filter((m) => m.id !== excludeUserId);
                setMembers(filtered);
              });
          }
        )
        .subscribe();
      channelRef.current = channel;
    })();
    return () => {
      cancelled = true;
      (async () => {
        const { createClientSupabaseBrowser } = await import('@/lib/supabase/client');
        const supabase = createClientSupabaseBrowser();
        if (channelRef.current) {
          await supabase.removeChannel(channelRef.current);
          channelRef.current = null;
        }
      })();
    };
  }, [open, excludeUserId]);

  React.useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return members;
    return members.filter((m) => m.name.toLowerCase().includes(q));
  }, [members, query]);

  const dialog = (
    <AnimatePresence>
      {open && (
        <motion.div
          key="newmsg-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="newmsg-title"
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
          <motion.div
            key="newmsg-panel"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={cn(
              'relative w-full sm:max-w-md',
              'glass-strong border border-white/10 shadow-2xl',
              'rounded-t-3xl sm:rounded-2xl',
              'flex flex-col',
              'max-h-[100dvh] sm:max-h-[85dvh]'
            )}
          >
            <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-3 border-b border-white/10">
              <h2 id="newmsg-title" className="text-base sm:text-lg font-semibold text-white">
                Start a conversation
              </h2>
              <button
                onClick={onClose}
                className="p-2 -mr-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 sm:px-6 pt-3 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search members..."
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-galaxy-500 min-h-[44px]"
                />
              </div>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-2 sm:px-3 pb-3">
              {loading ? (
                <div className="space-y-2 px-1 sm:px-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <div className="w-10 h-10 rounded-full bg-slate-700/50 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3.5 bg-slate-700/50 rounded w-1/3 animate-pulse" />
                        <div className="h-3 bg-slate-700/50 rounded w-1/2 animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length === 0 ? (
                <div className="px-6 py-12 text-center text-slate-400 text-sm">
                  {query.trim() ? 'No members match your search.' : 'No members available.'}
                </div>
              ) : (
                <ul className="space-y-1">
                  {filtered.map((m) => {
                    const badge = roleBadge(m.role);
                    return (
                      <li key={m.id}>
                        <button
                          type="button"
                          onClick={() => onSelect(m.id)}
                          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 active:bg-white/10 transition-colors text-left min-h-[56px]"
                        >
                          {m.photo_url || m.photo_path ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={m.photo_url ?? ''}
                              alt={m.name}
                              className="w-10 h-10 rounded-full object-cover shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-galaxy-600 to-purple-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                              {m.name?.[0]?.toUpperCase() ?? <UserIcon className="w-4 h-4" />}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-white truncate">{m.name}</p>
                            {badge && (
                              <span
                                className={cn(
                                  'inline-flex items-center gap-1 mt-0.5 text-[10px] px-1.5 py-0.5 rounded border',
                                  badge.className
                                )}
                              >
                                <Shield className="w-2.5 h-2.5" />
                                {badge.label}
                              </span>
                            )}
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(dialog, document.body);
}
