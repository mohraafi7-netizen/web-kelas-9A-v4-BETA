import { createClientSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export type UserRole = 'member' | 'admin' | 'main_admin';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: UserRole;
}

export async function getAuthenticatedUser(): Promise<AuthenticatedUser | null> {
  const supabase = await createClientSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  if (!session?.user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, email, role')
    .eq('id', session.user.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    role: profile.role as UserRole,
  };
}

export function requireRole(allowedRoles: UserRole[]) {
  return async (request: Request): Promise<AuthenticatedUser | Response> => {
    const user = await getAuthenticatedUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!allowedRoles.includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return user;
  };
}
