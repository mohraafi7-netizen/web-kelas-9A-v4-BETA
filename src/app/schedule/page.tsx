import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { Calendar } from 'lucide-react';

export const metadata = {
  title: 'Schedule - Galaxy Class',
  description: 'Class schedule and timetable.',
};

async function getSchedule() {
  try {
    const supabase = createClientSupabaseBrowser();
    const { data, error } = await supabase
      .from('schedule')
      .select('*')
      .order('day', { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function SchedulePage() {
  const items = await getSchedule();

  return (
    <main className="min-h-screen">
      <Section title="Schedule" subtitle="Class timetable and schedule information.">
        {items.length === 0 ? (
          <EmptyState
            title="No schedule yet"
            description="Class schedule will appear here once configured."
            action={<Calendar className="w-12 h-12 text-galaxy-400" />}
          />
        ) : (
          <div className="grid gap-4 max-w-3xl mx-auto">
            {items.map((item) => (
              <GlassCard key={item.id} className="p-4 flex items-center gap-4">
                <div className="text-sm font-mono text-galaxy-400 bg-galaxy-600/10 px-3 py-2 rounded-lg border border-galaxy-500/10 shrink-0">
                  {item.time_start} - {item.time_end}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-white truncate">{item.subject}</p>
                  <p className="text-sm text-slate-400">{item.teacher} • {item.room}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}
