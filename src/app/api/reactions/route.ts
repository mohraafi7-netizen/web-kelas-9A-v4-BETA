import { createClientSupabase } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('message_id');

    if (!messageId) {
      return NextResponse.json({ error: 'message_id is required' }, { status: 400 });
    }

    const supabase = await createClientSupabase();
    const { data, error } = await supabase
      .from('reactions')
      .select('*')
      .eq('message_id', messageId);

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (error) {
    console.error('[REACTIONS GET ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch reactions' }, { status: 500 });
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

    const messageId = typeof body.message_id === 'string' ? body.message_id : '';
    const emoji = typeof body.emoji === 'string' ? body.emoji.trim() : '';

    if (!messageId || !emoji) {
      return NextResponse.json({ error: 'message_id and emoji are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('reactions')
      .upsert(
        { message_id: messageId, user_id: user.id, emoji },
        { onConflict: 'message_id,user_id,emoji' }
      )
      .select()
      .single();

    if (error) {
      console.error('[REACTIONS POST ERROR]', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[REACTIONS POST EXCEPTION]', error);
    return NextResponse.json({ error: 'Failed to add reaction' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const messageId = searchParams.get('message_id');
    const emoji = searchParams.get('emoji');

    if (!messageId || !emoji) {
      return NextResponse.json({ error: 'message_id and emoji are required' }, { status: 400 });
    }

    const supabase = await createClientSupabase();
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', user.id)
      .eq('emoji', emoji);

    if (error) {
      console.error('[REACTIONS DELETE ERROR]', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[REACTIONS DELETE EXCEPTION]', error);
    return NextResponse.json({ error: 'Failed to remove reaction' }, { status: 500 });
  }
}
