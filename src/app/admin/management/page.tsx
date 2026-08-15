'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { Button } from '@/components/ui';
import { UserPlus, Shield, Trash2 } from 'lucide-react';

interface Profile {
  id: string;
  username: string;
  role: string;
  name: string;
}

function AdminManagement() {
  const { profile } = useAuth();
  const [profiles, setProfiles] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (profile?.role !== 'main_admin') return;

    fetch('/api/admin/profiles')
      .then(res => res.json())
      .then(data => {
        setProfiles(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [profile]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    await fetch('/api/admin/profiles', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, role: newRole }),
    });
    setProfiles(prev => prev.map(p => p.id === userId ? { ...p, role: newRole } : p));
  };

  if (profile?.role !== 'main_admin') {
    return (
      <GlassCard className="p-6 text-center">
        <Shield className="w-12 h-12 text-galaxy-400 mx-auto mb-3" />
        <h3 className="font-semibold text-white mb-2">Access Restricted</h3>
        <p className="text-sm text-slate-400">Only Main Admin can access this page.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <UserPlus className="w-5 h-5 text-galaxy-400" />
          <h3 className="font-semibold text-white">Admin Management</h3>
        </div>
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : (
          <div className="space-y-3">
            {profiles.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div>
                  <p className="text-sm font-medium text-white">{p.name}</p>
                  <p className="text-xs text-slate-400">@{p.username}</p>
                </div>
                <select
                  value={p.role}
                  onChange={(e) => handleRoleChange(p.id, e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="main_admin">Main Admin</option>
                </select>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}

export default function AdminManagementPage() {
  const router = useRouter();
  const { profile } = useAuth();

  if (!profile) {
    return (
      <main className="min-h-screen">
        <Section title="Admin Management">
          <div className="text-center">
            <p className="text-slate-400 mb-4">Please sign in.</p>
            <Button onClick={() => router.push('/login')}>Sign In</Button>
          </div>
        </Section>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Section title="Admin Management" subtitle="Manage roles and access.">
        <AdminManagement />
      </Section>
    </main>
  );
}
