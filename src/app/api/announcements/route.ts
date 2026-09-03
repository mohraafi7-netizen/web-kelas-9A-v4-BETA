import { createClientSupabase } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClientSupabase();
    const { data, error } = await supabase.from('announcements').select('id, title, content, created_at, author').order('created_at', { ascending: false }).limit(50);
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('[ANNOUNCEMENTS GET ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
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
    const content = typeof body.content === 'string' ? body.content.trim() : '';

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { data, error } = await supabase.from('announcements').insert({
      title,
      content: content || null,
      author: user.email,
    }).select().single();

    if (error) {
      console.error('[ANNOUNCEMENTS POST ERROR]', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('[ANNOUNCEMENTS POST EXCEPTION]', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
