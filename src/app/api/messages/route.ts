import { createClientSupabase } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClientSupabase();

    const { data, error } = await supabase
      .from('private_messages')
      .select('sender_id, receiver_id, message, created_at')
      .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) {
      console.error('[Messages GET Error]', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    const conversations = new Map<string, { id: string; name: string; lastMessage: string; time: string }>();
    const otherIds = new Set<string>();

    for (const msg of data ?? []) {
      const otherId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
      if (!conversations.has(otherId)) {
        conversations.set(otherId, {
          id: otherId,
          name: '',
          lastMessage: msg.message,
          time: new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
        otherIds.add(otherId);
      }
    }

    if (otherIds.size > 0) {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', Array.from(otherIds));

      if (profilesData) {
        const profileMap = new Map(profilesData.map((p) => [p.id, p.name]));
        for (const [id, conv] of conversations) {
          conv.name = profileMap.get(id) ?? 'Unknown';
        }
      }
    }

    return NextResponse.json(Array.from(conversations.values()));
  } catch (error) {
    console.error('[Messages GET Exception]', error);
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClientSupabase();
    const body = await request.json();
    const { receiver_id, message } = body;

    if (!receiver_id || !message?.trim()) {
      return NextResponse.json({ error: 'Receiver and message are required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('private_messages')
      .insert({
        sender_id: user.id,
        receiver_id,
        message: message.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('[Messages POST Error]', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[Messages POST Exception]', error);
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
