'use client';

import * as React from 'react';
import { Modal } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { Button } from '@/components/ui';
import { GalaxyBadge } from '@/components/ui';
import { useToast } from '@/components/ui';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import type { Poll, PollOption } from '@/types';
import { useAuth } from '@/providers/AuthProvider';

function PollVoteModal({ pollId, onClose }: { pollId: string; onClose: () => void }) {
  const { showToast } = useToast();
  const { user, profile } = useAuth();
  const [poll, setPoll] = React.useState<Poll | null>(null);
  const [options, setOptions] = React.useState<PollOption[]>([]);
  const [results, setResults] = React.useState<{ options: (PollOption & { votes: number })[], totalVotes: number } | null>(null);
  const [selectedOption, setSelectedOption] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [voting, setVoting] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const supabase = createClientSupabaseBrowser();
        const [pollRes, optionsRes, resultsRes] = await Promise.all([
          supabase.from('polls').select('*').eq('id', pollId).single(),
          supabase.from('poll_options').select('*').eq('poll_id', pollId).order('created_at', { ascending: true }),
          fetch(`/api/polls/${pollId}/vote`).then((r) => r.json()),
        ]);

        if (pollRes.error) throw pollRes.error;
        setPoll(pollRes.data);
        setOptions(optionsRes.data ?? []);

        if (resultsRes.options) {
          setResults(resultsRes);
        }
      } catch {
        showToast('error', 'Failed to load poll');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [pollId, showToast]);

  const handleVote = async () => {
    if (!selectedOption) return;
    if (!profile?.id) {
      showToast('error', 'Login diperlukan untuk voting');
      return;
    }

    setVoting(true);
    try {
      const supabase = createClientSupabaseBrowser();
      const { error } = await supabase.from('poll_votes').upsert(
        { poll_id: pollId, option_id: selectedOption, user_id: profile.id },
        { onConflict: 'poll_id,user_id' }
      );

      if (error) {
        console.error('[POLL VOTE ERROR]', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
        });
        throw error;
      }

      showToast('success', 'Vote berhasil');
      const resultsRes = await fetch(`/api/polls/${pollId}/vote`).then((r) => r.json());
      if (resultsRes.options) setResults(resultsRes);
    } catch (err) {
      const error = err as Error;
      console.error('[POLL VOTE EXCEPTION]', {
        message: error.message,
      });
      showToast('error', `Gagal voting: ${error.message}`);
    } finally {
      setVoting(false);
    }
  };

  if (loading || !poll) return null;

  return (
    <Modal open={true} onClose={onClose} size="md">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">{poll.title}</h2>
        {poll.description && <p className="text-sm text-slate-400 mb-4">{poll.description}</p>}

        {results && (
          <div className="space-y-3 mb-6 text-left">
            {results.options.map((opt) => {
              const percentage = results.totalVotes > 0 ? ((opt.votes / results.totalVotes) * 100).toFixed(1) : '0.0';
              return (
                <div key={opt.id}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-slate-200">{opt.option_text}</span>
                    <span className="text-slate-400">{opt.votes} suara ({percentage}%)</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-galaxy-600 to-purple-600 rounded-full" style={{ width: `${percentage}%` }} />
                  </div>
                </div>
              );
            })}
            <p className="text-xs text-slate-500">Total suara: {results.totalVotes}</p>
          </div>
        )}

        {poll.is_active && (
          <div className="space-y-3 mb-6 text-left">
            <p className="text-sm font-medium text-white mb-2">Pilih jawaban:</p>
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelectedOption(opt.id)}
                className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 ${
                  selectedOption === opt.id
                    ? 'border-galaxy-500 bg-galaxy-600/20 text-white'
                    : 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-600'
                }`}
              >
                {opt.option_text}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-3">
          {poll.is_active && (
            <Button onClick={handleVote} disabled={!selectedOption || voting} className="flex-1">
              {voting ? 'Mengirim...' : 'Vote'}
            </Button>
          )}
          <Button variant="ghost" onClick={onClose} className="flex-1">Tutup</Button>
        </div>
      </div>
    </Modal>
  );
}

export default PollVoteModal;
