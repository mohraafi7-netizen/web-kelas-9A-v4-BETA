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
import { Plus, Pencil, Trash2, Image, X } from 'lucide-react';
import { storage } from '@/lib/storage';
import { useToast } from '@/components/ui';
import type { GalleryItem } from '@/types';

function AdminGalleryClient() {
  const { showToast } = useToast();
  const [items, setItems] = React.useState<GalleryItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<GalleryItem | null>(null);
  const [formData, setFormData] = React.useState({ title: '', image_url: '', category: '', storage_path: '', file_name: '', file_type: '', file_size: 0 });
  const [preview, setPreview] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClientSupabaseBrowser();
      const { data, error } = await supabase.from('gallery').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch gallery');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > storage.getMaxFileSize()) {
      showToast('error', 'File size exceeds 10MB limit');
      return;
    }

    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('error', 'File type not allowed. Use jpg, jpeg, png, or webp.');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    setFormData((prev) => ({
      ...prev,
      file_name: file.name,
      file_type: file.type,
      file_size: file.size,
      image_url: '',
      storage_path: '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const supabase = createClientSupabaseBrowser();
    try {
      let storagePath = formData.storage_path;
      let imageUrl = formData.image_url;

      if (preview && !editingItem) {
        setUploading(true);
        const file = (await fetch(preview).then((r) => r.blob())) as Blob;
        const extension = formData.file_name.split('.').pop() || 'jpg';
        const newPath = storage.generatePath('gallery', crypto.randomUUID(), formData.file_name);
        const { error: uploadError } = await supabase.storage.from('gallery').upload(newPath, file, {
          upsert: true,
          contentType: formData.file_type,
          cacheControl: '3600',
        });
        if (uploadError) throw uploadError;

        const { data: publicData } = supabase.storage.from('gallery').getPublicUrl(newPath);
        storagePath = newPath;
        imageUrl = publicData.publicUrl;
      }

      const payload = {
        title: formData.title,
        category: formData.category || null,
        image_url: imageUrl || null,
        storage_path: storagePath || null,
        file_name: formData.file_name || null,
        file_type: formData.file_type || null,
        file_size: formData.file_size || null,
      };

      if (editingItem) {
        await supabase.from('gallery').update(payload).eq('id', editingItem.id);
      } else {
        await supabase.from('gallery').insert([payload]);
      }

      showToast('success', editingItem ? 'Gallery updated' : 'Gallery uploaded');
      setIsModalOpen(false);
      setEditingItem(null);
      setFormData({ title: '', image_url: '', category: '', storage_path: '', file_name: '', file_type: '', file_size: 0 });
      setPreview(null);
      fetchData();
    } catch (err) {
      showToast('error', err instanceof Error ? err.message : 'Failed to save gallery');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (item: GalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      image_url: item.image_url || '',
      category: item.category || '',
      storage_path: item.storage_path || '',
      file_name: item.file_name || '',
      file_type: item.file_type || '',
      file_size: item.file_size || 0,
    });
    setPreview(item.image_url || item.storage_path ? storage.getPublicUrl('gallery', item.storage_path || '') : null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    const supabase = createClientSupabaseBrowser();
    const item = items.find((i) => i.id === id);
    if (item?.storage_path) {
      await supabase.storage.from('gallery').remove([item.storage_path]);
    }
    await supabase.from('gallery').delete().eq('id', id);
    showToast('success', 'Gallery item deleted');
    fetchData();
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({ title: '', image_url: '', category: '', storage_path: '', file_name: '', file_type: '', file_size: 0 });
    setPreview(null);
    setIsModalOpen(true);
  };

  const removePreview = () => {
    setPreview(null);
    setFormData((prev) => ({ ...prev, file_name: '', file_type: '', file_size: 0, storage_path: '', image_url: '' }));
  };

  if (loading) return <Loading size="lg" />;
  if (error) return <ErrorState title="Error" message={error} onRetry={fetchData} />;

  return (
    <AdminLayout title="Gallery Management" activeTab="gallery">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Gallery Management</h1>
        <Button onClick={openAddModal}>
          <Plus className="w-4 h-4 mr-2" />
          Upload Foto
        </Button>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title="No gallery items yet"
          description="Upload photos to start building your class gallery."
          action={<Image className="w-12 h-12 text-galaxy-400" />}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <GlassCard key={item.id} hover className="overflow-hidden p-0">
              <div className="relative aspect-video">
                <img
                  src={item.storage_path ? storage.getPublicUrl('gallery', item.storage_path) : item.image_url || '/placeholder-project.jpg'}
                  alt={item.title}
                  className="w-full h-full object-cover rounded-t-2xl"
                />
              </div>
              <div className="p-4 flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-white">{item.title}</h3>
                  <p className="text-xs text-galaxy-400">{item.category || 'General'}</p>
                </div>
                <div className="flex gap-2">
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

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Gallery Item' : 'Upload Gallery Foto'}>
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
            <label className="block text-sm font-medium mb-2">Category</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Photo</label>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
              disabled={uploading}
            />
            {preview && (
              <div className="relative mt-3">
                <img src={preview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                <button
                  type="button"
                  onClick={removePreview}
                  className="absolute top-2 right-2 p-1 rounded-lg bg-slate-900/80 text-white hover:text-red-400 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1" disabled={uploading}>
              {uploading ? 'Uploading...' : editingItem ? 'Update' : 'Upload'}
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

export default AdminGalleryClient;
