'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui';
import { Button } from '@/components/ui';
import { Modal } from '@/components/ui';
import { Loading } from '@/components/ui';
import { ErrorState } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { Plus, Pencil, Trash2, X, LogOut, LayoutDashboard, Users, Bell, Image, FolderOpen, Camera, BarChart3, HardDrive } from 'lucide-react';

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

  const handleLogout = async () => {
    const supabase = createClientSupabaseBrowser();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <div className="flex">
        <aside className="hidden md:flex w-64 flex-col fixed h-screen glass-strong border-r border-white/5">
          <div className="p-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Admin Panel
            </h2>
          </div>
          <nav className="flex-1 px-4 space-y-2">
            {adminNavItems.map((item) => (
              <button
                key={item.href}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === item.key
                    ? 'bg-galaxy-600/20 text-white'
                    : 'text-slate-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 border-t border-white/5">
            <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </aside>

        <main className="flex-1 md:ml-64 p-6 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="md:hidden flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">{title}</h1>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

export { AdminLayout };
