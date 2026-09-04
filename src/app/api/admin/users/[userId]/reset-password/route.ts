import { createClientSupabase } from '@/lib/supabase/server';
import { createClientSupabaseAdmin } from '@/lib/supabase/admin';
import { getAuthenticatedUser, requireRole } from '@/lib/auth/api-auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const authResult = await requireRole(['main_admin'])(request);
    if (authResult instanceof Response) return authResult;

    const body = await request.json();
    const targetUserId = typeof body.user_id === 'string' ? body.user_id.trim() : '';
    const newPassword = typeof body.password === 'string' ? body.password : '';

    if (!targetUserId || !newPassword) {
      return NextResponse.json({ error: 'user_id and password are required' }, { status: 400 });
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
