import { Section } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { Vote } from 'lucide-react';

export const metadata = {
  title: 'Voting - Galaxy Class',
  description: 'Class voting and polls.',
};

export default function VotingPage() {
  return (
    <main className="min-h-screen">
      <Section title="Voting" subtitle="Participate in class polls and votes.">
        <EmptyState
          title="No active polls"
          description="Voting polls will appear here when created."
          action={<Vote className="w-12 h-12 text-galaxy-400" />}
        />
      </Section>
    </main>
  );
}
