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
import { Plus, Pencil, Trash2, Bell, Paperclip, Trash2 as TrashIcon } from 'lucide-react';
import { storage } from '@/lib/storage';
import { useToast } from '@/components/ui';
import type { Announcement, AnnouncementAttachment } from '@/types';

function AdminAnnouncementsClient() {
  const { showToast } = useToast();
  const [announcements, setAnnouncements] = React.useState<Announcement[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<Announcement | null>(null);
  const [formData, setFormData] = React.useState({ title: '', content: '', author: '' });
  const [attachments, setAttachments] = React.useState<AnnouncementAttachment[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [pendingFiles, setPendingFiles] = React.useState<File[]>([]);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClientSupabaseBrowser();
      const { data, error } = await supabase.from('announcements').select('id, title, content, created_at, author').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      setAnnouncements(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClientSupabaseBrowser();
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const uploadedBy = user?.id || null;

      let announcementId = editingItem?.id;
      if (editingItem) {
        await supabase.from('announcements').update(formData).eq('id', editingItem.id);
      } else {
        const { data, error } = await supabase.from('announcements').insert([formData]).select().single();
        if (error) throw error;
        announcementId = data.id;
      }

      if (announcementId && pendingFiles.length > 0) {
        setUploading(true);
        const uploads = pendingFiles.map(async (file) => {
          const path = storage.generatePath('announcements', announcementId, file.name);
          const { error: uploadError } = await supabase.storage.from('announcement-attachments').upload(path, file, {
            upsert: true,
            contentType: file.type,
            cacheControl: '3600',
          });
          if (uploadError) throw uploadError;

          return supabase.from('announcement_attachments').insert({
            announcement_id: announcementId,
            file_name: file.name,
            storage_path: path,
            file_type: file.type,
            file_size: file.size,
            uploaded_by: uploadedBy,
          });
        });

        await Promise.all(uploads);
      }

      showToast('success', editingItem ? 'Announcement updated' : 'Announcement created');
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ title: '', content: '', author: '' });
      setAttachments([]);
      setPendingFiles([]);
      fetchData();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save announcement');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (item: Announcement) => {
    setEditingItem(item);
    setFormData({ title: item.title, content: item.content, author: item.author || '' });
    setPendingFiles([]);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;
    const supabase = createClientSupabaseBrowser();
    await supabase.from('announcements').delete().eq('id', id);
    showToast('success', 'Announcement deleted');
    fetchData();
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ title: '', content: '', author: '' });
    setAttachments([]);
    setPendingFiles([]);
    setIsModalOpen(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > storage.getMaxFileSize()) {
      showToast('error', 'File size exceeds 10MB limit');
      return;
    }

    if (!storage.getAllowedMimeTypes().includes(file.type)) {
      showToast('error', 'File type not allowed');
      return;
    }

    setPendingFiles((prev) => [...prev, file]);
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  if (loading) return <Loading size="lg" />;
  if (error) return <ErrorState title="Error" message={error} onRetry={fetchData} />;

  return (
    <AdminLayout title="Announcements Management" activeTab="announcements">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Announcements Management</h1>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Announcement
        </Button>
      </div>

      {announcements.length === 0 ? (
        <EmptyState
          title="No announcements yet"
          description="Create your first announcement to notify the class."
          action={<Bell className="w-12 h-12 text-galaxy-400" />}
        />
      ) : (
        <div className="grid gap-4">
          {announcements.map((item) => (
            <GlassCard key={item.id} className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{item.content}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {item.author || 'Anonymous'} • {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Announcement' : 'Add Announcement'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
              rows={4}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Author</label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Attachments</label>
            <input
              type="file"
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
              onChange={handleFileSelect}
              accept={storage.getAllowedMimeTypes().join(',')}
              disabled={uploading}
            />
            {pendingFiles.length > 0 && (
              <div className="mt-3 space-y-2">
                {pendingFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700">
                    <Paperclip className="w-4 h-4 text-slate-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate">{file.name}</p>
                      <p className="text-xs text-slate-500">{storage.formatFileSize(file.size)}</p>
                    </div>
                    <button type="button" onClick={() => removePendingFile(idx)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400">
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={uploading}>
              {uploading ? 'Saving...' : editingItem ? 'Update' : 'Create'}
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

export default AdminAnnouncementsClient;
