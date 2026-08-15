'use client';

import * as React from 'react';
import { Button } from '@/components/ui';
import { Upload, X, File, Image as ImageIcon, FileText, Trash2 } from 'lucide-react';
import { storage } from '@/lib/storage';

interface FileUploadProps {
  bucket: string;
  prefix: string;
  id: string;
  onChange: (attachment: { file_name: string; storage_path: string; file_type: string; file_size: number } | null) => void;
  value?: { file_name: string; storage_path: string; file_type: string; file_size: number } | null;
  disabled?: boolean;
}

function FileUpload({ bucket, prefix, id, onChange, value, disabled }: FileUploadProps) {
  const [preview, setPreview] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.size > storage.getMaxFileSize()) {
      setError('File size exceeds 10MB limit');
      return;
    }

    if (!storage.getAllowedMimeTypes().includes(file.type)) {
      setError('File type not allowed');
      return;
    }

    setUploading(true);
    try {
      const path = storage.generatePath(prefix, id, file.name);
      const supabase = (await import('@/lib/supabase/client')).createClientSupabaseBrowser();

      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, file, {
        upsert: true,
        contentType: file.type,
        cacheControl: '3600',
      });

      if (uploadError) throw uploadError;

      const publicUrl = storage.getPublicUrl(bucket, path);

      onChange({
        file_name: file.name,
        storage_path: path,
        file_type: file.type,
        file_size: file.size,
      });

      if (storage.isImage(file.type)) {
        setPreview(publicUrl);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    if (!value) return;
    try {
      const supabase = (await import('@/lib/supabase/client')).createClientSupabaseBrowser();
      await supabase.storage.from(bucket).remove([value.storage_path]);
    } catch {
      // silent
    }
    onChange(null);
    setPreview(null);
  };

  React.useEffect(() => {
    if (value && storage.isImage(value.file_type)) {
      const url = storage.getPublicUrl(bucket, value.storage_path);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }, [value, bucket]);

  return (
    <div className="space-y-2">
      {value ? (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 border border-slate-700">
          {preview ? (
            <img src={preview} alt={value.file_name} className="w-10 h-10 object-cover rounded-lg" />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-700">
              {storage.isPdf(value.file_type) ? (
                <FileText className="w-5 h-5 text-red-400" />
              ) : (
                <File className="w-5 h-5 text-slate-400" />
              )}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm text-white truncate">{value.file_name}</p>
            <p className="text-xs text-slate-500">{storage.formatFileSize(value.file_size)}</p>
          </div>
          {!disabled && (
            <button type="button" onClick={handleRemove} className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <label className="flex items-center justify-center gap-2 p-4 rounded-xl border-2 border-dashed border-slate-700 hover:border-galaxy-500 cursor-pointer transition-colors">
          <Upload className="w-5 h-5 text-slate-400" />
          <span className="text-sm text-slate-400">{uploading ? 'Uploading...' : 'Upload File'}</span>
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept={storage.getAllowedMimeTypes().join(',')}
            disabled={disabled || uploading}
          />
        </label>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

export { FileUpload };
