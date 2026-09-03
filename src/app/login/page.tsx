'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { GalaxyButton } from '@/components/ui';
import { GalaxyGlow } from '@/components/ui';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [selectedName, setSelectedName] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [profiles, setProfiles] = React.useState<Array<{ id: string; name: string }>>([]);
  const { login, loading, error, profile } = useAuth();

  React.useEffect(() => {
    if (profile) {
      router.push('/dashboard');
    }
  }, [profile, router]);

  React.useEffect(() => {
    const supabase = createClientSupabaseBrowser();
    supabase
      .from('profiles')
      .select('id, name')
      .order('name')
      .then(({ data }) => {
        if (data) setProfiles(data);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedName) return;
    const success = await login(selectedName, password);
    if (success) {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-galaxy p-4 relative overflow-hidden">
      <GalaxyGlow size="xl" color="purple" className="top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2" />
      <GalaxyGlow size="lg" color="blue" className="bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full glass-card mb-6 mx-auto">
            <span className="text-3xl">🌌</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            GALAXY CLASS
          </h1>
          <p className="text-slate-400">Welcome back to your galaxy.</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 space-y-6">
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm animate-in">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2 text-slate-300">
              Pilih Nama
            </label>
            <select
              id="name"
              value={selectedName}
              onChange={(e) => setSelectedName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800/50 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-galaxy-500 focus:border-transparent transition-all"
              required
            >
              <option value="">Pilih nama siswa</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.name}>
                  {profile.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2 text-slate-300">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-galaxy-500 focus:border-transparent transition-all"
                placeholder="Masukkan password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-sm transition-colors"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          <GalaxyButton
            type="submit"
            disabled={loading || !selectedName}
            className="w-full"
            size="lg"
          >
            {loading ? 'Signing in...' : 'Login'}
          </GalaxyButton>

          <p className="text-center text-sm text-slate-400">
            Contact admin if you need access.
          </p>
        </form>
      </div>
    </div>
  );
}
