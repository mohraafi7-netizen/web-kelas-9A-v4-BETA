import { createClientSupabase } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClientSupabase();
    const { data, error } = await supabase
      .from('tasks')
      .select('id, title, description, subject, deadline, status, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error('[TASKS GET ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
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
    const description = typeof body.description === 'string' ? body.description.trim() : '';
    const subject = typeof body.subject === 'string' ? body.subject.trim() : '';
    const deadline = typeof body.deadline === 'string' ? body.deadline.trim() : null;
    const status = typeof body.status === 'string' ? body.status.trim() : 'active';

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title,
        description: description || null,
        subject: subject || null,
        deadline: deadline || null,
        status,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error('[TASKS POST ERROR]', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('[TASKS POST EXCEPTION]', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
