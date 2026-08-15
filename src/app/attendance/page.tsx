import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { ClipboardList } from 'lucide-react';

export const metadata = {
  title: 'Attendance - Galaxy Class',
  description: 'Attendance records.',
};

async function getAttendance() {
  try {
    const supabase = createClientSupabaseBrowser();
    const { data, error } = await supabase
      .from('attendance')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function AttendancePage() {
  const items = await getAttendance();

  return (
    <main className="min-h-screen">
      <Section title="Attendance" subtitle="Track and view attendance records.">
        {items.length === 0 ? (
          <EmptyState
            title="No attendance records"
            description="Attendance data will appear here once recorded."
            action={<ClipboardList className="w-12 h-12 text-galaxy-400" />}
          />
        ) : (
          <div className="grid gap-4 max-w-3xl mx-auto">
            {items.map((item) => (
              <GlassCard key={item.id} className="p-4 flex items-center justify-between">
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
            ))}
          </div>
        )}
      </Section>
    </main>
  );
}
