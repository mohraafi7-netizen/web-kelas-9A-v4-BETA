import { createClientSupabase } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClientSupabase();
    const { data, error } = await supabase
      .from('chat_messages')
      .select('id, username, message, created_at')
      .order('created_at', { ascending: true })
      .limit(100);

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error('[CHAT GET ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClientSupabase();
    const body = await request.json();

    const message = typeof body.message === 'string' ? body.message.trim() : '';
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        user_id: user.id,
        username: user.email,
        message,
      })
      .select()
      .single();

    if (error) {
      console.error('[CHAT POST ERROR]', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('[CHAT POST EXCEPTION]', error);
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
