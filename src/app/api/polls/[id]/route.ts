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
      .from('polls')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch poll' }, { status: 500 });
  }
}

export async function PATCH(
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
      .from('polls')
      .update({
        title: body.title,
        description: body.description,
        is_active: body.is_active,
        starts_at: body.starts_at,
        ends_at: body.ends_at,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: 'Failed to update poll' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireRole(['admin', 'main_admin'])(request);
    if (authResult instanceof Response) return authResult;

    const { id } = await params;
    const supabase = await createClientSupabase();

    const { error } = await supabase
      .from('polls')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to delete poll' }, { status: 500 });
  }
}
