'use client';

import * as React from 'react';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { GalaxyBadge } from '@/components/ui';
import { SpaceBackground } from '@/components/ui';
import { ClipboardList } from 'lucide-react';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';

function AttendanceItem({ item }: { item: { id: string; date: string; status: string } }) {
  return (
    <GlassCard className="p-4 flex items-center justify-between">
      <div>
        <p className="font-medium text-white">{item.date}</p>
        <p className="text-sm text-slate-400">Status: {item.status}</p>
      </div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
        item.status === 'present' ? 'bg-green-500/10 text-green-400' :
        item.status === 'late' ? 'bg-yellow-500/10 text-yellow-400' :
        item.status === 'excused' ? 'bg-blue-500/10 text-blue-400' :
        'bg-red-500/10 text-red-400'
      }`}>
        {item.status}
      </span>
    </GlassCard>
  );
}

export default function AttendancePage() {
  const [items, setItems] = React.useState<Array<{ id: string; date: string; status: string }>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const supabase = createClientSupabaseBrowser();
    const fetchAttendance = async () => {
      try {
        const { data } = await supabase
          .from('attendance')
          .select('*')
          .order('date', { ascending: false });
        setItems(data ?? []);
      } catch (error) {
        console.error('[Attendance Error]', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen">
        <Section title="Attendance" subtitle="Track and view attendance records.">
          <div className="grid gap-4 max-w-3xl mx-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <GlassCard key={i} className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-slate-700/50 rounded w-1/3" />
                  <div className="h-3 bg-slate-700/50 rounded w-1/2" />
                </div>
              </GlassCard>
            ))}
          </div>
        </Section>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <SpaceBackground particleCount={40} enableParallax={false} />
      <Section title="Attendance" subtitle="Track and view attendance records." className="relative z-10">
        {items.length === 0 ? (
          <EmptyState
            title="No attendance records"
            description="Attendance data will appear here once recorded."
            action={<ClipboardList className="w-12 h-12 text-galaxy-400" />}
          />
        ) : (
          <div className="grid gap-4 max-w-3xl mx-auto">
            {items.map((item) => (
              <AttendanceItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}
