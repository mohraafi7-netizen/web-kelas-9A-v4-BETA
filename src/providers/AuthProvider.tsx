'use client';

import * as React from 'react';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { RealtimeChannel } from '@supabase/supabase-js';

export type UserRole = 'member' | 'admin' | 'main_admin';

export interface Profile {
  id: string;
  username: string;
  role: UserRole;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = React.createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadProfile = React.useCallback(async (userId: string) => {
    const supabase = createClientSupabaseBrowser();

    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, role, name, email')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('PROFILE LOAD ERROR:', error);
      throw new Error(`Gagal mengambil profile: ${error.message}`);
    }

    if (!data) {
      throw new Error('Profile user tidak ditemukan.');
    }

    const loadedProfile = data as Profile;
    setProfile(loadedProfile);

    return loadedProfile;
  }, []);

  React.useEffect(() => {
    let mounted = true;
    let profileChannel: RealtimeChannel | null = null;

    const supabase = createClientSupabaseBrowser();

    const initialize = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('SESSION ERROR:', sessionError);
        }

        if (!mounted) return;

        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          try {
            await loadProfile(currentUser.id);
          } catch (profileError) {
            console.error('INITIAL PROFILE ERROR:', profileError);

            if (mounted) {
              setProfile(null);
              setError(
                profileError instanceof Error
                  ? profileError.message
                  : 'Gagal mengambil profile.'
              );
            }
          }
        }
      } catch (err) {
        console.error('AUTH INITIALIZATION ERROR:', err);

        if (mounted) {
          setError(
            err instanceof Error
              ? err.message
              : 'Gagal memuat sistem login.'
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initialize();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      const currentUser = session?.user ?? null;

      setUser(currentUser);

      if (!currentUser) {
        setProfile(null);
        setLoading(false);
        return;
      }

      if (profileChannel) {
        supabase.removeChannel(profileChannel);
      }

      profileChannel = supabase
        .channel('profile-updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${currentUser.id}`,
          },
          (payload) => {
            if (mounted) {
              setProfile(payload.new as Profile);
            }
          }
        )
        .subscribe();
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
      if (profileChannel) {
        supabase.removeChannel(profileChannel);
      }
    };
  }, [loadProfile]);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setError(null);
    setLoading(true);

    try {
      const supabase = createClientSupabaseBrowser();

      console.log('=== LOGIN DEBUG ===');
      console.log('NAME:', username);

      const {
        data: profileData,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select('id, username, role, name, email')
        .eq('name', username)
        .maybeSingle();

      if (profileError) {
        console.error('PROFILE QUERY ERROR:', profileError);

        setError(`PROFILE ERROR: ${profileError.message}`);

        return false;
      }

      if (!profileData) {
        console.error('PROFILE NOT FOUND:', username);

        setError('Profile tidak ditemukan untuk nama tersebut.');

        return false;
      }

      console.log('PROFILE FOUND:', {
        id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        role: profileData.role,
      });

      const email = profileData.email?.trim().toLowerCase();

      if (!email) {
        setError('Email akun tidak ditemukan di profile.');

        return false;
      }

      console.log('TRY AUTH LOGIN:', email);

      const {
        data: authData,
        error: authError,
      } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        console.error('AUTH LOGIN ERROR:', authError);

        setError(`AUTH ERROR: ${authError.message}`);

        return false;
      }

      if (!authData.user) {
        console.error('AUTH USER EMPTY');

        setError(
          'Supabase tidak mengembalikan user setelah login.'
        );

        return false;
      }

      console.log(
        'AUTH LOGIN SUCCESS:',
        authData.user.email
      );

      setUser(authData.user);
      setProfile(profileData as Profile);

      return true;
    } catch (err) {
      console.error('LOGIN EXCEPTION:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Terjadi kesalahan saat login.'
      );

      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (!user) return;

    try {
      await loadProfile(user.id);
    } catch (err) {
      console.error('REFRESH PROFILE ERROR:', err);

      setError(
        err instanceof Error
          ? err.message
          : 'Gagal memperbarui profile.'
      );
    }
  };

  const logout = async () => {
    const supabase = createClientSupabaseBrowser();

    await supabase.auth.signOut();

    setUser(null);
    setProfile(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        error,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
}
