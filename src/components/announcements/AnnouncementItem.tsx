'use client';

import * as React from 'react';
import { GlassCard } from '@/components/ui';
import { Bell, Paperclip, Download } from 'lucide-react';
import type { Announcement, AnnouncementAttachment } from '@/types';
import { storage } from '@/lib/storage';

function AnnouncementItem({ announcement, attachments }: { announcement: Announcement; attachments?: AnnouncementAttachment[] }) {
  return (
    <GlassCard hover className="p-6">
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-xl bg-galaxy-600/20 shrink-0">
          <Bell className="w-6 h-6 text-galaxy-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-white mb-2">{announcement.title}</h3>
          <p className="text-slate-300 mb-4 line-clamp-3">{announcement.content}</p>
          {attachments && attachments.length > 0 && (
            <div className="mb-4 space-y-2">
              {attachments.map((att) => (
                <a
                  key={att.id}
                  href={storage.getPublicUrl('announcement-attachments', att.storage_path)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-galaxy-500/50 transition-colors"
                >
                  <Paperclip className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300 truncate flex-1">{att.file_name}</span>
                  <span className="text-xs text-slate-500">{storage.formatFileSize(att.file_size)}</span>
                  <Download className="w-4 h-4 text-slate-400" />
                </a>
              ))}
            </div>
          )}
          <div className="flex items-center gap-4 text-sm text-slate-500">
            <span>{announcement.author || 'Anonymous'}</span>
            <span>•</span>
            <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </GlassCard>
  );
}

export { AnnouncementItem };
