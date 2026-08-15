import * as React from 'react';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { Trophy } from 'lucide-react';

function AboutAchievements() {
  const achievements = [
    { title: 'Best Class Award 2024', description: 'Recognized as the best performing class in the school.' },
    { title: 'Science Olympiad Gold', description: 'First place in the regional Science Olympiad competition.' },
    { title: 'Coding Championship', description: 'Winners of the inter-school coding competition.' },
    { title: 'Sports Day Champions', description: 'Overall champions of the annual sports day event.' },
  ];

  return (
    <div>
      <div className="text-center mb-10">
        <h3 className="text-3xl font-semibold text-white mb-3">Achievements</h3>
        <p className="text-slate-400">Our journey through the stars</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {achievements.map((achievement) => (
          <GlassCard key={achievement.title} hover variant="default" className="p-6 group">
            <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
              <Trophy className="w-6 h-6 text-yellow-400" />
            </div>
            <h4 className="font-semibold text-white mb-2 group-hover:text-galaxy-300 transition-colors">{achievement.title}</h4>
            <p className="text-sm text-slate-400 leading-relaxed">{achievement.description}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

export { AboutAchievements };
