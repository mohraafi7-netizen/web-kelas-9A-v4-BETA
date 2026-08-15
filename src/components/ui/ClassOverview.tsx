import * as React from 'react';
import { GlassCard } from '@/components/ui';
import { Users, Calendar, Bell, Trophy } from 'lucide-react';
import Link from 'next/link';

interface ClassOverviewProps {
  memberCount?: number;
  eventCount?: number;
  announcementCount?: number;
  achievementCount?: number;
}

function ClassOverview({
  memberCount = 33,
  eventCount = 24,
  announcementCount = 8,
  achievementCount = 12,
}: ClassOverviewProps) {
  const stats = [
    { label: 'Students', value: memberCount.toString(), icon: Users, href: '/members' },
    { label: 'Events', value: eventCount.toString(), icon: Calendar, href: '/events' },
    { label: 'Announcements', value: announcementCount.toString(), icon: Bell, href: '/announcements' },
    { label: 'Achievements', value: achievementCount.toString(), icon: Trophy, href: '/about' },
  ];

  return (
    <GlassCard className="p-6">
      <h3 className="font-semibold text-white mb-4">Class Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors group"
          >
            <div className="p-2 rounded-lg bg-galaxy-600/10 text-galaxy-400 group-hover:scale-110 transition-transform">
              <stat.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-lg font-bold text-white leading-none">{stat.value}</p>
              <p className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>
    </GlassCard>
  );
}

export { ClassOverview };
