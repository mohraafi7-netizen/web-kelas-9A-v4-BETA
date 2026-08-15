'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { canViewAdminPanel, canManageRoles } from '@/lib/auth/permissions';

const publicRoutes = ['/login', '/signup'];
const memberRoutes = ['/dashboard', '/members', '/announcements', '/schedule', '/attendance', '/voting', '/materials', '/events', '/ranking', '/birthdays', '/duty', '/tasks', '/chat', '/gallery', '/projects', '/poetry', '/profile', '/settings'];
const adminRoutes = ['/admin'];

function RouteGuard({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    if (loading) return;

    const isPublic = publicRoutes.includes(pathname);
    const isMemberRoute = memberRoutes.some(r => pathname === r || pathname.startsWith(r + '/'));
    const isAdminRoute = adminRoutes.some(r => pathname === r || pathname.startsWith(r + '/'));
    const isManagementRoute = pathname === '/admin/management' || pathname.startsWith('/admin/management/');

    if (!profile) {
      if (!isPublic) {
        router.push('/login');
      }
      return;
    }

    if (isPublic && pathname !== '/') {
      router.push('/dashboard');
      return;
    }

    if (isAdminRoute && !canViewAdminPanel(profile.role)) {
      router.push('/dashboard');
      return;
    }

    if (isManagementRoute && !canManageRoles(profile.role)) {
      router.push('/admin');
      return;
    }
  }, [profile, loading, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-galaxy-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

export { RouteGuard };
