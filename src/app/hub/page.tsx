'use client';

import * as React from 'react';
import { Section } from '@/components/ui';
import { GlassCard } from '@/components/ui';
import { GalaxyButton } from '@/components/ui';
import { GalaxyBadge } from '@/components/ui';
import { EmptyState } from '@/components/ui';
import { SpaceBackground } from '@/components/ui';
import { Calendar, Clock, Bell, CheckCircle, AlertCircle, Megaphone, Vote, FolderOpen, BookOpen, PartyPopper } from 'lucide-react';
import { createClientSupabaseBrowser } from '@/lib/supabase/client';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/components/ui';
import type { Event, Task, Announcement, Poll, Notification } from '@/types';
import { motion } from 'framer-motion';

type TimelineItem = {
  id: string;
  type: 'schedule' | 'task' | 'exam' | 'event' | 'announcement' | 'poll' | 'project' | 'reminder';
  title: string;
  description?: string;
  time?: string;
  date: string;
  link?: string;
};

const typeConfig = {
  schedule: { icon: Calendar, color: 'text-blue-400 bg-blue-500/10 border-blue-500/30', label: 'Schedule' },
  task: { icon: CheckCircle, color: 'text-amber-400 bg-amber-500/10 border-amber-500/30', label: 'Task' },
  exam: { icon: AlertCircle, color: 'text-red-400 bg-red-500/10 border-red-500/30', label: 'Exam' },
  event: { icon: PartyPopper, color: 'text-purple-400 bg-purple-500/10 border-purple-500/30', label: 'Event' },
  announcement: { icon: Megaphone, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30', label: 'Announcement' },
  poll: { icon: Vote, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30', label: 'Poll' },
  project: { icon: FolderOpen, color: 'text-pink-400 bg-pink-500/10 border-pink-500/30', label: 'Project' },
  reminder: { icon: Clock, color: 'text-orange-400 bg-orange-500/10 border-orange-500/30', label: 'Reminder' },
};

export default function HubPage() {
  const { profile } = useAuth();
  const { showToast } = useToast();
  const [viewMode, setViewMode] = React.useState<'timeline' | 'calendar'>('timeline');
  const [timelineItems, setTimelineItems] = React.useState<TimelineItem[]>([]);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const supabase = createClientSupabaseBrowser();
      const today = new Date().toISOString().split('T')[0];
      const items: TimelineItem[] = [];

      const [tasksRes, announcementsRes, pollsRes, eventsRes] = await Promise.all([
        supabase.from('tasks').select('id, title, deadline, status').eq('status', 'active').order('deadline', { ascending: true }).limit(10),
        supabase.from('announcements').select('id, title, created_at').order('created_at', { ascending: false }).limit(5),
        supabase.from('polls').select('id, title, is_active').order('created_at', { ascending: false }).limit(5),
        supabase.from('events').select('id, title, event_date, event_time, event_type').order('event_date', { ascending: true }).limit(10),
      ]);

      if (tasksRes.data) {
        (tasksRes.data as Array<{ id: string; title: string; deadline?: string }>).forEach((task) => {
          items.push({
            id: task.id,
            type: 'task',
            title: task.title,
            date: task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : today,
            time: task.deadline,
          });
        });
      }

      if (announcementsRes.data) {
        (announcementsRes.data as Array<{ id: string; title: string; created_at: string }>).forEach((ann) => {
          items.push({
            id: ann.id,
            type: 'announcement',
            title: ann.title,
            date: new Date(ann.created_at).toISOString().split('T')[0],
            link: '/announcements',
          });
        });
      }

      if (pollsRes.data) {
        (pollsRes.data as Array<{ id: string; title: string; is_active: boolean }>).forEach((poll) => {
          items.push({
            id: poll.id,
            type: 'poll',
            title: poll.title,
            date: today,
            link: '/polls',
          });
        });
      }

      if (eventsRes.data) {
        (eventsRes.data as Array<{ id: string; title: string; event_date: string; event_time?: string; event_type: string }>).forEach((ev) => {
          items.push({
            id: ev.id,
            type: ev.event_type as TimelineItem['type'],
            title: ev.title,
            date: ev.event_date,
            time: ev.event_time,
          });
        });
      }

      setTimelineItems(items.sort((a, b) => a.date.localeCompare(b.date)));

      if (profile) {
        const notifRes = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(20);
        if (notifRes.data) {
          setNotifications(notifRes.data as Notification[]);
        }
      }
    } catch (error) {
      console.error('[HUB FETCH ERROR]', error);
      showToast('error', 'Failed to load hub data');
    } finally {
      setLoading(false);
    }
  }, [profile, showToast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  const markAsRead = async (id: string) => {
    if (!profile) return;
    const supabase = createClientSupabaseBrowser();
    await supabase.from('notifications').update({ read: true }).eq('id', id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllAsRead = async () => {
    if (!profile) return;
    const supabase = createClientSupabaseBrowser();
    await supabase.from('notifications').update({ read: true }).eq('user_id', profile.id).eq('read', false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const groupedByDate = React.useMemo(() => {
    const groups: Record<string, TimelineItem[]> = {};
    timelineItems.forEach((item) => {
      if (!groups[item.date]) groups[item.date] = [];
      groups[item.date].push(item);
    });
    return groups;
  }, [timelineItems]);

  const formatDateLabel = (dateStr: string) => {
    const date = new Date(dateStr + 'T00:00:00');
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    if (dateStr === today) return 'Today';
    if (dateStr === tomorrow) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <main className="min-h-screen">
        <SpaceBackground particleCount={40} enableParallax={false} />
        <Section title="Class Hub" subtitle="Agenda & Notifications">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <GlassCard key={i} className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-slate-700/50 rounded w-3/4" />
                  <div className="h-3 bg-slate-700/50 rounded w-full" />
                </div>
              </GlassCard>
            ))}
          </div>
        </Section>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <SpaceBackground particleCount={40} enableParallax={false} />
      <Section title="Class Hub" subtitle="Agenda & Notifications" className="relative z-10">
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Timeline</h2>
              <div className="flex items-center gap-2">
                <GalaxyButton
                  variant={viewMode === 'timeline' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('timeline')}
                >
                  Timeline
                </GalaxyButton>
                <GalaxyButton
                  variant={viewMode === 'calendar' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('calendar')}
                >
                  Calendar
                </GalaxyButton>
              </div>
            </div>

            {viewMode === 'timeline' ? (
              <div className="space-y-6">
                {Object.entries(groupedByDate).length === 0 ? (
                  <EmptyState
                    title="No upcoming events"
                    description="Your timeline is clear. Enjoy your day!"
                    action={<Calendar className="w-12 h-12 text-galaxy-400" />}
                  />
                ) : (
                  Object.entries(groupedByDate).map(([date, items]) => (
                    <div key={date}>
                      <h3 className="text-sm font-semibold text-slate-400 mb-3 px-1">{formatDateLabel(date)}</h3>
                      <div className="space-y-2">
                        {items.map((item, idx) => {
                          const config = typeConfig[item.type];
                          const Icon = config.icon;
                          return (
                            <motion.div
                              key={item.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: idx * 0.05 }}
                            >
                              <GlassCard hover className="p-4 flex items-center gap-4">
                                <div className={`p-2 rounded-lg border ${config.color}`}>
                                  <Icon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-white truncate">{item.title}</p>
                                  {item.time && (
                                    <p className="text-xs text-slate-500">{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                  )}
                                </div>
                                <GalaxyBadge variant="secondary" size="sm">{config.label}</GalaxyBadge>
                              </GlassCard>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : (
              <GlassCard className="p-6">
                <p className="text-sm text-slate-400 text-center py-8">Calendar view coming soon. Use timeline for now.</p>
              </GlassCard>
            )}
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-galaxy-400" />
                Notifications
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-galaxy-600/20 text-galaxy-400 text-xs font-medium">
                    {unreadCount}
                  </span>
                )}
              </h2>
              {unreadCount > 0 && (
                <button onClick={markAllAsRead} className="text-xs text-galaxy-400 hover:text-galaxy-300">
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <EmptyState
                title="No notifications"
                description="You're all caught up!"
                action={<Bell className="w-12 h-12 text-galaxy-400" />}
              />
            ) : (
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <GlassCard
                    key={notif.id}
                    hover
                    className={`p-4 cursor-pointer ${!notif.read ? 'border-galaxy-500/30 bg-galaxy-600/5' : ''}`}
                    onClick={() => markAsRead(notif.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg border ${typeConfig[notif.type as keyof typeof typeConfig]?.color || typeConfig.reminder.color}`}>
                        {(() => {
                          const Icon = typeConfig[notif.type as keyof typeof typeConfig]?.icon || Bell;
                          return <Icon className="w-4 h-4" />;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{notif.title}</p>
                        <p className="text-xs text-slate-400 line-clamp-2">{notif.message}</p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {new Date(notif.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!notif.read && <div className="w-2 h-2 rounded-full bg-galaxy-400 shrink-0 mt-1" />}
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>
    </main>
  );
}
