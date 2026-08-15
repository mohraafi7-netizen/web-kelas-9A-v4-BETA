import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { Trophy } from 'lucide-react';

export const metadata = {
  title: 'Ranking - Galaxy Class',
  description: 'Student points and class rankings.',
};

async function getRankings() {
  try {
    const supabase = createClientSupabaseBrowser();
    const { data, error } = await supabase
      .from('profiles')
      .select('name, role')
      .order('name', { ascending: true });

    if (error) throw new Error(error.message);
    return (data ?? []).map((p: any, i: number) => ({
      rank: i + 1,
      name: p.name,
      role: p.role,
    }));
  } catch {
    return [];
  }
}

export default async function RankingPage() {
  const rankings = await getRankings();

  return (
    <main className="min-h-screen">
      <Section title="Ranking" subtitle="Student points and class rankings.">
        {rankings.length === 0 ? (
          <EmptyState
            title="No rankings yet"
            description="Rankings will be calculated once points are assigned."
            action={<Trophy className="w-12 h-12 text-galaxy-400" />}
          />
        ) : (
          <div className="grid gap-3 max-w-3xl mx-auto">
            {rankings.map((item) => (
              <GlassCard key={item.rank} className="p-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-galaxy-600/20 flex items-center justify-center text-sm font-bold text-galaxy-400">
                  {item.rank}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{item.name}</p>
                  <p className="text-xs text-slate-400 capitalize">{item.role.replace('_', ' ')}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}
