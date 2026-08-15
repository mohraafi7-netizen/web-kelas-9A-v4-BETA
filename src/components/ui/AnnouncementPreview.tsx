import * as React from 'react';
import { GlassCard } from '@/components/ui';
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface AnnouncementPreviewItem {
  title: string;
  date: string;
  category: string;
}

interface AnnouncementPreviewProps {
  announcements: AnnouncementPreviewItem[];
}

function AnnouncementPreview({ announcements }: AnnouncementPreviewProps) {
  if (!announcements.length) return null;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Latest Announcements</h3>
        <Link href="/announcements" className="text-xs text-galaxy-400 hover:text-galaxy-300 transition-colors flex items-center gap-1">
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {announcements.slice(0, 3).map((item, index) => (
          <div key={index} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-galaxy-600/10 text-galaxy-400 border border-galaxy-500/10">
                  {item.category}
                </span>
                <span className="text-[10px] text-slate-500">{item.date}</span>
              </div>
              <h4 className="text-sm font-medium text-white truncate">{item.title}</h4>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export { AnnouncementPreview };
