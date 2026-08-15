import { createClientSupabase } from '@/lib/supabase/server';
import { getAuthenticatedUser, requireRole } from '@/lib/auth/api-auth';
import { NextResponse } from 'next/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClientSupabase();
    const { data, error } = await supabase
      .from('poll_options')
      .select('*')
      .eq('poll_id', id)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch poll options' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole(['admin', 'main_admin'])(request);
    if (authResult instanceof Response) return authResult;

    const { id } = await params;
    const supabase = await createClientSupabase();
    const body = await request.json();

    const { data, error } = await supabase
      .from('poll_options')
      .insert({
        poll_id: id,
        option_text: body.option_text,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to create poll option' }, { status: 500 });
  }
}
