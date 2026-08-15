'use client';

import * as React from 'react';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { GlassCard } from '@/components/ui';
import { Button } from '@/components/ui';
import { Modal } from '@/components/ui';
import { Loading } from '@/components/ui';
import { ErrorState } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { Plus, Pencil, Trash2, X, Users } from 'lucide-react';
import type { Profile } from '@/types';

function AdminMembersClient() {
  const [members, setMembers] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingMember, setEditingMember] = React.useState<Profile | null>(null);
  const [formData, setFormData] = React.useState({ name: '', role: '', attendance_number: '' });

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClientSupabaseBrowser();
      const { data, error } = await supabase.from('profiles').select('*').order('name');
      if (error) throw error;
      setMembers(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMembers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClientSupabaseBrowser();
    
    try {
      const payload = {
        name: formData.name,
        role: formData.role || null,
        attendance_number: formData.attendance_number ? Number(formData.attendance_number) : null,
      };

      if (editingMember) {
        await supabase.from('profiles').update(payload).eq('id', editingMember.id);
      } else {
        await supabase.from('profiles').insert([payload]);
      }
      setIsModalOpen(false);
      setEditingMember(null);
      setFormData({ name: '', role: '', attendance_number: '' });
      fetchMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save member');
    }
  };

  const handleEdit = (member: Profile) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      role: member.role || '',
      attendance_number: (member as any).attendance_number ? String((member as any).attendance_number) : '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this member?')) return;
    const supabase = createClientSupabaseBrowser();
    await supabase.from('profiles').delete().eq('id', id);
    fetchMembers();
  };

  const openAddModal = () => {
    setEditingMember(null);
    setFormData({ name: '', role: '', attendance_number: '' });
    setIsModalOpen(true);
  };

  if (loading) return <Loading size="lg" />;
  if (error) return <ErrorState title="Error" message={error} onRetry={fetchMembers} />;

  return (
    <AdminLayout title="Members Management" activeTab="members">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Members Management</h1>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {members.length === 0 ? (
        <EmptyState
          title="No members yet"
          description="Add your first class member to get started."
          action={<Users className="w-12 h-12 text-galaxy-400" />}
        />
      ) : (
        <div className="grid gap-4">
          {members.map((member) => (
            <GlassCard key={member.id} className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">
                  {(member as any).attendance_number ? `#${String((member as any).attendance_number).padStart(2, '0')} ` : ''}{member.name}
                </h3>
                <p className="text-sm text-slate-400">{member.role || 'Member'}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(member)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(member.id)}>
                  <Trash2 className="w-4 h-4 text-red-400" />
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingMember ? 'Edit Member' : 'Add Member'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Role</label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Attendance Number</label>
            <input
              type="number"
              min="1"
              value={formData.attendance_number}
              onChange={(e) => setFormData({ ...formData, attendance_number: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
              placeholder="e.g. 1"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {editingMember ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </AdminLayout>
  );
}

export default AdminMembersClient;
