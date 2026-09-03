import { createClientSupabase } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClientSupabase();
    const { data, error } = await supabase
      .from('polls')
      .select('id, title, description, is_active, starts_at, ends_at, created_by, created_at')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error('[POLLS GET ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch polls' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role !== 'admin' && user.role !== 'main_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const supabase = await createClientSupabase();
    const body = await request.json();

    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('polls')
      .insert({
        title,
        description: typeof body.description === 'string' ? body.description.trim() || null : null,
        is_active: typeof body.is_active === 'boolean' ? body.is_active : true,
        starts_at: typeof body.starts_at === 'string' ? body.starts_at || null : null,
        ends_at: typeof body.ends_at === 'string' ? body.ends_at || null : null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('[POLLS POST ERROR]', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('[POLLS POST EXCEPTION]', error);
    return NextResponse.json({ error: 'Failed to create poll' }, { status: 500 });
  }
}
