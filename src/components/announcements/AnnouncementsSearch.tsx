'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { GlassCard } from '@/components/ui';

function AnnouncementsSearch({ onSearch }: { onSearch: (query: string) => void }) {
  const [query, setQuery] = React.useState('');

  React.useEffect(() => {
    const timeout = setTimeout(() => {
      onSearch(query);
    }, 300);
    return () => clearTimeout(timeout);
  }, [query, onSearch]);

  return (
    <GlassCard className="p-4 sm:p-6 max-w-2xl mx-auto mb-8">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search announcements..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-galaxy-500 focus:border-transparent"
        />
      </div>
    </GlassCard>
  );
}

export { AnnouncementsSearch };
