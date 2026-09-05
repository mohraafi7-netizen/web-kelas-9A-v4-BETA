import { createClientSupabase } from '@/lib/supabase/server';
import { createClientSupabaseAdmin } from '@/lib/supabase/admin';
import { requireRole } from '@/lib/auth/api-auth';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const authResult = await requireRole(['main_admin'])(request);
    if (authResult instanceof Response) return authResult;

    const { userId: routeUserId } = await params;
    const targetUserId = (routeUserId ?? '').trim();

    if (!targetUserId) {
      return NextResponse.json({ error: 'user_id is required' }, { status: 400 });
    }

    let body: { password?: unknown } = {};
    try {
      body = (await request.json()) as { password?: unknown };
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }
    const newPassword = typeof body.password === 'string' ? body.password : '';

    if (!newPassword) {
      return NextResponse.json({ error: 'password is required' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }

    const adminSupabase = createClientSupabaseAdmin();
    const { error } = await adminSupabase.auth.admin.updateUserById(targetUserId, {
      password: newPassword,
    });

    if (error) {
      console.error('[ADMIN PASSWORD RESET ERROR]', {
        message: error.message,
        code: error.code,
      });
      return NextResponse.json({ error: error.message || 'Failed to reset password' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[ADMIN PASSWORD RESET EXCEPTION]', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
