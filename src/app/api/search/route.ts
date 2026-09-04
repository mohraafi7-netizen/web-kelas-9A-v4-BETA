import { createClientSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query || query.length < 2) {
      return NextResponse.json({ results: {} });
    }

    const supabase = await createClientSupabase();
    const like = `%${query}%`;

    const [membersRes, scheduleRes, tasksRes, announcementsRes, projectsRes, pollsRes] = await Promise.all([
      supabase.from('profiles').select('id, name, role').ilike('name', like).limit(5),
      supabase.from('schedule').select('id, subject, teacher').ilike('subject', like).limit(5),
      supabase.from('tasks').select('id, title, status').ilike('title', like).limit(5),
      supabase.from('announcements').select('id, title').ilike('title', like).limit(5),
      supabase.from('projects').select('id, title').ilike('title', like).limit(5),
      supabase.from('polls').select('id, title').ilike('title', like).limit(5),
    ]);

    return NextResponse.json({
      results: {
        members: membersRes.data ?? [],
        schedule: scheduleRes.data ?? [],
        tasks: tasksRes.data ?? [],
        announcements: announcementsRes.data ?? [],
        projects: projectsRes.data ?? [],
        polls: pollsRes.data ?? [],
      },
    });
  } catch (error) {
    console.error('[SEARCH ERROR]', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
