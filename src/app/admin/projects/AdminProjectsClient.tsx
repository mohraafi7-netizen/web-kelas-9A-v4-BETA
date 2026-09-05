'use client';

import * as React from 'react';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { GlassCard } from '@/components/ui';
import { Button } from '@/components/ui';
import { Modal } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { Loading } from '@/components/ui';
import { ErrorState } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { Plus, Pencil, Trash2, FolderOpen, Paperclip, Trash2 as TrashIcon } from 'lucide-react';
import { storage } from '@/lib/storage';
import { useToast } from '@/components/ui';
import type { Project, ProjectAttachment } from '@/types';

function AdminProjectsClient() {
  const { showToast } = useToast();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<Project | null>(null);
  const [formData, setFormData] = React.useState({ title: '', description: '', image_url: '', link: '', category: '' });
  const [attachments, setAttachments] = React.useState<ProjectAttachment[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [pendingFiles, setPendingFiles] = React.useState<File[]>([]);
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ open: boolean; id: string; title: string; loading: boolean }>({ open: false, id: '', title: '', loading: false });

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClientSupabaseBrowser();
      const { data, error } = await supabase.from('projects').select('id, title, description, category, image_url, link, created_at').order('created_at', { ascending: false });
      if (error) throw error;
      setProjects(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  React.useEffect(() => {
    const supabase = createClientSupabaseBrowser();
    const channel = supabase
      .channel('admin-projects-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'projects' }, () => {
        fetchData();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects' }, () => {
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

    const title = formData.title.trim();
    if (!title) {
      showToast('error', 'Title is required');
      return;
    }

    setSubmitting(true);
    try {
      const supabase = createClientSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      const uploadedBy = user?.id || null;

      let projectId = editingItem?.id;
      if (editingItem) {
        const { error } = await supabase.from('projects').update({
          title,
          description: formData.description.trim(),
          category: formData.category.trim() || null,
          image_url: formData.image_url.trim() || null,
          link: formData.link.trim() || null,
        }).eq('id', editingItem.id);
        if (error) {
          console.error('[PROJECT UPDATE ERROR]', { message: error.message, code: error.code, details: error.details, hint: error.hint });
          throw error;
        }
      } else {
        const { data, error } = await supabase.from('projects').insert([{
          title,
          description: formData.description.trim(),
          category: formData.category.trim() || null,
          image_url: formData.image_url.trim() || null,
          link: formData.link.trim() || null,
        }]).select().single();
        if (error) {
          console.error('[PROJECT INSERT ERROR]', { message: error.message, code: error.code, details: error.details, hint: error.hint });
          throw error;
        }
        projectId = data.id;
      }

      if (projectId && pendingFiles.length > 0) {
        setUploading(true);
        const uploads = pendingFiles.map(async (file) => {
          const path = storage.generatePath('projects', projectId, file.name);
          const { error: uploadError } = await supabase.storage.from('project-attachments').upload(path, file, {
            upsert: true,
            contentType: file.type,
            cacheControl: '3600',
          });
          if (uploadError) throw uploadError;

          return supabase.from('project_attachments').insert({
            project_id: projectId,
            file_name: file.name,
            storage_path: path,
            file_type: file.type,
            file_size: file.size,
            uploaded_by: uploadedBy,
          });
        });

        await Promise.all(uploads);
      }

      showToast('success', editingItem ? 'Project updated' : 'Project created');
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ title: '', description: '', image_url: '', link: '', category: '' });
      setAttachments([]);
      setPendingFiles([]);
      fetchData();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save project');
    } finally {
      setUploading(false);
      setSubmitting(false);
    }
  };

  const handleEdit = (item: Project) => {
    setEditingItem(item);
    setFormData({ title: item.title, description: item.description, image_url: item.image_url || '', link: item.link || '', category: item.category || '' });
    setPendingFiles([]);
    setIsModalOpen(true);
  };

  const requestDelete = (id: string, title: string) => {
    setDeleteConfirm({ open: true, id, title, loading: false });
  };

  const cancelDelete = () => {
    if (deleteConfirm.loading) return;
    setDeleteConfirm({ open: false, id: '', title: '', loading: false });
  };

  const confirmDelete = async () => {
    setDeleteConfirm((prev) => ({ ...prev, loading: true }));
    try {
      const supabase = createClientSupabaseBrowser();
      const { error } = await supabase.from('projects').delete().eq('id', deleteConfirm.id);
      if (error) {
        console.error('[PROJECT DELETE ERROR]', { message: error.message, code: error.code, details: error.details, hint: error.hint });
        showToast('error', 'Gagal menghapus project');
      } else {
        showToast('success', 'Project berhasil dihapus');
        fetchData();
      }
    } catch (err) {
      console.error('[PROJECT DELETE EXCEPTION]', err);
      showToast('error', 'Gagal menghapus project');
    } finally {
      setDeleteConfirm({ open: false, id: '', title: '', loading: false });
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ title: '', description: '', image_url: '', link: '', category: '' });
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
    <AdminLayout title="Projects Management" activeTab="projects">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Projects Management</h1>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          title="No projects yet"
          description="Create your first project to showcase your work."
          action={<FolderOpen className="w-12 h-12 text-galaxy-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((item) => (
            <GlassCard key={item.id} hover className="overflow-hidden p-0">
              <div className="relative aspect-video">
                <img src={item.image_url || '/placeholder-project.jpg'} alt={item.title} className="w-full h-full object-cover rounded-t-2xl" />
              </div>
              <div className="p-4 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="text-xs text-galaxy-400">{item.category || 'Project'}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(item)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => requestDelete(item.id, item.title)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Project' : 'Add Project'}>
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
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
              rows={3}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Image URL</label>
            <input
              type="text"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Link</label>
            <input
              type="text"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
            <Button type="submit" className="flex-1" disabled={submitting || uploading}>
              {submitting || uploading ? 'Saving...' : editingItem ? 'Update' : 'Create'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1" disabled={submitting || uploading}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={deleteConfirm.open}
        title="Hapus Project?"
        description={`Project "${deleteConfirm.title}" akan dihapus dan tidak dapat dikembalikan.`}
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

export default AdminProjectsClient;
