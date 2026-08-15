'use client';

import * as React from 'react';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { GalaxyBadge } from '@/components/ui';
import { GalaxyGlow } from '@/components/ui';
import { SpaceBackground } from '@/components/ui';
import { AnnouncementsClient } from '@/components/announcements/AnnouncementsClient';
import { EmptyState } from '@/components/ui';
import { Bell, Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AnnouncementsPage() {
  return (
    <main className="min-h-screen">
      <SpaceBackground particleCount={40} enableParallax={false} />

      <Section
        title="TRANSMISSIONS"
        subtitle="Stay updated with the latest news and announcements."
        className="relative z-10"
      >
        <div className="relative">
          <GalaxyGlow size="lg" color="purple" className="top-0 right-0 opacity-30" />
          <AnnouncementsClient />
        </div>
      </Section>
    </main>
  );
}
