import { createClientSupabase } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabase = await createClientSupabase();
  const { data: { session } } = await supabase.auth.getSession();

  const protectedRoutes = [
    '/dashboard',
    '/members',
    '/announcements',
    '/schedule',
    '/attendance',
    '/voting',
    '/materials',
    '/events',
    '/ranking',
    '/birthdays',
    '/duty',
    '/tasks',
    '/chat',
    '/gallery',
    '/projects',
    '/poetry',
    '/profile',
    '/settings',
  ];

  const adminRoutes = ['/admin'];

  const publicRoutes = ['/login', '/signup', '/about', '/contact'];

  const pathname = request.nextUrl.pathname;

  const isProtected = protectedRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
  const isAdmin = adminRoutes.some(route => pathname === route || pathname.startsWith(`${route}/`));
  const isPublic = publicRoutes.some(route => pathname === route || pathname === '/');

  if (!session && (isProtected || isAdmin)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (session && (pathname === '/login' || pathname === '/signup')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (isAdmin && session) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (!profile || (profile.role !== 'admin' && profile.role !== 'main_admin')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
