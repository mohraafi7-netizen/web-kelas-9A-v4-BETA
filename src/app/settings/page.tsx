'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { Button } from '@/components/ui';
import { User, Settings as SettingsIcon, Shield, Upload } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const { profile, logout } = useAuth();
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    try {
      const supabase = createClientSupabaseBrowser();
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setMessage('Password updated successfully.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch {
      setError('Failed to update password.');
    }
  };

  if (!profile) {
    return (
      <main className="min-h-screen">
        <Section title="Settings" subtitle="Manage your account settings.">
          <div className="max-w-2xl mx-auto text-center">
            <User className="w-16 h-16 text-galaxy-400 mx-auto mb-4" />
            <p className="text-slate-400 mb-4">Please sign in to view settings.</p>
            <Button onClick={() => router.push('/login')}>Sign In</Button>
          </div>
        </Section>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <Section title="Settings" subtitle="Manage your account settings.">
        <div className="max-w-2xl mx-auto space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-galaxy-600/10 border border-galaxy-500/10">
                <User className="w-6 h-6 text-galaxy-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Profile</h3>
                <p className="text-sm text-slate-400">{profile.name}</p>
              </div>
            </div>
            <p className="text-xs text-slate-500 capitalize">Role: {profile.role.replace('_', ' ')}</p>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-galaxy-600/10 border border-galaxy-500/10">
                <Shield className="w-6 h-6 text-galaxy-400" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Security</h3>
                <p className="text-sm text-slate-400">Change your password</p>
              </div>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              {message && <p className="text-sm text-green-400">{message}</p>}
              {error && <p className="text-sm text-red-400">{error}</p>}
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-galaxy-500"
                  placeholder="Enter new password"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2 text-slate-300">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-galaxy-500"
                  placeholder="Confirm new password"
                  required
                  minLength={6}
                />
              </div>
              <Button type="submit" className="w-full">Change Password</Button>
            </form>
          </GlassCard>

          {profile.role === 'main_admin' && (
            <GlassCard className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-xl bg-galaxy-600/10 border border-galaxy-500/10">
                  <SettingsIcon className="w-6 h-6 text-galaxy-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Admin Tools</h3>
                  <p className="text-sm text-slate-400">Manage admins and system settings</p>
                </div>
              </div>
              <Button href="/admin/management" variant="secondary" className="w-full">
                Manage Admins
              </Button>
            </GlassCard>
          )}

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => router.push('/dashboard')} className="flex-1">
              Back to Dashboard
            </Button>
            <Button variant="ghost" onClick={logout} className="flex-1">
              Sign Out
            </Button>
          </div>
        </div>
      </Section>
    </main>
  );
}
