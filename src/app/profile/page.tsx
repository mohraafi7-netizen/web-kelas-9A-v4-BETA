'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { GalaxyButton } from '@/components/ui';
import { GalaxyBadge } from '@/components/ui';
import { GalaxyGlow } from '@/components/ui';
import { Avatar } from '@/components/ui';
import { SpaceBackground } from '@/components/ui';
import { User, Shield, Calendar, Mail, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { profile, logout } = useAuth();

  if (!profile) {
    return (
      <main className="min-h-screen">
        <SpaceBackground particleCount={40} enableParallax={false} />
        <Section title="Profile" subtitle="Your profile information." className="relative z-10">
          <div className="max-w-2xl mx-auto text-center">
            <GlassCard className="p-8">
              <User className="w-16 h-16 text-galaxy-400 mx-auto mb-4" />
              <p className="text-slate-400 mb-4">Please sign in to view your profile.</p>
              <GalaxyButton onClick={() => router.push('/login')}>Sign In</GalaxyButton>
            </GlassCard>
          </div>
        </Section>
      </main>
    );
  }

  const roleLabel =
    profile.role === 'main_admin' ? 'Main Administrator' : profile.role === 'admin' ? 'Class Admin' : 'Class Member';

  const roleBadgeVariant =
    profile.role === 'main_admin' ? 'danger' : profile.role === 'admin' ? 'info' : 'secondary';

  return (
    <main className="min-h-screen">
      <SpaceBackground particleCount={40} enableParallax={false} />
      <Section title="PROFILE" subtitle="Your astronaut profile." className="relative z-10">
        <div className="max-w-2xl mx-auto">
          <GlassCard className="p-8 relative overflow-hidden">
            <GalaxyGlow size="lg" color="purple" className="top-0 right-0 opacity-20" />

            <div className="relative z-10 text-center">
              <div className="relative inline-block mb-6">
                <Avatar name={profile.name} size="lg" className="mx-auto" />
                <div className="absolute -bottom-1 -right-1">
                  <GalaxyBadge variant={roleBadgeVariant} size="sm">
                    {profile.role === 'main_admin' ? '👑' : profile.role === 'admin' ? '⭐' : '🚀'}
                  </GalaxyBadge>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">{profile.name}</h2>

              <div className="flex items-center justify-center gap-2 text-slate-400 mb-4">
                <Mail className="w-4 h-4" />
                <span className="text-sm">{profile.email}</span>
              </div>

              <div className="flex items-center justify-center gap-2 mb-6">
                <Shield className="w-4 h-4 text-galaxy-400" />
                <GalaxyBadge variant={roleBadgeVariant} size="md">
                  {roleLabel}
                </GalaxyBadge>
              </div>

              <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mb-8">
                <Calendar className="w-4 h-4" />
                <span>Member since 2024</span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <GalaxyButton href="/settings" variant="secondary" icon={<User className="w-4 h-4" />}>
                  Settings
                </GalaxyButton>
                <GalaxyButton onClick={logout} variant="danger" icon={<LogOut className="w-4 h-4" />}>
                  Sign Out
                </GalaxyButton>
              </div>
            </div>
          </GlassCard>
        </div>
      </Section>
    </main>
  );
}
