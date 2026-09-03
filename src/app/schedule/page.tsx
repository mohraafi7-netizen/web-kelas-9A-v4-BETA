'use client';

import * as React from 'react';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { SpaceBackground } from '@/components/ui';
import { Calendar } from 'lucide-react';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';

function ScheduleItem({ item }: { item: { id: string; time_start: string; time_end: string; subject: string; teacher: string; room: string } }) {
  return (
    <GlassCard className="p-4 flex items-center gap-4">
      <div className="text-sm font-mono text-galaxy-400 bg-galaxy-600/10 px-3 py-2 rounded-lg border border-galaxy-500/10 shrink-0">
        {item.time_start} - {item.time_end}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white truncate">{item.subject}</p>
        <p className="text-sm text-slate-400">{item.teacher} • {item.room}</p>
      </div>
    </GlassCard>
  );
}

export default function SchedulePage() {
  const [items, setItems] = React.useState<Array<{ id: string; time_start: string; time_end: string; subject: string; teacher: string; room: string }>>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const supabase = createClientSupabaseBrowser();
    const fetchSchedule = async () => {
      try {
        const { data } = await supabase
          .from('schedule')
          .select('*')
          .order('day', { ascending: true });
        setItems(data ?? []);
      } catch (error) {
        console.error('[Schedule Error]', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen">
        <Section title="Schedule" subtitle="Class timetable and schedule information.">
          <div className="grid gap-4 max-w-3xl mx-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <GlassCard key={i} className="p-4">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-slate-700/50 rounded w-1/4" />
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
      <Section title="Schedule" subtitle="Class timetable and schedule information." className="relative z-10">
        {items.length === 0 ? (
          <EmptyState
            title="No schedule yet"
            description="Class schedule will appear here once configured."
            action={<Calendar className="w-12 h-12 text-galaxy-400" />}
          />
        ) : (
          <div className="grid gap-4 max-w-3xl mx-auto">
            {items.map((item) => (
              <ScheduleItem key={item.id} item={item} />
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}
