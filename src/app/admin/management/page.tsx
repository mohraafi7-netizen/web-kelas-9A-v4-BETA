'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { Button } from '@/components/ui';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { UserPlus, Shield, Trash2, KeyRound } from 'lucide-react';
import { useToast } from '@/components/ui';

interface Profile {
  id: string;
  username: string;
  role: string;
  name: string;
}

function AdminManagement() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [profiles, setProfiles] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [resettingId, setResettingId] = React.useState<string | null>(null);
  const [passwordForm, setPasswordForm] = React.useState<{ [key: string]: { password: string; confirm: string; show: boolean } }>({});
  const [resetConfirm, setResetConfirm] = React.useState<{ open: boolean; userId: string; name: string; loading: boolean }>({ open: false, userId: '', name: '', loading: false });

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

  const requestPasswordReset = (userId: string, name: string) => {
    const form = passwordForm[userId];
    if (!form) return;

    if (!form.password || form.password.length < 8) {
      showToast('error', 'Password must be at least 8 characters');
      return;
    }

    if (form.password !== form.confirm) {
      showToast('error', 'Passwords do not match');
      return;
    }

    setResetConfirm({ open: true, userId, name, loading: false });
  };

  const cancelPasswordReset = () => {
    if (resetConfirm.loading) return;
    setResetConfirm({ open: false, userId: '', name: '', loading: false });
  };

  const confirmPasswordReset = async () => {
    const { userId } = resetConfirm;
    setResetConfirm((prev) => ({ ...prev, loading: true }));
    const form = passwordForm[userId];
    setResettingId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: form?.password ?? '' }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast('error', data.error || 'Failed to reset password');
        setResetConfirm({ open: false, userId: '', name: '', loading: false });
        return;
      }

      showToast('success', 'Password berhasil diubah');
      setPasswordForm(prev => ({ ...prev, [userId]: { password: '', confirm: '', show: false } }));
    } catch {
      showToast('error', 'Failed to reset password');
    } finally {
      setResettingId(null);
      setResetConfirm({ open: false, userId: '', name: '', loading: false });
    }
  };

  const updatePasswordField = (userId: string, field: 'password' | 'confirm', value: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        [field]: value,
        show: prev[userId]?.show ?? false,
      },
    }));
  };

  const togglePasswordShow = (userId: string) => {
    setPasswordForm(prev => ({
      ...prev,
      [userId]: {
        ...prev[userId],
        show: !prev[userId]?.show,
      },
    }));
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
          <h3 className="font-semibold text-white">User Management</h3>
        </div>
        {loading ? (
          <p className="text-sm text-slate-400">Loading...</p>
        ) : (
          <div className="space-y-3">
            {profiles.map((p) => {
              const form = passwordForm[p.id] || { password: '', confirm: '', show: false };
              const isResetting = resettingId === p.id;

              return (
                <div key={p.id} className="p-4 rounded-xl bg-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{p.name}</p>
                      <p className="text-xs text-slate-400">@{p.username} · {p.role}</p>
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

                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <input
                        type={form.show ? 'text' : 'password'}
                        value={form.password}
                        onChange={(e) => updatePasswordField(p.id, 'password', e.target.value)}
                        placeholder="New password"
                        className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-galaxy-500"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordShow(p.id)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
                      >
                        {form.show ? 'Hide' : 'Show'}
                      </button>
                    </div>
                    <input
                      type={form.show ? 'text' : 'password'}
                      value={form.confirm}
                      onChange={(e) => updatePasswordField(p.id, 'confirm', e.target.value)}
                      placeholder="Confirm password"
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-galaxy-500"
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => requestPasswordReset(p.id, p.name)}
                      disabled={isResetting || !form.password || !form.confirm}
                      className="gap-1.5"
                    >
                      <KeyRound className="w-4 h-4" />
                      {isResetting ? 'Resetting...' : 'Reset'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </GlassCard>

      <ConfirmDialog
        open={resetConfirm.open}
        title="Ubah Password?"
        description={`Password akun "${resetConfirm.name}" akan diganti dengan password baru.`}
        confirmLabel="Ubah Password"
        cancelLabel="Batal"
        loading={resetConfirm.loading}
        variant="warning"
        onConfirm={confirmPasswordReset}
        onCancel={cancelPasswordReset}
      />
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
