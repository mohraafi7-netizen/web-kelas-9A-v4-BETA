import { createClientSupabase } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClientSupabase();
    const { data, error } = await supabase
      .from('schedule')
      .select('id, day, time_start, time_end, subject, teacher, room')
      .order('day', { ascending: true })
      .order('time_start', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error('[SCHEDULE GET ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
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

    const day = typeof body.day === 'string' ? body.day.trim() : '';
    const time_start = typeof body.time_start === 'string' ? body.time_start.trim() : '';
    const time_end = typeof body.time_end === 'string' ? body.time_end.trim() : '';
    const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    const teacher = typeof body.teacher === 'string' ? body.teacher.trim() : '';
    const room = typeof body.room === 'string' ? body.room.trim() : '';

    if (!day || !time_start || !time_end || !subject) {
      return NextResponse.json({ error: 'Day, time_start, time_end, and subject are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('schedule')
      .insert({
        day,
        time_start,
        time_end,
        subject,
        teacher,
        room,
      })
      .select()
      .single();

    if (error) {
      console.error('[SCHEDULE POST ERROR]', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('[SCHEDULE POST EXCEPTION]', error);
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
  }
}
