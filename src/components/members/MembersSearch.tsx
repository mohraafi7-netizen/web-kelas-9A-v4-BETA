'use client';

import * as React from 'react';
import { Search } from 'lucide-react';
import { GlassCard } from '@/components/ui';
import { GalaxyBadge } from '@/components/ui';
import { MemberCard } from '@/components/members/MemberCard';
import { MemberModal } from '@/components/members/MemberModal';
import type { Profile } from '@/types';

function MembersSearch({ members }: { members: Profile[] }) {
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState('all');
  const [selectedMember, setSelectedMember] = React.useState<Profile | null>(null);

  const filtered = members.filter((m) => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || m.role === filter;
    return matchesSearch && matchesFilter;
  });

  const roles: string[] = Array.from(new Set(members.map((m) => m.role).filter((r): r is string => Boolean(r))));

  return (
    <>
      <GlassCard className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search members..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-galaxy-500 focus:border-transparent"
            />
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
        {filtered.map((member) => (
          <MemberCard key={member.id} member={member} onClick={() => setSelectedMember(member)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-12 text-center text-sm text-slate-400">No members found.</div>
      )}

      <MemberModal member={selectedMember} open={!!selectedMember} onClose={() => setSelectedMember(null)} />
    </>
  );
}

export { MembersSearch };
