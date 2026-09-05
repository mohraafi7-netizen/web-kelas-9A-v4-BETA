'use client';

import * as React from 'react';
import { GlassCard } from '@/components/ui';
import { Button } from '@/components/ui';
import { Loading } from '@/components/ui';
import { ErrorState } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/components/ui';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { storage } from '@/lib/storage';
import { Trash2, Image, FileText, HardDrive } from 'lucide-react';

type StorageFile = {
  id: string;
  bucket: string;
  name: string;
  size: number;
  created_at: string;
};

function AdminStorageClient() {
  const { showToast } = useToast();
  const [files, setFiles] = React.useState<StorageFile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<string>('all');
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ open: boolean; file: StorageFile | null; loading: boolean }>({ open: false, file: null, loading: false });

  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      const supabase = createClientSupabaseBrowser();
      const buckets = ['member-photos', 'task-attachments', 'project-attachments', 'announcement-attachments'];
      const allFiles: StorageFile[] = [];

      for (const bucket of buckets) {
        const { data } = await supabase.storage.from(bucket).list('', {
          limit: 1000,
          sortBy: { column: 'created_at', order: 'desc' },
        });

        if (data) {
          for (const file of data) {
            allFiles.push({
              id: `${bucket}/${file.name}`,
              bucket,
              name: file.name,
              size: file.metadata?.size || 0,
              created_at: file.created_at || new Date().toISOString(),
            });
          }
        }
      }

      setFiles(allFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch storage files');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchFiles();
  }, []);

  const requestDelete = (file: StorageFile) => {
    setDeleteConfirm({ open: true, file, loading: false });
  };

  const cancelDelete = () => {
    if (deleteConfirm.loading) return;
    setDeleteConfirm({ open: false, file: null, loading: false });
  };

  const confirmDelete = async () => {
    const file = deleteConfirm.file;
    if (!file) return;
    setDeleteConfirm((prev) => ({ ...prev, loading: true }));
    try {
      const supabase = createClientSupabaseBrowser();
      const { error } = await supabase.storage.from(file.bucket).remove([file.name]);
      if (error) throw error;
      showToast('success', 'File berhasil dihapus');
      fetchFiles();
    } catch {
      showToast('error', 'Gagal menghapus file');
    } finally {
      setDeleteConfirm({ open: false, file: null, loading: false });
    }
  };

  const filtered = files.filter((f) => {
    if (filter === 'all') return true;
    return f.bucket === filter;
  });

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);

  if (loading) return <Loading size="lg" />;
  if (error) return <ErrorState title="Error" message={error} onRetry={fetchFiles} />;

  return (
    <>
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Storage Manager</h1>
        <p className="text-slate-400">Manage files across all storage buckets.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-white">{files.length}</p>
          <p className="text-xs text-slate-400">Total Files</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-galaxy-400">{storage.formatFileSize(totalSize)}</p>
          <p className="text-xs text-slate-400">Total Size</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{files.filter((f) => f.bucket === 'member-photos').length}</p>
          <p className="text-xs text-slate-400">Member Photos</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-amber-400">{files.filter((f) => f.bucket !== 'member-photos').length}</p>
          <p className="text-xs text-slate-400">Attachments</p>
        </GlassCard>
      </div>

      <div className="flex items-center gap-2">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
        >
          <option value="all">All Buckets</option>
          <option value="member-photos">Member Photos</option>
          <option value="task-attachments">Task Attachments</option>
          <option value="project-attachments">Project Attachments</option>
          <option value="announcement-attachments">Announcement Attachments</option>
        </select>
        <Button onClick={fetchFiles} variant="secondary">Refresh</Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="No files found"
          description="Uploaded files will appear here."
          action={<HardDrive className="w-12 h-12 text-galaxy-400" />}
        />
      ) : (
        <div className="grid gap-3">
          {filtered.map((file) => (
            <GlassCard key={file.id} className="p-4 flex items-center gap-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-800 shrink-0">
                {file.name.match(/\.(jpg|jpeg|png|webp)$/i) ? (
                  <Image className="w-5 h-5 text-purple-400" />
                ) : (
                  <FileText className="w-5 h-5 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{file.name}</p>
                <p className="text-xs text-slate-500">
                  {file.bucket} • {storage.formatFileSize(file.size)} • {new Date(file.created_at).toLocaleDateString()}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => requestDelete(file)}>
                <Trash2 className="w-4 h-4 text-red-400" />
              </Button>
            </GlassCard>
          ))}
        </div>
      )}
    </div>

    <ConfirmDialog
      open={deleteConfirm.open}
      title="Hapus File?"
      description={`File "${deleteConfirm.file?.name}" akan dihapus dari storage.`}
      confirmLabel="Hapus"
      cancelLabel="Batal"
      loading={deleteConfirm.loading}
      variant="danger"
      onConfirm={confirmDelete}
      onCancel={cancelDelete}
    />
    </>
  );
}

export default AdminStorageClient;