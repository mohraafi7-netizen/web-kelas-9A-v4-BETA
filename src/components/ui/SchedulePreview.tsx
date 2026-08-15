import * as React from 'react';
import { GlassCard } from '@/components/ui';
import { Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface ScheduleItem {
  time: string;
  subject: string;
  room?: string;
}

interface SchedulePreviewProps {
  items?: ScheduleItem[];
}

function SchedulePreview({ items }: SchedulePreviewProps) {
  const defaultItems = [
    { time: '07:00', subject: 'Mathematics', room: 'Room 101' },
    { time: '08:30', subject: 'Physics', room: 'Lab 2' },
    { time: '10:00', subject: 'English Literature', room: 'Room 205' },
  ];

  const displayItems = items && items.length > 0 ? items : defaultItems;

  return (
    <GlassCard className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-white">Today&apos;s Schedule</h3>
        <Link href="/schedule" className="text-xs text-galaxy-400 hover:text-galaxy-300 transition-colors flex items-center gap-1">
          View all <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {displayItems.slice(0, 3).map((item, index) => (
          <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="text-xs font-mono text-galaxy-400 bg-galaxy-600/10 px-2 py-1 rounded-lg border border-galaxy-500/10 shrink-0">
              {item.time}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{item.subject}</p>
              {item.room && <p className="text-xs text-slate-500">{item.room}</p>}
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export { SchedulePreview };
