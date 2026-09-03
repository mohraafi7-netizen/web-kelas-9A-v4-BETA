'use client';

import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { GalaxyButton } from '@/components/ui';
import { Container } from '@/components/ui';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { GalaxyGlow } from '@/components/ui';
import { SpaceBackground } from '@/components/ui';
import { QuickAccessCard } from '@/components/ui';
import { AnnouncementPreview } from '@/components/ui';
import { SchedulePreview } from '@/components/ui';
import { GalleryPreview } from '@/components/ui';
import { ClassOverview } from '@/components/ui';
import { MobileBottomNav } from '@/components/ui';
import { GalaxyBadge } from '@/components/ui';
import { BlackHoleVideo } from '@/components/ui/BlackHoleVideo';
import { useAuth } from '@/providers/AuthProvider';
import { useMousePosition } from '@/hooks/useMousePosition';
import { motion } from 'framer-motion';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import * as React from 'react';
import {
  Bell,
  Users,
  Calendar,
  Image,
  ChevronRight,
  Sparkles,
  ArrowRight,
  Megaphone,
  ClipboardList,
  Vote,
  BookOpen,
  Trophy,
  FileText,
  Camera,
  PartyPopper,
  Settings,
  User,
  Shield,
  Crown,
  Rocket,
  Target,
  Zap,
  Clock,
} from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const quickAccessItems = [
  { href: '/announcements', label: 'Announcements', description: 'See the latest class information', icon: <Megaphone className="w-5 h-5" /> },
  { href: '/members', label: 'Members', description: 'View everyone in our class', icon: <Users className="w-5 h-5" /> },
  { href: '/schedule', label: 'Schedule', description: 'Check today\'s lessons', icon: <Calendar className="w-5 h-5" /> },
  { href: '/gallery', label: 'Gallery', description: 'See photos and memories', icon: <Camera className="w-5 h-5" /> },
  { href: '/attendance', label: 'Attendance', description: 'Check attendance records', icon: <ClipboardList className="w-5 h-5" /> },
  { href: '/voting', label: 'Voting', description: 'Participate in class votes', icon: <Vote className="w-5 h-5" /> },
  { href: '/materials', label: 'Materials', description: 'Access learning materials', icon: <BookOpen className="w-5 h-5" /> },
  { href: '/ranking', label: 'Ranking', description: 'View class rankings', icon: <Trophy className="w-5 h-5" /> },
];

const latestAnnouncements = [
  { title: 'Science Fair Registration Open', date: '2 days ago', category: 'Event' },
  { title: 'Sports Day Schedule Released', date: '1 week ago', category: 'Sports' },
  { title: 'New Project Showcase', date: '2 weeks ago', category: 'Project' },
];

function HeroClock() {
  const [time, setTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = () => time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formatDate = () => time.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <span className="font-mono">{formatTime()}</span>
      <span>{formatDate()}</span>
    </>
  );
}

