'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { GlassCard } from '@/components/ui';
import { GalaxyButton } from '@/components/ui';
import { GalaxyBadge } from '@/components/ui';
import { SpaceBackground } from '@/components/ui';
import {
  LayoutDashboard,
  Users,
  Bell,
  Image,
  FolderOpen,
  Settings,
  LogOut,
  Shield,
  Crown,
  BarChart3,
  ClipboardList,
  Calendar,
  Camera,
  HardDrive,
} from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';

const adminNavItems = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, key: 'dashboard' },
  { href: '/admin/members', label: 'Members', icon: Users, key: 'members' },
  { href: '/admin/photos', label: 'Photos', icon: Camera, key: 'photos' },
  { href: '/admin/announcements', label: 'Announcements', icon: Bell, key: 'announcements' },
  { href: '/admin/gallery', label: 'Gallery', icon: Image, key: 'gallery' },
  { href: '/admin/projects', label: 'Projects', icon: FolderOpen, key: 'projects' },
  { href: '/admin/polls', label: 'Polls', icon: BarChart3, key: 'polls' },
  { href: '/admin/schedule', label: 'Schedule', icon: Calendar, key: 'schedule' },
  { href: '/admin/storage', label: 'Storage', icon: HardDrive, key: 'storage' },
];

function AdminDashboardClient() {
  const router = useRouter();
  const pathname = usePathname();
  const { profile, logout } = useAuth();
  const [stats, setStats] = React.useState({ members: 0, admins: 0, announcements: 0, gallery: 0, projects: 0, tasks: 0, polls: 0, schedule: 0, piketToday: 0 });

  React.useEffect(() => {
    const supabase = createClientSupabaseBrowser();

    const fetchStats = async () => {
      const [membersRes, announcementsRes, galleryRes, projectsRes, tasksRes, pollsRes, scheduleRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('announcements').select('*', { count: 'exact', head: true }),
        supabase.from('gallery').select('*', { count: 'exact', head: true }),
        supabase.from('projects').select('*', { count: 'exact', head: true }),
        supabase.from('tasks').select('*', { count: 'exact', head: true }),
        supabase.from('polls').select('*', { count: 'exact', head: true }),
        supabase.from('schedule').select('*', { count: 'exact', head: true }),
      ]);

      const today = new Date().toISOString().slice(0, 10);
      const { count: piketCount } = await supabase
        .from('piket')
        .select('*', { count: 'exact', head: true })
        .eq('date', today);

      const { count: adminCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('role', ['admin', 'main_admin']);

      setStats({
        members: membersRes.count ?? 0,
        admins: adminCount ?? 0,
        announcements: announcementsRes.count ?? 0,
        gallery: galleryRes.count ?? 0,
        projects: projectsRes.count ?? 0,
        tasks: tasksRes.count ?? 0,
        polls: pollsRes.count ?? 0,
        schedule: scheduleRes.count ?? 0,
        piketToday: piketCount ?? 0,
      });
    };

    fetchStats();

    const channel = supabase
      .channel('admin-stats')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gallery' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'polls' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'schedule' }, fetchStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'piket' }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

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

  const statItems = [
    { label: 'Total Members', value: stats.members.toString(), icon: Users, color: 'from-galaxy-600 to-purple-600' },
    { label: 'Admins', value: stats.admins.toString(), icon: Shield, color: 'from-red-600 to-pink-600' },
    { label: 'Announcements', value: stats.announcements.toString(), icon: Bell, color: 'from-blue-600 to-cyan-600' },
    { label: 'Gallery', value: stats.gallery.toString(), icon: Image, color: 'from-purple-600 to-pink-600' },
    { label: 'Projects', value: stats.projects.toString(), icon: FolderOpen, color: 'from-emerald-600 to-teal-600' },
    { label: 'Tasks', value: stats.tasks.toString(), icon: ClipboardList, color: 'from-orange-600 to-amber-600' },
    { label: 'Active Polls', value: stats.polls.toString(), icon: BarChart3, color: 'from-indigo-600 to-violet-600' },
    { label: 'Schedule Items', value: stats.schedule.toString(), icon: Calendar, color: 'from-sky-600 to-cyan-600' },
    { label: 'Piket Hari Ini', value: stats.piketToday.toString(), icon: Calendar, color: 'from-rose-600 to-red-600' },
  ];

  return (
    <div className="min-h-screen">
      <SpaceBackground particleCount={50} enableParallax={false} />

      <div className="relative z-10 flex min-h-screen">
        <aside className="hidden md:flex w-64 flex-col fixed h-screen glass-strong border-r border-white/5">
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-galaxy-600 to-purple-600 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Admin Panel
                </h2>
                {profile?.role === 'main_admin' && (
                  <GalaxyBadge variant="danger" size="sm">MAIN ADMIN</GalaxyBadge>
                )}
              </div>
            </div>
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
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5 space-y-2">
            {profile?.role === 'main_admin' && (
              <GalaxyButton
                href="/admin/management"
                variant="secondary"
                className="w-full justify-start"
                icon={<Crown className="w-4 h-4" />}
              >
                Role Management
              </GalaxyButton>
            )}
            <GalaxyButton
              variant="ghost"
              className="w-full justify-start"
              onClick={handleLogout}
              icon={<LogOut className="w-4 h-4" />}
            >
              Logout
            </GalaxyButton>
          </div>
        </aside>

        <main className="flex-1 md:ml-64 p-6 sm:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">Command Center</h1>
              <p className="text-slate-400">Monitor and manage your galaxy classroom.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statItems.map((stat, index) => (
                <GlassCard key={stat.label} className="p-6 group hover:border-white/20 transition-all duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-slate-400">{stat.label}</span>
                    <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} bg-opacity-20`}>
                      <stat.icon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-xs text-slate-500">Live</div>
                </GlassCard>
              ))}
            </div>

            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GalaxyButton href="/admin/announcements" variant="secondary" className="justify-start">
                  <Bell className="w-4 h-4" />
                  New Announcement
                </GalaxyButton>
                <GalaxyButton href="/admin/members" variant="secondary" className="justify-start">
                  <Users className="w-4 h-4" />
                  Manage Members
                </GalaxyButton>
                <GalaxyButton href="/admin/gallery" variant="secondary" className="justify-start">
                  <Image className="w-4 h-4" />
                  Upload Gallery
                </GalaxyButton>
                <GalaxyButton href="/admin/projects" variant="secondary" className="justify-start">
                  <FolderOpen className="w-4 h-4" />
                  Manage Projects
                </GalaxyButton>
              </div>
            </GlassCard>
          </div>
        </main>
      </div>
    </div>
  );
}

export default AdminDashboardClient;
