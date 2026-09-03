'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { GlassCard } from '@/components/ui';
import { GalaxyButton } from '@/components/ui';
import { Modal } from '@/components/ui';
import { Loading } from '@/components/ui';
import { ErrorState } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { Plus, Pencil, Trash2, X, LogOut, LayoutDashboard, Users, Bell, Image, FolderOpen, Camera, BarChart3, HardDrive, Menu, ChevronRight } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  activeTab: string;
}

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { href: '/admin/members', label: 'Members', icon: Users, key: 'members' },
  { href: '/admin/photos', label: 'Photos', icon: Camera, key: 'photos' },
  { href: '/admin/announcements', label: 'Announcements', icon: Bell, key: 'announcements' },
  { href: '/admin/gallery', label: 'Gallery', icon: Image, key: 'gallery' },
  { href: '/admin/projects', label: 'Projects', icon: FolderOpen, key: 'projects' },
  { href: '/admin/polls', label: 'Polls', icon: BarChart3, key: 'polls' },
  { href: '/admin/storage', label: 'Storage', icon: HardDrive, key: 'storage' },
];

function AdminLayout({ children, title, activeTab }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { profile } = useAuth();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleLogout = async () => {
    const supabase = createClientSupabaseBrowser();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const isActive = (key: string) => {
    if (key === 'dashboard') return pathname === '/admin';
    return pathname.startsWith(`/admin/${key}`);
  };

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg hover:bg-white/5 text-slate-400"
            aria-label="Toggle admin menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            {profile?.role === 'main_admin' && (
              <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">Main Admin</span>
            )}
          </div>
        </div>
        <GalaxyButton variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4" />
        </GalaxyButton>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-slate-950 border-r border-white/5 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Admin Panel
              </h2>
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg hover:bg-white/5 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-2">
              {adminNavItems.map((item) => {
                const active = isActive(item.key);
                return (
                  <button
                    key={item.href}
                    onClick={() => { router.push(item.href); setMobileOpen(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      active
                        ? 'bg-galaxy-600/20 text-white'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                    {active && <ChevronRight className="w-4 h-4 ml-auto text-galaxy-400" />}
                  </button>
                );
              })}
            </nav>
            {profile?.role === 'main_admin' && (
              <div className="mt-6 pt-4 border-t border-white/5">
                <GalaxyButton variant="secondary" href="/admin/management" className="w-full justify-start" icon={<span className="text-xs">👑</span>}>
                  Role Management
                </GalaxyButton>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-white/5">
              <GalaxyButton variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </GalaxyButton>
            </div>
          </div>
        </>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-64 flex-col fixed h-screen glass-strong border-r border-white/5">
          <div className="p-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Admin Panel
            </h2>
            {profile?.role === 'main_admin' && (
              <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider">Main Admin</span>
            )}
          </div>
          <nav className="flex-1 px-4 space-y-2">
            {adminNavItems.map((item) => {
              const active = isActive(item.key);
              return (
                <button
                  key={item.href}
                  onClick={() => router.push(item.href)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-galaxy-600/20 text-white border border-galaxy-500/30'
                      : 'text-slate-400 hover:bg-white/5 hover:text-white border border-transparent'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${active ? 'text-galaxy-400' : ''}`} />
                  {item.label}
                  {active && <ChevronRight className="w-4 h-4 ml-auto text-galaxy-400" />}
                </button>
              );
            })}
          </nav>
          <div className="p-4 border-t border-white/5 space-y-2">
            {profile?.role === 'main_admin' && (
              <GalaxyButton variant="secondary" href="/admin/management" className="w-full justify-start">
                <span className="text-xs mr-2">👑</span>
                Role Management
              </GalaxyButton>
            )}
            <GalaxyButton variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </GalaxyButton>
          </div>
        </aside>

        <main className="flex-1 md:ml-64 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export { AdminLayout };
