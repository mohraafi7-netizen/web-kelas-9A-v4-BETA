import { Section } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { BookOpen } from 'lucide-react';

export const metadata = {
  title: 'Materials - Galaxy Class',
  description: 'Class materials and resources.',
};

export default function MaterialsPage() {
  return (
    <main className="min-h-screen">
      <Section title="Materials" subtitle="Access class materials and resources.">
        <EmptyState
          title="No materials yet"
          description="Study materials and resources will appear here."
          action={<BookOpen className="w-12 h-12 text-galaxy-400" />}
        />
      </Section>
    </main>
  );
}
