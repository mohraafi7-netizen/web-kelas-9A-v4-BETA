'use client';

import * as React from 'react';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { GalaxyButton } from '@/components/ui';
import { GalaxyBadge } from '@/components/ui';
import { GalaxyGlow } from '@/components/ui';
import { SpaceBackground } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/components/ui/Toast';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { Avatar } from '@/components/ui';
import { motion } from 'framer-motion';
import { Calendar, Clock, Plus, Trash2, CheckCircle, ClipboardList, Users } from 'lucide-react';

type Piket = {
  id: string;
  date: string;
  day: string;
  student_name: string;
  task: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
};

type Member = {
  id: string;
  name: string;
  photo_url: string | null;
  role: string | null;
  created_at: string;
};

const DAYS = [
  { key: 'Monday', label: 'Senin', short: 'SEN' },
  { key: 'Tuesday', label: 'Selasa', short: 'SEL' },
  { key: 'Wednesday', label: 'Rabu', short: 'RAB' },
  { key: 'Thursday', label: 'Kamis', short: 'KAM' },
  { key: 'Friday', label: 'Jumat', short: 'JUM' },
];

function getTodayKey() {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()];
}

function DutyCard({ piket, isToday, onDelete, canEdit, members }: { piket: Piket; isToday: boolean; onDelete: (id: string) => void; canEdit: boolean; members: Member[] }) {
  const member = members.find(m => m.name === piket.student_name);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative ${isToday ? 'ring-2 ring-galaxy-500/50' : ''}`}
    >
      <GlassCard hover className={`p-4 flex items-center gap-4 ${isToday ? 'bg-galaxy-600/5' : ''}`}>
        <Avatar name={piket.student_name} src={member?.photo_url ?? undefined} size="sm" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">{piket.student_name}</p>
          <p className="text-xs text-slate-400 truncate">{piket.task}</p>
        </div>
        {canEdit && (
          <button
            onClick={() => onDelete(piket.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
            title="Remove from schedule"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </GlassCard>
    </motion.div>
  );
}

export default function DutyPage() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [piketList, setPiketList] = React.useState<Piket[]>([]);
  const [members, setMembers] = React.useState<Member[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showCreate, setShowCreate] = React.useState(false);
  const [form, setForm] = React.useState({ date: '', day: 'Monday', student_name: '', task: '' });

  const canEdit = profile?.role === 'admin' || profile?.role === 'main_admin';
  const todayKey = getTodayKey();

  const fetchPiket = React.useCallback(async () => {
    try {
      const supabase = createClientSupabaseBrowser();
      const { data } = await supabase.from('piket').select('*').order('date', { ascending: true });
      if (data) setPiketList(data as Piket[]);
    } catch (error) {
      showToast('error', 'Failed to load piket');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchMembers = React.useCallback(async () => {
    try {
      const supabase = createClientSupabaseBrowser();
      const { data } = await supabase.from('profiles').select('id, name, photo_url, role, created_at');
      if (data) setMembers(data as Member[]);
    } catch {
      // silent
    }
  }, []);

  React.useEffect(() => {
    fetchPiket();
    fetchMembers();
  }, [fetchPiket, fetchMembers]);

  React.useEffect(() => {
    if (!profile) return;
    const supabase = createClientSupabaseBrowser();
    const channel = supabase
      .channel('piket-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'piket' }, () => {
        fetchPiket();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile, fetchPiket]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.date || !form.student_name.trim() || !form.task.trim()) return;

    const supabase = createClientSupabaseBrowser();
    const { error } = await supabase.from('piket').insert({
      date: form.date,
      day: form.day,
      student_name: form.student_name,
      task: form.task,
    });

    if (error) {
      showToast('error', 'Failed to create piket');
    } else {
      showToast('success', 'Piket created successfully');
      setForm({ date: '', day: 'Monday', student_name: '', task: '' });
      setShowCreate(false);
      fetchPiket();
    }
  };

  const handleDelete = async (id: string) => {
    const supabase = createClientSupabaseBrowser();
    const { error } = await supabase.from('piket').delete().eq('id', id);

    if (error) {
      showToast('error', 'Failed to delete piket');
    } else {
      showToast('success', 'Piket deleted');
      fetchPiket();
    }
  };

  const grouped = DAYS.map((day) => ({
    ...day,
    items: piketList.filter((p) => p.day === day.key),
  }));

  const todayPiket = piketList.find(p => p.day === todayKey);

  return (
    <main className="min-h-screen">
      <SpaceBackground particleCount={40} enableParallax={false} />

      <Section title="WEEKLY DUTY" subtitle="Class piket schedule for the week." className="relative z-10">
        <div className="relative">
          <GalaxyGlow size="lg" color="blue" className="top-0 left-0 opacity-20" />

          {todayPiket && todayPiket && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <GlassCard className="p-6 border-galaxy-500/30 bg-galaxy-600/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="text-2xl">🚀</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Today&apos;s Duty</h3>
                    <p className="text-sm text-slate-400">Current piket assignment</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {piketList.filter(p => p.day === todayKey).map((p) => (
                    <DutyCard key={p.id} piket={p} isToday={true} onDelete={handleDelete} canEdit={canEdit} members={members} />
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {canEdit && (
            <div className="mb-6">
              <GalaxyButton onClick={() => setShowCreate(!showCreate)} icon={<Plus className="w-4 h-4" />}>
                {showCreate ? 'Cancel' : 'Add Duty'}
              </GalaxyButton>
            </div>
          )}

          {showCreate && canEdit && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <GlassCard className="p-6">
                <form onSubmit={handleCreate} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Date</label>
                      <input
                        type="date"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Day</label>
                      <select
                        value={form.day}
                        onChange={(e) => setForm({ ...form, day: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
                      >
                        {DAYS.map((day) => (
                          <option key={day.key} value={day.key}>{day.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Student Name</label>
                    <input
                      type="text"
                      value={form.student_name}
                      onChange={(e) => setForm({ ...form, student_name: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
                      placeholder="Student name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Task</label>
                    <input
                      type="text"
                      value={form.task}
                      onChange={(e) => setForm({ ...form, task: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
                      placeholder="Duty task"
                      required
                    />
                  </div>
                  <GalaxyButton type="submit" icon={<CheckCircle className="w-4 h-4" />}>
                    Add Duty
                  </GalaxyButton>
                </form>
              </GlassCard>
            </motion.div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <GlassCard key={i} className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-5 bg-slate-700/50 rounded w-3/4" />
                    <div className="h-4 bg-slate-700/50 rounded w-full" />
                    <div className="h-4 bg-slate-700/50 rounded w-1/2" />
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : piketList.length === 0 ? (
            <EmptyState
              title="No duty schedule yet"
              description="Duty roster will appear here once configured."
              action={<ClipboardList className="w-12 h-12 text-galaxy-400" />}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {grouped.map((day) => (
                <GlassCard key={day.key} className={`p-6 ${day.key === todayKey ? 'border-galaxy-500/30 bg-galaxy-600/5' : ''}`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-galaxy-400" />
                      <h3 className="text-lg font-semibold text-white">{day.label}</h3>
                    </div>
                    {day.key === todayKey && <GalaxyBadge variant="success" size="sm">TODAY</GalaxyBadge>}
                  </div>
                  {day.items.length === 0 ? (
                    <p className="text-sm text-slate-500">No assignments</p>
                  ) : (
                    <div className="space-y-3">
                      {day.items.map((piket) => (
                        <DutyCard
                          key={piket.id}
                          piket={piket}
                          isToday={day.key === todayKey}
                          onDelete={handleDelete}
                          canEdit={canEdit}
                          members={members}
                        />
                      ))}
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      </Section>
    </main>
  );
}
