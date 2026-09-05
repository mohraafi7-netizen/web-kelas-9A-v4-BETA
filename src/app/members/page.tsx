'use client';

import * as React from 'react';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { GalaxyBadge } from '@/components/ui';
import { GalaxyGlow } from '@/components/ui';
import { PageHeader } from '@/components/ui';
import { SpaceBackground } from '@/components/ui';
import { MembersSearch } from '@/components/members';
import { EmptyState } from '@/components/ui';
import { Users } from 'lucide-react';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { MEMBERS_DATA } from '@/data/members';
import type { Profile } from '@/types';
import { PresenceProvider } from '@/hooks/usePresence';

export default function MembersPage() {
  return (
    <PresenceProvider>
      <MembersPageContent />
    </PresenceProvider>
  );
}

function MembersPageContent() {
  const [members, setMembers] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const channelRef = React.useRef<ReturnType<ReturnType<typeof createClientSupabaseBrowser>['channel']> | null>(null);

  React.useEffect(() => {
    const supabase = createClientSupabaseBrowser();

    const fetchMembers = async () => {
      try {
        const { data } = await supabase.from('profiles').select('id, name, role, photo_path, attendance_number, instagram_url, tiktok_url, last_seen, created_at').order('name').limit(200);
        if (data && data.length > 0) {
          setMembers(data);
        } else {
          setMembers(MEMBERS_DATA.map(m => ({ ...m, photo_path: null, attendance_number: null, instagram_url: null, tiktok_url: null, last_seen: null, created_at: new Date().toISOString() })));
        }
      } catch {
        setMembers(MEMBERS_DATA.map(m => ({ ...m, photo_path: null, attendance_number: null, instagram_url: null, tiktok_url: null, last_seen: null, created_at: new Date().toISOString() })));
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();

    const channel = supabase
      .channel('members-realtime')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles', filter: 'id=neq.00000000-0000-0000-0000-000000000000' }, () => {
        fetchMembers();
      })
      .subscribe();
    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        try {
          supabase.removeChannel(channelRef.current);
        } catch (err) {
          console.warn('[Members] channel cleanup error (non-fatal):', err);
        }
        channelRef.current = null;
      }
    };
  }, []);

  return (
    <main className="min-h-screen pb-24 md:pb-8">
      <SpaceBackground particleCount={40} enableParallax={false} />

      <Section className="relative z-10">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-0">
          <GalaxyGlow size="lg" color="blue" className="top-0 left-0 opacity-20" />

          <PageHeader
            eyebrow="The Crew"
            title="Members"
            description="Find and connect with your classmates."
            actions={
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full glass">
                <Users className="w-4 h-4 text-galaxy-400" />
                <span className="text-sm font-medium text-slate-300">{members.length} members</span>
              </div>
            }
          />

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-5">
              {Array.from({ length: 10 }).map((_, i) => (
                <GlassCard key={i} className="p-0 overflow-hidden">
                  <div className="aspect-[4/3] bg-slate-800 animate-pulse" />
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-slate-700/50 rounded w-3/4" />
                    <div className="h-3 bg-slate-700/50 rounded w-1/2" />
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <MembersSearch members={members} />
          )}
        </div>
      </Section>
    </main>
  );
}
