'use client';

import * as React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { GlassCard } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { GalaxyButton } from '@/components/ui';
import { useToast } from '@/components/ui';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { storage } from '@/lib/storage';
import { getAttendanceLabel } from '@/data/memberPhotos';
import { Camera, Upload, Trash2, Search, Filter } from 'lucide-react';
import type { Profile } from '@/types';
import { useAuth } from '@/providers/AuthProvider';

function AdminPhotosClient() {
  const { showToast } = useToast();
  const { profile } = useAuth();
  const [profiles, setProfiles] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState<string | null>(null);
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<'all' | 'with' | 'without'>('all');
  const [previews, setPreviews] = React.useState<Record<string, string>>({});

  const isAdmin = profile?.role === 'admin' || profile?.role === 'main_admin';

  const fetchProfiles = async () => {
    try {
      const supabase = createClientSupabaseBrowser();
      const { data } = await supabase.from('profiles').select('*').order('attendance_number', { ascending: true }).order('name');
      if (data) setProfiles(data as Profile[]);
    } catch (error) {
      console.error('[PHOTO FETCH ERROR]', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchProfiles();
  }, []);

  const handleFileChange = (profileId: string, file: File | null) => {
    if (!file) return;
    if (!['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type)) {
      showToast('error', 'Format tidak didukung. Gunakan jpg, jpeg, png, atau webp.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('error', 'Ukuran file maksimal 5MB');
      return;
    }
    const preview = URL.createObjectURL(file);
    setPreviews((prev) => ({ ...prev, [profileId]: preview }));
  };

  const handleUpload = async (profileId: string) => {
    const preview = previews[profileId];
    if (!preview) {
      showToast('error', 'Pilih foto terlebih dahulu');
      return;
    }

    setUploading(profileId);
    try {
      const response = await fetch(preview);
      const blob = await response.blob();
      const extension = blob.type.split('/').pop() || 'jpg';
      const path = `${profileId}.${extension}`;

      const supabase = createClientSupabaseBrowser();

      const { error: uploadError } = await supabase.storage
        .from('member-photos')
        .upload(path, blob, {
          upsert: true,
          contentType: blob.type,
          cacheControl: '3600',
        });

      if (uploadError) {
        console.error('[PHOTO UPLOAD ERROR]', uploadError);
        showToast('error', `Upload error: ${uploadError.message}`);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('member-photos')
        .getPublicUrl(path);

      console.log('[PHOTO UPLOAD SUCCESS]', {
        profileId,
        path,
        publicUrl: publicUrlData.publicUrl,
      });

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          photo_path: path,
          photo_url: publicUrlData.publicUrl,
        })
        .eq('id', profileId);

      if (updateError) {
        console.error('[PHOTO PROFILE UPDATE ERROR]', updateError);
        showToast('error', `Profile update error: ${updateError.message}`);
        return;
      }

      console.log('[PHOTO PROFILE UPDATE SUCCESS]', {
        profileId,
        photo_path: path,
        photo_url: publicUrlData.publicUrl,
      });

      setProfiles((prev) =>
        prev.map((p) =>
          p.id === profileId
            ? { ...p, photo_path: path, photo_url: publicUrlData.publicUrl }
            : p
        )
      );

      showToast('success', 'Foto berhasil disimpan');
      setPreviews((prev) => {
        const next = { ...prev };
        delete next[profileId];
        return next;
      });
      await fetchProfiles();
    } catch (error) {
      console.error('[PHOTO UPLOAD EXCEPTION]', error);
      showToast('error', 'Gagal upload foto');
    } finally {
      setUploading(null);
    }
  };

  const handleDelete = async (profileId: string) => {
    if (!confirm('Hapus foto siswa ini?')) return;

    try {
      const supabase = createClientSupabaseBrowser();
      const { data: member } = await supabase
        .from('profiles')
        .select('photo_path, photo_url')
        .eq('id', profileId)
        .single();

      if (member?.photo_path) {
        const { error: removeError } = await supabase.storage
          .from('member-photos')
          .remove([member.photo_path]);

        if (removeError) {
          console.error('[PHOTO DELETE ERROR]', removeError);
        }
      } else if (member?.photo_url) {
        const urlParts = member.photo_url.split('/');
        const bucketIndex = urlParts.findIndex((part: string) => part === 'member-photos');
        if (bucketIndex !== -1) {
          const storagePath = urlParts.slice(bucketIndex).join('/');
          const { error: removeError } = await supabase.storage
            .from('member-photos')
            .remove([storagePath]);

          if (removeError) {
            console.error('[PHOTO DELETE ERROR]', removeError);
          }
        }
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ photo_path: null, photo_url: null })
        .eq('id', profileId);

      if (updateError) {
        console.error('[PHOTO PROFILE DELETE ERROR]', updateError);
        showToast('error', `Gagal menghapus foto: ${updateError.message}`);
        return;
      }

      showToast('success', 'Foto berhasil dihapus');
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === profileId
            ? { ...p, photo_path: null, photo_url: null }
            : p
        )
      );
      await fetchProfiles();
    } catch (error) {
      console.error('[PHOTO DELETE EXCEPTION]', error);
      showToast('error', 'Gagal menghapus foto');
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <GlassCard key={i} className="p-4">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-slate-700/50 rounded w-1/2" />
              <div className="h-3 bg-slate-700/50 rounded w-3/4" />
            </div>
          </GlassCard>
        ))}
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <EmptyState
        title="No members yet"
        description="Members will appear here once added."
        action={<Camera className="w-12 h-12 text-galaxy-400" />}
      />
    );
  }

  const filtered = profiles.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const hasPhoto = !!(p.photo_path || p.photo_url);
    if (filter === 'with') return matchesSearch && hasPhoto;
    if (filter === 'without') return matchesSearch && !hasPhoto;
    return matchesSearch;
  });

  const withPhoto = profiles.filter((p) => !!(p.photo_path || p.photo_url));
  const withoutPhoto = profiles.filter((p) => !(p.photo_path || p.photo_url));

  const getPhotoSrc = (profile: Profile) => {
    const path = profile.photo_path;
    const url = profile.photo_url;
    if (path) return storage.getPublicUrl('member-photos', path);
    if (url) return url;
    return null;
  };

  return (
    <div className="space-y-6">
      {!isAdmin && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm">
          Kamu dapat melihat foto member, tetapi tidak memiliki izin untuk mengubah foto.
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari nama siswa..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-galaxy-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as 'all' | 'with' | 'without')}
            className="px-4 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500"
          >
            <option value="all">Semua</option>
            <option value="with">Sudah ada foto</option>
            <option value="without">Belum ada foto</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((profile) => {
          const attendanceLabel = getAttendanceLabel(profile.attendance_number ?? null);
          const isUploading = uploading === profile.id;
          const preview = previews[profile.id];
          const photoSrc = getPhotoSrc(profile);

          return (
            <GlassCard key={profile.id} className={`p-4 flex items-center gap-4 ${!photoSrc ? 'border-red-500/30 bg-red-500/5' : ''}`}>
              <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-slate-800 shrink-0">
                {preview || photoSrc ? (
                  <img src={preview || photoSrc!} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-galaxy-700 via-purple-700 to-cosmic-900">
                    <span className="text-sm font-bold text-white/90">
                      {profile.name
                        .trim()
                        .split(' ')
                        .filter(Boolean)
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {attendanceLabel ? <span className="text-galaxy-300 mr-1">{attendanceLabel}</span> : null}
                  {profile.name}
                </p>
                <p className="text-xs text-slate-400 truncate">{profile.role || 'Member'}</p>
                {isAdmin && (
                  <div className="mt-2 flex items-center gap-2">
                    <label className="cursor-pointer inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-galaxy-600 hover:bg-galaxy-500 text-white text-xs transition-colors">
                      <Upload className="w-3 h-3" />
                      {photoSrc ? 'Ganti' : 'Upload'}
                      <input
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0] || null;
                          handleFileChange(profile.id, file);
                        }}
                      />
                    </label>
                    {preview && (
                      <button
                        type="button"
                        onClick={() => handleUpload(profile.id)}
                        disabled={isUploading}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs transition-colors disabled:opacity-50"
                      >
                        {isUploading ? 'Menyimpan...' : 'Simpan'}
                      </button>
                    )}
                    {photoSrc && (
                      <button
                        type="button"
                        onClick={() => handleDelete(profile.id)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                        Hapus
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div className="shrink-0">
                {photoSrc ? (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">&#10003;</span>
                ) : (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500/20 text-red-400">&#10007;</span>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-emerald-400">{withPhoto.length}</p>
          <p className="text-xs text-slate-400">Sudah ada foto</p>
        </GlassCard>
        <GlassCard className="p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{withoutPhoto.length}</p>
          <p className="text-xs text-slate-400">Belum ada foto</p>
        </GlassCard>
      </div>
    </div>
  );
}

export default function AdminPhotosPage() {
  return (
    <AdminLayout title="Photo Manager" activeTab="photos">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Photo Manager</h1>
        <p className="text-slate-400">Kelola foto anggota kelas Galaxy Class.</p>
      </div>
      <AdminPhotosClient />
    </AdminLayout>
  );
}
