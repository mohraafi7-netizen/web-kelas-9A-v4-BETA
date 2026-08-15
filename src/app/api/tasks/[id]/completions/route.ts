import { createClientSupabase } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import { NextResponse } from 'next/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const supabase = await createClientSupabase();

    const { data, error } = await supabase
      .from('task_completions')
      .select('*')
      .eq('task_id', id);

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch completions' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const supabase = await createClientSupabase();

    const { data: existing } = await supabase
      .from('task_completions')
      .select('*')
      .eq('task_id', id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase
        .from('task_completions')
        .delete()
        .eq('id', existing.id);

      if (error) throw error;
      return NextResponse.json({ completed: false });
    }

    const { data, error } = await supabase
      .from('task_completions')
      .insert({ task_id: id, user_id: user.id })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ completed: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle completion' }, { status: 500 });
  }
}
