import { Section } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { Cake } from 'lucide-react';

export const metadata = {
  title: 'Birthdays - Galaxy Class',
  description: 'Class birthdays celebration.',
};

export default function BirthdaysPage() {
  return (
    <main className="min-h-screen">
      <Section title="Birthdays" subtitle="Celebrate class birthdays.">
        <EmptyState
          title="No birthdays today"
          description="Birthday celebrations will appear here."
          action={<Cake className="w-12 h-12 text-galaxy-400" />}
        />
      </Section>
    </main>
  );
}
