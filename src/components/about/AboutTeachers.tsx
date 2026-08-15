import * as React from 'react';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { Avatar } from '@/components/ui';

function AboutTeachers() {
  const teachers = [
    { name: 'Mrs. Sarah Johnson', subject: 'Mathematics', initial: 'SJ' },
    { name: 'Mr. David Chen', subject: 'Physics', initial: 'DC' },
    { name: 'Ms. Emily Davis', subject: 'English Literature', initial: 'ED' },
    { name: 'Mr. Michael Brown', subject: 'Computer Science', initial: 'MB' },
    { name: 'Ms. Lisa Wang', subject: 'Biology', initial: 'LW' },
  ];

  return (
    <div className="mb-20">
      <div className="text-center mb-10">
        <h3 className="text-3xl font-semibold text-white mb-3">Our Teachers</h3>
        <p className="text-slate-400">Guiding us through the galaxy of knowledge</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
        {teachers.map((teacher) => (
          <GlassCard key={teacher.name} hover variant="default" className="p-6 text-center group">
            <Avatar name={teacher.name} size="lg" className="mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
            <h4 className="font-semibold text-white mb-1 group-hover:text-galaxy-300 transition-colors">{teacher.name}</h4>
            <p className="text-sm text-slate-400">{teacher.subject}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

export { AboutTeachers };