function HeroSection() {
  const { smoothX, smoothY } = useMousePosition({ smooth: true, smoothFactor: 0.03 });
  const { profile } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRoleBadge = () => {
    if (!profile) return null;
    if (profile.role === 'main_admin') {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-medium">
          <Crown className="w-3.5 h-3.5" />
          Main Admin
        </div>
      );
    }
    if (profile.role === 'admin') {
      return (
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-medium">
          <Shield className="w-3.5 h-3.5" />
          Admin
        </div>
      );
    }
    return null;
  };

  return (
    <section className="relative min-h-[85vh] flex items-center overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ y: [0, -30, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ y: [0, 30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/8 rounded-full blur-[100px]"
        />
      </div>

      <Container size="lg" className="relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="text-center lg:text-left"
          >
            {profile && (
              <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
                <User className="w-4 h-4 text-galaxy-400" />
                <span className="text-sm font-medium text-slate-300">
                  {getGreeting()}, {profile.name.split(' ')[0]}
                </span>
                {getRoleBadge()}
              </motion.div>
            )}

            {!profile && (
              <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8">
                <Sparkles className="w-4 h-4 text-galaxy-400" />
                <span className="text-sm font-medium text-slate-300">Welcome to the future of learning</span>
              </motion.div>
            )}

            <motion.h1
              variants={fadeIn}
              className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent leading-[1.1]"
            >
              {profile ? 'DASHBOARD' : 'GALAXY CLASS'}
            </motion.h1>

            <motion.p
              variants={fadeIn}
              className="text-lg sm:text-xl text-slate-300 mb-2 text-balance font-light"
            >
              {profile ? 'Your classroom galaxy is waiting.' : 'One Class. One Story. One Galaxy.'}
            </motion.p>

            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              {profile ? (
                <>
                  <GalaxyButton href="#quick-access" size="lg" icon={<Rocket className="w-5 h-5" />}>
                    Launch Control Center
                  </GalaxyButton>
                  <GalaxyButton href="/announcements" variant="secondary" size="lg" icon={<Bell className="w-5 h-5" />}>
                    Latest Updates
                  </GalaxyButton>
                </>
              ) : (
                <>
                  <GalaxyButton href="/login" size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                    Sign In
                  </GalaxyButton>
                  <GalaxyButton href="#quick-access" variant="secondary" size="lg">
                    Explore Features
                  </GalaxyButton>
                </>
              )}
            </motion.div>

            {profile && (
              <motion.div variants={fadeIn} className="mt-8 flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-galaxy-400" />
                  <HeroClock />
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-galaxy-400" />
                  <HeroClock />
                </div>
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
            className="flex items-center justify-center"
            style={{
              transform: `translate3d(${smoothX * 8}px, ${smoothY * 8}px, 0)`,
              willChange: 'transform',
            }}
          >
            <div className="relative w-full max-w-lg flex items-center justify-center">
              <div className="relative z-10">
                <BlackHoleVideo />
              </div>
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
}

function StatsSection() {
  const [stats, setStats] = React.useState({ members: 0, tasks: 0, announcements: 0, duty: 0 });

  React.useEffect(() => {
    const supabase = createClientSupabaseBrowser();

    const fetchStats = async () => {
      const [membersRes, tasksRes, announcementsRes, dutyRes] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('announcements').select('*', { count: 'exact', head: true }),
        supabase.from('piket').select('*', { count: 'exact', head: true }),
      ]);

      setStats({
        members: membersRes.count ?? 0,
        tasks: tasksRes.count ?? 0,
        announcements: announcementsRes.count ?? 0,
        duty: dutyRes.count ?? 0,
      });
    };

    fetchStats();

    const channel = supabase
      .channel('dashboard-stats')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'profiles' }, fetchStats)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'profiles' }, fetchStats)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks' }, fetchStats)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' }, fetchStats)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, fetchStats)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'announcements' }, fetchStats)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'piket' }, fetchStats)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'piket' }, fetchStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const statItems = [
    { label: 'Active Members', value: stats.members.toString(), icon: Users, color: 'from-galaxy-600 to-purple-600' },
    { label: 'Active Tasks', value: stats.tasks.toString(), icon: ClipboardList, color: 'from-cyan-600 to-blue-600' },
    { label: 'Announcements', value: stats.announcements.toString(), icon: Megaphone, color: 'from-purple-600 to-pink-600' },
    { label: 'Duty Today', value: stats.duty.toString(), icon: Calendar, color: 'from-amber-600 to-orange-600' },
  ];

  return (
    <Section title="Quick Stats" subtitle="Your classroom at a glance.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statItems.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard className="p-6 group hover:border-white/20 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-slate-400">{stat.label}</span>
                <div className={`p-2 rounded-lg bg-gradient-to-r ${stat.color} bg-opacity-20`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-slate-500">Updated just now</div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </Section>
  );
}

