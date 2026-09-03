'use client';

import * as React from 'react';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { GalaxyBadge } from '@/components/ui';
import { GalaxyGlow } from '@/components/ui';
import { SpaceBackground } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { BarChart3 } from 'lucide-react';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/components/ui';
import type { Poll } from '@/types';
import PollVoteModal from '@/components/polls/PollVoteModal';

function PollCard({ poll, onClick }: { poll: Poll; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 backdrop-blur-md transition-all duration-300 hover:border-galaxy-400/40 hover:shadow-[0_0_25px_rgba(139,92,246,0.15)]"
    >
      <div className="p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-white line-clamp-2 leading-snug">{poll.title}</h3>
          <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${poll.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
            {poll.is_active ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
        {poll.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-3">{poll.description}</p>
        )}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          {poll.starts_at && <span>Mulai: {poll.starts_at}</span>}
          {poll.ends_at && <span>Selesai: {poll.ends_at}</span>}
        </div>
      </div>
    </button>
  );
}

export default function PollsPage() {
  const [polls, setPolls] = React.useState<Poll[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedPollId, setSelectedPollId] = React.useState<string | null>(null);
  const { profile } = useAuth();
  const { showToast } = useToast();

  React.useEffect(() => {
    const supabase = createClientSupabaseBrowser();
    const fetchPolls = async () => {
      try {
        const { data, error } = await supabase.from('polls').select('*').order('created_at', { ascending: false });
        if (error) {
          console.error('[POLLS FETCH ERROR]', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          });
          showToast('error', `Gagal memuat polling: ${error.message}`);
          return;
        }
        setPolls(data ?? []);
      } catch (error) {
        console.error('[POLLS FETCH EXCEPTION]', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPolls();

    const channel = supabase
      .channel('polls-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'polls' }, () => {
        fetchPolls();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen">
        <SpaceBackground particleCount={40} enableParallax={false} />
        <Section title="POLLING" subtitle="Voting polls for Galaxy Class." className="relative z-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <GlassCard key={i} className="p-5">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-slate-700/50 rounded w-3/4" />
                  <div className="h-3 bg-slate-700/50 rounded w-1/2" />
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
      <Section title="POLLING" subtitle="Voting polls for Galaxy Class." className="relative z-10">
        <div className="relative">
          <GalaxyGlow size="lg" color="blue" className="top-0 left-0 opacity-20" />
          {polls.length === 0 ? (
            <EmptyState
              title="No active polls"
              description="Polls will appear here when created."
              action={<BarChart3 className="w-12 h-12 text-galaxy-400" />}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {polls.map((poll) => (
                <PollCard key={poll.id} poll={poll} onClick={() => setSelectedPollId(poll.id)} />
              ))}
            </div>
          )}
        </div>
      </Section>
      {selectedPollId && (
        <PollVoteModal pollId={selectedPollId} onClose={() => setSelectedPollId(null)} />
      )}
    </main>
  );
}
