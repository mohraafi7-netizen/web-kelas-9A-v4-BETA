import { Section } from '@/components/ui';
import { AboutVisionMission } from '@/components/about/AboutVisionMission';
import { AboutTeachers } from '@/components/about/AboutTeachers';
import { AboutAchievements } from '@/components/about/AboutAchievements';
import { AboutStats } from '@/components/about/AboutStats';

export default function AboutPage() {
  return (
    <main className="min-h-screen">
      <Section
        title="About Galaxy Class"
        subtitle="Learn more about our class identity, vision, and mission."
      >
        <AboutStats />
        <AboutVisionMission />
        <AboutTeachers />
        <AboutAchievements />
      </Section>
    </main>
  );
}
