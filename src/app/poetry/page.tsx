'use client';

import * as React from 'react';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { GalaxyBadge } from '@/components/ui';
import { SpaceBackground } from '@/components/ui';
import { PenLine } from 'lucide-react';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';

interface PoetryItem {
  id: string;
  title: string;
  content: string;
  author_name: string;
  category?: string;
  created_at: string;
}

function PoetryCard({ item }: { item: PoetryItem }) {
  return (
    <GlassCard hover className="p-6 group">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-galaxy-400 font-medium px-2 py-1 rounded-full bg-galaxy-600/10 border border-galaxy-500/10">
          {item.category || 'Words'}
        </span>
        <span className="text-xs text-slate-500">
          {new Date(item.created_at).toLocaleDateString()}
        </span>
      </div>
      <h3 className="font-semibold text-white mb-2 group-hover:text-galaxy-300 transition-colors">{item.title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">{item.content}</p>
      <p className="text-xs text-slate-500 mt-4">— {item.author_name}</p>
    </GlassCard>
  );
}

export default function PoetryPage() {
  const [items, setItems] = React.useState<PoetryItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const supabase = createClientSupabaseBrowser();
    const fetchPoetry = async () => {
      try {
        const { data } = await supabase
          .from('poetry')
          .select('*')
          .order('created_at', { ascending: false });
        setItems((data ?? []) as PoetryItem[]);
      } catch (error) {
        console.error('[Poetry Error]', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPoetry();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen">
        <Section title="Words & Poetry" subtitle="Poems, quotes, and messages from our class.">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <GlassCard key={i} className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-3 bg-slate-700/50 rounded w-1/4" />
                  <div className="h-4 bg-slate-700/50 rounded w-3/4" />
                  <div className="h-3 bg-slate-700/50 rounded w-full" />
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
      <Section title="Words & Poetry" subtitle="Poems, quotes, and messages from our class." className="relative z-10">
        {items.length === 0 ? (
          <EmptyState
            title="No words yet"
            description="Poems and messages will appear here once shared."
            action={<PenLine className="w-12 h-12 text-galaxy-400" />}
          />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <PoetryCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}
