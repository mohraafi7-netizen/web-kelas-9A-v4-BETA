import { createClientSupabase } from '@/lib/supabase/server';
import { getAuthenticatedUser, requireRole } from '@/lib/auth/api-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClientSupabase();
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('event_date', { ascending: true })
      .limit(100);

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error('[EVENTS GET ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
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
    const description = typeof body.description === 'string' ? body.description.trim() : null;
    const event_type = typeof body.event_type === 'string' ? body.event_type.trim() : 'event';
    const event_date = typeof body.event_date === 'string' ? body.event_date : '';
    const event_time = typeof body.event_time === 'string' ? body.event_time.trim() : null;

    if (!title || !event_date) {
      return NextResponse.json({ error: 'Title and event date are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('events')
      .insert({
        title,
        description: description || null,
        event_type: event_type || 'event',
        event_date,
        event_time: event_time || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('[EVENTS POST ERROR]', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[EVENTS POST EXCEPTION]', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
