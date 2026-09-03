import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Voting - Galaxy Class',
  description: 'Class voting and polls.',
};

export default function VotingPage() {
  redirect('/polls');
}
