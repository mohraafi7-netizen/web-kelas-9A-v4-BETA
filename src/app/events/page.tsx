import { Section } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { CalendarDays } from 'lucide-react';

export const metadata = {
  title: 'Events - Galaxy Class',
  description: 'Class events and calendar.',
};

export default function EventsPage() {
  return (
    <main className="min-h-screen">
      <Section title="Events" subtitle="Upcoming class events and activities.">
        <EmptyState
          title="No events scheduled"
          description="Class events will appear here once scheduled."
          action={<CalendarDays className="w-12 h-12 text-galaxy-400" />}
        />
      </Section>
    </main>
  );
}
