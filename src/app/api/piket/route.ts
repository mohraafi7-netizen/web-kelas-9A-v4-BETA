import { createClientSupabase } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClientSupabase();
    const { data, error } = await supabase
      .from('piket')
      .select('id, date, day, student_name, task, created_by, created_at, updated_at')
      .order('date', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error('[PIKET GET ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch piket' }, { status: 500 });
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

    const date = typeof body.date === 'string' ? body.date.trim() : '';
    const day = typeof body.day === 'string' ? body.day.trim() : '';
    const student_name = typeof body.student_name === 'string' ? body.student_name.trim() : '';
    const task = typeof body.task === 'string' ? body.task.trim() : '';

    if (!date || !day || !student_name || !task) {
      return NextResponse.json({ error: 'Date, day, student_name, and task are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('piket')
      .insert({
        date,
        day,
        student_name,
        task,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('[PIKET POST ERROR]', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('[PIKET POST EXCEPTION]', error);
    return NextResponse.json({ error: 'Failed to create piket' }, { status: 500 });
  }
}
