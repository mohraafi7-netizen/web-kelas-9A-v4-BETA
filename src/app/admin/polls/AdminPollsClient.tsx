'use client';

import * as React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { GlassCard } from '@/components/ui';
import { Button } from '@/components/ui';
import { Modal } from '@/components/ui';
import { Loading } from '@/components/ui';
import { ErrorState } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { useToast } from '@/components/ui';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { Plus, Pencil, Trash2, X, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import type { Poll, PollOption } from '@/types';
import { useAuth } from '@/providers/AuthProvider';

function AdminPollsClient() {
  const { showToast } = useToast();
  const { profile } = useAuth();
  const [polls, setPolls] = React.useState<Poll[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingPoll, setEditingPoll] = React.useState<Poll | null>(null);
  const [formData, setFormData] = React.useState({ title: '', description: '', is_active: true, starts_at: '', ends_at: '' });
  const [options, setOptions] = React.useState<string[]>(['', '']);
  const [results, setResults] = React.useState<Record<string, { options: (PollOption & { votes: number })[], totalVotes: number }>>({});
  const [loadingResults, setLoadingResults] = React.useState<string | null>(null);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'main_admin';

  const fetchPolls = async () => {
    setLoading(true);
    try {
      const supabase = createClientSupabaseBrowser();
      const { data, error } = await supabase.from('polls').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setPolls(data ?? []);
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to fetch polls');
    } finally {
      setLoading(false);
    }
  };

  const fetchResults = async (pollId: string) => {
    setLoadingResults(pollId);
    try {
      const supabase = createClientSupabaseBrowser();
      const res = await fetch(`/api/polls/${pollId}/vote`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);
      setResults((prev) => ({ ...prev, [pollId]: json }));
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to fetch results');
    } finally {
      setLoadingResults(null);
    }
  };

  React.useEffect(() => {
    fetchPolls();
  }, []);

  const openAddModal = () => {
    setEditingPoll(null);
    setFormData({ title: '', description: '', is_active: true, starts_at: '', ends_at: '' });
    setOptions(['', '']);
    setIsModalOpen(true);
  };

  const openEditModal = (poll: Poll) => {
    setEditingPoll(poll);
    setFormData({
      title: poll.title,
      description: poll.description || '',
      is_active: poll.is_active,
      starts_at: poll.starts_at || '',
      ends_at: poll.ends_at || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClientSupabaseBrowser();
    const validOptions = options.filter((o) => o.trim() !== '');
    if (validOptions.length < 2) {
      showToast('error', 'Minimal 2 pilihan jawaban');
      return;
    }

    try {
      let pollId = editingPoll?.id;
      if (editingPoll) {
        const { error } = await supabase.from('polls').update(formData).eq('id', editingPoll.id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase.from('polls').insert(formData).select().single();
        if (error) {
          console.error('[POLL SAVE ERROR]', {
            message: error.message,
            code: error.code,
            details: error.details,
            hint: error.hint,
          });
          throw error;
        }
        pollId = data.id;
      }

      if (pollId && !editingPoll) {
        const inserts = validOptions.map((text) => ({ poll_id: pollId, option_text: text }));
        const { error: optError } = await supabase.from('poll_options').insert(inserts);
        if (optError) {
          console.error('[POLL OPTION SAVE ERROR]', {
            message: optError.message,
            code: optError.code,
            details: optError.details,
            hint: optError.hint,
          });
          throw optError;
        }
      }

      showToast('success', editingPoll ? 'Polling berhasil diperbarui' : 'Polling berhasil dibuat');
      setIsModalOpen(false);
      fetchPolls();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to save poll');
      console.error('[POLL SAVE EXCEPTION]', {
        message: error.message,
        code: (err as any)?.code,
        details: (err as any)?.details,
        hint: (err as any)?.hint,
      });
      showToast('error', `Gagal menyimpan polling: ${error.message}`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Hapus polling ini?')) return;
    const supabase = createClientSupabaseBrowser();
    const { error } = await supabase.from('polls').delete().eq('id', id);
    if (error) {
      showToast('error', error.message);
      return;
    }
    showToast('success', 'Polling berhasil dihapus');
    fetchPolls();
  };

  const handleToggleActive = async (poll: Poll) => {
    const supabase = createClientSupabaseBrowser();
    const { error } = await supabase.from('polls').update({ is_active: !poll.is_active }).eq('id', poll.id);
    if (error) {
      showToast('error', error.message);
      return;
    }
    showToast('success', poll.is_active ? 'Polling dinonaktifkan' : 'Polling diaktifkan');
    fetchPolls();
  };

  const addOptionField = () => {
    setOptions((prev) => [...prev, '']);
  };

  const updateOption = (index: number, value: string) => {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  };

  const removeOptionField = (index: number) => {
    setOptions((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) return <Loading size="lg" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Polling</h1>
          <p className="text-slate-400">Buat dan kelola polling kelas.</p>
        </div>
        {isAdmin && (
          <Button onClick={openAddModal}>
            <Plus className="w-4 h-4 mr-2" />
            Buat Polling
          </Button>
        )}
      </div>

      {polls.length === 0 ? (
        <EmptyState
          title="Belum ada polling"
          description="Buat polling pertama untuk kelas."
          action={<BarChart3 className="w-12 h-12 text-galaxy-400" />}
        />
      ) : (
        <div className="grid gap-4">
          {polls.map((poll) => {
            const result = results[poll.id];
            return (
              <GlassCard key={poll.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{poll.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{poll.description}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${poll.is_active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                        {poll.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                      {poll.starts_at && <span className="text-xs text-slate-500">Mulai: {poll.starts_at}</span>}
                      {poll.ends_at && <span className="text-xs text-slate-500">Selesai: {poll.ends_at}</span>}
                    </div>
                  </div>
                  {isAdmin && (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleToggleActive(poll)}>
                        {poll.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => openEditModal(poll)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(poll.id)}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <Button variant="secondary" size="sm" onClick={() => fetchResults(poll.id)} disabled={loadingResults === poll.id}>
                    {loadingResults === poll.id ? 'Memuat...' : 'Lihat Hasil'}
                  </Button>
                </div>

                {result && (
                  <div className="space-y-2">
                    {result.options.map((opt) => {
                      const percentage = result.totalVotes > 0 ? ((opt.votes / result.totalVotes) * 100).toFixed(1) : '0.0';
                      return (
                        <div key={opt.id} className="flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between text-sm mb-1">
                              <span className="text-slate-200">{opt.option_text}</span>
                              <span className="text-slate-400">{opt.votes} suara ({percentage}%)</span>
                            </div>
                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-galaxy-600 to-purple-600 rounded-full" style={{ width: `${percentage}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <p className="text-xs text-slate-500 mt-2">Total suara: {result.totalVotes}</p>
                  </div>
                )}
              </GlassCard>
            );
          })}
        </div>
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingPoll ? 'Edit Polling' : 'Buat Polling Baru'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Judul Polling</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Mulai</label>
              <input
                type="date"
                value={formData.starts_at}
                onChange={(e) => setFormData({ ...formData, starts_at: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Selesai</label>
              <input
                type="date"
                value={formData.ends_at}
                onChange={(e) => setFormData({ ...formData, ends_at: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Pilihan Jawaban</label>
            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(idx, e.target.value)}
                    className="flex-1 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
                    placeholder={`Pilihan ${idx + 1}`}
                  />
                  {options.length > 2 && (
                    <button type="button" onClick={() => removeOptionField(idx)} className="text-red-400 hover:text-red-300">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button type="button" onClick={addOptionField} className="text-sm text-galaxy-400 hover:text-galaxy-300">
                + Tambah pilihan
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="rounded bg-slate-800 border-slate-700"
            />
            <label htmlFor="is_active" className="text-sm text-slate-300">Aktifkan polling</label>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">{editingPoll ? 'Update' : 'Buat'}</Button>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1">Batal</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default function AdminPollsPage() {
  return (
    <AdminLayout title="Polling" activeTab="polls">
      <AdminPollsClient />
    </AdminLayout>
  );
}