function TodaysMission() {
  const [missions, setMissions] = React.useState<Array<{ id: string; title: string; type: 'task' | 'duty' | 'announcement'; time?: string }>>([]);

  React.useEffect(() => {
    const supabase = createClientSupabaseBrowser();

    const fetchMissions = async () => {
      const today = new Date().toISOString().split('T')[0];

      const [tasksRes, dutyRes, announcementsRes] = await Promise.all([
        supabase.from('tasks').select('id, title, deadline').eq('status', 'active').order('deadline', { ascending: true }).limit(3),
        supabase.from('piket').select('id, student_name').eq('date', today).limit(1),
        supabase.from('announcements').select('id, title').order('created_at', { ascending: false }).limit(2),
      ]);

      const missionItems: Array<{ id: string; title: string; type: 'task' | 'duty' | 'announcement'; time?: string }> = [];

      if (tasksRes.data) {
        (tasksRes.data as Array<{ id: string; title: string; deadline?: string }>).forEach((task) => {
          missionItems.push({
            id: task.id,
            title: task.title,
            type: 'task',
            time: task.deadline,
          });
        });
      }

      if (dutyRes.data && dutyRes.data.length > 0) {
        missionItems.push({
          id: dutyRes.data[0].id,
          title: `Piket: ${dutyRes.data[0].student_name}`,
          type: 'duty',
        });
      }

      if (announcementsRes.data) {
        (announcementsRes.data as Array<{ id: string; title: string }>).forEach((ann) => {
          missionItems.push({
            id: ann.id,
            title: ann.title,
            type: 'announcement',
          });
        });
      }

      setMissions(missionItems.slice(0, 5));
    };

    fetchMissions();

    const channel = supabase
      .channel('dashboard-missions')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks' }, fetchMissions)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' }, fetchMissions)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'piket' }, fetchMissions)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'announcements' }, fetchMissions)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'announcements' }, fetchMissions)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case 'task': return <ClipboardList className="w-4 h-4" />;
      case 'duty': return <Calendar className="w-4 h-4" />;
      case 'announcement': return <Megaphone className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getColor = (type: string) => {
    switch (type) {
      case 'task': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'duty': return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'announcement': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
    }
  };

  return (
    <Section title="Today's Mission" subtitle="Your objectives for today.">
      {missions.length === 0 ? (
        <GlassCard className="p-8 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-full glass-card flex items-center justify-center">
              <Target className="w-6 h-6 text-galaxy-400" />
            </div>
            <p className="text-slate-400">No missions for today. Enjoy your day!</p>
          </div>
        </GlassCard>
      ) : (
        <div className="space-y-3">
          {missions.map((mission, index) => (
            <motion.div
              key={mission.id}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard hover className="p-4 flex items-center gap-4">
                <div className={`p-2 rounded-lg border ${getColor(mission.type)}`}>
                  {getIcon(mission.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{mission.title}</p>
                  {mission.time && (
                    <p className="text-xs text-slate-500">Due: {new Date(mission.time).toLocaleDateString()}</p>
                  )}
                </div>
                <GalaxyBadge variant="secondary" size="sm">
                  {mission.type}
                </GalaxyBadge>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}
    </Section>
  );
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen pb-16 md:pb-0">
      <SpaceBackground particleCount={40} enableParallax={true} />

      <HeroSection />

      <Container size="lg" className="relative z-10 -mt-8">
        <div className="space-y-8">
          <StatsSection />

          <TodaysMission />

          <Section title="Quick Access" subtitle="Everything you need, in one place.">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" id="quick-access">
              {quickAccessItems.map((item, index) => (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                >
                  <QuickAccessCard
                    href={item.href}
                    icon={item.icon}
                    title={item.label}
                    description={item.description}
                  />
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-6">
              <GalaxyButton href="/members" variant="secondary" icon={<ArrowRight className="w-4 h-4" />}>
                View All Features
              </GalaxyButton>
            </div>
          </Section>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AnnouncementPreview announcements={latestAnnouncements} />
            </div>
            <div>
              <SchedulePreview />
            </div>
          </div>

          <GalleryPreview />
        </div>
      </Container>

      <MobileBottomNav />
    </main>
  );
}
