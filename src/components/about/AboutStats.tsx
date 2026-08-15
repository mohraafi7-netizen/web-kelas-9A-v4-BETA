import * as React from 'react';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';

function AboutStats() {
  const stats = [
    { label: 'Total Members', value: '42' },
    { label: 'Teachers', value: '5' },
    { label: 'Projects', value: '12' },
    { label: 'Awards', value: '8' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-20">
      {stats.map((stat) => (
        <GlassCard key={stat.label} variant="default" className="p-8 text-center group hover:border-galaxy-500/30 transition-all duration-300">
          <div className="text-4xl sm:text-5xl font-bold text-galaxy-400 mb-3 tracking-tight group-hover:scale-110 transition-transform duration-300">{stat.value}</div>
          <div className="text-xs text-slate-400 uppercase tracking-widest">{stat.label}</div>
        </GlassCard>
      ))}
    </div>
  );
}

export { AboutStats };
