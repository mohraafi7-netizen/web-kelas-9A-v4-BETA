export const storage = {
  getPublicUrl: (bucket: string, path: string) => {
    const url = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!);
    url.pathname = `/storage/v1/object/public/${bucket}/${path}`;
    return url.toString();
  },

  generatePath: (prefix: string, id: string, fileName: string) => {
    const extension = fileName.split('.').pop() || 'bin';
    const safeName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    return `${prefix}/${id}/${Date.now()}_${safeName}`;
  },

  formatFileSize: (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  getAllowedMimeTypes: () => {
    return [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip',
    ];
  },

  getMaxFileSize: () => 10 * 1024 * 1024,

  isImage: (mimeType: string) => mimeType.startsWith('image/'),

  isPdf: (mimeType: string) => mimeType === 'application/pdf',

  getFileIcon: (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.includes('word') || mimeType.includes('document')) return 'doc';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return 'xls';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return 'ppt';
    return 'file';
  },
};
