'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Users, Calendar, ClipboardList, Megaphone, FolderOpen, Vote } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GlassCard } from '@/components/ui';

type SearchResults = {
  members: Array<{ id: string; name: string; role: string }>;
  schedule: Array<{ id: string; subject: string; teacher: string }>;
  tasks: Array<{ id: string; title: string; status: string }>;
  announcements: Array<{ id: string; title: string }>;
  projects: Array<{ id: string; title: string }>;
  polls: Array<{ id: string; title: string }>;
};

const sectionConfig: Record<keyof SearchResults, { icon: any; label: string; href: (id: string) => string }> = {
  members: { icon: Users, label: 'Members', href: (id) => `/members` },
  schedule: { icon: Calendar, label: 'Schedule', href: () => `/schedule` },
  tasks: { icon: ClipboardList, label: 'Tasks', href: (id) => `/tasks` },
  announcements: { icon: Megaphone, label: 'Announcements', href: (id) => `/announcements` },
  projects: { icon: FolderOpen, label: 'Projects', href: (id) => `/projects` },
  polls: { icon: Vote, label: 'Polls', href: (id) => `/polls` },
};

function GlobalSearch() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<SearchResults>({
    members: [],
    schedule: [],
    tasks: [],
    announcements: [],
    projects: [],
    polls: [],
  });
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const router = useRouter();
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults({
        members: [],
        schedule: [],
        tasks: [],
        announcements: [],
        projects: [],
        polls: [],
      });
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || {});
        }
      } catch (error) {
        console.error('[SEARCH FETCH ERROR]', error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-slate-400 text-sm hover:text-white transition-colors"
      >
        <Search className="w-4 h-4" />
        <span>Search...</span>
        <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-slate-500">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-start justify-center pt-[15vh] px-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="relative w-full max-w-xl glass-strong rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search Galaxy Class..."
                  className="flex-1 bg-transparent text-white placeholder-slate-500 focus:outline-none text-sm"
                />
                <button onClick={() => setIsOpen(false)} className="p-1 rounded-lg hover:bg-white/5 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="max-h-[60vh] overflow-y-auto p-2">
                {loading && (
                  <div className="py-8 text-center text-sm text-slate-400">Searching...</div>
                )}

                {!loading && query && totalResults === 0 && (
                  <div className="py-8 text-center text-sm text-slate-400">No results found for &ldquo;{query}&rdquo;</div>
                )}

                {!query && (
                  <div className="py-8 text-center text-sm text-slate-400">Start typing to search...</div>
                )}

                {!loading && totalResults > 0 && (
                  <div className="space-y-4">
                    {(Object.entries(results) as [keyof SearchResults, any[]][]).map(([key, items]) => {
                      if (items.length === 0) return null;
                      const config = sectionConfig[key];
                      const Icon = config.icon;
                      return (
                        <div key={key}>
                          <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            <Icon className="w-3.5 h-3.5" />
                            {config.label}
                          </div>
                          <div className="space-y-1">
                            {items.map((item: any) => (
                              <button
                                key={item.id}
                                onClick={() => {
                                  setIsOpen(false);
                                  router.push(config.href(item.id));
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-left hover:bg-white/5 transition-colors"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-white truncate">{item.title || item.name}</p>
                                  {item.teacher && <p className="text-xs text-slate-500">{item.teacher}</p>}
                                  {item.role && <p className="text-xs text-slate-500 capitalize">{item.role}</p>}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export { GlobalSearch };
