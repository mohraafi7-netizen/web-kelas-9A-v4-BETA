'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Bell, Image, FolderOpen, Camera, BarChart3, HardDrive, Home, Menu, X, ClipboardList, Calendar, MessageCircle, Megaphone, KeyRound, Settings, Shield, Mail } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' },
    ],
  },
  {
    label: 'Class',
    items: [
      { href: '/admin/schedule', label: 'Schedule', icon: Calendar, key: 'schedule' },
      { href: '/admin/piket', label: 'Piket', icon: ClipboardList, key: 'piket' },
      { href: '/admin/polls', label: 'Polling', icon: BarChart3, key: 'polls' },
    ],
  },
  {
    label: 'Content',
    items: [
      { href: '/admin/announcements', label: 'Announcements', icon: Megaphone, key: 'announcements' },
      { href: '/admin/gallery', label: 'Gallery', icon: Image, key: 'gallery' },
      { href: '/admin/photos', label: 'Photos', icon: Camera, key: 'photos' },
      { href: '/admin/projects', label: 'Projects', icon: FolderOpen, key: 'projects' },
    ],
  },
  {
    label: 'Users',
    items: [
      { href: '/admin/members', label: 'Members', icon: Users, key: 'members' },
      { href: '/admin/management', label: 'User Management', icon: KeyRound, key: 'management' },
    ],
  },
  {
    label: 'Community',
    items: [
      { href: '/chat', label: 'Class Chat', icon: MessageCircle, key: 'chat' },
      { href: '/messages', label: 'Messages', icon: Mail, key: 'messages' },
    ],
  },
  {
    label: 'System',
    items: [
      { href: '/admin/storage', label: 'Storage', icon: HardDrive, key: 'storage' },
    ],
  },
];

const bottomNav = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard, key: 'dashboard' },
  { href: '/admin/schedule', label: 'Class', icon: Calendar, key: 'schedule' },
  { href: '/admin/announcements', label: 'Content', icon: Megaphone, key: 'announcements' },
  { href: '/admin/members', label: 'Users', icon: Users, key: 'members' },
  { href: '#more', label: 'More', icon: Menu, key: 'more' },
];

function isActive(pathname: string, href: string, key: string): boolean {
  if (key === 'dashboard') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function AdminMobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useAuth();
  const [moreOpen, setMoreOpen] = React.useState(false);

  const showAdminLink = profile?.role === 'admin' || profile?.role === 'main_admin';
  if (!showAdminLink) return null;

  const handleMoreClick = () => setMoreOpen(true);

  return (
    <>
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 glass-nav border-t border-white/5" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
        <div className="flex items-center justify-around h-14">
          {bottomNav.map((item) => {
            if (item.key === 'more') {
              return (
                <button
                  key={item.href}
                  onClick={handleMoreClick}
                  className="flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[64px] text-slate-400 hover:text-white"
                  aria-label="More admin options"
                >
                  <item.icon className="w-5 h-5" strokeWidth={2} />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </button>
              );
            }
            const active = isActive(pathname, item.href, item.key);
            return (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-[64px]',
                  active ? 'text-white' : 'text-slate-400 hover:text-white'
                )}
              >
                <item.icon className="w-5 h-5" strokeWidth={active ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {moreOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex items-end" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMoreOpen(false)} />
          <div className="relative w-full glass-strong rounded-t-3xl border-t border-white/10 p-4 pb-8 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">More Admin Tools</h2>
              <button onClick={() => setMoreOpen(false)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {navGroups.map((group) => {
              if (group.items.length === 0) return null;
              if (group.label === 'Community') {
                return (
                  <div key={group.label} className="mb-4">
                    <h3 className="px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{group.label}</h3>
                    <div className="space-y-1">
                      {group.items.map((item) => {
                        const active = isActive(pathname, item.href, item.key);
                        return (
                          <button
                            key={item.href}
                            onClick={() => { router.push(item.href); setMoreOpen(false); }}
                            className={cn(
                              'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px]',
                              active ? 'bg-galaxy-600/20 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                            )}
                            aria-current={active ? 'page' : undefined}
                          >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              const isCurrentGroup = group.items.some((i) => isActive(pathname, i.href, i.key));
              if (isCurrentGroup) return null;
              return (
                <div key={group.label} className="mb-4">
                  <h3 className="px-2 py-1 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">{group.label}</h3>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const active = isActive(pathname, item.href, item.key);
                      return (
                        <button
                          key={item.href}
                          onClick={() => { router.push(item.href); setMoreOpen(false); }}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors min-h-[44px]',
                            active ? 'bg-galaxy-600/20 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                          )}
                          aria-current={active ? 'page' : undefined}
                        >
                          <item.icon className="w-5 h-5" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            <div className="mt-4 pt-4 border-t border-white/5 space-y-1">
              <button
                onClick={() => { router.push('/dashboard'); setMoreOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-300 hover:bg-white/5 hover:text-white"
              >
                <Home className="w-5 h-5" />
                Back to Public Site
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export { AdminMobileNav, navGroups };
