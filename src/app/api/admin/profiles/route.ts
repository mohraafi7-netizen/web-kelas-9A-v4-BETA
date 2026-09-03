import { createClientSupabase } from '@/lib/supabase/server';
import { getAuthenticatedUser, requireRole } from '@/lib/auth/api-auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const authResult = await requireRole(['admin', 'main_admin'])(request);
  if (authResult instanceof Response) return authResult;

  const supabase = await createClientSupabase();
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, role, name')
    .order('name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function PATCH(request: Request) {
  try {
    const authResult = await requireRole(['main_admin'])(request);
    if (authResult instanceof Response) return authResult;

    const { userId, role } = await request.json();

    const supabase = await createClientSupabase();
    const { error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
