import { createClientSupabase } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = await createClientSupabase();
    const body = await request.json();

    const instagram_url = typeof body.instagram_url === 'string' ? body.instagram_url.trim() : null;
    const tiktok_url = typeof body.tiktok_url === 'string' ? body.tiktok_url.trim() : null;

    const { data, error } = await supabase
      .from('profiles')
      .update({
        instagram_url: instagram_url || null,
        tiktok_url: tiktok_url || null,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('[PROFILE UPDATE ERROR]', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('[PROFILE UPDATE EXCEPTION]', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
