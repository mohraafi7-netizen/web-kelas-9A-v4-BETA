'use client';

import * as React from 'react';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { SpaceBackground } from '@/components/ui';
import { Trophy } from 'lucide-react';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';

function RankingItem({ rank, name, role }: { rank: number; name: string; role: string }) {
  return (
    <GlassCard className="p-4 flex items-center gap-4">
      <div className="w-8 h-8 rounded-full bg-galaxy-600/20 flex items-center justify-center text-sm font-bold text-galaxy-400">
        {rank}
      </div>
      <div className="flex-1">
        <p className="font-medium text-white">{name}</p>
        <p className="text-xs text-slate-400 capitalize">{role.replace('_', ' ')}</p>
      </div>
    </GlassCard>
  );
}

export default function RankingPage() {
  const [rankings, setRankings] = React.useState<Array<{ rank: number; name: string; role: string }>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const supabase = createClientSupabaseBrowser();
    const fetchRankings = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('name, role')
          .order('name', { ascending: true });
        setRankings((data ?? []).map((p: any, i: number) => ({
          rank: i + 1,
          name: p.name,
          role: p.role,
        })));
      } catch (error) {
        console.error('[Ranking Error]', error);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen">
        <Section title="Ranking" subtitle="Student points and class rankings.">
          <div className="grid gap-3 max-w-3xl mx-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <GlassCard key={i} className="p-4">
                <div className="animate-pulse flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-700/50" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-slate-700/50 rounded w-1/3" />
                    <div className="h-3 bg-slate-700/50 rounded w-1/4" />
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
      <Section title="Ranking" subtitle="Student points and class rankings." className="relative z-10">
        {rankings.length === 0 ? (
          <EmptyState
            title="No rankings yet"
            description="Rankings will be calculated once points are assigned."
            action={<Trophy className="w-12 h-12 text-galaxy-400" />}
          />
        ) : (
          <div className="grid gap-3 max-w-3xl mx-auto">
            {rankings.map((item) => (
              <RankingItem key={item.rank} rank={item.rank} name={item.name} role={item.role} />
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}
