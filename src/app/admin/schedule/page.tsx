'use client';

import * as React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { GlassCard } from '@/components/ui';
import { Button } from '@/components/ui';
import { Modal } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Loading } from '@/components/ui';
import { ErrorState } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { Plus, Pencil, Trash2, X, Calendar } from 'lucide-react';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { useToast } from '@/components/ui';

const DAYS = [
  { key: 'Monday', label: 'Senin' },
  { key: 'Tuesday', label: 'Selasa' },
  { key: 'Wednesday', label: 'Rabu' },
  { key: 'Thursday', label: 'Kamis' },
  { key: 'Friday', label: 'Jumat' },
];

type ScheduleItem = {
  id: string;
  day: string;
  time_start: string;
  time_end: string;
  subject: string;
  teacher: string;
  room: string;
};

function AdminScheduleClient() {
  const [items, setItems] = React.useState<ScheduleItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<ScheduleItem | null>(null);
  const [formData, setFormData] = React.useState({ day: 'Monday', time_start: '', time_end: '', subject: '', teacher: '', room: '' });
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ open: boolean; id: string; subject: string; loading: boolean }>({ open: false, id: '', subject: '', loading: false });
  const { showToast } = useToast();

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClientSupabaseBrowser();
      const { data, error } = await supabase.from('schedule').select('id, day, time_start, time_end, subject, teacher, room').order('day', { ascending: true }).order('time_start', { ascending: true });
      if (error) throw error;
      setItems(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch schedule');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  React.useEffect(() => {
    const supabase = createClientSupabaseBrowser();
    const channel = supabase
      .channel('admin-schedule-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'schedule' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'schedule' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'schedule' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const day = formData.day.trim();
    const time_start = formData.time_start.trim();
    const time_end = formData.time_end.trim();
    const subject = formData.subject.trim();

    if (!day || !time_start || !time_end || !subject) {
      showToast('error', 'Day, start time, end time, and subject are required');
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClientSupabaseBrowser();
      if (editingItem) {
        const { error } = await supabase.from('schedule').update({
          day,
          time_start,
          time_end,
          subject,
          teacher: formData.teacher.trim(),
          room: formData.room.trim(),
        }).eq('id', editingItem.id);
        if (error) {
          console.error('[SCHEDULE UPDATE ERROR]', { message: error.message, code: error.code, details: error.details, hint: error.hint });
          throw error;
        }
        showToast('success', 'Schedule updated');
      } else {
        const { error } = await supabase.from('schedule').insert([{
          day,
          time_start,
          time_end,
          subject,
          teacher: formData.teacher.trim(),
          room: formData.room.trim(),
        }]);
        if (error) {
          console.error('[SCHEDULE INSERT ERROR]', { message: error.message, code: error.code, details: error.details, hint: error.hint });
          throw error;
        }
        showToast('success', 'Schedule created');
      }
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ day: 'Monday', time_start: '', time_end: '', subject: '', teacher: '', room: '' });
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save schedule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item: ScheduleItem) => {
    setEditingItem(item);
    setFormData({
      day: item.day,
      time_start: item.time_start,
      time_end: item.time_end,
      subject: item.subject,
      teacher: item.teacher,
      room: item.room,
    });
    setIsModalOpen(true);
  };

  const requestDelete = (id: string, subject: string) => {
    setDeleteConfirm({ open: true, id, subject, loading: false });
  };

  const cancelDelete = () => {
    if (deleteConfirm.loading) return;
    setDeleteConfirm({ open: false, id: '', subject: '', loading: false });
  };

  const confirmDelete = async () => {
    setDeleteConfirm((prev) => ({ ...prev, loading: true }));
    try {
      const supabase = createClientSupabaseBrowser();
      const { error } = await supabase.from('schedule').delete().eq('id', deleteConfirm.id);
      if (error) {
        console.error('[SCHEDULE DELETE ERROR]', { message: error.message, code: error.code, details: error.details, hint: error.hint });
        showToast('error', 'Gagal menghapus jadwal');
      } else {
        showToast('success', 'Jadwal berhasil dihapus');
      }
    } catch (err) {
      console.error('[SCHEDULE DELETE EXCEPTION]', err);
      showToast('error', 'Gagal menghapus jadwal');
    } finally {
      setDeleteConfirm({ open: false, id: '', subject: '', loading: false });
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ day: 'Monday', time_start: '', time_end: '', subject: '', teacher: '', room: '' });
    setIsModalOpen(true);
  };

  const grouped = DAYS.map((day) => ({
    ...day,
    items: items.filter((i) => i.day === day.key),
  }));

  if (loading) return <Loading size="lg" />;
  if (error) return <ErrorState title="Error" message={error} onRetry={fetchData} />;

  return (
    <AdminLayout title="Schedule Management" activeTab="schedule">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Schedule</h1>
          <p className="text-slate-400">Manage class timetable and schedule.</p>
        </div>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No schedule yet"
          description="Add your first schedule item to get started."
          action={<Calendar className="w-12 h-12 text-galaxy-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {grouped.map((day) => (
            <GlassCard key={day.key} className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-4 h-4 text-galaxy-400" />
                <h3 className="text-lg font-semibold text-white">{day.label}</h3>
              </div>
              {day.items.length === 0 ? (
                <p className="text-sm text-slate-500">No classes</p>
              ) : (
                <div className="space-y-3">
                  {day.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                      <div>
                        <p className="text-sm font-mono text-galaxy-400 mb-1">{item.time_start} - {item.time_end}</p>
                        <p className="text-sm font-medium text-white">{item.subject}</p>
                        <p className="text-xs text-slate-400">{item.teacher} • {item.room}</p>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => requestDelete(item.id, item.subject)}>
                          <Trash2 className="w-3.5 h-3.5 text-red-400" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Schedule' : 'Add Schedule'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Day</label>
            <select
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
            >
              {DAYS.map((day) => (
                <option key={day.key} value={day.key}>{day.label}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start Time</label>
              <input
                type="text"
                value={formData.time_start}
                onChange={(e) => setFormData({ ...formData, time_start: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
                placeholder="07:00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">End Time</label>
              <input
                type="text"
                value={formData.time_end}
                onChange={(e) => setFormData({ ...formData, time_end: e.target.value })}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
                placeholder="08:00"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
              placeholder="Mathematics"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Teacher</label>
            <input
              type="text"
              value={formData.teacher}
              onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
              placeholder="Mr. Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Room</label>
            <input
              type="text"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
              placeholder="Room 101"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={submitting}>
              {submitting ? 'Saving...' : editingItem ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1" disabled={submitting}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Hapus Jadwal?"
        description={`Jadwal "${deleteConfirm.subject}" akan dihapus.`}
        confirmLabel="Hapus"
        cancelLabel="Batal"
        loading={deleteConfirm.loading}
        variant="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </AdminLayout>
  );
}

export default function AdminSchedulePage() {
  return (
    <AdminLayout title="Schedule Management" activeTab="schedule">
      <AdminScheduleClient />
    </AdminLayout>
  );
}
