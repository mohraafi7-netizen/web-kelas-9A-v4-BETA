import { createClientSupabase } from '@/lib/supabase/server';
import { getAuthenticatedUser } from '@/lib/auth/api-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClientSupabase();
    const { data, error } = await supabase.from('gallery').select('id, title, category, image_url, storage_path, created_at').order('created_at', { ascending: false }).limit(100);
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('[GALLERY GET ERROR]', error);
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 });
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
    const category = typeof body.category === 'string' ? body.category.trim() : '';
    const image_url = typeof body.image_url === 'string' ? body.image_url.trim() : '';
    const storage_path = typeof body.storage_path === 'string' ? body.storage_path.trim() : '';

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { data, error } = await supabase.from('gallery').insert({
      title,
      category: category || null,
      image_url: image_url || null,
      storage_path: storage_path || null,
    }).select().single();

    if (error) {
      console.error('[GALLERY POST ERROR]', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      throw error;
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('[GALLERY POST EXCEPTION]', error);
    return NextResponse.json({ error: 'Failed to create gallery item' }, { status: 500 });
  }
}
