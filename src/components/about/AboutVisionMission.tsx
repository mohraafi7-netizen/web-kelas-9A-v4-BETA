import * as React from 'react';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { Target, Eye } from 'lucide-react';

function AboutVisionMission() {
  return (
    <div className="grid md:grid-cols-2 gap-8 mb-20">
      <GlassCard variant="strong" className="p-8 sm:p-10 group hover:border-galaxy-500/20 transition-all duration-300">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-galaxy-600/10 border border-galaxy-500/10">
            <Eye className="w-6 h-6 text-galaxy-400" />
          </div>
          <h3 className="text-2xl font-semibold text-white">Vision</h3>
        </div>
        <p className="text-slate-300 leading-relaxed text-lg">
          To become a class that excels academically, is creative, and has a strong character, ready to compete in the global era.
        </p>
      </GlassCard>
      <GlassCard variant="strong" className="p-8 sm:p-10 group hover:border-galaxy-500/20 transition-all duration-300">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 rounded-xl bg-galaxy-600/10 border border-galaxy-500/10">
            <Target className="w-6 h-6 text-galaxy-400" />
          </div>
          <h3 className="text-2xl font-semibold text-white">Mission</h3>
        </div>
        <ul className="space-y-4 text-slate-300">
          {[
            'Create a conducive learning environment',
            'Develop creativity and innovation through projects',
            'Build integrity and collaboration among members',
            'Achieve excellence in academics and non-academics',
          ].map((item, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="text-galaxy-400 mt-1.5 text-sm">◆</span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      </GlassCard>
    </div>
  );
}

export { AboutVisionMission };
