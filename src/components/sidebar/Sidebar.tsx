'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { canViewAdminPanel, canManageRoles } from '@/lib/auth/permissions';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarDays,
  ClipboardList,
  Megaphone,
  MessageCircle,
  Mail,
  Users,
  Image,
  FolderOpen,
  User,
  Settings,
  Shield,
  Crown,
  LogOut,
  ChevronRight,
  Bell,
} from 'lucide-react';

const navGroups = [
  {
    label: 'Main',
    items: [
      { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/hub', label: 'Class Hub', icon: Bell },
    ],
  },
  {
    label: 'Community',
    items: [
      { href: '/chat', label: 'Chat', icon: MessageCircle },
      { href: '/messages', label: 'Messages', icon: Mail },
      { href: '/members', label: 'Members', icon: Users },
      { href: '/gallery', label: 'Gallery', icon: Image },
    ],
  },
  {
    label: 'Class',
    items: [
      { href: '/tasks', label: 'Tasks', icon: ClipboardList },
      { href: '/projects', label: 'Projects', icon: FolderOpen },
      { href: '/schedule', label: 'Schedule', icon: CalendarDays },
      { href: '/duty', label: 'Piket', icon: CalendarDays },
      { href: '/announcements', label: 'Announcements', icon: Megaphone },
    ],
  },
  {
    label: 'Account',
    items: [
      { href: '/profile', label: 'Profile', icon: User },
      { href: '/settings', label: 'Settings', icon: Settings },
    ],
  },
];

function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, logout } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
    router.refresh();
  };

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  React.useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', collapsed ? '4rem' : '16rem');
  }, [collapsed]);

  return (
    <aside
      className={cn(
        'hidden md:flex fixed left-0 top-0 h-screen glass-strong border-r border-white/5 transition-all duration-300 z-40',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 flex items-center gap-3">
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-galaxy-600 to-purple-600 opacity-80" />
            <div className="absolute inset-[2px] rounded-full bg-space-navy" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white/90" />
            </div>
          </div>
          {!collapsed && (
            <span className="text-lg font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent whitespace-nowrap">
              GALAXY CLASS
            </span>
          )}
        </div>

        <nav className="flex-1 px-3 space-y-4 overflow-y-auto">
          {navGroups.map((group) => (
            <div key={group.label}>
              {!collapsed && (
                <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  {group.label}
                </div>
              )}
              <div className="space-y-1">
                {group.items.map((item) => {
                  const active = isActive(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group',
                        active
                          ? 'bg-galaxy-600/20 text-white border border-galaxy-500/30'
                          : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                      )}
                    >
                      {active && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute inset-0 rounded-xl bg-galaxy-600/10"
                          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                        />
                      )}
                      <item.icon className={cn('w-5 h-5 shrink-0 relative z-10', active ? 'text-galaxy-400' : '')} />
                      {!collapsed && <span className="relative z-10">{item.label}</span>}
                      {active && !collapsed && (
                        <ChevronRight className="w-4 h-4 ml-auto text-galaxy-400 relative z-10" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {canViewAdminPanel(profile?.role) && (
            <div className="pt-4 mt-4 border-t border-white/5">
              {!collapsed && (
                <div className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  Admin
                </div>
              )}
              <Link
                href="/admin"
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative',
                  pathname.startsWith('/admin')
                    ? 'bg-galaxy-600/20 text-white border border-galaxy-500/30'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                )}
              >
                <Shield className="w-5 h-5 shrink-0" />
                {!collapsed && <span className="relative z-10">Command Center</span>}
              </Link>
              {canManageRoles(profile?.role) && (
                <Link
                  href="/admin/management"
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative mt-1',
                    pathname === '/admin/management'
                      ? 'bg-purple-600/20 text-white border border-purple-500/30'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                  )}
                >
                  <Crown className="w-5 h-5 shrink-0" />
                  {!collapsed && <span className="relative z-10">Management</span>}
                </Link>
              )}
            </div>
          )}
        </nav>

        <div className="p-3 border-t border-white/5 space-y-1">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-all duration-200"
          >
            <ChevronRight className={cn('w-5 h-5 shrink-0 transition-transform', collapsed ? '' : 'rotate-180')} />
            {!collapsed && <span>Collapse</span>}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

export { Sidebar };
